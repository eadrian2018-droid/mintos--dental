import { useState } from "react";

import {
  Calendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";

import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer =
  momentLocalizer(moment);

type Evento = {

  title: string;

  start: Date;

  end: Date;

};

export default function AgendaCalendar() {

  const [eventos,
    setEventos] =
    useState<Evento[]>([]);

  function crearCita({
    start,
    end,
  }: {
    start: Date;
    end: Date;
  }) {

    const nombre =

      prompt(
        "Nombre del paciente"
      );

    if (!nombre)
      return;

    setEventos([

      ...eventos,

      {

        title: nombre,

        start,

        end,

      },

    ]);

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

          />

        </div>

      </div>

    </div>

  );

}