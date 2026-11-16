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
  supabase,
} from "../lib/supabase";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useLanguage,
} from "../context/LanguageContext";

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

type Doctor = {
  id: number;
  nombre: string;
  telefono: string | null;
  activo: boolean;
  color_agenda: string | null;
};

// Diez colores predefinidos, seleccionables desde un menú compacto.
const COLORES_DOCTORES = [
  "#0B8F80", "#2563EB", "#7C3AED", "#DB2777", "#DC2626",
  "#EA580C", "#A16207", "#65A30D", "#15803D", "#0369A1",
] as const;

Modal.setAppElement("#root");

export default function AgendaCalendar() {

  const navigate =
    useNavigate();

  const { language } = useLanguage();
  const es = language === "es";

  const t = {
    newAppointment: es ? "NUEVA CITA" : "NEW APPOINTMENT",
    appointmentDetails: es ? "DETALLES DE CITA" : "APPOINTMENT DETAILS",
    schedulePatient: es ? "Agendar paciente" : "Schedule patient",
    editAppointment: es ? "Editar cita" : "Edit appointment",
    searchExisting: es ? "Buscar paciente existente" : "Search existing patient",
    searchPatient: es ? "Buscar paciente..." : "Search patient...",
    or: es ? "O" : "OR",
    patientName: es ? "Nombre del paciente" : "Patient name",
    appointmentDuration: es ? "Duración de la cita" : "Appointment duration",
    doctor: es ? "Doctor" : "Doctor",
    status: es ? "Estado" : "Status",
    pending: es ? "Pendiente" : "Pending",
    confirmed: es ? "Confirmada" : "Confirmed",
    treatment: es ? "Tratamiento" : "Treatment",
    cancelled: es ? "Cancelada" : "Cancelled",
    createAppointment: es ? "Crear cita" : "Create appointment",
    save: es ? "Guardar" : "Save",
    openRecord: es ? "Abrir expediente" : "Open patient record",
    delete: es ? "Eliminar" : "Delete",
    close: es ? "Cerrar" : "Close",
    today: es ? "Hoy" : "Today",
    month: es ? "Mes" : "Month",
    week: es ? "Semana" : "Week",
    day: es ? "Día" : "Day",
    min30: "30 min",
    hour1: es ? "1 hora" : "1 hour",
    hour1half: es ? "1 h 30" : "1 h 30",
    hours2: es ? "2 horas" : "2 hours",
    createError: es ? "No se pudo crear la cita." : "The appointment could not be created.",
    moveError: es ? "No se pudo actualizar el horario de la cita." : "The appointment time could not be updated.",
    enterPatient: es ? "Ingresa el nombre del paciente." : "Enter the patient name.",
    saveError: es ? "No se pudieron guardar los cambios." : "The changes could not be saved.",
    deleteConfirm: es ? "¿Seguro que quieres eliminar esta cita?" : "Are you sure you want to delete this appointment?",
    deleteError: es ? "No se pudo eliminar la cita." : "The appointment could not be deleted.",
    noLinkedPatient: es ? "Esta cita no está conectada a un paciente existente." : "This appointment is not linked to an existing patient.",
    selectDoctor: es ? "Selecciona un doctor." : "Select a doctor.",
    noDoctorPhone: es ? "Este doctor no tiene un número de WhatsApp registrado." : "This doctor does not have a WhatsApp number registered.",
    notifyDoctor: es ? "Notificar por WhatsApp" : "Notify via WhatsApp",
    notifyCreated: es ? "Cita creada. ¿Quieres notificar al doctor por WhatsApp?" : "Appointment created. Do you want to notify the doctor via WhatsApp?",
    doctorColors: es ? "Colores de doctores" : "Doctor colors",
    doctorColorsHint: es ? "Asigna un color a cada doctor para identificar sus citas." : "Assign a color to each doctor to identify appointments.",
    colorSaveError: es ? "No se pudo guardar el color." : "Could not save the color.",
    noDoctors: es ? "No hay doctores activos." : "No active doctors.",
  };

  const {
    permisos, perfil,
  } = useAuth();

  const puedeConfigurarColores = perfil?.rol === "admin";

  const puedeEditarCitas =
    permisos?.editar_citas === true;

  const [
    eventos,
    setEventos,
  ] = useState<Evento[]>([]);

  const [mostrarColores, setMostrarColores] = useState(false);
  const [selectorColorAbierto, setSelectorColorAbierto] = useState<number | null>(null);
  const [guardandoColorId, setGuardandoColorId] = useState<number | null>(null);
  const [errorColor, setErrorColor] = useState("");

  const [
    pacientes,
    setPacientes,
  ] = useState<Paciente[]>([]);

  const [
    doctores,
    setDoctores,
  ] = useState<Doctor[]>([]);

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
  ] = useState("");

  const [
    inicioNuevo,
    setInicioNuevo,
  ] = useState<any>(null);

  const [
    finNuevo,
    setFinNuevo,
  ] = useState<any>(null);

  const [
    duracionMinutos,
    setDuracionMinutos,
  ] = useState(60);

  useEffect(() => {

    cargarCitas();
    cargarPacientes();
    cargarDoctores();

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

  async function cargarDoctores() {

    const {
      data,
      error,
    } = await supabase
      .from("doctores")
      .select(
        "id, nombre, telefono, activo, color_agenda"
      )
      .eq(
        "activo",
        true
      )
      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (error) {

      console.error(
        "Error cargando doctores:",
        error
      );

      return;

    }

    const lista =
      (data || []) as Doctor[];

    setDoctores(
      lista
    );

    setDoctor(
      (actual) =>
        actual ||
        lista[0]?.nombre ||
        ""
    );

  }

  async function guardarColorDoctor(doctorId: number, nuevoColor: string) {
    if (!puedeConfigurarColores || guardandoColorId !== null) return;
    if (!/^#[0-9a-fA-F]{6}$/.test(nuevoColor)) return;
    const anterior = doctores.find((item) => item.id === doctorId);
    if (!anterior || anterior.color_agenda === nuevoColor) return;
    setGuardandoColorId(doctorId);
    setErrorColor("");
    const { data, error } = await supabase
      .from("doctores")
      .update({ color_agenda: nuevoColor })
      .eq("id", doctorId)
      .select("id, color_agenda")
      .single();
    if (error || !data) {
      console.error("Error guardando color del doctor:", error);
      setErrorColor(t.colorSaveError);
      setGuardandoColorId(null);
      return;
    }
    setDoctores((actuales) => actuales.map((item) =>
      item.id === doctorId ? { ...item, color_agenda: data.color_agenda } : item
    ));
    setGuardandoColorId(null);
    try {
      await registrarBitacora({
        accion: "Cambiar color de doctor en agenda",
        modulo: "Agenda",
        detalle: `Doctor ID: ${doctorId} | Color anterior: ${anterior.color_agenda || "sin asignar"} | Nuevo color: ${nuevoColor}`,
      });
    } catch (errorBitacora) {
      console.error("No se pudo registrar el cambio de color en bitácora:", errorBitacora);
    }
  }

  const eventosConColores = eventos.map((evento) => {
    const doctorEvento = doctores.find((item) => item.nombre === evento.extendedProps?.doctor);
    const color = doctorEvento?.color_agenda || evento.backgroundColor;
    return { ...evento, backgroundColor: color, borderColor: color };
  });

  function obtenerDoctor(
    nombreDoctor: string
  ) {

    return doctores.find(
      (item) =>
        item.nombre ===
        nombreDoctor
    );

  }

  function normalizarTelefonoWhatsApp(
    telefono: string
  ) {

    return telefono.replace(
      /\D/g,
      ""
    );

  }

  function crearMensajeWhatsApp(
    nombrePaciente: string,
    nombreDoctor: string,
    fechaInicio: Date,
    duracion?: number
  ) {

    const fecha =
      fechaInicio.toLocaleDateString(
        es ? "es-MX" : "en-US",
        {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

    const hora =
      fechaInicio.toLocaleTimeString(
        es ? "es-MX" : "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      );

    const duracionTexto =
      duracion
        ? es
          ? `\nDuración: ${duracion} min`
          : `\nDuration: ${duracion} min`
        : "";

    return es
      ? `🦷 *MintOS Dental*\n\nHola ${nombreDoctor}, tienes una cita asignada.\n\nPaciente: ${nombrePaciente}\nFecha: ${fecha}\nHora: ${hora}${duracionTexto}\n\nEste mensaje fue preparado desde MintOS.`
      : `🦷 *MintOS Dental*\n\nHello ${nombreDoctor}, you have an appointment assigned.\n\nPatient: ${nombrePaciente}\nDate: ${fecha}\nTime: ${hora}${duracionTexto}\n\nThis message was prepared by MintOS.`;

  }

  function abrirWhatsAppDoctor(
    nombreDoctor: string,
    nombrePaciente: string,
    fechaInicio: Date,
    duracion?: number
  ) {

    const doctorSeleccionado =
      obtenerDoctor(
        nombreDoctor
      );

    const telefono =
      doctorSeleccionado
        ?.telefono
        ? normalizarTelefonoWhatsApp(
            doctorSeleccionado.telefono
          )
        : "";

    if (!telefono) {

      alert(
        t.noDoctorPhone
      );

      return;

    }

    const mensaje =
      crearMensajeWhatsApp(
        nombrePaciente,
        nombreDoctor,
        fechaInicio,
        duracion
      );

    const url =
      `https://wa.me/${telefono}?text=${encodeURIComponent(
        mensaje
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

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

    setDuracionMinutos(
      60
    );

    setFinNuevo(
      new Date(
        new Date(
          info.start
        ).getTime() +
        60 * 60 * 1000
      )
    );

    setPacienteId(
      null
    );

    setNombreManual(
      ""
    );

    setDoctor(
      doctores[0]?.nombre ||
      ""
    );

    setEstado(
      "pendiente"
    );

    setModalOpen(
      true
    );

  }

  function cambiarDuracion(
    minutos: number
  ) {

    setDuracionMinutos(
      minutos
    );

    if (!inicioNuevo) {

      return;

    }

    setFinNuevo(
      new Date(
        new Date(
          inicioNuevo
        ).getTime() +
        minutos * 60 * 1000
      )
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

    if (!doctor) {

      alert(
        t.selectDoctor
      );

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
        t.createError
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

    const notificar =
      window.confirm(
        t.notifyCreated
      );

    if (notificar) {

      abrirWhatsAppDoctor(
        doctor,
        nombreFinal,
        new Date(
          inicio
        ),
        duracionMinutos
      );

    }

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
        t.moveError
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
      doctores[0]?.nombre ||
      ""
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
        t.enterPatient
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
        t.saveError
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
        t.deleteConfirm
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
        t.deleteError
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
        t.noLinkedPatient
      );

      return;

    }

    setModalOpen(
      false
    );

    navigate(
      `/pacientes?paciente=${pacienteId}&tab=expediente`
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

      {puedeConfigurarColores && (
        <div className="agenda-colors-toolbar">
          <button type="button" className="agenda-colors-trigger" onClick={() => setMostrarColores(true)}>
            <span aria-hidden="true">🎨</span> {t.doctorColors}
          </button>
        </div>
      )}

      <div
        className="agenda-calendar-card"
      >

        <FullCalendar

          key={language}

          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}

          initialView=
            "timeGridWeek"

          locale={es ? "es" : "en"}

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
              t.today,

            month:
              t.month,

            week:
              t.week,

            day:
              t.day,
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
            eventosConColores
          }

          eventContent={(info) => {
            const estadoCita = info.event.extendedProps.estado || "pendiente";
            const etiqueta = estadoCita === "confirmada" ? t.confirmed :
              estadoCita === "cancelada" ? t.cancelled :
              estadoCita === "tratamiento" ? t.treatment : t.pending;
            return (
              <div className="agenda-event-content">
                <span className="agenda-event-title">{info.event.title}</span>
                <span className={`agenda-event-status agenda-event-status-${estadoCita}`}>
                  {etiqueta}
                </span>
              </div>
            );
          }}

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
            "100%"

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
        isOpen={mostrarColores}
        onRequestClose={() => { if (guardandoColorId === null) setMostrarColores(false); }}
        className="agenda-modal agenda-colors-modal"
        overlayClassName="agenda-modal-overlay"
        contentLabel={t.doctorColors}
      >
        <div className="agenda-modal-header">
          <div>
            <span className="agenda-modal-eyebrow">MINTOS · AGENDA</span>
            <h2>{t.doctorColors}</h2>
          </div>
          <button type="button" className="agenda-modal-close" aria-label={t.close}
            disabled={guardandoColorId !== null} onClick={() => setMostrarColores(false)}>×</button>
        </div>
        <div className="agenda-modal-body">
          <p className="agenda-colors-description">{t.doctorColorsHint}</p>
          {doctores.length === 0 && <p>{t.noDoctors}</p>}
          {doctores.map((item) => (
            <div className="agenda-color-row" key={item.id}>
              <span className="agenda-color-name">{item.nombre}</span>
              <div className="agenda-color-selector">
                <button
                  type="button"
                  className="agenda-color-current"
                  aria-label={`${t.doctorColors}: ${item.nombre}`}
                  aria-expanded={selectorColorAbierto === item.id}
                  aria-controls={`agenda-colors-${item.id}`}
                  disabled={guardandoColorId !== null}
                  onClick={() => setSelectorColorAbierto((actual) => actual === item.id ? null : item.id)}
                >
                  <span className="agenda-color-current-sample" style={{ backgroundColor: item.color_agenda || "#0B8F80" }} />
                  <span className="agenda-color-current-chevron" aria-hidden="true">▾</span>
                </button>
                {selectorColorAbierto === item.id && (
                  <div className="agenda-color-dropdown" id={`agenda-colors-${item.id}`} role="group" aria-label={`${t.doctorColors}: ${item.nombre}`}>
                    {COLORES_DOCTORES.map((color, indice) => (
                      <button
                        key={color}
                        type="button"
                        className={`agenda-color-swatch${item.color_agenda?.toLowerCase() === color.toLowerCase() ? " agenda-color-swatch-selected" : ""}`}
                        style={{ backgroundColor: color }}
                        aria-label={`${item.nombre}: color ${indice + 1} (${color})`}
                        aria-pressed={item.color_agenda?.toLowerCase() === color.toLowerCase()}
                        title={`${item.nombre} · ${color}`}
                        disabled={guardandoColorId !== null}
                        onClick={() => {
                          setSelectorColorAbierto(null);
                          void guardarColorDoctor(item.id, color);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {errorColor && <p role="alert" className="agenda-colors-error">{errorColor}</p>}
        </div>
        <div className="agenda-modal-footer">
          <button type="button" className="agenda-btn agenda-btn-neutral"
            disabled={guardandoColorId !== null} onClick={() => setMostrarColores(false)}>{t.close}</button>
        </div>
      </Modal>

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
                  ? t.newAppointment
                  : t.appointmentDetails
              }

            </span>

            <h2>

              {
                modoCrear
                  ? t.schedulePatient
                  : t.editAppointment
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
              {t.searchExisting}
            </label>

            <Select

              options={
                opcionesPacientes
              }

              placeholder={t.searchPatient}

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
              {t.or}
            </span>

          </div>

          <div
            className="agenda-field"
          >

            <label>
              {t.patientName}
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

              placeholder={t.patientName}

            />

          </div>

          {
            modoCrear && (

              <div
                className="agenda-field"
              >

                <label>
                  {t.appointmentDuration}
                </label>

                <div
                  className="agenda-duration-options"
                >

                  {[
                    { minutos: 30, label: t.min30 },
                    { minutos: 60, label: t.hour1 },
                    { minutos: 90, label: t.hour1half },
                    { minutos: 120, label: t.hours2 },
                  ].map((opcion) => {

                    const activo =
                      duracionMinutos ===
                      opcion.minutos;

                    return (

                      <button
                        key={opcion.minutos}
                        type="button"
                        disabled={!puedeEditarCitas}
                        onClick={() =>
                          cambiarDuracion(
                            opcion.minutos
                          )
                        }
                        className={`agenda-duration-btn${
                          activo
                            ? " agenda-duration-btn-active"
                            : ""
                        }`}
                      >
                        {opcion.label}
                      </button>

                    );

                  })}

                </div>

              </div>

            )
          }

          <div
            className="agenda-modal-grid"
          >

            <div
              className="agenda-field"
            >

              <label>
                {t.doctor}
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

                <option
                  value=""
                  disabled
                >
                  {t.selectDoctor}
                </option>

                {
                  doctores.map(
                    (item) => (

                      <option
                        key={item.id}
                        value={item.nombre}
                      >
                        {item.nombre}
                      </option>

                    )
                  )
                }

              </select>

            </div>

            <div
              className="agenda-field"
            >

              <label>
                {t.status}
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
                  {t.pending}
                </option>

                <option
                  value="confirmada"
                >
                  {t.confirmed}
                </option>

                <option
                  value="tratamiento"
                >
                  {t.treatment}
                </option>

                <option
                  value="cancelada"
                >
                  {t.cancelled}
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
                    {t.createAppointment}
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
                        {t.save}
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
                        {t.openRecord}
                      </button>

                    )
                  }

                  {
                    doctor && (

                      <button

                        type="button"

                        onClick={() =>
                          abrirWhatsAppDoctor(
                            doctor,
                            nombreManual.trim() ||
                            eventoSeleccionado
                              ?.title
                              ?.split(" - ")[0] ||
                            "Paciente",
                            new Date(
                              eventoSeleccionado
                                ?.start ||
                              new Date()
                            )
                          )
                        }

                        className=
                          "agenda-btn agenda-btn-secondary"

                      >
                        {t.notifyDoctor}
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
                        {t.delete}
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
            {t.close}
          </button>

        </div>

      </Modal>

    </div>

  );

}