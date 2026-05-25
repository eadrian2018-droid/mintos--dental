import { useState } from "react";

import Incisor from "./teeth/Incisor";
import Canino from "./teeth/Canino";
import Premolar from "./teeth/Premolar";
import Molar from "./teeth/Molar";

interface Props {

  observacionesDientes:
    Record<number, string>;

  setObservacionesDientes:
    React.Dispatch<
      React.SetStateAction<
        Record<number, string>
      >
    >;

  estadoDientes:
    Record<number, string>;

  setEstadoDientes:
    React.Dispatch<
      React.SetStateAction<
        Record<number, string>
      >
    >;
}

export default function Odontograma({

  observacionesDientes,
  setObservacionesDientes,

  estadoDientes,
  setEstadoDientes,

}: Props) {

  const [seleccionado,
    setSeleccionado] =

    useState<number | null>(null);

  const [tratamiento,
    setTratamiento] =

    useState("caries");

  const superiores = [

    18,17,16,15,14,13,12,11,
    21,22,23,24,25,26,27,28,

  ];

  const inferiores = [

    48,47,46,45,44,43,42,41,
    31,32,33,34,35,36,37,38,

  ];

  function obtenerColor() {

    if (tratamiento === "caries")
      return "#ef4444";

    if (tratamiento === "resina")
      return "#3b82f6";

    if (tratamiento === "extraccion")
      return "#111827";

    if (tratamiento === "corona")
      return "#22c55e";

    if (tratamiento === "implante")
      return "#fbbf24";

    return "#ffffff";
  }

  function clickDiente(
    numero: number
  ) {

    setSeleccionado(numero);

    setEstadoDientes({

      ...estadoDientes,

      [numero]: obtenerColor(),

    });
  }

  function renderDiente(
    numero: number
  ) {

    const color =
      estadoDientes[numero]
      || "white";

    const invertido =
      superiores.includes(numero);

    let componente;

    if (
      [11,12,21,22,31,32,41,42]
      .includes(numero)
    ) {

      componente = (

        <Incisor
          color={color}
          invertido={invertido}
        />

      );

    }

    else if (
      [13,23,33,43]
      .includes(numero)
    ) {

      componente = (

        <Canino
          color={color}
          invertido={invertido}
        />

      );

    }

    else if (
      [14,15,24,25,34,35,44,45]
      .includes(numero)
    ) {

      componente = (

        <Premolar
          color={color}
          invertido={invertido}
        />

      );

    }

    else {

      componente = (

        <Molar
          color={color}
          invertido={invertido}
        />

      );

    }

    return (

      <div

        key={numero}

        onClick={() =>
          clickDiente(numero)
        }

        className="
          cursor-pointer
          flex
          flex-col
          items-center
          hover:scale-105
          transition
        "

        style={{
          width: "5.5%",
          minWidth: "42px",
          maxWidth: "58px",
        }}
      >

        {componente}

        <span className="
          text-[10px]
          font-bold
          mt-1
        ">

          {numero}

        </span>

      </div>

    );
  }

  return (

    <div className="
      space-y-10
    ">

      <h2 className="
        text-3xl
        font-bold
        text-center
        text-teal-700
      ">

        Odontograma Clínico

      </h2>

      {/* SELECT */}

      <div className="
        flex
        justify-center
      ">

        <select

          value={tratamiento}

          onChange={(e) =>
            setTratamiento(
              e.target.value
            )
          }

          className="
            border
            rounded-xl
            p-3
          "
        >

          <option value="caries">
            Caries
          </option>

          <option value="resina">
            Resina
          </option>

          <option value="extraccion">
            Extracción
          </option>

          <option value="corona">
            Corona
          </option>

          <option value="implante">
            Implante
          </option>

        </select>

      </div>

      {/* SUPERIOR */}

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-4
      ">

        <h3 className="
          text-center
          text-2xl
          font-bold
          text-teal-700
          mb-6
        ">

          MAXILAR SUPERIOR

        </h3>

        <div className="
          flex
          justify-center
          gap-[2px]
        ">

          {superiores.map(renderDiente)}

        </div>

      </div>

      {/* INFERIOR */}

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-4
      ">

        <h3 className="
          text-center
          text-2xl
          font-bold
          text-teal-700
          mb-6
        ">

          MAXILAR INFERIOR

        </h3>

        <div className="
          flex
          justify-center
          gap-[2px]
        ">

          {inferiores.map(renderDiente)}

        </div>

      </div>

      {/* OBSERVACIONES */}

      {seleccionado && (

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
        ">

          <h3 className="
            text-xl
            font-bold
            text-teal-700
            mb-4
          ">

            Observaciones diente {seleccionado}

          </h3>

          <textarea

            value={
              observacionesDientes[
                seleccionado
              ] || ""
            }

            onChange={(e) =>

              setObservacionesDientes({

                ...observacionesDientes,

                [seleccionado]:
                  e.target.value,

              })

            }

            className="
              border
              rounded-2xl
              p-4
              w-full
              h-32
            "

            placeholder="
              Observaciones clínicas...
            "

          />

        </div>

      )}

    </div>

  );
}