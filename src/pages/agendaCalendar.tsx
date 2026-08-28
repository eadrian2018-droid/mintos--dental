import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import FullCalendar
  from "@fullcalendar/react";

import dayGridPlugin
  from "@fullcalendar/daygrid";

import timeGridPlugin
  from "@fullcalendar/timegrid";

import interactionPlugin
  from "@fullcalendar/interaction";

import Modal
  from "react-modal";

import Select
  from "react-select";

import {
  CalendarDays,
  Circle,
} from "lucide-react";

import {
  supabase,
} from "../lib/supabase";

import {
  useAuth,
} from "../context/AuthContext";

import {
  registrarBitacora,
} from "../lib/registrarBitacora";

import "./AgendaCalendar.css";

type Evento = {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    estado?: string;
    doctor?: string;
    paciente_id?: number;
  };
};

type Paciente = {
  id: number;
  nombre: string;
};

Modal.setAppElement("#root");

export default function AgendaCalendar() {

  const navigate =
    useNavigate();

  const {
    permisos,
  } = useAuth();

  const puedeEditarCitas =
    permisos?.editar_citas === true;

  const [
    eventos,
    setEventos,
  ] = useState<Evento[]>([]);

  const [
    pacientes,
    setPacientes,
  ] = useState<Paciente[]>([]);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    modoCrear,
    setModoCrear,
  ] = useState(false);

  const [
    eventoSeleccionado,
    setEventoSeleccionado,
  ] = useState<any>(null);

  const [
    pacienteId,
    setPacienteId,
  ] = useState<number | null>(
    null
  );

  const [
    nombreManual,
    setNombreManual,
  ] = useState("");

  const [
    estado,
    setEstado,
  ] = useState("pendiente");

  const [
    doctor,
    setDoctor,
  ] = useState("Dr. Edgar");

  const [
    inicioNuevo,
    setInicioNuevo,
  ] = useState<any>(null);

  const [
    finNuevo,
    setFinNuevo,
  ] = useState<any>(null);

  useEffect(() => {

    cargarCitas();
    cargarPacientes();

  }, []);

  function colorEstado(
    estadoActual: string
  ) {

    if (
      estadoActual ===
      "confirmada"
    ) {

      return "#22c55e";

    }

    if (
      estadoActual ===
      "cancelada"
    ) {

      return "#ef4444";

    }

    if (
      estadoActual ===
      "tratamiento"
    ) {

      return "#3b82f6";

    }

    return "#f59e0b";

  }

  async function cargarPacientes() {

    const {
      data,
    } = await supabase
      .from("pacientes")
      .select(
        "id, nombre"
      )
      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (data) {

      setPacientes(
        data
      );

    }

  }

  async function cargarCitas() {

    const {
      data,
    } = await supabase
      .from("citas")
      .select("*")
      .order(
        "inicio",
        {
          ascending: true,
        }
      );

    if (!data) {

      return;

    }

    const eventosFormateados =
      data.map(
        (cita) => ({

          id:
            String(
              cita.id
            ),

          title:
            `${
              cita.paciente ||
              "Paciente"
            } - ${
              cita.doctor ||
              "Doctor"
            }`,

          start:
            new Date(
              cita.inicio
            ).toISOString(),

          end:
            new Date(
              cita.fin
            ).toISOString(),

          backgroundColor:
            colorEstado(
              cita.estado ||
              "pendiente"
            ),

          borderColor:
            colorEstado(
              cita.estado ||
              "pendiente"
            ),

          extendedProps: {

            estado:
              cita.estado,

            doctor:
              cita.doctor,

            paciente_id:
              cita.paciente_id,

          },

        })
      );

    setEventos(
      eventosFormateados
    );

  }

  function abrirCrearCita(
    info: any
  ) {

    setModoCrear(
      true
    );

    setInicioNuevo(
      info.start
    );

    setFinNuevo(
      info.end
    );

    setPacienteId(
      null
    );

    setNombreManual(
      ""
    );

    setDoctor(
      "Dr. Edgar"
    );

    setEstado(
      "pendiente"
    );

    setModalOpen(
      true
    );

  }

  async function guardarNuevaCita() {

    let nombreFinal =
      nombreManual.trim();

    if (pacienteId) {

      const paciente =
        pacientes.find(
          (p) =>
            p.id ===
            pacienteId
        );

      nombreFinal =
        paciente?.nombre ||
        "";

    }

    if (!nombreFinal) {

      return;

    }

    const inicio =
      new Date(
        inicioNuevo
      ).toISOString();

    const fin =
      new Date(
        finNuevo
      ).toISOString();

    const {
      data,
      error,
    } = await supabase
      .from("citas")
      .insert([
        {
          paciente:
            nombreFinal,

          paciente_id:
            pacienteId,

          inicio,

          fin,

          estado,

          doctor,
        },
      ])
      .select("id")
      .single();

    if (error) {

      console.error(
        "Error creando cita:",
        error
      );

      alert(
        "No se pudo crear la cita."
      );

      return;

    }

    await registrarBitacora({
      accion:
        "Crear cita",

      modulo:
        "Agenda",

      detalle:
        `Paciente: ${nombreFinal} | Doctor: ${doctor} | Estado: ${estado} | Inicio: ${
          new Date(
            inicio
          ).toLocaleString(
            "es-MX"
          )
        } | Cita ID: ${
          data?.id ||
          ""
        }`,
    });

    setModalOpen(
      false
    );

    cargarCitas();

  }

  async function moverCita(
    info: any
  ) {

    const inicio =
      new Date(
        info.event.start
      ).toISOString();

    const fin =
      new Date(
        info.event.end
      ).toISOString();

    const {
      error,
    } = await supabase
      .from("citas")
      .update({
        inicio,
        fin,
      })
      .eq(
        "id",
        info.event.id
      );

    if (error) {

      console.error(
        "Error moviendo cita:",
        error
      );

      alert(
        "No se pudo actualizar el horario de la cita."
      );

      info.revert();

      return;

    }

    await registrarBitacora({
      accion:
        "Cambiar horario de cita",

      modulo:
        "Agenda",

      detalle:
        `Cita ID: ${info.event.id} | Paciente: ${
          info.event.title
            ?.split(" - ")[0] ||
          "Paciente"
        } | Nuevo inicio: ${
          new Date(
            inicio
          ).toLocaleString(
            "es-MX"
          )
        } | Nuevo fin: ${
          new Date(
            fin
          ).toLocaleString(
            "es-MX"
          )
        }`,
    });

    cargarCitas();

  }

  function abrirModal(
    info: any
  ) {

    setModoCrear(
      false
    );

    setEventoSeleccionado(
      info.event
    );

    const nombrePaciente =
      info.event.title
        .split(" - ")[0];

    setNombreManual(
      nombrePaciente
    );

    setEstado(
      info.event
        .extendedProps
        ?.estado ||
      "pendiente"
    );

    setDoctor(
      info.event
        .extendedProps
        ?.doctor ||
      "Dr. Edgar"
    );

    setPacienteId(
      info.event
        .extendedProps
        ?.paciente_id ||
      null
    );

    setModalOpen(
      true
    );

  }

  async function guardarCambios() {

    if (
      !eventoSeleccionado
    ) {

      return;

    }

    let nombreFinal =
      nombreManual.trim();

    if (pacienteId) {

      const paciente =
        pacientes.find(
          (p) =>
            p.id ===
            pacienteId
        );

      nombreFinal =
        paciente?.nombre ||
        nombreFinal;

    }

    if (!nombreFinal) {

      alert(
        "Ingresa el nombre del paciente."
      );

      return;

    }

    const estadoAnterior =
      eventoSeleccionado
        .extendedProps
        ?.estado ||
      "pendiente";

    const doctorAnterior =
      eventoSeleccionado
        .extendedProps
        ?.doctor ||
      "";

    const pacienteAnterior =
      eventoSeleccionado
        .title
        ?.split(" - ")[0] ||
      "";

    const {
      error,
    } = await supabase
      .from("citas")
      .update({
        paciente:
          nombreFinal,

        paciente_id:
          pacienteId,

        estado,

        doctor,
      })
      .eq(
        "id",
        eventoSeleccionado.id
      );

    if (error) {

      console.error(
        "Error actualizando cita:",
        error
      );

      alert(
        "No se pudieron guardar los cambios."
      );

      return;

    }

    const cambios: string[] =
      [];

    if (
      pacienteAnterior !==
      nombreFinal
    ) {

      cambios.push(
        `Paciente: ${pacienteAnterior} → ${nombreFinal}`
      );

    }

    if (
      doctorAnterior !==
      doctor
    ) {

      cambios.push(
        `Doctor: ${doctorAnterior} → ${doctor}`
      );

    }

    if (
      estadoAnterior !==
      estado
    ) {

      cambios.push(
        `Estado: ${estadoAnterior} → ${estado}`
      );

    }

    await registrarBitacora({
      accion:
        "Editar cita",

      modulo:
        "Agenda",

      detalle:
        cambios.length > 0
          ? `Cita ID: ${
              eventoSeleccionado.id
            } | ${
              cambios.join(
                " | "
              )
            }`
          : `Cita ID: ${
              eventoSeleccionado.id
            } | Guardada sin cambios visibles`,
    });

    setModalOpen(
      false
    );

    cargarCitas();

  }

  async function eliminarCita() {

    if (
      !eventoSeleccionado
    ) {

      return;

    }

    const confirmar =
      window.confirm(
        "¿Seguro que quieres eliminar esta cita?"
      );

    if (!confirmar) {

      return;

    }

    const nombrePaciente =
      eventoSeleccionado
        .title
        ?.split(" - ")[0] ||
      "Paciente";

    const doctorCita =
      eventoSeleccionado
        .extendedProps
        ?.doctor ||
      "Doctor";

    const estadoCita =
      eventoSeleccionado
        .extendedProps
        ?.estado ||
      "pendiente";

    const citaId =
      eventoSeleccionado.id;

    const {
      error,
    } = await supabase
      .from("citas")
      .delete()
      .eq(
        "id",
        citaId
      );

    if (error) {

      console.error(
        "Error eliminando cita:",
        error
      );

      alert(
        "No se pudo eliminar la cita."
      );

      return;

    }

    await registrarBitacora({
      accion:
        "Eliminar cita",

      modulo:
        "Agenda",

      detalle:
        `Cita ID: ${citaId} | Paciente: ${nombrePaciente} | Doctor: ${doctorCita} | Estado: ${estadoCita}`,
    });

    setModalOpen(
      false
    );

    cargarCitas();

  }

  function abrirExpediente() {

    if (!pacienteId) {

      alert(
        "Esta cita no está conectada a un paciente existente."
      );

      return;

    }

    setModalOpen(
      false
    );

    navigate(
      `/paciente/${pacienteId}`
    );

  }

  const opcionesPacientes =
    pacientes.map(
      (p) => ({
        value:
          p.id,

        label:
          p.nombre,
      })
    );

  return (

    <div
      className="agenda-page"
    >

      <div
        className="agenda-top"
      >

        <div
          className="agenda-heading"
        >

          <div
            className="agenda-heading-icon"
          >

            <CalendarDays
              size={24}
            />

          </div>

          <div>

            <h1>
              Agenda
            </h1>

            <p>
              Administra citas y horarios
              de tus pacientes
            </p>

          </div>

        </div>

        <div
          className="agenda-status-legend"
        >

          <div
            className="agenda-status-item"
          >

            <Circle
              size={10}
              fill="#f59e0b"
              stroke="#f59e0b"
            />

            Pendiente

          </div>

          <div
            className="agenda-status-item"
          >

            <Circle
              size={10}
              fill="#22c55e"
              stroke="#22c55e"
            />

            Confirmada

          </div>

          <div
            className="agenda-status-item"
          >

            <Circle
              size={10}
              fill="#3b82f6"
              stroke="#3b82f6"
            />

            Tratamiento

          </div>

          <div
            className="agenda-status-item"
          >

            <Circle
              size={10}
              fill="#ef4444"
              stroke="#ef4444"
            />

            Cancelada

          </div>

        </div>

      </div>

      <div
        className="agenda-calendar-card"
      >

        <FullCalendar

          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}

          initialView=
            "timeGridWeek"

          locale="es"

          firstDay={1}

          headerToolbar={{
            left:
              "prev,next today",

            center:
              "title",

            right:
              "timeGridDay,timeGridWeek,dayGridMonth",
          }}

          buttonText={{
            today:
              "Hoy",

            month:
              "Mes",

            week:
              "Semana",

            day:
              "Día",
          }}

          selectable={
            puedeEditarCitas
          }

          editable={
            puedeEditarCitas
          }

          selectMirror

          nowIndicator

          events={
            eventos
          }

          select={
            puedeEditarCitas
              ? abrirCrearCita
              : undefined
          }

          eventDrop={
            puedeEditarCitas
              ? moverCita
              : undefined
          }

          eventResize={
            puedeEditarCitas
              ? moverCita
              : undefined
          }

          eventClick={
            abrirModal
          }

          height=
            "calc(100vh - 245px)"

          slotMinTime=
            "08:00:00"

          slotMaxTime=
            "20:30:00"

          slotDuration=
            "00:30:00"

          snapDuration=
            "00:15:00"

          slotLabelInterval=
            "01:00"

          slotLabelFormat={{
            hour:
              "numeric",

            minute:
              "2-digit",

            hour12:
              true,
          }}

          eventTimeFormat={{
            hour:
              "numeric",

            minute:
              "2-digit",

            hour12:
              true,
          }}

          dayHeaderFormat={{
            weekday:
              "short",

            day:
              "numeric",

            month:
              "short",
          }}

          allDaySlot={
            false
          }

          hiddenDays={[
            0,
          ]}

          expandRows

          stickyHeaderDates

          eventDisplay=
            "block"

          eventShortHeight={
            24
          }

          slotEventOverlap={
            false
          }

          dayMaxEvents

        />

      </div>

      <Modal

        isOpen={
          modalOpen
        }

        onRequestClose={() =>
          setModalOpen(
            false
          )
        }

        className=
          "agenda-modal"

        overlayClassName=
          "agenda-modal-overlay"

      >

        <div
          className="agenda-modal-header"
        >

          <div>

            <span
              className="agenda-modal-eyebrow"
            >

              {
                modoCrear
                  ? "NUEVA CITA"
                  : "DETALLES DE CITA"
              }

            </span>

            <h2>

              {
                modoCrear
                  ? "Agendar paciente"
                  : "Editar cita"
              }

            </h2>

          </div>

          <button
            type="button"
            className=
              "agenda-modal-close"
            onClick={() =>
              setModalOpen(
                false
              )
            }
          >
            ×
          </button>

        </div>

        <div
          className="agenda-modal-body"
        >

          <div
            className="agenda-field"
          >

            <label>
              Buscar paciente existente
            </label>

            <Select

              options={
                opcionesPacientes
              }

              placeholder=
                "Buscar paciente..."

              isClearable

              isDisabled={
                !puedeEditarCitas
              }

              value={
                pacienteId
                  ? opcionesPacientes.find(
                      (option) =>
                        option.value ===
                        pacienteId
                    ) || null
                  : null
              }

              onChange={(
                option: any
              ) => {

                if (!option) {

                  setPacienteId(
                    null
                  );

                  return;

                }

                setPacienteId(
                  option.value
                );

                const paciente =
                  pacientes.find(
                    (p) =>
                      p.id ===
                      option.value
                  );

                setNombreManual(
                  paciente?.nombre ||
                  ""
                );

              }}

              classNamePrefix=
                "agenda-select"

            />

          </div>

          <div
            className="agenda-divider"
          >

            <span>
              O
            </span>

          </div>

          <div
            className="agenda-field"
          >

            <label>
              Nombre del paciente
            </label>

            <input

              value={
                nombreManual
              }

              disabled={
                !puedeEditarCitas
              }

              onChange={(e) =>
                setNombreManual(
                  e.target.value
                )
              }

              placeholder=
                "Nombre del paciente"

            />

          </div>

          <div
            className="agenda-modal-grid"
          >

            <div
              className="agenda-field"
            >

              <label>
                Doctor
              </label>

              <select

                value={
                  doctor
                }

                disabled={
                  !puedeEditarCitas
                }

                onChange={(e) =>
                  setDoctor(
                    e.target.value
                  )
                }

              >

                <option>
                  Dr. Edgar
                </option>

                <option>
                  Dra. Maria
                </option>

                <option>
                  Dr. Juan
                </option>

              </select>

            </div>

            <div
              className="agenda-field"
            >

              <label>
                Estado
              </label>

              <select

                value={
                  estado
                }

                disabled={
                  !puedeEditarCitas
                }

                onChange={(e) =>
                  setEstado(
                    e.target.value
                  )
                }

              >

                <option
                  value="pendiente"
                >
                  Pendiente
                </option>

                <option
                  value="confirmada"
                >
                  Confirmada
                </option>

                <option
                  value="tratamiento"
                >
                  Tratamiento
                </option>

                <option
                  value="cancelada"
                >
                  Cancelada
                </option>

              </select>

            </div>

          </div>

        </div>

        <div
          className="agenda-modal-footer"
        >

          {
            modoCrear
              ? (

                puedeEditarCitas && (

                  <button

                    onClick={
                      guardarNuevaCita
                    }

                    className=
                      "agenda-btn agenda-btn-primary"

                  >
                    Crear cita
                  </button>

                )

              )
              : (

                <>

                  {
                    puedeEditarCitas && (

                      <button

                        onClick={
                          guardarCambios
                        }

                        className=
                          "agenda-btn agenda-btn-primary"

                      >
                        Guardar
                      </button>

                    )
                  }

                  {
                    permisos
                      ?.ver_expediente ===
                      true && (

                      <button

                        onClick={
                          abrirExpediente
                        }

                        className=
                          "agenda-btn agenda-btn-secondary"

                      >
                        Abrir expediente
                      </button>

                    )
                  }

                  {
                    puedeEditarCitas && (

                      <button

                        onClick={
                          eliminarCita
                        }

                        className=
                          "agenda-btn agenda-btn-danger"

                      >
                        Eliminar
                      </button>

                    )
                  }

                </>

              )
          }

          <button

            type="button"

            onClick={() =>
              setModalOpen(
                false
              )
            }

            className=
              "agenda-btn agenda-btn-neutral"

          >
            Cerrar
          </button>

        </div>

      </Modal>

    </div>

  );

}