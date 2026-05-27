import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";

import Modal from "react-modal";

import Select from "react-select";

import { supabase } from "../lib/supabase";

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

  const [eventos,
    setEventos] =
    useState<Evento[]>([]);

  const [pacientes,
    setPacientes] =
    useState<Paciente[]>([]);

  const [modalOpen,
    setModalOpen] =
    useState(false);

  const [modoCrear,
    setModoCrear] =
    useState(false);

  const [eventoSeleccionado,
    setEventoSeleccionado] =
    useState<any>(null);

  const [pacienteId,
    setPacienteId] =
    useState<number | null>(null);

  const [nombreManual,
    setNombreManual] =
    useState("");

  const [estado,
    setEstado] =
    useState("pendiente");

  const [doctor,
    setDoctor] =
    useState("Dr. Edgar");

  const [inicioNuevo,
    setInicioNuevo] =
    useState<any>(null);

  const [finNuevo,
    setFinNuevo] =
    useState<any>(null);

  useEffect(() => {

    cargarCitas();

    cargarPacientes();

  }, []);

  function colorEstado(
    estado: string
  ) {

    if (estado === "confirmada")
      return "#16a34a";

    if (estado === "cancelada")
      return "#dc2626";

    if (estado === "tratamiento")
      return "#2563eb";

    return "#eab308";

  }

  async function cargarPacientes() {

    const { data } =

      await supabase

        .from("pacientes")

        .select("id, nombre")

        .order(
          "nombre",
          {
            ascending: true,
          }
        );

    if (data) {

      setPacientes(data);

    }

  }

  async function cargarCitas() {

    const { data } =

      await supabase

        .from("citas")

        .select("*")

        .order(
          "inicio",
          {
            ascending: true,
          }
        );

    if (!data)
      return;

    const eventosFormateados =

      data.map((cita)=>({

        id:
          String(cita.id),

        title:
          `${cita.paciente || "Paciente"} - ${cita.doctor || "Doctor"}`,

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
            cita.estado || "pendiente"
          ),

        borderColor:
          colorEstado(
            cita.estado || "pendiente"
          ),

        extendedProps: {

          estado:
            cita.estado,

          doctor:
            cita.doctor,

          paciente_id:
            cita.paciente_id,

        },

      }));

    setEventos(
      eventosFormateados
    );

  }

  function abrirCrearCita(
    info: any
  ) {

    setModoCrear(true);

    setInicioNuevo(
      info.start
    );

    setFinNuevo(
      info.end
    );

    setPacienteId(null);

    setNombreManual("");

    setDoctor(
      "Dr. Edgar"
    );

    setEstado(
      "pendiente"
    );

    setModalOpen(true);

  }

  async function guardarNuevaCita() {

    let nombreFinal =
      nombreManual;

    if (pacienteId) {

      const paciente =
        pacientes.find(
          (p)=>
            p.id === pacienteId
        );

      nombreFinal =
        paciente?.nombre || "";
    }

    if (!nombreFinal)
      return;

    await supabase

      .from("citas")

      .insert([

        {

          paciente:
            nombreFinal,

          paciente_id:
            pacienteId,

          inicio:
            new Date(
              inicioNuevo
            ).toISOString(),

          fin:
            new Date(
              finNuevo
            ).toISOString(),

          estado,

          doctor,

        },

      ]);

    setModalOpen(false);

    cargarCitas();

  }

  async function moverCita(
    info: any
  ) {

    await supabase

      .from("citas")

      .update({

        inicio:
          new Date(
            info.event.start
          ).toISOString(),

        fin:
          new Date(
            info.event.end
          ).toISOString(),

      })

      .eq(
        "id",
        info.event.id
      );

    cargarCitas();

  }

  function abrirModal(
    info: any
  ) {

    setModoCrear(false);

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

      info.event.extendedProps
        ?.estado ||

      "pendiente"

    );

    setDoctor(

      info.event.extendedProps
        ?.doctor ||

      "Dr. Edgar"

    );

    setPacienteId(

      info.event.extendedProps
        ?.paciente_id ||

      null

    );

    setModalOpen(true);

  }

  async function guardarCambios() {

    if (!eventoSeleccionado)
      return;

    await supabase

      .from("citas")

      .update({

        paciente:
          nombreManual,

        paciente_id:
          pacienteId,

        estado,

        doctor,

      })

      .eq(
        "id",
        eventoSeleccionado.id
      );

    setModalOpen(false);

    cargarCitas();

  }

  async function eliminarCita() {

    if (!eventoSeleccionado)
      return;

    await supabase

      .from("citas")

      .delete()

      .eq(
        "id",
        eventoSeleccionado.id
      );

    setModalOpen(false);

    cargarCitas();

  }

  function abrirExpediente() {

    if (!pacienteId) {

      alert(
        "Esta cita no está conectada a un paciente existente."
      );

      return;

    }

    window.open(

      `/paciente/${pacienteId}`,

      "_blank"

    );

  }

  const opcionesPacientes =

    pacientes.map((p)=>({

      value: p.id,

      label: p.nombre,

    }));

  return (

    <div className="
      space-y-6
    ">

      <div>

        <h1 className="
          text-5xl
          font-bold
          text-gray-800
        ">
          Agenda y Citas
        </h1>

      </div>

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-6
      ">

        <FullCalendar

          plugins={[

            dayGridPlugin,

            timeGridPlugin,

            interactionPlugin,

          ]}

          initialView="timeGridWeek"

          selectable

          editable

          events={
            eventos
          }

          select={
            abrirCrearCita
          }

          eventDrop={
            moverCita
          }

          eventResize={
            moverCita
          }

          eventClick={
            abrirModal
          }

          height="80vh"

          slotMinTime="08:00:00"

          slotMaxTime="20:00:00"

          slotDuration="00:15:00"

          snapDuration="00:15:00"

          slotLabelInterval="01:00"

          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }}

          allDaySlot={false}

          dayHeaderClassNames={() => [
            "bg-gray-100",
            "text-gray-700",
            "font-bold",
          ]}

          slotLaneClassNames={() => [
            "bg-blue-50/30",
            "border-gray-200",
          ]}

          slotLabelClassNames={() => [
            "text-gray-500",
            "font-semibold",
          ]}

        />

      </div>

      <Modal

        isOpen={modalOpen}

        onRequestClose={()=>
          setModalOpen(false)
        }

        style={{

          overlay: {

            backgroundColor:
              "rgba(0,0,0,0.5)",

            zIndex: 9999,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

          },

          content: {

            position: "relative",

            inset: "unset",

            width: "500px",

            borderRadius: "24px",

            padding: "40px",

            border: "none",

          },

        }}
      >

        <h2 className="
          text-3xl
          font-bold
          mb-6
        ">

          {

            modoCrear

            ? "Nueva Cita"

            : "Editar Cita"

          }

        </h2>

        <div className="space-y-5">

          <div>

            <label className="
              block
              mb-2
              font-semibold
            ">
              Buscar Paciente Existente
            </label>

            <Select

              options={
                opcionesPacientes
              }

              placeholder="
Buscar paciente...
              "

              isClearable

              onChange={(option:any)=>{

                if (!option) {

                  setPacienteId(null);

                  return;

                }

                setPacienteId(
                  option.value
                );

                const paciente =
                  pacientes.find(
                    (p)=>
                      p.id === option.value
                  );

                setNombreManual(
                  paciente?.nombre || ""
                );

              }}

            />

          </div>

          <div>

            <label className="
              block
              mb-2
              font-semibold
            ">
              O escribir nuevo paciente
            </label>

            <input

              value={nombreManual}

              onChange={(e)=>
                setNombreManual(
                  e.target.value
                )
              }

              className="
                w-full
                border
                rounded-xl
                p-4
              "

              placeholder="
Nombre nuevo paciente
              "

            />

          </div>

          <select

            value={doctor}

            onChange={(e)=>
              setDoctor(
                e.target.value
              )
            }

            className="
              w-full
              border
              rounded-xl
              p-4
            "
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

          <select

            value={estado}

            onChange={(e)=>
              setEstado(
                e.target.value
              )
            }

            className="
              w-full
              border
              rounded-xl
              p-4
            "
          >

            <option value="pendiente">
              Pendiente
            </option>

            <option value="confirmada">
              Confirmada
            </option>

            <option value="tratamiento">
              Tratamiento
            </option>

            <option value="cancelada">
              Cancelada
            </option>

          </select>

          <div className="
            flex
            flex-wrap
            gap-4
            pt-4
          ">

            {

              modoCrear

              ? (

                <button

                  onClick={
                    guardarNuevaCita
                  }

                  className="
                    bg-teal-600
                    hover:bg-teal-700
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    font-bold
                  "
                >
                  Crear Cita
                </button>

              )

              : (

                <>

                  <button

                    onClick={
                      guardarCambios
                    }

                    className="
                      bg-teal-600
                      hover:bg-teal-700
                      text-white
                      px-6
                      py-3
                      rounded-xl
                      font-bold
                    "
                  >
                    Guardar
                  </button>

                  <button

                    onClick={
                      abrirExpediente
                    }

                    className="
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      px-6
                      py-3
                      rounded-xl
                      font-bold
                    "
                  >
                    Abrir Expediente
                  </button>

                  <button

                    onClick={
                      eliminarCita
                    }

                    className="
                      bg-red-600
                      hover:bg-red-700
                      text-white
                      px-6
                      py-3
                      rounded-xl
                      font-bold
                    "
                  >
                    Eliminar
                  </button>

                </>

              )

            }

          </div>

        </div>

      </Modal>

    </div>

  );

}