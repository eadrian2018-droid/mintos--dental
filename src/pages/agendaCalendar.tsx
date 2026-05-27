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

};

export default function AgendaCalendar() {

  const [eventos,
    setEventos] =
    useState<Evento[]>([]);

  useEffect(() => {

    cargarCitas();

  }, []);

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

  async function borrarCita(
    info: any
  ) {

    const confirmar =

      confirm(
        `¿Eliminar cita de ${info.event.title}?`
      );

    if (!confirmar)
      return;

    await supabase

      .from("citas")

      .delete()

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
            borrarCita
          }

          height="80vh"

          slotMinTime="08:00:00"

          slotMaxTime="20:00:00"

          slotDuration="00:15:00"

          snapDuration="00:15:00"

          allDaySlot={false}

        />

      </div>

    </div>

  );

}