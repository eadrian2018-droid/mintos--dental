import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";

import { supabase } from "../lib/supabase";

type Evento = {

  id: string;

  title: string;

  start: string;

  end: string;

  backgroundColor?: string;

  borderColor?: string;

};

export default function AgendaCalendar() {

  const [eventos,
    setEventos] =
    useState<Evento[]>([]);

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

      }));

    setEventos(
      eventosFormateados
    );

  }

  async function crearCita(
    info: any
  ) {

    const nombre =

      prompt(
        "Nombre del paciente"
      );

    if (!nombre)
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

    const { error } =

      await supabase

        .from("citas")

        .insert([

          {

            paciente:
              nombre,

            inicio,

            fin,

            estado:
              "pendiente",

          },

        ]);

    if (error) {

      alert(
        "Error creando cita"
      );

      return;

    }

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

  async function editarEstado(
    info: any
  ) {

    const estado =

      prompt(

`Estado:

pendiente
confirmada
tratamiento
cancelada`

      );

    if (!estado)
      return;

    await supabase

      .from("citas")

      .update({

        estado,

      })

      .eq(
        "id",
        info.event.id
      );

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
            editarEstado
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

    </div>

  );

}