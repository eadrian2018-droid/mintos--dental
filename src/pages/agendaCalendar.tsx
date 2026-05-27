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
  }: any) {

    const nombre =

      prompt(
        "Nombre del paciente"
      );

    if (!nombre)
      return;

    const fin =

      new Date(
        start.getTime() +
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

  async function editarCita(
    evento: Evento
  ) {

    const accion =

      prompt(

`Editar cita:

1 = Cambiar nombre
2 = Cambiar duración
3 = Mover +1 hora
4 = Mover -1 hora
5 = Eliminar`

      );

    if (accion === "1") {

      const nuevoNombre =

        prompt(
          "Nuevo nombre",
          evento.title
        );

      if (!nuevoNombre)
        return;

      await supabase

        .from("citas")

        .update({

          paciente:
            nuevoNombre,

        })

        .eq(
          "id",
          evento.id
        );

    }

    if (accion === "2") {

      const horas =

        prompt(
          "Duración en horas"
        );

      const duracion =

        Number(horas || 1);

      const nuevoFin =

        new Date(
          evento.start.getTime() +
          duracion *
          60 *
          60 *
          1000
        );

      await supabase

        .from("citas")

        .update({

          fin: nuevoFin,

        })

        .eq(
          "id",
          evento.id
        );

    }

    if (accion === "3") {

      const nuevoInicio =

        new Date(
          evento.start.getTime() +
          60 *
          60 *
          1000
        );

      const nuevoFin =

        new Date(
          evento.end.getTime() +
          60 *
          60 *
          1000
        );

      await supabase

        .from("citas")

        .update({

          inicio:
            nuevoInicio,

          fin:
            nuevoFin,

        })

        .eq(
          "id",
          evento.id
        );

    }

    if (accion === "4") {

      const nuevoInicio =

        new Date(
          evento.start.getTime() -
          60 *
          60 *
          1000
        );

      const nuevoFin =

        new Date(
          evento.end.getTime() -
          60 *
          60 *
          1000
        );

      await supabase

        .from("citas")

        .update({

          inicio:
            nuevoInicio,

          fin:
            nuevoFin,

        })

        .eq(
          "id",
          evento.id
        );

    }

    if (accion === "5") {

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

    }

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

            onSelectEvent={
              editarCita
            }

          />

        </div>

      </div>

    </div>

  );

}