import { useEffect, useMemo, useRef, useState } from "react";

import type { Dispatch, SetStateAction } from "react";

import type { Doctor } from "../../types/Doctor";

import type { Tratamiento } from "../../types/Tratamiento";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import { useLanguage } from "../../context/LanguageContext";

import { calcularComisionNeta } from "../../lib/comisionNeta";

import { obtenerFechaLocalMintOS, validarFechaEfectivaMintOS } from "../../services/cargosAdicionales.service";

import { registrarBitacora } from "../../lib/registrarBitacora";

type PagoComision = {
  id?: number;
  doctor_id?: number | null;
  tratamiento_id?: number;
  moneda?: string;
  monto_original?: number;
  monto_mxn?: number;
  monto_aplicado_moneda_tratamiento?: number | null;
  tipo_cambio?: number | null;
  comision_banco?: number;
  es_cargo_adicional?: boolean;
  cargo_adicional_id?: number | null;
  comision_doctor_porcentaje?: number | null;
  comision_doctor_pagada?: boolean;
  comision_doctor_fecha_pago?: string | null;
  comision_doctor_metodo_pago?: string | null;
  comision_doctor_pago_moneda?: string | null;
  comision_doctor_pago_monto?: number;
};

type ComisionesProps = {
  doctores: Doctor[];
  tratamientos: Tratamiento[];
  pagos?: PagoComision[];

  setDoctorDetalle: Dispatch<SetStateAction<Doctor | null>>;

  setMostrarDetalleDoctor: Dispatch<SetStateAction<boolean>>;
};

type Vista = "doctores" | "especialistas";

type FormaPagoEspecialista = "Efectivo" | "Transferencia";
type MonedaPagoEspecialista = "MXN" | "USD";

// Los honorarios proporcionales se redondean a centavos.
const redondearImporte = (importe: number) =>
  Math.round((importe + Number.EPSILON) * 100) / 100;

export default function Comisiones({
  doctores,
  tratamientos,
  pagos = [],
  setDoctorDetalle,
  setMostrarDetalleDoctor,
}: ComisionesProps) {

  const {
    perfil,
  } = useAuth();

  const esAdmin =
    perfil?.rol === "admin";

  const pagoEspecialistaEnCursoRef = useRef(false);
  const solicitudEspecialistaRef = useRef<{ payload: string; id: string } | null>(null);

  const { language } = useLanguage();
  const es = language === "es";
  const locale = es ? "es-MX" : "en-US";
  const tr = (espanol: string, english: string) => es ? espanol : english;

  const [fechaPagoEspecialista, setFechaPagoEspecialista] = useState(obtenerFechaLocalMintOS);

  const [monedaPrincipal, setMonedaPrincipal] = useState<"MXN" | "USD">("MXN");
  const [monedaSecundariaActiva, setMonedaSecundariaActiva] = useState(true);

  useEffect(() => {
    let activo = true;
    async function cargarConfiguracionMonedas() {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("clave, valor")
        .in("clave", ["moneda_principal", "moneda_secundaria_activa"]);
      if (error || !activo) return;
      const valores = Object.fromEntries(
        (data ?? []).map((fila) => [fila.clave, String(fila.valor ?? "")])
      );
      setMonedaPrincipal(valores.moneda_principal === "USD" ? "USD" : "MXN");
      setMonedaSecundariaActiva(valores.moneda_secundaria_activa !== "false");
    }
    void cargarConfiguracionMonedas();
    return () => { activo = false; };
  }, []);

  const mostrarMXN = monedaPrincipal === "MXN" || monedaSecundariaActiva;
  const mostrarUSD = monedaPrincipal === "USD" || monedaSecundariaActiva;
  const traducirMetodo = (metodo: string) =>
    es ? metodo : ({ "Efectivo": "Cash", "Transferencia": "Transfer", "Tarjeta": "Card" } as Record<string, string>)[metodo] || metodo;


  const [
    vista,
    setVista,
  ] = useState<Vista>(
    "doctores"
  );

  const [
    tratamientoPago,
    setTratamientoPago,
  ] = useState<any | null>(
    null
  );

  const [
    formaPagoEspecialista,
    setFormaPagoEspecialista,
  ] = useState<FormaPagoEspecialista>("Efectivo");

  const [monedaPagoEspecialista, setMonedaPagoEspecialista] =
    useState<MonedaPagoEspecialista>("MXN");
  const [tipoCambioEspecialista, setTipoCambioEspecialista] = useState<number | null>(null);
  const [cargandoTipoCambioEspecialista, setCargandoTipoCambioEspecialista] = useState(false);

  // Leer el tipo de cambio vigente al abrir el pago; nunca tomar el tipo de
  // cambio de un tratamiento antiguo como si fuera la tasa actual.
  useEffect(() => {
    if (!tratamientoPago) return;
    let activo = true;
    setTipoCambioEspecialista(null);
    setCargandoTipoCambioEspecialista(true);
    void (async () => {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("valor")
        .eq("clave", "tipo_cambio")
        .maybeSingle();
      if (!activo) return;
      const tasa = Number(data?.valor);
      setTipoCambioEspecialista(!error && data && Number.isFinite(tasa) && tasa > 0 ? tasa : null);
      setCargandoTipoCambioEspecialista(false);
    })();
    return () => { activo = false; };
  }, [tratamientoPago]);

  const monedaHonorariosEspecialista: MonedaPagoEspecialista =
    tratamientoPago?.moneda_especialista === "USD" ? "USD" : "MXN";
  const requiereConversionEspecialista =
    monedaPagoEspecialista !== monedaHonorariosEspecialista;

  const importePagoEspecialista = useMemo(() => {
    if (!tratamientoPago) return null;
    const honorarios = Number(tratamientoPago.especialista);
    if (!Number.isFinite(honorarios) || honorarios <= 0) return null;
    if (!requiereConversionEspecialista) return redondearImporte(honorarios);
    if (!tipoCambioEspecialista || !Number.isFinite(tipoCambioEspecialista)) return null;
    const convertido = monedaHonorariosEspecialista === "MXN"
      ? honorarios / tipoCambioEspecialista
      : honorarios * tipoCambioEspecialista;
    return Number.isFinite(convertido) ? redondearImporte(convertido) : null;
  }, [tratamientoPago, requiereConversionEspecialista, tipoCambioEspecialista, monedaHonorariosEspecialista]);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  // FIN03: la lista de anulaciones se obtiene del servidor (solo admin).
  const [pagosAnulados, setPagosAnulados] = useState<Set<number>>(new Set());
  const [anulacionesCargadas, setAnulacionesCargadas] = useState(false);
  useEffect(() => {
    if (!esAdmin) {
      setAnulacionesCargadas(false);
      return;
    }
    let activo = true;
    setAnulacionesCargadas(false);
    void (async () => {
      const { data, error } = await supabase.rpc("mintos_obtener_pagos_anulados_fin03");
      if (!activo) return;
      if (error) {
        console.error("FIN03: no se pudieron consultar cobros anulados:", error);
        setAnulacionesCargadas(false);
        return;
      }
      setPagosAnulados(new Set((data ?? []).map((fila: { pago_id: number }) => Number(fila.pago_id))));
      setAnulacionesCargadas(true);
    })();
    return () => { activo = false; };
  }, [esAdmin]);

  const formatoMonto =
    (
      monto: number
    ) =>
      Number(
        monto || 0
      ).toLocaleString(
        locale,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

  const tratamientosAny = useMemo(() => tratamientos as any[], [tratamientos]);

  const resumenDoctores =
    useMemo(
      () =>
        doctores
          .filter(
            (doctor: any) =>
              doctor.tipo_doctor === "doctor" ||
              doctor.tipo_doctor === "ambos"
          )
          .map(
            (doctor) => {

              const tratamientosDoctor =
                tratamientosAny.filter(
                  (tratamiento) =>
                    Number(tratamiento.doctor_id) === Number(doctor.id) ||
                    pagos.some(pago =>
                      pago.doctor_id != null &&
                      Number(pago.doctor_id) === Number(doctor.id) &&
                      Number(pago.tratamiento_id) === Number(tratamiento.id)
                    )
                );

              const finalizados =
                tratamientosDoctor.filter(
                  (tratamiento) =>
                    tratamiento.estado ===
                    "Finalizado"
                );

              // FIN-02F: incluir tratamientos en proceso sin alterar el conteo de finalizados.
              const tratamientosLiquidables = tratamientosDoctor.filter(
                (tratamiento) =>
                  ["Finalizado", "En proceso", "Pendiente"].includes(tratamiento.estado)
              );

              const ids =
                new Set(
                  tratamientosLiquidables.map(
                    (tratamiento) =>
                      Number(
                        tratamiento.id
                      )
                  )
                );

              const pagosDoctor =
                pagos.filter(
                  (pago) =>
                    pago.doctor_id != null &&
                    Number(pago.doctor_id) === Number(doctor.id) &&
                    ids.has(Number(pago.tratamiento_id)) &&
                    !pagosAnulados.has(Number(pago.id))
                );

              const calcularComision = (pago: PagoComision) => {
                const tratamiento = tratamientosLiquidables.find(
                  (item) => Number(item.id) === Number(pago.tratamiento_id)
                );
                if (!tratamiento) return 0;
                // Las comisiones ya liquidadas conservan su importe histórico.
                if (pago.comision_doctor_pagada === true) {
                  return pago.comision_doctor_pago_moneda === pago.moneda
                    ? Number(pago.comision_doctor_pago_monto || 0) : 0;
                }
                return calcularComisionNeta(
                  pago, tratamiento, Number(doctor.porcentaje || 0)
                ) ?? 0;
              };

              // La liquidación individual v3 no exige autorizaciones manuales.
              const pagosElegibles = pagosDoctor.filter(pago => {
                if (pago.comision_doctor_pagada) return false;
                const tratamiento = tratamientosLiquidables.find(
                  item => Number(item.id) === Number(pago.tratamiento_id)
                );
                return Boolean(tratamiento) && calcularComisionNeta(
                  pago, tratamiento, Number(doctor.porcentaje || 0)
                ) !== null;
              });

              const pagosMXN =
                pagosElegibles.filter(
                  (pago) =>
                    pago.moneda === "MXN"
                );

              const pagosUSD =
                pagosElegibles.filter(
                  (pago) =>
                    pago.moneda === "USD"
                );

              const comisionMXN =
                pagosMXN.filter(pago => !pago.comision_doctor_pagada).reduce(
                  (total, pago) => total + calcularComision(pago), 0
                );

              const comisionUSD =
                pagosUSD.filter(pago => !pago.comision_doctor_pagada).reduce(
                  (total, pago) => total + calcularComision(pago), 0
                );

              const pagadoMXN =
                pagosDoctor
                  .filter(
                    (pago) =>
                      pago.comision_doctor_pagada === true
                      &&
                      pago.comision_doctor_pago_moneda === "MXN"
                  )
                  .reduce(
                    (total, pago) =>
                      total +
                      Number(
                        pago.comision_doctor_pago_monto || 0
                      ),
                    0
                  );

              const pagadoUSD =
                pagosDoctor
                  .filter(
                    (pago) =>
                      pago.comision_doctor_pagada === true
                      &&
                      pago.comision_doctor_pago_moneda === "USD"
                  )
                  .reduce(
                    (total, pago) =>
                      total +
                      Number(
                        pago.comision_doctor_pago_monto || 0
                      ),
                    0
                  );

              return {
                doctor,
                finalizados:
                  finalizados.length,
                comisionMXN,
                comisionUSD,
                pagadoMXN,
                pagadoUSD,
                pendienteMXN:
                  Math.max(
                    comisionMXN,
                    0
                  ),
                pendienteUSD:
                  Math.max(
                    comisionUSD,
                    0
                  ),
              };

            }
          ),
      [
        doctores,
        pagos,
        tratamientosAny,
        pagosAnulados,
        anulacionesCargadas,
      ]
    );

  const totalComisionMXN =
    resumenDoctores.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteMXN,
      0
    );

  const totalComisionUSD =
    resumenDoctores.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteUSD,
      0
    );

  const [honorarios, setHonorarios] = useState<any[]>([]);
  const [estadoHonorarios, setEstadoHonorarios] = useState<"cargando" | "listo" | "error">("cargando");

  useEffect(() => {
    if (vista !== "especialistas") return;
    let vigente = true;
    setEstadoHonorarios("cargando");
    setHonorarios([]);
    void (async () => {
      try {
        const filas: any[] = [];
        let desde = 0;
        while (vigente) {
          const { data, error } = await supabase
            .rpc("mintos_consultar_honorarios_especialistas_v1")
            .order("pago_id", { ascending: true })
            .range(desde, desde + 499);
          if (error) throw error;
          if (!Array.isArray(data)) throw new Error("Respuesta inválida");
          if (!data.length) break;
          filas.push(...data);
          desde += data.length;
        }
        if (vigente) {
          setHonorarios(filas);
          setEstadoHonorarios("listo");
        }
      } catch (error) {
        if (vigente) {
          console.error(error);
          setEstadoHonorarios("error");
        }
      }
    })();
    return () => { vigente = false; };
  }, [vista, perfil]);

  const tratamientosEspecialistas = useMemo(() => {
    const porId = new Map(tratamientosAny.map(t => [Number(t.id), t]));
    return [
      ...tratamientosAny.filter(t => t.especialista_pagado === true && t.especialista_id),
      ...honorarios.map(h => ({
        ...porId.get(Number(h.tratamiento_id)),
        id: Number(h.tratamiento_id),
        pago_id: Number(h.pago_id),
        especialista_id: Number(h.especialista_id),
        especialista_nombre: h.especialista_nombre,
        fecha: h.fecha_cobro,
        especialista: Number(h.honorario_proporcional),
        moneda_especialista: h.moneda_honorario,
        especialista_pagado: h.pagado,
        especialista_pago_monto: Number(h.monto_pagado),
        especialista_pago_moneda: h.moneda_pago,
        especialista_fecha_pago: h.fecha_pago,
        especialista_metodo_pago: h.metodo_pago,
        especialista_pago_tipo_cambio: null,
      })),
    ];
  }, [tratamientosAny, honorarios]);

  const resumenEspecialistas =
    useMemo(
      () => {

        const especialistasConfigurados =
          doctores.filter(
            (doctor: any) =>
              doctor.tipo_doctor === "especialista" ||
              doctor.tipo_doctor === "ambos"
          );

        return especialistasConfigurados.map(
          (doctor: any) => {

            const tratamientosEspecialista =
              tratamientosEspecialistas.filter(
                (tratamiento) =>
                  Number(
                    tratamiento.especialista_id
                  ) ===
                  Number(
                    doctor.id
                  )
              );

            let pendienteMXN = 0;
            let pendienteUSD = 0;
            let pagadoMXN = 0;
            let pagadoUSD = 0;

            tratamientosEspecialista.forEach(
              (tratamiento) => {

                const costo =
                  Number(
                    tratamiento.especialista || 0
                  );

                const moneda =
                  tratamiento.moneda_especialista ===
                    "USD"
                    ? "USD"
                    : "MXN";

                if (
                  tratamiento.especialista_pagado ===
                  true
                ) {

                  // Los pagos se contabilizan en la moneda e importe
                  // realmente entregados, no en la moneda del costo original.
                  const montoPagado = Number(tratamiento.especialista_pago_monto || 0);
                  if (tratamiento.especialista_pago_moneda === "USD") {
                    pagadoUSD += montoPagado;
                  } else if (tratamiento.especialista_pago_moneda === "MXN") {
                    pagadoMXN += montoPagado;
                  }

                  return;
                }

                if (moneda === "USD") {
                  pendienteUSD += costo;
                }
                else {
                  pendienteMXN += costo;
                }

              }
            );

            return {
              id: doctor.id,
              nombre:
                doctor.nombre ||
                "Especialista",
              doctor,
              tratamientos:
                tratamientosEspecialista,
              pendienteMXN,
              pendienteUSD,
              pagadoMXN,
              pagadoUSD,
            };

          }
        );

      },
      [
        doctores,
        tratamientosEspecialistas,
      ]
    );

  const pendienteEspecialistasMXN =
    resumenEspecialistas.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteMXN,
      0
    );

  const pendienteEspecialistasUSD =
    resumenEspecialistas.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteUSD,
      0
    );

  async function registrarPagoEspecialista() {
    if (!esAdmin || !tratamientoPago?.pago_id || tratamientoPago.especialista_pagado || guardando || pagoEspecialistaEnCursoRef.current) return;
    if (formaPagoEspecialista === "Transferencia" && monedaPagoEspecialista !== "MXN") return;

    if (!validarFechaEfectivaMintOS(fechaPagoEspecialista)) {
      alert(tr("Fecha de pago inválida.", "Invalid payment date."));
      return;
    }

    const monto = importePagoEspecialista;
    if (monto === null || !Number.isFinite(monto) || monto <= 0) {
      alert(tr("No se pudo calcular un importe válido.", "Could not calculate a valid amount."));
      return;
    }

    const monedaPago = monedaPagoEspecialista;
    const metodoPago = formaPagoEspecialista;
    const tratamiento = tratamientoPago;
    pagoEspecialistaEnCursoRef.current = true;
    setGuardando(true);

    try {
      // Evitar liquidar con una cotización que haya cambiado desde que
      // se abrió el modal. El trigger FIN-02G vuelve a verificarla.
      if (requiereConversionEspecialista) {
        const { data: configuracion, error: errorCambio } = await supabase
          .from("configuracion_finanzas")
          .select("valor")
          .eq("clave", "tipo_cambio")
          .single();
        if (errorCambio) throw errorCambio;
        const cambioVigente = Number(configuracion?.valor);
        if (!Number.isFinite(cambioVigente) || cambioVigente <= 0) {
          throw new Error(tr("Tipo de cambio no disponible.", "Exchange rate unavailable."));
        }
        if (cambioVigente !== tipoCambioEspecialista) {
          setTipoCambioEspecialista(cambioVigente);
          throw new Error(tr(
            "El tipo de cambio cambió. Revisa el nuevo importe y confirma nuevamente.",
            "The exchange rate changed. Review the updated amount and confirm again."
          ));
        }
      }

      const parametros = {
        p_pago_id: tratamiento.pago_id,
        p_moneda: monedaPago,
        p_monto: monto,
        p_metodo_pago: metodoPago,
        p_fecha_pago: fechaPagoEspecialista,
      };
      const payload = JSON.stringify(parametros);
      if (solicitudEspecialistaRef.current?.payload !== payload) {
        solicitudEspecialistaRef.current = { payload, id: crypto.randomUUID() };
      }
      const { data, error } = await supabase.rpc("mintos_liquidar_honorario_especialista_v1", {
        ...parametros,
        p_clave_idempotencia: solicitudEspecialistaRef.current.id,
      });

      if (error) throw error;

      if (!data) {
        throw new Error(tr(
          "No se confirmó ningún pago. Otro usuario pudo haberlo registrado o el tratamiento cambió. Actualiza la vista antes de reintentar.",
          "No payment was confirmed. Another user may have recorded it or the treatment changed. Refresh before retrying."
        ));
      }

      try {
        await registrarBitacora({
          accion: "Pagar especialista",
          modulo: "Comisiones",
          detalle:
            `Cobro ID: ${tratamiento.pago_id} | Tratamiento ID: ${tratamiento.id} | Especialista ID: ${tratamiento.especialista_id || "-"} | Especialista: ${tratamiento.especialista_nombre || "-"} | Tratamiento: ${tratamiento.tratamiento || "-"} | Monto: ${monto} ${monedaPago} | Método: ${metodoPago} | Tipo de cambio: ${requiereConversionEspecialista ? tipoCambioEspecialista : "No aplica"}`,
        });
      } catch (errorBitacora) {
        console.error("Pago confirmado; no se pudo registrar la bitácora:", errorBitacora);
      }

      setTratamientoPago(null);
      window.location.reload();
    } catch (error) {
      console.error("No se pudo confirmar el pago al especialista:", error);
      alert(tr(
        "No se pudo confirmar el pago al especialista. Verifica su estado antes de reintentar. ",
        "Could not confirm the specialist payment. Verify its status before retrying. "
      ) + (error instanceof Error ? error.message : String(error)));
    } finally {
      pagoEspecialistaEnCursoRef.current = false;
      setGuardando(false);
    }
  }

  return (

    <div
      className="
        space-y-6
      "
    >

      <div className="mint-card overflow-hidden border border-[var(--mint-border)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#63c8b2]">
              {tr("Control de comisiones", "Commission management")}
            </p>
            <p className="text-sm text-white/85 mt-1">
              {tr("Consulta comisiones de doctores y adeudos a especialistas.", "Review doctor commissions and outstanding specialist payments.")}
            </p>
          </div>

          <div
            className="
              inline-flex
              p-1
              rounded-xl
              bg-white/10
              border
              border-white/25
              self-start
              shadow-sm
            "
          >

            <button
              type="button"
              onClick={() =>
                setVista(
                  "doctores"
                )
              }
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold

                ${
                  vista ===
                  "doctores"

                    ? `
                      !bg-[#102f4f]
                      !text-white
                      shadow-[0_3px_10px_rgba(15,42,65,0.08)]
                      ring-1
                      ring-[var(--mint-border-teal)]
                    `

                    : `
                      !text-white/80 hover:!text-white
                    `
                }
              `}
            >
              {tr("Doctores", "Doctors")}
            </button>

            <button
              type="button"
              onClick={() => {

                setVista(
                  "especialistas"
                );

                setDoctorDetalle(
                  null
                );

                setMostrarDetalleDoctor(
                  false
                );

              }}
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold

                ${
                  vista ===
                  "especialistas"

                    ? `
                        !bg-[#102f4f]
                        !text-white
                        shadow-[0_3px_10px_rgba(15,42,65,0.08)]
                        ring-1
                        ring-[var(--mint-border-teal)]
                      `

                    : `
                      !text-white/80 hover:!text-white
                    `
                }
              `}
            >
              {tr("Especialistas", "Specialists")}
            </button>

          </div>

        </div>
        <div className="h-1 bg-[linear-gradient(90deg,#249884_0%,#63c8b2_58%,#d8bd72_100%)]" />
      </div>

      {
        vista ===
        "doctores"

          ? (

            <>

              {esAdmin && !anulacionesCargadas && (
                <p role="status" className="text-sm mint-text-secondary">{tr("Verificación adicional de anulaciones pendiente.", "Additional void verification pending.")}</p>
              )}
              <div
                className={`
                  grid
                  ${mostrarMXN && mostrarUSD ? "md:grid-cols-3" : "md:grid-cols-2"}
                  gap-4
                `}
              >

                <div
                  className="
                    mint-card-primary
                    relative
                    overflow-hidden
                    p-5
                    border
                    border-[var(--mint-border-teal)]
                    shadow-[0_8px_24px_rgba(15,42,65,0.05)]
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Doctores", "Doctors")}
                  </p>

                  <p className="text-2xl font-bold mint-text-primary mt-2">
                    {
                      resumenDoctores.length
                    }
                  </p>
                </div>

                {mostrarMXN && (
<div
                  className="
                    mint-card
                    relative
                    overflow-hidden
                    p-5
                    border
                    border-[var(--mint-border)]
                    shadow-[0_8px_24px_rgba(15,42,65,0.05)]
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Por pagar MXN", "MXN due")}
                  </p>

                  <p className="text-2xl font-bold text-[var(--mint-success)] mt-2">
                    $
                    {
                      formatoMonto(
                        totalComisionMXN
                      )
                    }
                  </p>
                </div>
)}

                {mostrarUSD && (
<div
                  className="
                    mint-card-accent
                    relative
                    overflow-hidden
                    p-5
                    border
                    border-[var(--mint-border)]
                    shadow-[0_8px_24px_rgba(15,42,65,0.05)]
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Por pagar USD", "USD due")}
                  </p>

                  <p className="text-2xl font-bold mint-text-accent mt-2">
                    $
                    {
                      formatoMonto(
                        totalComisionUSD
                      )
                    }
                  </p>
                </div>
)}

              </div>

                            <div
                className="
                  mint-card
                  overflow-hidden
                  border
                  border-[var(--mint-border)]
                  shadow-[0_12px_30px_rgba(15,42,65,0.055)]
                "
              >

                <div className="overflow-x-auto">

                  <table className="mint-table w-full">

                    <thead>
                      <tr>
                        <th className="p-4 text-left">
                          Doctor
                        </th>
                        <th className="p-4 text-center">
                          %
                        </th>
                        <th className="p-4 text-center">
                          {tr("Finalizados", "Completed")}
                        </th>
                        {mostrarMXN && (<th className="p-4 text-right">
                          {tr("Pendiente MXN", "MXN pending")}
                        </th>)}
                        {mostrarMXN && (<th className="p-4 text-right">
                          {tr("Pagado MXN", "MXN paid")}
                        </th>)}
                        {mostrarUSD && (<th className="p-4 text-right">
                          {tr("Pendiente USD", "USD pending")}
                        </th>)}
                        {mostrarUSD && (<th className="p-4 text-right">
                          {tr("Pagado USD", "USD paid")}
                        </th>)}
                        <th className="p-4 text-right">
                          {tr("Acción", "Action")}
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {
                        resumenDoctores.map(
                          (
                            item
                          ) => (

                            <tr
                              key={
                                item.doctor.id
                              }
                              className="
                                mint-table-row
                              "
                            >

                              <td className="p-4">
                                <p className="font-semibold mint-text-primary">
                                  {
                                    item.doctor.nombre
                                  }
                                </p>

                                <p className="text-xs mint-text-muted mt-1">
                                  {
                                    item.doctor.especialidad ||
                                    tr("Doctor clínico", "Clinical doctor")
                                  }
                                </p>
                              </td>

                              <td className="p-4 text-center font-semibold">
                                {
                                  Number(
                                    item.doctor.porcentaje ||
                                    0
                                  )
                                }%
                              </td>

                              <td className="p-4 text-center">
                                {
                                  item.finalizados
                                }
                              </td>

                              {mostrarMXN && (<td className="p-4 text-right">
                                <span className="font-bold text-[var(--mint-danger)]">
                                  $
                                  {
                                    formatoMonto(
                                      item.pendienteMXN
                                    )
                                  }
                                </span>
                              </td>)}

                              {mostrarMXN && (<td className="p-4 text-right">
                                <span className="font-bold text-[var(--mint-success)]">
                                  $
                                  {
                                    formatoMonto(
                                      item.pagadoMXN
                                    )
                                  }
                                </span>
                              </td>)}

                              {mostrarUSD && (<td className="p-4 text-right">
                                <span className="font-bold text-[var(--mint-warning)]">
                                  $
                                  {
                                    formatoMonto(
                                      item.pendienteUSD
                                    )
                                  }
                                </span>
                              </td>)}

                              {mostrarUSD && (<td className="p-4 text-right">
                                <span className="font-bold mint-text-accent">
                                  $
                                  {
                                    formatoMonto(
                                      item.pagadoUSD
                                    )
                                  }
                                </span>
                              </td>)}

                              <td className="p-4 text-right">

                                <div className="flex justify-end gap-2">

                                  <button
                                    type="button"
                                    onClick={() => {

                                      setDoctorDetalle(
                                        item.doctor
                                      );

                                      setMostrarDetalleDoctor(
                                        true
                                      );

                                    }}
                                    className="
                                      mint-btn
                                      mint-btn-action
                                      mint-btn-sm
                                    "
                                  >
                                    {tr("Ver detalle", "View details")}
                                  </button>

                                </div>

                              </td>

                            </tr>

                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>

              </div>


            </>

          )

          : (

            <>

              <div
                className={`
                  grid
                  ${mostrarMXN && mostrarUSD ? "md:grid-cols-3" : "md:grid-cols-2"}
                  gap-4
                `}
              >

                <div className="mint-card-primary relative overflow-hidden p-5 border border-[var(--mint-border-teal)] shadow-[0_8px_24px_rgba(15,42,65,0.05)]">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Especialistas", "Specialists")}
                  </p>

                  <p className="text-2xl font-bold mint-text-primary mt-2">
                    {
                      resumenEspecialistas.length
                    }
                  </p>
                </div>

                {mostrarMXN && (
<div className="mint-card relative overflow-hidden p-5 border border-[var(--mint-border)] shadow-[0_8px_24px_rgba(15,42,65,0.05)]">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Por pagar MXN", "MXN due")}
                  </p>

                  <p className="text-2xl font-bold text-[var(--mint-danger)] mt-2">
                    $
                    {
                      formatoMonto(
                        pendienteEspecialistasMXN
                      )
                    }
                  </p>
                </div>
)}

                {mostrarUSD && (
<div className="mint-card-accent relative overflow-hidden p-5 border border-[var(--mint-border)] shadow-[0_8px_24px_rgba(15,42,65,0.05)]">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Por pagar USD", "USD due")}
                  </p>

                  <p className="text-2xl font-bold mint-text-accent mt-2">
                    $
                    {
                      formatoMonto(
                        pendienteEspecialistasUSD
                      )
                    }
                  </p>
                </div>
)}

              </div>

              {
                estadoHonorarios !== "listo" ? (
                  <div className="mint-card p-6" role="status">{estadoHonorarios === "error" ? tr("Error consultando honorarios. Actualiza la página.", "Could not load fees. Refresh the page.") : tr("Consultando honorarios...", "Loading fees...")}</div>
                ) : resumenEspecialistas
                  .length === 0

                  ? (

                    <div className="mint-card p-10 text-center">
                      <p className="font-semibold mint-text-primary">
                        {tr("No hay tratamientos con especialista.", "There are no specialist treatments.")}
                      </p>
                    </div>

                  )

                  : resumenEspecialistas.map(
                      (
                        especialista
                      ) => (

                        <div
                          key={
                            especialista.id
                          }
                          className="
                            mint-card
                            overflow-hidden
                            border
                            border-[var(--mint-border)]
                            shadow-[0_10px_28px_rgba(15,42,65,0.055)]
                          "
                        >

                          <div
                            className="
                              px-6
                              py-5
                              border-b
                              border-[var(--mint-border)]
                              flex
                              flex-col
                              md:flex-row
                              md:items-center
                              md:justify-between
                              gap-4
                            "
                          >

                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mint-text-brand">
                                {tr("Especialista", "Specialist")}
                              </p>

                              <h3 className="text-xl font-bold mint-text-primary mt-1">
                                {
                                  especialista.nombre
                                }
                              </h3>
                            </div>

                            <div className="flex gap-3 flex-wrap">

                              {mostrarMXN && (<div className="px-4 py-2 rounded-xl bg-[var(--mint-danger-bg)] border border-[var(--mint-danger-border)]">
                                <p className="text-[10px] uppercase font-bold text-[var(--mint-danger)]">
                                  {tr("Pendiente MXN", "MXN pending")}
                                </p>

                                <p className="font-bold text-[var(--mint-danger)]">
                                  $
                                  {
                                    formatoMonto(
                                      especialista.pendienteMXN
                                    )
                                  }
                                </p>
                              </div>)}

                              {mostrarUSD && (<div className="px-4 py-2 rounded-xl bg-[var(--mint-warning-bg)] border border-[var(--mint-warning-border)]">
                                <p className="text-[10px] uppercase font-bold text-[var(--mint-warning)]">
                                  {tr("Pendiente USD", "USD pending")}
                                </p>

                                <p className="font-bold text-[var(--mint-warning)]">
                                  $
                                  {
                                    formatoMonto(
                                      especialista.pendienteUSD
                                    )
                                  }
                                </p>
                              </div>)}

                            </div>

                          </div>

                          <div className="overflow-x-auto">

                            <table className="mint-table w-full">

                              <thead>
                                <tr>
                                  <th className="p-4 text-left">
                                    {tr("Fecha", "Date")}
                                  </th>
                                  <th className="p-4 text-left">
                                    {tr("Tratamiento", "Treatment")}
                                  </th>
                                  <th className="p-4 text-left">
                                    {tr("Estado", "Status")}
                                  </th>
                                  <th className="p-4 text-right">
                                    {tr("Costo", "Cost")}
                                  </th>
                                  <th className="p-4 text-center">
                                    {tr("Pago", "Payment")}
                                  </th>
                                  <th className="p-4 text-right">
                                    {tr("Acción", "Action")}
                                  </th>
                                </tr>
                              </thead>

                              <tbody>

                                {
                                  especialista
                                    .tratamientos
                                    .map(
                                      (
                                        tratamiento
                                      ) => {

                                        const pagado =
                                          tratamiento
                                            .especialista_pagado ===
                                          true;

                                        const finalizado =
                                          tratamiento.estado ===
                                          "Finalizado";
                                        return (

                                          <tr
                                            key={
                                              tratamiento.pago_id ?? `legacy-${tratamiento.id}`
                                            }
                                            className="mint-table-row"
                                          >

                                            <td className="p-4 mint-text-secondary whitespace-nowrap">
                                              {
                                                tratamiento.fecha ? new Date(tratamiento.fecha).toLocaleDateString(locale, { timeZone: "America/Hermosillo" }) : "—"
                                              }
                                            </td>

                                            <td className="p-4">
                                              <p className="font-semibold mint-text-primary">
                                                {
                                                  tratamiento.tratamiento ||
                                                  tr("Tratamiento", "Treatment")
                                                }
                                              </p>
                                            </td>

                                            <td className="p-4">
                                              <span
                                                className={`
                                                  inline-flex
                                                  px-3
                                                  py-1
                                                  rounded-full
                                                  text-xs
                                                  font-semibold
                                                  border

                                                  ${
                                                    finalizado

                                                      ? `
                                                        bg-[var(--mint-success-bg)]
                                                        text-[var(--mint-success)]
                                                        border-[var(--mint-success-border)]
                                                      `

                                                      : `
                                                        bg-[var(--mint-bg-soft)]
                                                        mint-text-secondary
                                                        border-[var(--mint-border)]
                                                      `
                                                  }
                                                `}
                                              >
                                                {
                                                  tratamiento.estado ||
                                                  tr("Pendiente", "Pending")
                                                }
                                              </span>
                                            </td>

                                            <td className="p-4 text-right whitespace-nowrap">
                                              <span className="font-bold mint-text-primary">
                                                $
                                                {
                                                  formatoMonto(
                                                    Number(
                                                      tratamiento.especialista ||
                                                      0
                                                    )
                                                  )
                                                }
                                              </span>

                                              <span className="ml-2 text-xs mint-text-muted">
                                                {
                                                  tratamiento.moneda_especialista ===
                                                  "USD"
                                                    ? "USD"
                                                    : "MXN"
                                                }
                                              </span>
                                            </td>

                                            <td className="p-4 text-center">

                                              {
                                                pagado

                                                  ? (

                                                    <div>
                                                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[var(--mint-success-bg)] text-[var(--mint-success)] border border-[var(--mint-success-border)]">
                                                        {tr("Pagado", "Paid")}
                                                      </span>

                                                       <p className="text-[10px] mint-text-muted mt-1">
                                                        {traducirMetodo(tratamiento.especialista_metodo_pago || "—")}
                                                      </p>
                                                      <p className="text-xs font-semibold mint-text-primary mt-1">
                                                        ${formatoMonto(Number(tratamiento.especialista_pago_monto || 0))}
                                                        {" "}{tratamiento.especialista_pago_moneda || "—"}
                                                      </p>
                                                      {tratamiento.especialista_pago_tipo_cambio != null && (
                                                        <p className="text-[10px] mint-text-muted mt-1">
                                                          {tr("Tipo de cambio", "Exchange rate")}: {Number(tratamiento.especialista_pago_tipo_cambio).toFixed(4)}
                                                        </p>
                                                      )}
                                                    </div>

                                                  )

                                                  : (

                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[var(--mint-danger-bg)] text-[var(--mint-danger)] border border-[var(--mint-danger-border)]">
                                                      {tr("Pendiente", "Pending")}
                                                    </span>

                                                  )
                                              }

                                            </td>

                                            <td className="p-4 text-right">

                                              {
                                                pagado

                                                  ? (

                                                    <span className="text-xs mint-text-muted">
                                                      {
                                                        tratamiento.especialista_fecha_pago
                                                          ? new Date(
                                                              tratamiento.especialista_fecha_pago
                                                            )
                                                              .toLocaleDateString(locale, { timeZone: "America/Hermosillo" })
                                                          : tr("Registrado", "Recorded")
                                                      }
                                                    </span>

                                                  )

                                                  : Boolean(tratamiento.pago_id) && esAdmin && estadoHonorarios === "listo"

                                                    ? (

                                                      <button
                                                        type="button"
                                                        onClick={() => {

                                                          setFormaPagoEspecialista("Efectivo");
                                                          setMonedaPagoEspecialista(
                                                            tratamiento.moneda_especialista === "USD" ? "USD" : "MXN"
                                                          );
                                                          setFechaPagoEspecialista(obtenerFechaLocalMintOS());
                                                          setTratamientoPago(tratamiento);

                                                        }}
                                                        className="
                                                          mint-btn
                                                          mint-btn-primary
                                                          mint-btn-sm
                                                        "
                                                      >
                                                        {tr("Pagar", "Pay")}
                                                      </button>

                                                    )

                                                    : (

                                                      <span className="text-xs mint-text-muted">
                                                        {tr("Pendiente", "Pending")}
                                                      </span>

                                                    )
                                              }

                                            </td>

                                          </tr>

                                        );

                                      }
                                    )
                                }

                              </tbody>

                            </table>

                          </div>

                        </div>

                      )
                    )
              }

            </>

          )
      }

      {
        tratamientoPago &&
        (

          <div
            className="
              fixed
              inset-0
              z-[1000]
              flex
              items-center
              justify-center
              bg-black/60
              p-4
            "
          >

            <div
              className="
                mint-card
                w-full
                max-w-lg
                p-6
                shadow-2xl
              "
            >

              <h3 className="text-xl font-bold mint-text-primary">
                {tr("Pagar especialista", "Pay specialist")}
              </h3>

              <p className="text-sm mint-text-secondary mt-2">
                {
                  tratamientoPago.especialista_nombre ||
                  tr("Especialista", "Specialist")
                }
              </p>

              <p className="text-xs mint-text-muted mt-1">
                {
                  tratamientoPago.tratamiento ||
                  tr("Tratamiento", "Treatment")
                }
              </p>

              <div className="mt-5 rounded-xl border border-[var(--mint-border)] bg-[var(--mint-bg-soft)] p-4">
                <p className="text-xs mint-text-muted">{tr("Honorario proporcional", "Proportional specialist fee")}</p>
                <p className="mt-1 text-lg font-bold mint-text-primary">
                  ${formatoMonto(Number(tratamientoPago.especialista || 0))} {monedaHonorariosEspecialista}
                </p>
              </div>

              <div className="mt-4">
                <label className="mint-label" htmlFor="fechaPagoEspecialista">{tr("Fecha de pago", "Payment date")}</label>
                <input id="fechaPagoEspecialista" type="date" required
                  className="mint-input" value={fechaPagoEspecialista}
                  max={obtenerFechaLocalMintOS()} disabled={guardando}
                  onChange={event => setFechaPagoEspecialista(event.target.value)} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mint-label">{tr("Método de pago", "Payment method")}</label>
                  <select
                    value={formaPagoEspecialista}
                    disabled={guardando}
                    onChange={(event) => {
                      const metodo = event.target.value as FormaPagoEspecialista;
                      setFormaPagoEspecialista(metodo);
                      if (metodo === "Transferencia") setMonedaPagoEspecialista("MXN");
                    }}
                    className="mint-input"
                  >
                    <option value="Efectivo">{tr("Efectivo", "Cash")}</option>
                    <option value="Transferencia">{tr("Transferencia", "Bank transfer")}</option>
                  </select>
                </div>
                <div>
                  <label className="mint-label">{tr("Moneda de pago", "Payment currency")}</label>
                  <select
                    value={monedaPagoEspecialista}
                    disabled={guardando || formaPagoEspecialista === "Transferencia"}
                    onChange={(event) => setMonedaPagoEspecialista(event.target.value as MonedaPagoEspecialista)}
                    className="mint-input"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              {requiereConversionEspecialista && (
                <div className="mt-4 rounded-xl border border-[var(--mint-border)] bg-[var(--mint-bg-soft)] p-3 text-sm mint-text-secondary">
                  {tr("Tipo de cambio vigente", "Current exchange rate")}: {cargandoTipoCambioEspecialista
                    ? tr("Consultando...", "Loading...")
                    : tipoCambioEspecialista
                      ? `1 USD = ${tipoCambioEspecialista.toFixed(4)} MXN`
                      : tr("No disponible. Revisa Configuración → Finanzas.", "Unavailable. Check Settings → Finance.")}
                </div>
              )}

              <div className="mt-4">
                <label className="mint-label">{tr("Importe a liquidar", "Settlement amount")}</label>
                <input
                  type="text"
                  readOnly
                  value={importePagoEspecialista === null
                    ? tr("No disponible", "Unavailable")
                    : `$${formatoMonto(importePagoEspecialista)} ${monedaPagoEspecialista}`}
                  className="mint-input font-semibold"
                />
                <p className="mt-2 text-xs mint-text-muted">
                  {tr("Se liquida el honorario correspondiente a este cobro.",
                    "This settles the specialist fee associated with this collection.")}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => {

                    setTratamientoPago(
                      null
                    );


                  }}
                  className="mint-btn mint-btn-secondary"
                >
                  {tr("Cancelar", "Cancel")}
                </button>

                <button
                  type="button"
                  disabled={guardando || !validarFechaEfectivaMintOS(fechaPagoEspecialista) || importePagoEspecialista === null || importePagoEspecialista <= 0}
                  onClick={
                    registrarPagoEspecialista
                  }
                  className="mint-btn mint-btn-primary"
                >
                  {
                    guardando
                      ? tr("Guardando...", "Saving...")
                      : tr("Confirmar pago", "Confirm payment")
                  }
                </button>

              </div>

            </div>

          </div>

        )
      }

    </div>

  );

}