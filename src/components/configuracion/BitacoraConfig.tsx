import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CalendarDays,
  Filter,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";

import { supabase }
  from "../../lib/supabase";

import { useLanguage }
  from "../../context/LanguageContext";

type RegistroBitacora = {
  id: number;
  usuario_nombre: string | null;
  usuario_email: string | null;
  accion: string | null;
  modulo: string | null;
  detalle: string | null;
  created_at: string;
};

export default function BitacoraConfig() {

  const { language } = useLanguage();

  const es = language === "es";

  const [
    registros,
    setRegistros,
  ] = useState<RegistroBitacora[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    modulo,
    setModulo,
  ] = useState("todos");

  useEffect(() => {

    cargarBitacora();

  }, []);

  async function cargarBitacora() {

    setCargando(true);

    const {
      data,
      error,
    } = await supabase
      .from("bitacora")
      .select(`
        id,
        usuario_nombre,
        usuario_email,
        accion,
        modulo,
        detalle,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(200);

    if (error) {

      console.error(
        "Error cargando bitácora:",
        error
      );

      setCargando(false);

      return;

    }

    setRegistros(
      (data || []) as RegistroBitacora[]
    );

    setCargando(false);

  }

  const modulos =
    useMemo(() => {

      const lista =
        registros
          .map(
            (registro) =>
              registro.modulo
          )
          .filter(
            (
              valor
            ): valor is string =>
              Boolean(valor)
          );

      return [
        ...new Set(lista),
      ].sort();

    }, [
      registros,
    ]);

  const registrosFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return registros.filter(
        (registro) => {

          const coincideModulo =
            modulo === "todos" ||
            registro.modulo === modulo;

          if (!coincideModulo) {

            return false;

          }

          if (!texto) {

            return true;

          }

          const contenido = `
            ${registro.usuario_nombre || ""}
            ${registro.usuario_email || ""}
            ${registro.accion || ""}
            ${registro.modulo || ""}
            ${registro.detalle || ""}
          `.toLowerCase();

          return contenido.includes(
            texto
          );

        }
      );

    }, [
      registros,
      busqueda,
      modulo,
    ]);

  function traducirModulo(
    valor: string | null
  ) {

    if (!valor || es) {
      return valor || "-";
    }

    const traducciones: Record<string, string> = {
      "Presupuestos": "Estimates",
      "Configuración": "Settings",
      "Configuración financiera": "Financial settings",
      "Configuración de clínica": "Clinic settings",
      "Cobros": "Payments",
      "Gastos": "Expenses",
      "Comisiones": "Commissions",
      "Métodos de pago": "Payment methods",
      "Expedientes": "Patient records",
      "Pacientes": "Patients",
      "Agenda": "Schedule",
      "Citas": "Appointments",
      "Finanzas": "Finances",
      "Tratamientos": "Treatments",
      "Doctores": "Doctors",
      "Usuarios": "Users",
      "Seguridad": "Security",
      "Bitácora": "Activity Log",
    };

    return traducciones[valor] || valor;

  }

  function traducirAccion(
    valor: string | null
  ) {

    if (!valor || es) {
      return valor || "-";
    }

    const traducciones: Record<string, string> = {
      "Abrir presupuesto": "Open estimate",
      "Enviar presupuesto": "Send estimate",
      "Crear presupuesto": "Create estimate",
      "Editar presupuesto": "Edit estimate",
      "Eliminar presupuesto": "Delete estimate",
      "Editar configuración de clínica": "Edit clinic settings",
      "Crear cita": "Create appointment",
      "Editar cita": "Edit appointment",
      "Cancelar cita": "Cancel appointment",
      "Crear paciente": "Create patient",
      "Editar paciente": "Edit patient",
      "Eliminar paciente": "Delete patient",
      "Guardar expediente": "Save patient record",
      "Cambiar contraseña": "Change password",
       "Cerrar otras sesiones": "Sign out other sessions",
      "Cambiar configuración de moneda": "Change currency settings",
      "Editar configuración de pago": "Edit payment settings",
      "Registrar cobro": "Record payment",
      "Cambiar estado de tratamiento": "Change treatment status",
      "Abrir expediente clínico": "Open patient record",
      "Crear tratamiento": "Create treatment",
      "Editar tratamiento": "Edit treatment",
      "Eliminar tratamiento": "Delete treatment",
      "Guardar tratamiento": "Save treatment",
      "Registrar gasto": "Record expense",
      "Editar gasto": "Edit expense",
      "Eliminar gasto": "Delete expense",
      "Registrar comisión": "Record commission",
      "Editar comisión": "Edit commission",
      "Eliminar comisión": "Delete commission",
      "Iniciar sesión": "Sign in",
      "Cerrar sesión": "Sign out",
      "Crear usuario": "Create user",
      "Editar usuario": "Edit user",
      "Desactivar usuario": "Deactivate user",
      "Activar usuario": "Activate user",
      "Crear doctor": "Create doctor",
      "Editar doctor": "Edit doctor",
      "Eliminar doctor": "Delete doctor",
    };

    return traducciones[valor] || valor;

  }

  function traducirDetalle(
    valor: string | null
  ) {

    if (!valor || es) {
      return valor || "-";
    }

    return valor
      .replace(/Cierre de sesiones en otros dispositivos solicitado correctamente\./g, "Sign-out of sessions on other devices successfully requested.")
       .replace(/Presupuesto ID:/g, "Estimate ID:")
      .replace(/Paciente ID:/g, "Patient ID:")
      .replace(/Paciente:/g, "Patient:")
      .replace(/Clínica:/g, "Clinic:")
      .replace(/Campos modificados:/g, "Modified fields:")
      .replace(/Idioma:/g, "Language:")
      .replace(/Subtotal:/g, "Subtotal:")
      .replace(/Descuento:/g, "Discount:")
      .replace(/Total:/g, "Total:")
      .replace(/Fecha:/g, "Date:")
      .replace(/Hora:/g, "Time:")
      .replace(/Doctor:/g, "Doctor:")
      .replace(/Estado:/g, "Status:")
      .replace(/Tratamiento ID:/g, "Treatment ID:")
      .replace(/Tratamiento:/g, "Treatment:")
      .replace(/Nuevo estado:/g, "New status:")
      .replace(/Configuración de pago ID:/g, "Payment setting ID:")
      .replace(/Configuración de pago:/g, "Payment setting:")
      .replace(/Cobro real:/g, "Actual payment:")
      .replace(/Cobro:/g, "Payment:")
      .replace(/Método:/g, "Method:")
      .replace(/Monto:/g, "Amount:")
      .replace(/Moneda:/g, "Currency:")
      .replace(/Tipo de cambio:/g, "Exchange rate:")
      .replace(/Finalizado/g, "Completed")
      .replace(/En proceso/g, "In progress")
      .replace(/Pendiente/g, "Pending")
      .replace(/Cancelado/g, "Cancelled")
      .replace(/Efectivo/g, "Cash")
      .replace(/Transferencia/g, "Bank transfer")
      .replace(/Tarjeta de crédito/g, "Credit card")
      .replace(/Tarjeta de débito/g, "Debit card");

  }

  function formatearFecha(
    fecha: string
  ) {

    return new Date(
      fecha
    ).toLocaleString(
      es ? "es-MX" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  }

  if (cargando) {

    return (

      <div
        className="
          mint-card
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            mint-text-secondary
          "
        >

          <Loader2
            size={17}
            className="animate-spin"
          />

          {es ? "Cargando bitácora..." : "Loading activity log..."}

        </div>

      </div>

    );

  }

  return (

    <div
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[var(--mint-border)]
        bg-white
        shadow-[0_12px_34px_rgba(15,42,65,0.07)]
      "
    >

      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
          p-6
          border-b
          border-white/10
          bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)]
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-white/10
              text-white
              border
              border-white/15
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >

            <Activity
              size={22}
            />

          </div>

          <div>

            <h1
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              {es ? "Bitácora" : "Activity Log"}
            </h1>

            <p
              className="
                text-sm
                text-white/70
                mt-1
              "
            >
              {es ? "Historial de actividad registrada en MintOS." : "History of activity recorded in MintOS."}
            </p>

          </div>

        </div>

        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-3
          "
        >

          <div
            className="
              relative
            "
          >

            <Search
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                mint-text-muted
              "
            />

            <input
              type="text"
              value={
                busqueda
              }
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              placeholder={es ? "Buscar actividad..." : "Search activity..."}
              className="
                mint-input
                w-full
                sm:w-64
                bg-white
                pl-9
                pr-3
                py-2.5
              "
            />

          </div>

          <div
            className="
              relative
            "
          >

            <Filter
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                mint-text-muted
                pointer-events-none
              "
            />

            <select
              value={
                modulo
              }
              onChange={(e) =>
                setModulo(
                  e.target.value
                )
              }
              className="
                mint-input
                bg-white
                pl-9
                pr-8
                py-2.5
              "
            >

              <option value="todos">
                {es ? "Todos los módulos" : "All modules"}
              </option>

              {
                modulos.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {traducirModulo(item)}
                    </option>

                  )
                )
              }

            </select>

          </div>

        </div>

      </div>

      <div
        className="
          overflow-x-auto
          bg-[var(--mint-app-bg)]
          p-4
        "
      >

        <table
          className="
            w-full
            min-w-[900px]
          "
        >

          <thead
            className="
              bg-[var(--mint-surface-teal)]
              border-b
              border-[var(--mint-border-teal)]
            "
          >

            <tr>

              <th
                className="
                  px-5
                  py-3
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                "
              >
                {es ? "Fecha" : "Date"}
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                "
              >
                {es ? "Usuario" : "User"}
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                "
              >
                {es ? "Módulo" : "Module"}
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                "
              >
                {es ? "Acción" : "Action"}
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                "
              >
                {es ? "Detalle" : "Details"}
              </th>

            </tr>

          </thead>

          <tbody
            className="
              divide-y
              divide-[var(--mint-border)]
            "
          >

            {
              registrosFiltrados.length === 0
                ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="
                        px-6
                        py-12
                        text-center
                        text-sm
                        mint-text-muted
                      "
                    >

                      {es ? "No hay actividad registrada." : "No activity recorded."}

                    </td>

                  </tr>

                )
                : (

                  registrosFiltrados.map(
                    (registro) => (

                      <tr
                        key={
                          registro.id
                        }
                        className="
                          bg-white
                          hover:bg-[var(--mint-surface-teal)]
                          transition-colors
                        "
                      >

                        <td
                          className="
                            px-5
                            py-4
                            text-sm
                            mint-text-secondary
                            whitespace-nowrap
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <CalendarDays
                              size={15}
                              className="
                                mint-text-muted
                              "
                            />

                            {
                              formatearFecha(
                                registro.created_at
                              )
                            }

                          </div>

                        </td>

                        <td
                          className="
                            px-5
                            py-4
                          "
                        >

                          <div
                            className="
                              flex
                              items-start
                              gap-2
                            "
                          >

                            <UserRound
                              size={16}
                              className="
                                mint-text-muted
                                mt-0.5
                              "
                            />

                            <div>

                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  mint-text-primary
                                "
                              >
                                {
                                  registro.usuario_nombre ||
                                  (es ? "Usuario" : "User")
                                }
                              </p>

                              {
                                registro.usuario_email && (

                                  <p
                                    className="
                                      text-xs
                                      mint-text-muted
                                      mt-0.5
                                    "
                                  >
                                    {
                                      registro.usuario_email
                                    }
                                  </p>

                                )
                              }

                            </div>

                          </div>

                        </td>

                        <td
                          className="
                            px-5
                            py-4
                          "
                        >

                          <span
                            className="
                              mint-badge
                              mint-badge-muted
                              inline-flex
                              px-2.5
                              py-1
                            "
                          >
                            {
                              traducirModulo(
                                registro.modulo
                              )
                            }
                          </span>

                        </td>

                        <td
                          className="
                            px-5
                            py-4
                            text-sm
                            font-medium
                            mint-text-primary
                          "
                        >
                          {
                            traducirAccion(
                              registro.accion
                            )
                          }
                        </td>

                        <td
                          className="
                            px-5
                            py-4
                            text-sm
                            mint-text-secondary
                            max-w-md
                          "
                        >
                          {
                            traducirDetalle(
                              registro.detalle
                            )
                          }
                        </td>

                      </tr>

                    )
                  )

                )
            }

          </tbody>

        </table>

      </div>

    </div>

  );

}