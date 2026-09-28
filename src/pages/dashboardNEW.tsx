import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  CalendarDays,
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
        min-h-full
        space-y-6
        bg-transparent
        p-1
        lg:p-2
      "
    >

      {/* DASHBOARD HEADER */}
      <header
        className="
          flex
          flex-col
          md:flex-row
          md:items-end
          md:justify-between
          gap-4
          px-7
          py-6
          rounded-[24px]
          bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)]
          dark:bg-[linear-gradient(120deg,#0c2f4d_0%,#103b55_58%,#0b7f73_100%)]
          border
          border-[#d2e6e2]
          dark:border-[#17465f]
          shadow-[0_14px_34px_rgba(15,42,65,0.07)]
        "
      >
        <div>
          <div
            className="
              inline-flex
              items-center
              gap-2
              text-[10px]
              uppercase
              tracking-[0.15em]
              font-extrabold
              text-[#0b8f80]
            "
          >
            <Stethoscope size={13} />
            {es ? "MintOS · Centro clínico" : "MintOS · Clinical center"}
          </div>

          <h1
            className="
              mt-1.5
              text-[28px]
              font-extrabold
              tracking-[-0.035em]
              text-white
              dark:text-white
            "
          >
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-white/70 capitalize">
            {fechaActual}
          </p>
        </div>

        <div
          className="
            hidden
            md:block
            w-36
            h-[4px]
            rounded-full
            bg-gradient-to-r
            from-[#149c89]
            via-[#63c8b2]
            to-[#d8bd72]
            shadow-[0_3px_12px_rgba(20,156,137,0.16)]
          "
        />
      </header>

      {/* REMINDERS FIRST */}
<section
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-[#d7e6e4]
            dark:border-white/[0.08]
            bg-white
            dark:bg-[#102331]
            shadow-[0_16px_36px_rgba(15,42,65,0.065)]
          "
        >
          <div
            className="
              absolute
              inset-x-0
              top-0
              h-[3px]
              bg-gradient-to-r
              from-[#2ab79e]
              via-[#6fc7ad]
              to-[#d8bd72]
            "
          />

          <div
            className="
              px-5
              pt-6
              pb-4
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div className="flex items-center gap-3.5">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-gradient-to-br
                  from-[#087e86]
                  to-[#0aa17f]
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow-[0_8px_18px_rgba(10,143,128,0.20)]
                "
              >
                <Bell size={18} />
              </div>

              <div>
                <span
                  className="
                    inline-flex
                    rounded-full
                    border
                    border-[#bfe4dc]
                    dark:border-[#285e58]
                    bg-[#eaf8f5]
                    dark:bg-[#123d3a]
                    px-2.5
                    py-1
                    text-[9px]
                    uppercase
                    tracking-[0.10em]
                    font-extrabold
                    text-[#087d71]
                    dark:text-[#71dfcb]
                  "
                >
                  {es ? "Equipo" : "Team"}
                </span>

                <h2
                  className="
                    mt-2
                    text-[20px]
                    font-extrabold
                    tracking-[-0.02em]
                    text-[#102f4f]
                    dark:text-white
                  "
                >
                  {es ? "Recordatorios" : "Reminders"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMostrarNuevoRecordatorio(true)}
              className="
                group
                w-11
                h-11
                rounded-full
                bg-gradient-to-br
                from-[#087e86]
                to-[#0aa17f]
                text-white
                flex
                items-center
                justify-center
                shadow-[0_8px_20px_rgba(10,143,128,0.22)]
                hover:-translate-y-0.5
                hover:shadow-[0_12px_24px_rgba(10,143,128,0.28)]
                transition-all
              "
              title={es ? "Agregar recordatorio" : "Add reminder"}
            >
              <Plus
                size={18}
                className="transition-transform group-hover:rotate-90"
              />
            </button>
          </div>

          <div className="px-5 pb-5">

            {mostrarNuevoRecordatorio && (
              <div
                className="
                  mb-4
                  rounded-[18px]
                  border
                  border-[#cfe5e2]
                  dark:border-white/10
                  bg-[#f7fbfa]
                  dark:bg-white/[0.035]
                  p-4
                "
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-extrabold mint-text-primary">
                      {es ? "Nuevo recordatorio" : "New reminder"}
                    </p>
                    <p className="mt-0.5 text-[11px] mint-text-secondary">
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
                      w-8
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      mint-text-secondary
                      hover:bg-black/[0.04]
                      dark:hover:bg-white/[0.06]
                      transition
                    "
                  >
                    <X size={15} />
                  </button>
                </div>

                <textarea
                  value={mensajeRecordatorio}
                  onChange={(event) => setMensajeRecordatorio(event.target.value)}
                  rows={3}
                  placeholder={
                    es
                      ? "Escribe algo que el equipo no debe olvidar..."
                      : "Write something the team should not forget..."
                  }
                  className="
                    w-full
                    rounded-[14px]
                    border
                    border-[#d9e7e8]
                    dark:border-white/10
                    bg-white
                    dark:bg-[#0d2232]
                    mint-text-primary
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#48bfa9]
                    focus:ring-4
                    focus:ring-[#48bfa9]/10
                    resize-none
                    transition
                  "
                />

                <div className="mt-3 space-y-3">
                  <div
                    className="
                      inline-flex
                      p-1
                      rounded-full
                      border
                      border-[#dce8e9]
                      dark:border-white/10
                      bg-white
                      dark:bg-[#0d2232]
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
                        onClick={() => setPrioridadRecordatorio(valor)}
                        className={`
                          px-3
                          py-1.5
                          rounded-full
                          text-[10px]
                          font-extrabold
                          transition
                          ${
                            prioridadRecordatorio === valor
                              ? "bg-[#102f4f] text-white"
                              : "mint-text-secondary hover:bg-[#f1f6f7] dark:hover:bg-white/[0.05]"
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
                      w-full
                      min-h-10
                      rounded-full
                      bg-gradient-to-r
                      from-[#087e86]
                      to-[#0aa17f]
                      text-white
                      px-5
                      text-xs
                      font-extrabold
                      shadow-[0_7px_18px_rgba(10,143,128,0.18)]
                      hover:-translate-y-0.5
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      disabled:translate-y-0
                      transition
                    "
                  >
                    {guardandoRecordatorio
                      ? (es ? "Guardando..." : "Saving...")
                      : (es ? "Guardar recordatorio" : "Save reminder")}
                  </button>
                </div>
              </div>
            )}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#e5eeed]
                dark:border-white/[0.07]
                px-1
                py-2
                mb-4
              "
            >
              <span className="text-[11px] font-bold mint-text-secondary">
                {es ? "Pendientes" : "Pending"}
              </span>

              <span
                className="
                  min-w-7
                  h-7
                  px-2
                  rounded-full
                  bg-[#102f4f]
                  dark:bg-[#67ddc7]
                  text-white
                  dark:text-[#102f4f]
                  flex
                  items-center
                  justify-center
                  text-[10px]
                  font-extrabold
                "
              >
                {recordatoriosPendientes.length}
              </span>
            </div>

            {recordatoriosPendientes.length === 0 ? (
              <div
                className="
                  px-5
                  py-10
                  text-center
                "
              >
                <div
                  className="
                    w-14
                    h-14
                    rounded-full
                    mx-auto
                    bg-[#e8f8f5]
                    dark:bg-[#123d3a]
                    border
                    border-[#cde8e3]
                    dark:border-[#285e58]
                    text-[#0b8f80]
                    dark:text-[#71dfcb]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Check size={21} />
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    font-extrabold
                    text-[#102f4f]
                    dark:text-white
                  "
                >
                  {es ? "Todo bajo control" : "Everything is under control"}
                </p>

                <p className="mt-1.5 text-xs leading-5 mint-text-secondary">
                  {es
                    ? "No hay recordatorios pendientes."
                    : "There are no pending reminders."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                {recordatoriosPendientes.map((recordatorio) => (
                  <article
                    key={recordatorio.id}
                    className={`
                      relative
                      overflow-hidden
                      rounded-[17px]
                      border
                      p-3.5
                      transition-all
                      hover:-translate-y-0.5
                      hover:shadow-[0_9px_22px_rgba(15,42,65,0.07)]
                      ${
                        recordatorio.prioridad === "urgente"
                          ? "bg-[var(--mint-danger-bg)] border-[var(--mint-danger-border)]"
                          : recordatorio.prioridad === "importante"
                            ? "bg-[var(--mint-warning-bg)] border-[var(--mint-warning-border)]"
                            : "bg-white dark:bg-white/[0.025] border-[#e0e9eb] dark:border-white/[0.07]"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`
                          mt-1.5
                          w-2
                          h-2
                          rounded-full
                          shrink-0
                          ${
                            recordatorio.prioridad === "urgente"
                              ? "bg-[var(--mint-danger)]"
                              : recordatorio.prioridad === "importante"
                                ? "bg-[var(--mint-warning)]"
                                : "bg-[#36b69f]"
                          }
                        `}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-5 mint-text-primary">
                          {recordatorio.mensaje}
                        </p>

                        <p className="mt-2 text-[10px] mint-text-muted">
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

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => completarRecordatorio(recordatorio)}
                          className="
                            w-8
                            h-8
                            rounded-full
                            text-[#0b8f80]
                            flex
                            items-center
                            justify-center
                            hover:bg-[#e6f7f3]
                            dark:hover:bg-white/[0.06]
                            transition
                          "
                          title={es ? "Completar" : "Complete"}
                        >
                          <Check size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminarRecordatorio(recordatorio.id)}
                          className="
                            w-8
                            h-8
                            rounded-full
                            text-[var(--mint-danger)]
                            flex
                            items-center
                            justify-center
                            hover:bg-[var(--mint-danger-bg)]
                            transition
                          "
                          title={es ? "Eliminar" : "Delete"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {recordatoriosCompletados.length > 0 && (
              <details className="mt-4">
                <summary
                  className="
                    cursor-pointer
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-[0.12em]
                    mint-text-muted
                    select-none
                  "
                >
                  {es ? "Completados" : "Completed"} · {recordatoriosCompletados.length}
                </summary>

                <div className="mt-3 space-y-2">
                  {recordatoriosCompletados.map((recordatorio) => (
                    <div
                      key={recordatorio.id}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-[14px]
                        bg-[#f5f8f9]
                        dark:bg-white/[0.025]
                        px-3
                        py-2.5
                        opacity-75
                      "
                    >
                      <button
                        type="button"
                        onClick={() => completarRecordatorio(recordatorio)}
                        className="
                          w-7
                          h-7
                          rounded-full
                          bg-[#e5f6f2]
                          dark:bg-[#123d3a]
                          text-[#0b8f80]
                          flex
                          items-center
                          justify-center
                          shrink-0
                        "
                        title={es ? "Reabrir" : "Reopen"}
                      >
                        <Check size={12} />
                      </button>

                      <p className="flex-1 text-[11px] mint-text-secondary line-through">
                        {recordatorio.mensaje}
                      </p>

                      <button
                        type="button"
                        onClick={() => eliminarRecordatorio(recordatorio.id)}
                        className="
                          w-7
                          h-7
                          rounded-full
                          text-[var(--mint-danger)]
                          flex
                          items-center
                          justify-center
                          hover:bg-[var(--mint-danger-bg)]
                          transition
                        "
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>

      {/* TODAY'S SCHEDULE BELOW */}
      <section
        className="
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-[#d7e6e4]
          dark:border-white/[0.08]
          bg-white
          dark:bg-[#102331]
          shadow-[0_18px_42px_rgba(15,42,65,0.07)]
        "
      >
        <div
          className="
            absolute inset-x-0 top-0 h-[3px]
            bg-gradient-to-r from-[#19a991] via-[#65cdb8] to-[#d8bd72]
          "
        />

        <div
          className="
            px-5 lg:px-7 pt-6 pb-5
            flex flex-col sm:flex-row
            sm:items-center sm:justify-between gap-4
          "
        >
          <div className="flex items-center gap-3.5">
            <div
              className="
                w-11 h-11 rounded-[15px]
                bg-[#0b8f80] text-white
                flex items-center justify-center
                shadow-[0_9px_20px_rgba(11,143,128,0.20)]
              "
            >
              <CalendarDays size={19} />
            </div>

            <div>
              <span
                className="
                  text-[9px] uppercase tracking-[0.13em]
                  font-extrabold text-[#0b8f80]
                "
              >
                {es ? "Agenda clínica" : "Clinical schedule"}
              </span>

              <h2
                className="
                  mt-1 text-[22px] font-extrabold tracking-[-0.025em]
                  text-[#102f4f] dark:text-white
                "
              >
                {es ? "Agenda de hoy" : "Today's schedule"}
              </h2>
            </div>
          </div>

          <div
            className="
              inline-flex self-start sm:self-auto items-center gap-2
              rounded-full border border-[#cfe5e1]
              dark:border-white/10 bg-[#f4fbf9]
              dark:bg-white/[0.04] px-4 py-2
              text-xs font-extrabold text-[#31596c]
              dark:text-slate-300
            "
          >
            <Clock3 size={14} className="text-[#0b8f80]" />
            {citasHoy.length} {es ? "programadas" : "scheduled"}
          </div>
        </div>

        <div className="px-5 lg:px-7 pb-7">
          {citasHoy.length === 0 ? (
            <div
              className="
                relative overflow-hidden rounded-[22px]
                bg-[#f8fbfa] dark:bg-white/[0.025]
                border border-[#e0ece9] dark:border-white/[0.07]
                min-h-[230px]
              "
            >
              <div
                className="
                  absolute left-[76px] sm:left-[96px]
                  top-7 bottom-7 w-px
                  bg-gradient-to-b
                  from-transparent via-[#8fd8ca] to-transparent
                  dark:via-[#2b665f]
                "
              />

              <div className="absolute left-5 sm:left-7 top-7 bottom-7 flex flex-col justify-between">
                {["8 AM", "11 AM", "2 PM", "5 PM", "8 PM"].map((hora) => (
                  <span
                    key={hora}
                    className="
                      text-[9px] font-bold tracking-[0.08em]
                      text-[#91a5af] dark:text-slate-500
                    "
                  >
                    {hora}
                  </span>
                ))}
              </div>

              <div
                className="
                  min-h-[230px]
                  pl-[112px] sm:pl-[140px]
                  pr-7 py-7
                  flex items-center
                "
              >
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <div
                      className="
                        absolute inset-0 rounded-full
                        bg-[#54cbb4]/20 blur-xl scale-150
                      "
                    />
                    <div
                      className="
                        relative w-14 h-14 rounded-full
                        bg-white dark:bg-[#12303d]
                        border border-[#cce8e2] dark:border-[#285e58]
                        text-[#0b8f80] dark:text-[#71dfcb]
                        flex items-center justify-center
                        shadow-[0_10px_24px_rgba(15,42,65,0.08)]
                      "
                    >
                      <Check size={22} />
                    </div>
                  </div>

                  <div>
                    <p
                      className="
                        text-[9px] uppercase tracking-[0.15em]
                        font-extrabold text-[#0b8f80]
                      "
                    >
                      {es ? "Día disponible" : "Open day"}
                    </p>

                    <h3
                      className="
                        mt-1.5 text-[21px] font-extrabold
                        tracking-[-0.025em]
                        text-[#102f4f] dark:text-white
                      "
                    >
                      {es ? "La agenda de hoy está libre" : "Today's schedule is clear"}
                    </h3>

                    <p
                      className="
                        mt-2 max-w-xl text-sm leading-6
                        text-[#6b8290] dark:text-slate-400
                      "
                    >
                      {es
                        ? "No hay citas programadas. La línea de tiempo está disponible para nuevas citas durante el día."
                        : "There are no scheduled appointments. The timeline is available for new appointments throughout the day."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="
                relative rounded-[22px]
                bg-[#f8fbfa] dark:bg-white/[0.025]
                border border-[#e0ece9] dark:border-white/[0.07]
                px-4 sm:px-6 py-5
              "
            >
              <div
                className="
                  absolute left-[89px] sm:left-[111px]
                  top-7 bottom-7 w-px
                  bg-[#b8ded7] dark:bg-[#285e58]
                "
              />

              <div className="space-y-3">
                {citasHoy.map((cita) => {
                  const estado = obtenerEstadoCita(cita.estado);

                  return (
                    <article
                      key={cita.id}
                      className="
                        relative grid
                        grid-cols-[64px_minmax(0,1fr)]
                        sm:grid-cols-[78px_minmax(0,1fr)]
                        gap-5 sm:gap-7 items-center
                      "
                    >
                      <div className="relative z-10 text-right">
                        <p
                          className="
                            text-[11px] font-extrabold
                            text-[#102f4f] dark:text-white
                          "
                        >
                          {new Date(cita.inicio).toLocaleTimeString(
                            es ? "es-MX" : "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <div
                        className="
                          relative rounded-[17px]
                          border border-[#dce9e7]
                          dark:border-white/[0.08]
                          bg-white dark:bg-[#102b39]
                          px-4 py-3.5
                          shadow-[0_7px_18px_rgba(15,42,65,0.045)]
                          hover:border-[#a9d9d0]
                          hover:shadow-[0_10px_24px_rgba(15,42,65,0.08)]
                          transition-all
                        "
                      >
                        <span
                          className="
                            absolute -left-[34px] sm:-left-[40px]
                            top-1/2 -translate-y-1/2
                            w-3 h-3 rounded-full
                            bg-[#0b8f80]
                            ring-4 ring-[#e3f5f1]
                            dark:ring-[#163d3a]
                          "
                        />

                        <div
                          className="
                            flex flex-col sm:flex-row
                            sm:items-center sm:justify-between gap-3
                          "
                        >
                          <div className="min-w-0">
                            <p
                              className="
                                text-[15px] font-extrabold
                                text-[#102f4f] dark:text-white truncate
                              "
                            >
                              {cita.paciente || (es ? "Paciente" : "Patient")}
                            </p>

                            <p className="mt-1 text-xs text-[#718695] dark:text-slate-400">
                              {cita.doctor || (es ? "Doctor sin asignar" : "Unassigned doctor")}
                            </p>
                          </div>

                          <span
                            className={`
                              inline-flex self-start sm:self-auto
                              rounded-full border px-2.5 py-1
                              text-[10px] font-extrabold
                              ${estado.clase}
                            `}
                          >
                            {estado.texto}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

    </div>

  );

}
