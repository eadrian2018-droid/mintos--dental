import { useEffect, useState } from "react";

import {
  Calendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";

import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { supabase } from "../lib/supabase";

const localizer =
  momentLocalizer(moment);

type Evento = {

  id: number;

  title: string;

  start: Date;

  end: Date;

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

        id: cita.id,

        title:
          cita.paciente,

        start:
          new Date(
            cita.inicio
          ),

        end:
          new Date(
            cita.fin
          ),

      }));

    setEventos(
      eventosFormateados
    );

  }

  async function crearCita({
    start,
    end,
  }: any) {

    const nombre =

      prompt(
        "Nombre del paciente"
      );

    if (!nombre)
      return;

    const horas =

      prompt(
        "Duración en horas"
      );

    const duracion =

      Number(horas || 1);

    const nuevoFin =

      new Date(
        start.getTime() +
        duracion *
        60 *
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

            inicio:
              start,

            fin:
              nuevoFin,

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

  async function borrarEvento(
    evento: Evento
  ) {

    const confirmar =

      confirm(
        `¿Eliminar cita de ${evento.title}?`
      );

    if (!confirmar)
      return;

    await supabase

      .from("citas")

      .delete()

      .eq(
        "id",
        evento.id
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

        <div
          style={{
            height: "80vh",
          }}
        >

          <Calendar

            localizer={
              localizer
            }

            events={
              eventos
            }

            startAccessor="start"

            endAccessor="end"

            selectable

            popup

            step={30}

            timeslots={2}

            defaultView={
              Views.WEEK
            }

            views={[
              Views.MONTH,
              Views.WEEK,
              Views.DAY,
              Views.AGENDA,
            ]}

            min={
              new Date(
                0,
                0,
                0,
                8,
                0,
                0
              )
            }

            max={
              new Date(
                0,
                0,
                0,
                20,
                0,
                0
              )
            }

            onSelectSlot={
              crearCita
            }

            onDoubleClickEvent={
              borrarEvento
            }

          />

        </div>

      </div>

    </div>

  );

}