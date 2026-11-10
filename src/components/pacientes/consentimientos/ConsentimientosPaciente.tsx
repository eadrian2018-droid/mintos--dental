import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { supabase } from "../../../lib/supabase";

type ConsentimientosPacienteProps = {
  es: boolean;
  pacienteAbierto: {
    id: number;
    consentimiento_firmado?: boolean | null;
    texto_consentimiento?: string | null;
    firma_paciente?: string | null;
  } | null;
};

type ConsentimientoEspecifico = {
  id: string;
  paciente_id: number;
  tratamiento_id: number | null;
  plantilla_id: string;
  plantilla_version: number;
  titulo: string;
  contenido: string;
  idioma: string;
  estado: string;
  creado_at: string;
  firmado_at: string | null;
};

export default function ConsentimientosPaciente({
  es,
  pacienteAbierto,
}: ConsentimientosPacienteProps) {
  const [consentimientos, setConsentimientos] = useState<
    ConsentimientoEspecifico[]
  >([]);

  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);

  const [consentimientoSeleccionado, setConsentimientoSeleccionado] =
    useState<string | null>(null);

  const [firmaAbierta, setFirmaAbierta] = useState<string | null>(null);
  const [firmando, setFirmando] = useState(false);
  const [errorFirma, setErrorFirma] = useState<string | null>(null);
  const [trazoPresente, setTrazoPresente] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const [firmaConsultada, setFirmaConsultada] = useState<{
    consentimientoId: string;
    url: string;
  } | null>(null);

  const [cargandoFirmaConsultada, setCargandoFirmaConsultada] =
    useState(false);

  const [errorFirmaConsultada, setErrorFirmaConsultada] =
    useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dibujandoRef = useRef(false);
  const ultimaPosicionRef = useRef<{ x: number; y: number } | null>(
    null
  );

  const pacienteId = pacienteAbierto?.id;

  function limpiarFirma() {
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");

    if (canvas && contexto) {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
    }

    setTrazoPresente(false);
    setConfirmado(false);
    setErrorFirma(null);
  }

  function abrirFirma(id: string) {
    setFirmaAbierta(id);
    setErrorFirma(null);
    setTrazoPresente(false);
    setConfirmado(false);
  }

  function cerrarFirma() {
    if (firmando) return;

    setFirmaAbierta(null);
    setErrorFirma(null);
  }

  function posicionFirma(evento: PointerEvent<HTMLCanvasElement>) {
    const rect = evento.currentTarget.getBoundingClientRect();

    return {
      x:
        ((evento.clientX - rect.left) *
          evento.currentTarget.width) /
        rect.width,
      y:
        ((evento.clientY - rect.top) *
          evento.currentTarget.height) /
        rect.height,
    };
  }

  function iniciarTrazo(evento: PointerEvent<HTMLCanvasElement>) {
    if (firmando) return;

    evento.currentTarget.setPointerCapture(evento.pointerId);

    const punto = posicionFirma(evento);

    dibujandoRef.current = true;
    ultimaPosicionRef.current = punto;

    const contexto = evento.currentTarget.getContext("2d");

    if (contexto) {
      contexto.fillStyle = "#142c42";
      contexto.beginPath();
      contexto.arc(punto.x, punto.y, 1.8, 0, Math.PI * 2);
      contexto.fill();
    }

    setTrazoPresente(true);
    setConfirmado(false);
  }

  function moverTrazo(evento: PointerEvent<HTMLCanvasElement>) {
    if (!dibujandoRef.current || firmando) return;

    const contexto = evento.currentTarget.getContext("2d");
    const anterior = ultimaPosicionRef.current;
    const punto = posicionFirma(evento);

    if (!contexto || !anterior) return;

    contexto.strokeStyle = "#142c42";
    contexto.lineWidth = 3;
    contexto.lineCap = "round";
    contexto.lineJoin = "round";

    contexto.beginPath();
    contexto.moveTo(anterior.x, anterior.y);
    contexto.lineTo(punto.x, punto.y);
    contexto.stroke();

    ultimaPosicionRef.current = punto;
  }

  function terminarTrazo() {
    dibujandoRef.current = false;
    ultimaPosicionRef.current = null;
  }

  async function registrarFirma(consentimientoId: string) {
    if (!trazoPresente || !confirmado || firmando) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    setFirmando(true);
    setErrorFirma(null);

    try {
      const { data: sesion, error: errorSesion } =
        await supabase.auth.getSession();

      if (errorSesion || !sesion.session?.access_token) {
        throw new Error(
          es
            ? "La sesión ha expirado. Inicia sesión nuevamente."
            : "Your session has expired. Please sign in again."
        );
      }

      const { data, error } = await supabase.functions.invoke(
        "firmar-consentimiento",
        {
          headers: {
            Authorization: `Bearer ${sesion.session.access_token}`,
          },
          body: {
            consentimiento_id: consentimientoId,
            firma_base64: canvas.toDataURL("image/png"),
          },
        }
      );

      if (
        error ||
        !data ||
        data.success !== true ||
        data.estado !== "firmado"
      ) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : es
              ? "No se pudo confirmar la firma. Verifica el estado antes de volver a intentar."
              : "Signature could not be confirmed. Check its status before retrying."
        );
      }

      const {
        data: actualizado,
        error: errorActualizacion,
      } = await supabase
        .from("mintos_consentimientos_pacientes")
        .select("firmado_at,estado")
        .eq("id", consentimientoId)
        .eq("paciente_id", pacienteId!)
        .single();

      if (
        errorActualizacion ||
        actualizado?.estado !== "firmado"
      ) {
        throw new Error(
          es
            ? "La firma fue procesada, pero no se pudo actualizar la vista. Recarga el expediente."
            : "Signature processed, but the view could not be updated. Reload the patient record."
        );
      }

      setConsentimientos((anteriores) =>
        anteriores.map((item) =>
          item.id === consentimientoId
            ? {
                ...item,
                estado: "firmado",
                firmado_at: actualizado.firmado_at,
              }
            : item
        )
      );

      setFirmaAbierta(null);
      setConfirmado(false);
      setTrazoPresente(false);
    } catch (error) {
      setErrorFirma(
        error instanceof Error
          ? error.message
          : es
            ? "Error al registrar la firma."
            : "Failed to register signature."
      );
    } finally {
      setFirmando(false);
    }
  }

  useEffect(() => {
    let activo = true;

    setConsentimientos([]);
    setConsentimientoSeleccionado(null);
    setFirmaAbierta(null);
    setErrorFirma(null);
    setErrorCarga(false);

    if (!pacienteId) {
      setCargando(false);
      return;
    }

    async function cargarConsentimientos() {
      setCargando(true);

      try {
        const { data, error } = await supabase
          .from("mintos_consentimientos_pacientes")
          .select(
            `
              id,
              paciente_id,
              tratamiento_id,
              plantilla_id,
              plantilla_version,
              titulo,
              contenido,
              idioma,
              estado,
              creado_at,
              firmado_at
            `
          )
          .eq("paciente_id", pacienteId!)
          .order("creado_at", { ascending: false });

        if (!activo) return;

        if (error) {
          console.error(
            "Error cargando consentimientos del paciente:",
            error
          );

          setErrorCarga(true);
          setConsentimientos([]);
          return;
        }

        setConsentimientos(data || []);
      } catch (error) {
        if (!activo) return;

        console.error(
          "Error inesperado cargando consentimientos:",
          error
        );

        setErrorCarga(true);
        setConsentimientos([]);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarConsentimientos();

    return () => {
      activo = false;
    };
  }, [pacienteId]);

  useEffect(() => {
    let activo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    setFirmaConsultada(null);
    setErrorFirmaConsultada(null);
    setCargandoFirmaConsultada(false);

    const seleccionado = consentimientos.find(
      (item) => item.id === consentimientoSeleccionado
    );

    if (
      !pacienteId ||
      !seleccionado ||
      seleccionado.estado !== "firmado"
    ) {
      return () => {
        activo = false;
      };
    }

    const seleccionadoId = seleccionado.id;

    async function consultarFirma() {
      setCargandoFirmaConsultada(true);

      try {
        const { data: sesion, error: errorSesion } =
          await supabase.auth.getSession();

        if (errorSesion || !sesion.session?.access_token) {
          throw new Error(
            es
              ? "La sesión ha expirado. Inicia sesión nuevamente."
              : "Your session has expired. Please sign in again."
          );
        }

        const { data, error } = await supabase.functions.invoke(
          "ver-firma-consentimiento",
          {
            headers: {
              Authorization: `Bearer ${sesion.session.access_token}`,
            },
            body: {
              consentimiento_id: seleccionadoId,
            },
          }
        );

        if (
          error ||
          data?.success !== true ||
          typeof data.url !== "string"
        ) {
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : es
                ? "No se pudo consultar la firma. Verifica tus permisos."
                : "Unable to retrieve the signature. Check your permissions."
          );
        }

        if (!activo) return;

        setFirmaConsultada({
          consentimientoId: seleccionadoId,
          url: data.url,
        });

        temporizador = setTimeout(() => {
          if (activo) {
            setFirmaConsultada(null);
          }
        }, 55_000);
      } catch (error) {
        if (!activo) return;

        setErrorFirmaConsultada(
          error instanceof Error
            ? error.message
            : es
              ? "No se pudo cargar la firma."
              : "Unable to load the signature."
        );
      } finally {
        if (activo) {
          setCargandoFirmaConsultada(false);
        }
      }
    }

    void consultarFirma();

    return () => {
      activo = false;

      if (temporizador) {
        clearTimeout(temporizador);
      }
    };
  }, [consentimientoSeleccionado, consentimientos, pacienteId, es]);

  function formatearFecha(fecha: string | null) {
    if (!fecha) return "—";

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return "—";
    }

    return fechaConvertida.toLocaleDateString(
      es ? "es-MX" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  function obtenerEstado(estado: string) {
    const estadoNormalizado = estado.toLowerCase();

    if (estadoNormalizado === "firmado") {
      return es ? "Firmado" : "Signed";
    }

    if (estadoNormalizado === "pendiente") {
      return es ? "Pendiente" : "Pending";
    }

    return estado;
  }

  function obtenerClasesEstado(estado: string) {
    const estadoNormalizado = estado.toLowerCase();

    if (estadoNormalizado === "firmado") {
      return `
        border-[var(--mint-border-teal)]
        bg-[var(--mint-surface-teal)]
        mint-text-brand
      `;
    }

    return `
      border-[var(--mint-border)]
      bg-[var(--mint-bg-soft)]
      mint-text-secondary
    `;
  }

    return (
    <div className="space-y-6">
      {/* CONSENTIMIENTO GENERAL EXISTENTE */}

      <div
        className="
          rounded-[22px]
          border border-[var(--mint-border-teal)]
          bg-[var(--mint-surface)]
          p-6
          shadow-[var(--mint-shadow-card)]
        "
      >
        <div
          className="
            flex flex-col gap-4
            md:flex-row md:items-start md:justify-between
          "
        >
          <div>
            <h3 className="text-xl font-bold mint-text-primary">
              {es
                ? "Consentimiento informado"
                : "Informed consent"}
            </h3>

            <p className="mt-1 text-sm mint-text-secondary">
              {es
                ? "Consentimiento y firma registrados durante el ingreso."
                : "Consent and signature recorded during intake."}
            </p>
          </div>

          <span
            className={`
              inline-flex self-start rounded-full
              border px-3 py-1 text-xs font-bold
              ${
                pacienteAbierto?.consentimiento_firmado
                  ? "border-[var(--mint-border-teal)] bg-[var(--mint-surface-teal)] mint-text-brand"
                  : "border-[var(--mint-border)] bg-[var(--mint-bg-soft)] mint-text-secondary"
              }
            `}
          >
            {pacienteAbierto?.consentimiento_firmado
              ? es
                ? "Firmado"
                : "Signed"
              : es
                ? "No firmado"
                : "Not signed"}
          </span>
        </div>

        {pacienteAbierto?.texto_consentimiento && (
          <div
            className="
              mt-5 max-h-52 overflow-y-auto
              rounded-2xl
              border border-[var(--mint-border)]
              bg-[var(--mint-bg-soft)]
              p-4 text-sm leading-6
              mint-text-secondary whitespace-pre-wrap
            "
          >
            {pacienteAbierto.texto_consentimiento}
          </div>
        )}

        {pacienteAbierto?.firma_paciente ? (
          <div className="mt-5">
            <p
              className="
                mb-2 text-xs font-semibold uppercase
                tracking-wide mint-text-muted
              "
            >
              {es
                ? "Firma del paciente"
                : "Patient signature"}
            </p>

            <div
              className="
                inline-flex max-w-full rounded-2xl
                border border-[var(--mint-border)]
                bg-white p-3
              "
            >
              <img
                src={pacienteAbierto.firma_paciente}
                alt={
                  es
                    ? "Firma del paciente"
                    : "Patient signature"
                }
                className="
                  max-h-40 max-w-full object-contain
                "
              />
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm mint-text-muted">
            {es
              ? "No hay firma digital registrada."
              : "No digital signature is recorded."}
          </p>
        )}
      </div>

      {/* CONSENTIMIENTOS ESPECÍFICOS */}

      <div
        className="
          rounded-[22px]
          border border-[var(--mint-border-teal)]
          bg-[var(--mint-surface)]
          p-6
          shadow-[var(--mint-shadow-card)]
        "
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold mint-text-primary">
            {es
              ? "Consentimientos específicos"
              : "Specific consents"}
          </h3>

          <p className="mt-1 text-sm mint-text-secondary">
            {es
              ? "Documentos de consentimiento asignados a este paciente."
              : "Consent documents assigned to this patient."}
          </p>
        </div>

        {cargando && (
          <div
            role="status"
            className="
              rounded-2xl
              border border-[var(--mint-border)]
              bg-[var(--mint-bg-soft)]
              p-5 text-sm mint-text-secondary
            "
          >
            {es
              ? "Cargando consentimientos..."
              : "Loading consent documents..."}
          </div>
        )}

        {!cargando && errorCarga && (
          <div
            role="alert"
            className="
              rounded-2xl border border-red-200
              bg-red-50 p-5 text-sm text-red-700
            "
          >
            {es
              ? "No fue posible cargar los consentimientos. Verifica tu conexión o tus permisos."
              : "Unable to load consent documents. Check your connection or permissions."}
          </div>
        )}

        {!cargando &&
          !errorCarga &&
          consentimientos.length === 0 && (
            <div
              className="
                rounded-2xl
                border border-dashed border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                px-6 py-10 text-center
              "
            >
              <p className="text-sm font-semibold mint-text-primary">
                {es
                  ? "Sin consentimientos específicos"
                  : "No specific consent documents"}
              </p>

              <p className="mt-2 text-sm mint-text-secondary">
                {es
                  ? "Este paciente todavía no tiene documentos de consentimiento asignados."
                  : "This patient does not have any assigned consent documents yet."}
              </p>
            </div>
          )}

        {!cargando &&
          !errorCarga &&
          consentimientos.length > 0 && (
            <div className="space-y-3">
              {consentimientos.map((consentimiento) => {
                const expandido =
                  consentimientoSeleccionado === consentimiento.id;

                return (
                  <div
                    key={consentimiento.id}
                    className="
                      overflow-hidden rounded-2xl
                      border border-[var(--mint-border)]
                      bg-[var(--mint-bg-soft)]
                    "
                  >
                    <div
                      className="
                        flex flex-col gap-4 p-4
                        md:flex-row md:items-center md:justify-between
                      "
                    >
                      <div className="min-w-0">
                        <h4 className="font-semibold mint-text-primary">
                          {consentimiento.titulo}
                        </h4>

                        <div
                          className="
                            mt-2 flex flex-wrap items-center
                            gap-x-4 gap-y-1
                            text-xs mint-text-secondary
                          "
                        >
                          <span>
                            {es ? "Asignado:" : "Assigned:"}{" "}
                            {formatearFecha(consentimiento.creado_at)}
                          </span>

                          <span>
                            {es ? "Idioma:" : "Language:"}{" "}
                            {consentimiento.idioma.toUpperCase()}
                          </span>

                          <span>
                            {es ? "Versión:" : "Version:"}{" "}
                            {consentimiento.plantilla_version}
                          </span>

                          {consentimiento.firmado_at && (
                            <span>
                              {es ? "Firmado el:" : "Signed on:"}{" "}
                              {formatearFecha(
                                consentimiento.firmado_at
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="
                          flex shrink-0 flex-wrap
                          items-center gap-3
                        "
                      >
                        <span
                          className={`
                            inline-flex rounded-full border
                            px-3 py-1 text-xs font-bold
                            ${obtenerClasesEstado(
                              consentimiento.estado
                            )}
                          `}
                        >
                          {obtenerEstado(consentimiento.estado)}
                        </span>

                        <button
                          type="button"
                          aria-expanded={expandido}
                          aria-controls={`consentimiento-contenido-${consentimiento.id}`}
                          onClick={() =>
                            setConsentimientoSeleccionado(
                              expandido ? null : consentimiento.id
                            )
                          }
                          className="
                            rounded-xl
                            border border-[var(--mint-border-teal)]
                            bg-[var(--mint-surface)]
                            px-4 py-2
                            text-sm font-semibold
                            mint-text-brand
                            transition-colors
                            hover:bg-[var(--mint-surface-teal)]
                          "
                        >
                          {expandido
                            ? es
                              ? "Cerrar"
                              : "Close"
                            : es
                              ? "Ver documento"
                              : "View document"}
                        </button>
                      </div>
                    </div>

                    {expandido && (
                      <div
                        id={`consentimiento-contenido-${consentimiento.id}`}
                        className="
                          border-t border-[var(--mint-border)]
                          bg-[var(--mint-surface)]
                          p-5
                        "
                      >
                        <div
                          className="
                            whitespace-pre-wrap break-words
                            text-sm leading-7
                            mint-text-secondary
                          "
                        >
                          {consentimiento.contenido}
                        </div>

                        {/* FIRMA DE CONSENTIMIENTO YA FIRMADO */}

                        {consentimiento.estado === "firmado" && (
                          <div
                            className="
                              mt-6 rounded-2xl
                              border border-[var(--mint-border-teal)]
                              bg-[var(--mint-bg-soft)]
                              p-4
                            "
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold mint-text-primary">
                                  {es
                                    ? "Firma digital registrada"
                                    : "Recorded digital signature"}
                                </p>

                                <p className="mt-1 text-xs mint-text-secondary">
                                  {es
                                    ? "Firma asociada a este consentimiento."
                                    : "Signature associated with this consent."}
                                </p>
                              </div>

                              <span
                                className="
                                  rounded-full border
                                  border-[var(--mint-border-teal)]
                                  bg-[var(--mint-surface-teal)]
                                  px-3 py-1 text-xs font-semibold
                                  mint-text-brand
                                "
                              >
                                {es ? "Firmado" : "Signed"}
                              </span>
                            </div>

                            {cargandoFirmaConsultada && (
                              <p
                                role="status"
                                className="mt-4 text-sm mint-text-secondary"
                              >
                                {es
                                  ? "Cargando firma..."
                                  : "Loading signature..."}
                              </p>
                            )}

                            {errorFirmaConsultada && (
                              <p
                                role="alert"
                                className="
                                  mt-4 rounded-xl bg-red-50
                                  p-3 text-sm text-red-700
                                "
                              >
                                {errorFirmaConsultada}
                              </p>
                            )}

                            {firmaConsultada?.consentimientoId ===
                              consentimiento.id && (
                              <div
                                className="
                                  mt-4 inline-flex max-w-full
                                  rounded-xl border
                                  border-[var(--mint-border)]
                                  bg-white p-3
                                "
                              >
                                <img
                                  src={firmaConsultada.url}
                                  alt={
                                    es
                                      ? "Firma digital del paciente"
                                      : "Patient digital signature"
                                  }
                                  className="
                                    max-h-44 max-w-full object-contain
                                  "
                                />
                              </div>
                            )}

                            {!cargandoFirmaConsultada &&
                              !errorFirmaConsultada &&
                              firmaConsultada?.consentimientoId !==
                                consentimiento.id && (
                                <p className="mt-4 text-sm mint-text-muted">
                                  {es
                                    ? "La vista temporal de la firma ha expirado. Cierra y vuelve a abrir el documento para consultarla."
                                    : "The temporary signature view has expired. Close and reopen the document to view it again."}
                                </p>
                              )}

                            {consentimiento.firmado_at && (
                              <p className="mt-3 text-xs mint-text-secondary">
                                {es ? "Fecha de firma:" : "Signature date:"}{" "}
                                {formatearFecha(
                                  consentimiento.firmado_at
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {consentimiento.estado === "pendiente" && (
                          <div
                            className="
                              mt-6 rounded-xl
                              border border-[var(--mint-border)]
                              bg-[var(--mint-bg-soft)]
                              p-4 text-sm mint-text-secondary
                            "
                          >
                            {es
                              ? "Este documento está pendiente de firma."
                              : "This document is awaiting signature."}
                          </div>
                        )}

                        {consentimiento.estado === "pendiente" && (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() =>
                                firmaAbierta === consentimiento.id
                                  ? cerrarFirma()
                                  : abrirFirma(consentimiento.id)
                              }
                              disabled={firmando}
                              className="
                                rounded-xl bg-teal-700
                                px-4 py-2 text-sm font-semibold
                                text-white hover:bg-teal-800
                                disabled:opacity-50
                              "
                            >
                              {firmaAbierta === consentimiento.id
                                ? es
                                  ? "Cancelar firma"
                                  : "Cancel signature"
                                : es
                                  ? "Firmar consentimiento"
                                  : "Sign consent"}
                            </button>

                            {firmaAbierta === consentimiento.id && (
                              <div
                                className="
                                  mt-4 space-y-4 rounded-2xl
                                  border border-[var(--mint-border-teal)]
                                  bg-[var(--mint-surface)] p-4
                                "
                              >
                                <p className="text-sm font-semibold mint-text-primary">
                                  {es
                                    ? "Firma del paciente"
                                    : "Patient signature"}
                                </p>

                                <p className="text-xs mint-text-secondary">
                                  {es
                                    ? "El paciente debe leer el documento y firmar personalmente en el recuadro."
                                    : "The patient must read the document and sign personally in the box."}
                                </p>

                                <canvas
                                  ref={canvasRef}
                                  width={720}
                                  height={220}
                                  aria-label={
                                    es
                                      ? "Área para firma del paciente"
                                      : "Patient signature area"
                                  }
                                  onPointerDown={iniciarTrazo}
                                  onPointerMove={moverTrazo}
                                  onPointerUp={terminarTrazo}
                                  onPointerCancel={terminarTrazo}
                                  onLostPointerCapture={terminarTrazo}
                                  className="
                                    block w-full rounded-xl
                                    border border-[var(--mint-border)]
                                    bg-white
                                  "
                                  style={{
                                    touchAction: "none",
                                    aspectRatio: "720 / 220",
                                  }}
                                />

                                <button
                                  type="button"
                                  onClick={limpiarFirma}
                                  disabled={firmando}
                                  className="
                                    rounded-lg border
                                    border-[var(--mint-border)]
                                    px-3 py-2 text-sm
                                    mint-text-secondary
                                    disabled:opacity-50
                                  "
                                >
                                  {es
                                    ? "Limpiar firma"
                                    : "Clear signature"}
                                </button>

                                <label className="flex items-start gap-3 text-sm mint-text-secondary">
                                  <input
                                    type="checkbox"
                                    checked={confirmado}
                                    onChange={(evento) =>
                                      setConfirmado(evento.target.checked)
                                    }
                                    disabled={firmando || !trazoPresente}
                                    className="mt-1"
                                  />

                                  <span>
                                    {es
                                      ? "Confirmo que el paciente ha leído este consentimiento y que la firma fue realizada por el paciente."
                                      : "I confirm the patient has read this consent and the signature was made by the patient."}
                                  </span>
                                </label>

                                {errorFirma && (
                                  <p
                                    role="alert"
                                    className="
                                      rounded-xl bg-red-50
                                      p-3 text-sm text-red-700
                                    "
                                  >
                                    {errorFirma}
                                  </p>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    void registrarFirma(consentimiento.id)
                                  }
                                  disabled={
                                    !trazoPresente ||
                                    !confirmado ||
                                    firmando
                                  }
                                  className="
                                    rounded-xl bg-teal-700
                                    px-5 py-2.5 text-sm font-semibold
                                    text-white hover:bg-teal-800
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  {firmando
                                    ? es
                                      ? "Registrando firma..."
                                      : "Saving signature..."
                                    : es
                                      ? "Confirmar y registrar firma"
                                      : "Confirm and save signature"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}