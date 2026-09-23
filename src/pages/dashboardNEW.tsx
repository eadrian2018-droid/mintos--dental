import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Check,
  Clock3,
  Plus,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import {
  useLanguage,
} from "../context/LanguageContext";

export default function Dashboard() {

  const {
    language,
  } = useLanguage();

  const es =
    language === "es";

  const [
    ,
    setTotalPacientes,
  ] = useState(0);

  const [
    ,
    setTotalCitas,
  ] = useState(0);

  const [
    citasHoy,
    setCitasHoy,
  ] = useState<any[]>([]);

  const [, setPacientesNuevosMes] = useState(0);
  const [, setTratamientosPendientes] = useState(0);
  const [, setCobrosHoy] = useState(0);
  const [, setSaldoPendiente] = useState(0);
  const [, setTipoCambio] = useState(0);

  const [
    recordatorios,
    setRecordatorios,
  ] = useState<any[]>([]);

  const [
    mostrarNuevoRecordatorio,
    setMostrarNuevoRecordatorio,
  ] = useState(false);

  const [
    mensajeRecordatorio,
    setMensajeRecordatorio,
  ] = useState("");

  const [
    prioridadRecordatorio,
    setPrioridadRecordatorio,
  ] = useState("normal");

  const [
    guardandoRecordatorio,
    setGuardandoRecordatorio,
  ] = useState(false);

  const [
    ,
    setCargando,
  ] = useState(true);

  useEffect(() => {

    cargarDashboard();

  }, []);

  async function cargarDashboard() {

    setCargando(true);

    const hoy =
      new Date()
        .toLocaleDateString(
          "en-CA"
        );

    const inicioHoy =
      `${hoy}T00:00:00`;

    const finHoy =
      `${hoy}T23:59:59`;

    const ahora = new Date();

    const inicioMes =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        1
      ).toISOString();

    const finMes =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth() + 1,
        1
      ).toISOString();

    const [
      pacientesResponse,
      citasResponse,
      citasHoyResponse,
      pagosHoyResponse,
      pacientesMesResponse,
      tratamientosResponse,
      tipoCambioResponse,
      recordatoriosResponse,
    ] =
      await Promise.all([

        supabase
          .from("pacientes")
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("citas")
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("citas")
          .select("*")
          .gte(
            "inicio",
            inicioHoy
          )
          .lte(
            "inicio",
            finHoy
          )
          .order(
            "inicio",
            {
              ascending: true,
            }
          ),

        supabase
          .from("pagos")
          .select(
            "monto_mxn, created_at"
          )
          .gte(
            "created_at",
            inicioHoy
          )
          .lte(
            "created_at",
            finHoy
          ),

        supabase
          .from("pacientes")
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          )
          .gte("created_at", inicioMes)
          .lt("created_at", finMes),

        supabase
          .from("tratamientos")
          .select("resta, pendiente"),

        supabase
          .from("configuracion_finanzas")
          .select("valor")
          .eq("clave", "tipo_cambio_usd_mxn")
          .maybeSingle(),

        supabase
          .from("recordatorios")
          .select("*")
          .order("completado", { ascending: true })
          .order("created_at", { ascending: false }),

      ]);

    setTotalPacientes(
      pacientesResponse.count || 0
    );

    setTotalCitas(
      citasResponse.count || 0
    );

    setCitasHoy(
      citasHoyResponse.data || []
    );

    const totalCobrosHoy =
      (
        pagosHoyResponse.data || []
      ).reduce(
        (
          total,
          pago: any
        ) =>
          total +
          Number(
            pago.monto_mxn || 0
          ),
        0
      );

    setCobrosHoy(
      totalCobrosHoy
    );

    setPacientesNuevosMes(
      pacientesMesResponse.count || 0
    );

    const tratamientosActivos =
      (tratamientosResponse.data || [])
        .filter(
          (tratamiento: any) =>
            Number(tratamiento.resta || 0) > 0 ||
            tratamiento.pendiente === true
        );

    setTratamientosPendientes(
      tratamientosActivos.length
    );

    setSaldoPendiente(
      tratamientosActivos.reduce(
        (total: number, tratamiento: any) =>
          total + Number(tratamiento.resta || 0),
        0
      )
    );

    setTipoCambio(
      Number(tipoCambioResponse.data?.valor || 0)
    );

    setRecordatorios(
      recordatoriosResponse.data || []
    );

    setCargando(false);

  }

  async function crearRecordatorio() {

    const mensaje =
      mensajeRecordatorio.trim();

    if (!mensaje) {
      return;
    }

    setGuardandoRecordatorio(true);

    const {
      data: usuarioData,
    } = await supabase.auth.getUser();

    const usuario =
      usuarioData.user;

    if (!usuario) {
      setGuardandoRecordatorio(false);
      return;
    }

    const nombre =
      usuario.user_metadata?.nombre ||
      usuario.user_metadata?.full_name ||
      usuario.email ||
      (es ? "Usuario" : "User");

    const { error } =
      await supabase
        .from("recordatorios")
        .insert({
          mensaje,
          creado_por: usuario.id,
          creado_por_nombre: nombre,
          asignado_a: "Todos",
          prioridad: prioridadRecordatorio,
        });

    setGuardandoRecordatorio(false);

    if (error) {
      window.alert(
        es
          ? "No se pudo guardar el recordatorio."
          : "The reminder could not be saved."
      );
      return;
    }

    setMensajeRecordatorio("");
    setPrioridadRecordatorio("normal");
    setMostrarNuevoRecordatorio(false);
    await cargarRecordatorios();

  }

  async function cargarRecordatorios() {

    const { data } =
      await supabase
        .from("recordatorios")
        .select("*")
        .order("completado", { ascending: true })
        .order("created_at", { ascending: false });

    setRecordatorios(data || []);

  }

  async function completarRecordatorio(
    recordatorio: any
  ) {

    const nuevoEstado =
      !recordatorio.completado;

    const {
      data: usuarioData,
    } = await supabase.auth.getUser();

    const { error } =
      await supabase
        .from("recordatorios")
        .update({
          completado: nuevoEstado,
          completado_at: nuevoEstado
            ? new Date().toISOString()
            : null,
          completado_por: nuevoEstado
            ? usuarioData.user?.id || null
            : null,
        })
        .eq("id", recordatorio.id);

    if (error) {
      window.alert(
        es
          ? "No se pudo actualizar el recordatorio."
          : "The reminder could not be updated."
      );
      return;
    }

    await cargarRecordatorios();

  }

  async function eliminarRecordatorio(
    id: number
  ) {

    const confirmar =
      window.confirm(
        es
          ? "¿Eliminar este recordatorio?"
          : "Delete this reminder?"
      );

    if (!confirmar) {
      return;
    }

    const { error } =
      await supabase
        .from("recordatorios")
        .delete()
        .eq("id", id);

    if (error) {
      window.alert(
        es
          ? "Solo quien creó el recordatorio puede eliminarlo."
          : "Only the person who created the reminder can delete it."
      );
      return;
    }

    await cargarRecordatorios();

  }

  const recordatoriosPendientes =
    recordatorios.filter(
      (recordatorio) =>
        !recordatorio.completado
    );

  const recordatoriosCompletados =
    recordatorios.filter(
      (recordatorio) =>
        recordatorio.completado
    );

  const fechaActual =
    useMemo(
      () =>
        new Date()
          .toLocaleDateString(
            es
              ? "es-MX"
              : "en-US",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          ),
      [
        es,
      ]
    );

  const citasPendientes =
    citasHoy.filter(
      (cita) =>
        String(
          cita.estado || ""
        )
          .toLowerCase() !==
        "cancelada"
    ).length;

  const doctoresHoy =
    new Set(
      citasHoy
        .map(
          (cita) =>
            cita.doctor
        )
        .filter(Boolean)
    ).size;

  function obtenerEstadoCita(
    estado: string
  ) {

    const estadoNormalizado =
      String(
        estado || "pendiente"
      ).toLowerCase();

    if (
      estadoNormalizado ===
        "confirmada" ||
      estadoNormalizado ===
        "confirmado"
    ) {

      return {
        texto: es ? "Confirmada" : "Confirmed",
        clase:
          "bg-[var(--mint-success-bg)] text-[var(--mint-success)] border-[var(--mint-success-border)]",
      };

    }

    if (
      estadoNormalizado ===
        "cancelada" ||
      estadoNormalizado ===
        "cancelado"
    ) {

      return {
        texto: es ? "Cancelada" : "Cancelled",
        clase:
          "bg-[var(--mint-danger-bg)] text-[var(--mint-danger)] border-[var(--mint-danger-border)]",
      };

    }

    if (
      estadoNormalizado ===
        "completada" ||
      estadoNormalizado ===
        "completado" ||
      estadoNormalizado ===
        "finalizada" ||
      estadoNormalizado ===
        "finalizado"
    ) {

      return {
        texto: es ? "Completada" : "Completed",
        clase:
          "bg-[var(--mint-info-bg)] text-[var(--mint-info)] border-[var(--mint-info-border)]",
      };

    }

    return {
      texto: es ? "Pendiente" : "Pending",
      clase:
        "bg-[var(--mint-warning-bg)] text-[var(--mint-warning)] border-[var(--mint-warning-border)]",
    };

  }

  return (

    <div
      className="
        space-y-7
      "
    >

      <div
        className="
          flex
          flex-col
          xl:flex-row
          xl:items-end
          xl:justify-between
          gap-4
        "
      >

        <div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
              text-[var(--mint-primary)]
              text-xs
              font-bold
              mb-3
            "
          >
            <Stethoscope
              size={14}
            />

            {es ? "Vista general" : "Overview"}
          </div>

          <h1
            className="
              text-3xl
              lg:text-4xl
              font-bold
              mint-text-primary
              tracking-tight
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mint-text-secondary
              mt-2
              text-sm
              lg:text-base
              capitalize
            "
          >
            {fechaActual}
          </p>

        </div>

        <div
          className="
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-2xl
            bg-[var(--mint-bg-soft)]
            border
            border-[var(--mint-border)]
          "
        >

          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
              flex
              items-center
              justify-center
              text-[var(--mint-primary)]
            "
          >
            <Clock3
              size={18}
            />
          </div>

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-wide
                font-bold
                mint-text-muted
              "
            >
              {es ? "Operación de hoy" : "Today's operation"}
            </p>

            <p
              className="
                text-sm
                font-semibold
                mint-text-primary
                mt-0.5
              "
            >
              {citasHoy.length} {es ? "citas" : "appointments"} · {doctoresHoy} {es ? "doctores" : "doctors"}
            </p>

          </div>

        </div>

      </div>

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-[260px_minmax(0,1fr)]
          gap-4
          items-stretch
        "
      >

        <div
          className="
            mint-card
            p-5
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-muted
                "
              >
                {es ? "Citas hoy" : "Appointments today"}
              </p>

              <p
                className="
                  text-4xl
                  font-bold
                  mint-text-primary
                  mt-3
                "
              >
                {citasHoy.length}
              </p>

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mt-1
                "
              >
                {citasPendientes} {es ? "activas" : "active"}
              </p>

            </div>

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-[var(--mint-warning-bg)]
                border
                border-[var(--mint-warning-border)]
                flex
                items-center
                justify-center
                text-[var(--mint-warning)]
              "
            >
              <Clock3 size={20} />
            </div>

          </div>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              px-5
              sm:px-6
              py-5
              border-b
              border-[var(--mint-border)]
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-[var(--mint-primary-soft)]
                  border
                  border-[var(--mint-border-primary)]
                  flex
                  items-center
                  justify-center
                  text-[var(--mint-primary)]
                "
              >
                <Bell size={20} />
              </div>

              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    mint-text-primary
                  "
                >
                  {es ? "Recordatorios" : "Reminders"}
                </h2>

                <p
                  className="
                    text-sm
                    mint-text-secondary
                    mt-0.5
                  "
                >
                  {recordatoriosPendientes.length} {es ? "pendientes" : "pending"}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setMostrarNuevoRecordatorio(true)
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-[var(--mint-primary)]
                text-white
                text-sm
                font-bold
                hover:opacity-90
                transition
              "
            >
              <Plus size={17} />
              {es ? "Agregar recordatorio" : "Add reminder"}
            </button>

          </div>

          {mostrarNuevoRecordatorio && (
            <div
              className="
                px-5
                sm:px-6
                py-5
                bg-[var(--mint-bg-soft)]
                border-b
                border-[var(--mint-border)]
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  mb-4
                "
              >
                <div>
                  <p className="text-sm font-bold mint-text-primary">
                    {es ? "Nuevo recordatorio" : "New reminder"}
                  </p>
                  <p className="text-xs mint-text-secondary mt-1">
                    {es ? "Visible para todo el equipo" : "Visible to the entire team"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMostrarNuevoRecordatorio(false);
                    setMensajeRecordatorio("");
                    setPrioridadRecordatorio("normal");
                  }}
                  className="
                    w-9
                    h-9
                    rounded-xl
                    border
                    border-[var(--mint-border)]
                    mint-text-secondary
                    flex
                    items-center
                    justify-center
                    hover:bg-[var(--mint-bg)]
                    transition
                  "
                  aria-label={es ? "Cerrar" : "Close"}
                >
                  <X size={17} />
                </button>
              </div>

              <textarea
                value={mensajeRecordatorio}
                onChange={(event) =>
                  setMensajeRecordatorio(
                    event.target.value
                  )
                }
                rows={3}
                placeholder={
                  es
                    ? "Ej. Llamar a Roberto para confirmar su cita de mañana..."
                    : "E.g. Call Roberto to confirm tomorrow's appointment..."
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg)]
                  mint-text-primary
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-[var(--mint-primary)]
                  resize-none
                "
              />

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-3
                  mt-4
                "
              >

                <div
                  className="
                    inline-flex
                    p-1
                    rounded-xl
                    bg-[var(--mint-bg)]
                    border
                    border-[var(--mint-border)]
                  "
                >
                  {[
                    ["normal", es ? "Normal" : "Normal"],
                    ["importante", es ? "Importante" : "Important"],
                    ["urgente", es ? "Urgente" : "Urgent"],
                  ].map(([valor, etiqueta]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() =>
                        setPrioridadRecordatorio(valor)
                      }
                      className={`
                        px-3
                        py-1.5
                        rounded-lg
                        text-xs
                        font-bold
                        transition
                        ${
                          prioridadRecordatorio === valor
                            ? "bg-[var(--mint-primary-soft)] text-[var(--mint-primary)]"
                            : "mint-text-secondary"
                        }
                      `}
                    >
                      {etiqueta}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={crearRecordatorio}
                  disabled={
                    guardandoRecordatorio ||
                    !mensajeRecordatorio.trim()
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    bg-[var(--mint-primary)]
                    text-white
                    text-sm
                    font-bold
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    hover:opacity-90
                    transition
                  "
                >
                  <Bell size={16} />
                  {guardandoRecordatorio
                    ? (es ? "Guardando..." : "Saving...")
                    : (es ? "Guardar recordatorio" : "Save reminder")}
                </button>

              </div>

            </div>
          )}

          <div
            className="
              p-4
              sm:p-5
              max-h-[430px]
              overflow-y-auto
            "
          >

            {recordatoriosPendientes.length === 0 ? (
              <div
                className="
                  py-10
                  text-center
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-[var(--mint-primary-soft)]
                    border
                    border-[var(--mint-border-primary)]
                    text-[var(--mint-primary)]
                    flex
                    items-center
                    justify-center
                    mx-auto
                    mb-3
                  "
                >
                  <Check size={20} />
                </div>
                <p className="text-sm font-bold mint-text-primary">
                  {es ? "No hay recordatorios pendientes" : "No pending reminders"}
                </p>
                <p className="text-xs mint-text-secondary mt-1">
                  {es ? "El equipo está al día." : "The team is up to date."}
                </p>
              </div>
            ) : (
              <div
                className="
                  space-y-3
                "
              >
                {recordatoriosPendientes.map(
                  (recordatorio) => (
                    <div
                      key={recordatorio.id}
                      className={`
                        rounded-2xl
                        border
                        p-4
                        ${
                          recordatorio.prioridad === "urgente"
                            ? "bg-[var(--mint-danger-bg)] border-[var(--mint-danger-border)]"
                            : recordatorio.prioridad === "importante"
                              ? "bg-[var(--mint-warning-bg)] border-[var(--mint-warning-border)]"
                              : "bg-[var(--mint-bg-soft)] border-[var(--mint-border)]"
                        }
                      `}
                    >

                      <div
                        className="
                          flex
                          flex-col
                          lg:flex-row
                          lg:items-center
                          gap-4
                        "
                      >

                        <div className="flex-1 min-w-0">
                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              flex-wrap
                              mb-1.5
                            "
                          >
                            {recordatorio.prioridad !== "normal" && (
                              <span
                                className={`
                                  inline-flex
                                  px-2.5
                                  py-1
                                  rounded-full
                                  text-[10px]
                                  uppercase
                                  tracking-wide
                                  font-bold
                                  ${
                                    recordatorio.prioridad === "urgente"
                                      ? "text-[var(--mint-danger)] border border-[var(--mint-danger-border)]"
                                      : "text-[var(--mint-warning)] border border-[var(--mint-warning-border)]"
                                  }
                                `}
                              >
                                {recordatorio.prioridad === "urgente"
                                  ? (es ? "Urgente" : "Urgent")
                                  : (es ? "Importante" : "Important")}
                              </span>
                            )}
                          </div>

                          <p
                            className="
                              text-sm
                              font-semibold
                              mint-text-primary
                              leading-relaxed
                            "
                          >
                            {recordatorio.mensaje}
                          </p>

                          <p
                            className="
                              text-xs
                              mint-text-muted
                              mt-2
                            "
                          >
                            {recordatorio.creado_por_nombre || (es ? "Usuario" : "User")}
                            {" · "}
                            {new Date(recordatorio.created_at).toLocaleString(
                              es ? "es-MX" : "en-US",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            shrink-0
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              completarRecordatorio(recordatorio)
                            }
                            className="
                              inline-flex
                              items-center
                              justify-center
                              gap-2
                              px-3.5
                              py-2
                              rounded-xl
                              bg-[var(--mint-primary-soft)]
                              border
                              border-[var(--mint-border-primary)]
                              text-[var(--mint-primary)]
                              text-xs
                              font-bold
                              hover:opacity-80
                              transition
                            "
                          >
                            <Check size={15} />
                            {es ? "Completar" : "Complete"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              eliminarRecordatorio(recordatorio.id)
                            }
                            className="
                              w-9
                              h-9
                              rounded-xl
                              border
                              border-[var(--mint-border)]
                              text-[var(--mint-danger)]
                              flex
                              items-center
                              justify-center
                              hover:bg-[var(--mint-danger-bg)]
                              transition
                            "
                            aria-label={es ? "Eliminar recordatorio" : "Delete reminder"}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                      </div>

                    </div>
                  )
                )}
              </div>
            )}

            {recordatoriosCompletados.length > 0 && (
              <details className="mt-4">
                <summary
                  className="
                    cursor-pointer
                    text-xs
                    font-bold
                    mint-text-muted
                    select-none
                  "
                >
                  {es ? "Completados" : "Completed"} ({recordatoriosCompletados.length})
                </summary>

                <div className="space-y-2 mt-3">
                  {recordatoriosCompletados.map(
                    (recordatorio) => (
                      <div
                        key={recordatorio.id}
                        className="
                          flex
                          flex-col
                          sm:flex-row
                          sm:items-center
                          gap-3
                          px-4
                          py-3
                          rounded-xl
                          bg-[var(--mint-bg-soft)]
                          border
                          border-[var(--mint-border)]
                          opacity-70
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            completarRecordatorio(recordatorio)
                          }
                          className="
                            w-8
                            h-8
                            rounded-lg
                            bg-[var(--mint-primary-soft)]
                            border
                            border-[var(--mint-border-primary)]
                            text-[var(--mint-primary)]
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                          aria-label={es ? "Reabrir recordatorio" : "Reopen reminder"}
                        >
                          <Check size={14} />
                        </button>

                        <p
                          className="
                            flex-1
                            text-xs
                            mint-text-secondary
                            line-through
                          "
                        >
                          {recordatorio.mensaje}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarRecordatorio(recordatorio.id)
                          }
                          className="
                            w-8
                            h-8
                            rounded-lg
                            text-[var(--mint-danger)]
                            flex
                            items-center
                            justify-center
                            hover:bg-[var(--mint-danger-bg)]
                            transition
                          "
                          aria-label={es ? "Eliminar recordatorio" : "Delete reminder"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </details>
            )}

          </div>

        </div>

      </div>

      <div
        className="
          mint-card
          overflow-hidden
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
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {es ? "Agenda de hoy" : "Today's schedule"}
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {es ? "Próximas citas programadas" : "Upcoming scheduled appointments"}
            </p>

          </div>

          <div
            className="
              px-3
              py-1.5
              rounded-xl
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
              text-[var(--mint-primary)]
              text-xs
              font-bold
            "
          >
            {citasHoy.length} {es ? "citas" : "appointments"}
          </div>

        </div>

        <div
          className="
            p-4
            sm:p-5
          "
        >

          {
            citasHoy.length ===
            0
              ? (

                <div
                  className="
                    mint-empty
                    py-12
                  "
                >
                  {es ? "No hay citas programadas para hoy" : "No appointments scheduled for today"}
                </div>

              )
              : (

                <div
                  className="
                    divide-y
                    divide-[var(--mint-border)]
                  "
                >

                  {
                    citasHoy.map(
                      (cita) => {

                        const estado =
                          obtenerEstadoCita(
                            cita.estado
                          );

                        return (

                          <div
                            key={
                              cita.id
                            }
                            className="
                              py-4
                              first:pt-0
                              last:pb-0
                              flex
                              flex-col
                              md:flex-row
                              md:items-center
                              gap-4
                            "
                          >

                            <div
                              className="
                                min-w-[92px]
                                md:border-r
                                md:border-[var(--mint-border)]
                                md:pr-5
                              "
                            >

                              <p
                                className="
                                  text-base
                                  font-bold
                                  text-[var(--mint-primary)]
                                "
                              >
                                {
                                  new Date(
                                    cita.inicio
                                  ).toLocaleTimeString(
                                    es
                                      ? "es-MX"
                                      : "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                }
                              </p>

                            </div>

                            <div
                              className="
                                flex-1
                                min-w-0
                              "
                            >

                              <h3
                                className="
                                  text-sm
                                  font-bold
                                  mint-text-primary
                                  truncate
                                "
                              >
                                {
                                  cita.paciente ||
                                  (es ? "Paciente" : "Patient")
                                }
                              </h3>

                              <p
                                className="
                                  text-xs
                                  mint-text-secondary
                                  mt-1
                                "
                              >
                                {
                                  cita.doctor ||
                                  (es ? "Doctor sin asignar" : "Unassigned doctor")
                                }
                              </p>

                            </div>

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                flex-wrap
                              "
                            >

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  px-3
                                  py-1.5
                                  rounded-full
                                  border
                                  text-xs
                                  font-bold
                                  ${estado.clase}
                                `}
                              >
                                {
                                  estado.texto
                                }
                              </span>

                            </div>

                          </div>

                        );

                      }
                    )
                  }

                </div>

              )
          }

        </div>

      </div>

    </div>

  );

}
