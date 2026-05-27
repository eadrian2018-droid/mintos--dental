import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";

import Modal from "react-modal";

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

  };

};

Modal.setAppElement("#root");

export default function AgendaCalendar() {

  const [eventos,
    setEventos] =
    useState<Evento[]>([]);

  const [modalOpen,
    setModalOpen] =
    useState(false);

  const [eventoSeleccionado,
    setEventoSeleccionado] =
    useState<any>(null);

  const [nombre,
    setNombre] =
    useState("");

  const [estado,
    setEstado] =
    useState("pendiente");

  useEffect(() => {

    cargarCitas();

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
          cita.paciente,

        start:
          cita.inicio,

        end:
          cita.fin,

        backgroundColor:
          colorEstado(
            cita.estado
          ),

        borderColor:
          colorEstado(
            cita.estado
          ),

        extendedProps: {

          estado:
            cita.estado,

        },

      }));

    setEventos(
      eventosFormateados
    );

  }

  async function crearCita(
    info: any
  ) {

    const nombrePaciente =

      prompt(
        "Nombre del paciente"
      );

    if (!nombrePaciente)
      return;

    const inicio =
      info.start;

    const fin =

      new Date(
        inicio.getTime() +
        15 *
        60 *
        1000
      );

    await supabase

      .from("citas")

      .insert([

        {

          paciente:
            nombrePaciente,

          inicio,

          fin,

          estado:
            "pendiente",

        },

      ]);

    cargarCitas();

  }

  async function moverCita(
    info: any
  ) {

    await supabase

      .from("citas")

      .update({

        inicio:
          info.event.start,

        fin:
          info.event.end,

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

    setEventoSeleccionado(
      info.event
    );

    setNombre(
      info.event.title
    );

    setEstado(

      info.event.extendedProps
        ?.estado ||

      "pendiente"

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
          nombre,

        estado,

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

    const confirmar =

      confirm(
        "¿Eliminar cita?"
      );

    if (!confirmar)
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

  return (

    <div>

      <h1 className="
        text-5xl
        font-bold
        text-gray-800
        mb-10
      ">
        Agenda y Citas
      </h1>

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
            crearCita
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

            overflow: "hidden",

          },

        }}
      >

        <h2 className="
          text-3xl
          font-bold
          mb-6
        ">
          Editar Cita
        </h2>

        <div className="space-y-5">

          <input

            value={nombre}

            onChange={(e)=>
              setNombre(
                e.target.value
              )
            }

            className="
              w-full
              border
              rounded-xl
              p-4
            "

            placeholder="Nombre paciente"

          />

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
            gap-4
            pt-4
          ">

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

          </div>

        </div>

      </Modal>

    </div>

  );

}