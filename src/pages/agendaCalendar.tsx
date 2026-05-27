import { useState } from "react";

import {
  Calendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";

import withDragAndDrop from
"react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer =
  momentLocalizer(moment);

const DnDCalendar =
  withDragAndDrop(Calendar);

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

    const nuevoEvento = {

      id: Date.now(),

      title: nombre,

      start,

      end,

    };

    setEventos([

      ...eventos,

      nuevoEvento,

    ]);

  }

  function moverEvento({
    event,
    start,
    end,
  }: any) {

    const actualizados =

      eventos.map((e)=>

        e.id === event.id

          ? {
              ...e,
              start,
              end,
            }

          : e

      );

    setEventos(actualizados);

  }

  function cambiarDuracion({
    event,
    start,
    end,
  }: any) {

    const actualizados =

      eventos.map((e)=>

        e.id === event.id

          ? {
              ...e,
              start,
              end,
            }

          : e

      );

    setEventos(actualizados);

  }

  function borrarEvento(
    evento: Evento
  ) {

    const confirmar =

      confirm(
        `¿Eliminar cita de ${evento.title}?`
      );

    if (!confirmar)
      return;

    setEventos(

      eventos.filter(
        (e)=>
          e.id !== evento.id
      )

    );

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

          <DnDCalendar

            localizer={
              localizer
            }

            events={
              eventos
            }

            startAccessor="start"

            endAccessor="end"

            selectable

            resizable

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

            onEventDrop={
              moverEvento
            }

            onEventResize={
              cambiarDuracion
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