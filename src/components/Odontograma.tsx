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
    Record<number, string[]>;

  setEstadoDientes:
    React.Dispatch<
      React.SetStateAction<
        Record<number, string[]>
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

  const coloresTratamientos:
    Record<string, string> = {

    caries: "#ef4444",

    resina: "#3b82f6",

    extraccion: "#111827",

    corona: "#22c55e",

    implante: "#fbbf24",

    endodoncia: "#9333ea",

    carillas: "#06b6d4",

    puente: "#f97316",

    protesis: "#64748b",

    sellador: "#14b8a6",

    limpieza: "#84cc16",

    blanqueamiento: "#e5e7eb",

    brackets: "#ec4899",

    incrustacion: "#a855f7",

    amalgama: "#6b7280",

    fractura: "#dc2626",

    movilidad: "#f59e0b",

    ausente: "#000000",

  };

  function obtenerColor(
    tratamiento: string
  ) {

    return coloresTratamientos[
      tratamiento
    ] || "#ffffff";

  }

  function clickDiente(
    numero: number
  ) {

    setSeleccionado(numero);

    const actuales =
      estadoDientes[numero] || [];

    if (
      actuales.includes(
        tratamiento
      )
    ) {

      const nuevos = actuales.filter(

        (t)=>
          t !== tratamiento

      );

      setEstadoDientes({

        ...estadoDientes,

        [numero]: nuevos,

      });

      return;

    }

    if (
      actuales.length >= 4
    ) {

      alert(
        "Máximo 4 tratamientos por diente"
      );

      return;

    }

    setEstadoDientes({

      ...estadoDientes,

      [numero]: [

        ...actuales,

        tratamiento,

      ],

    });

  }

  function renderDiente(
    numero: number
  ) {

    const tratamientos =
      estadoDientes[numero]
      || [];

    const colorPrincipal =

      tratamientos.length > 0

      ? obtenerColor(
          tratamientos[0]
        )

      : "white";

    const invertido =
      superiores.includes(numero);

    let componente;

    if (
      [11,12,21,22,31,32,41,42]
      .includes(numero)
    ) {

      componente = (

        <Incisor
          color={colorPrincipal}
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
          color={colorPrincipal}
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
          color={colorPrincipal}
          invertido={invertido}
        />

      );

    }

    else {

      componente = (

        <Molar
          color={colorPrincipal}
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

        <div className="
          flex
          flex-wrap
          justify-center
          gap-1
          mt-1
        ">

          {

            tratamientos.map((t)=>(

              <div

                key={t}

                className="
                  w-2
                  h-2
                  rounded-full
                "

                style={{
                  backgroundColor:
                    obtenerColor(t)
                }}
              />

            ))

          }

        </div>

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
            text-lg
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

          <option value="endodoncia">
            Endodoncia
          </option>

          <option value="carillas">
            Carillas
          </option>

          <option value="puente">
            Puente
          </option>

          <option value="protesis">
            Prótesis
          </option>

          <option value="sellador">
            Sellador
          </option>

          <option value="limpieza">
            Limpieza
          </option>

          <option value="blanqueamiento">
            Blanqueamiento
          </option>

          <option value="brackets">
            Brackets
          </option>

          <option value="incrustacion">
            Incrustación
          </option>

          <option value="amalgama">
            Amalgama
          </option>

          <option value="fractura">
            Fractura
          </option>

          <option value="movilidad">
            Movilidad
          </option>

          <option value="ausente">
            Ausente
          </option>

        </select>

      </div>

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

          <div className="
            mt-6
          ">

            <h4 className="
              font-bold
              mb-3
              text-lg
            ">

              Tratamientos del diente

            </h4>

            <div className="
              flex
              flex-wrap
              gap-2
            ">

              {

                (estadoDientes[
                  seleccionado
                ] || []).map((t)=>(

                  <div

                    key={t}

                    className="
                      px-3
                      py-1
                      rounded-full
                      text-white
                      text-sm
                      font-semibold
                    "

                    style={{
                      backgroundColor:
                        obtenerColor(t)
                    }}
                  >

                    {t}

                  </div>

                ))

              }

            </div>

          </div>

        </div>

      )}

    </div>

  );

}