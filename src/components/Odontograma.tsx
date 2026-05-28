import { useState } from "react";

import Incisor from "./teeth/Incisor";
import Canino from "./teeth/Canino";
import Premolar from "./teeth/Premolar";
import Molar from "./teeth/Molar";

interface ZonaDiente {

  oclusal?: string[];

  vestibular?: string[];

  distal?: string[];

  mesial?: string[];

}

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
    Record<number, ZonaDiente>;

  setEstadoDientes:
    React.Dispatch<
      React.SetStateAction<
        Record<number, ZonaDiente>
      >
    >;
}

export default function Odontograma({

  observacionesDientes,
  setObservacionesDientes,

  estadoDientes,
  setEstadoDientes,

}: Props) {

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
    tratamientos?: string[]
  ) {

    if (
      !tratamientos ||
      tratamientos.length === 0
    ) {

      return "white";

    }

    return coloresTratamientos[
      tratamientos[0]
    ] || "white";

  }

  function clickZona(

    numero: number,

    zona: keyof ZonaDiente

  ) {

    const actuales =

      estadoDientes[numero]
        ?.[
          zona
        ] || [];

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

        [numero]: {

          ...estadoDientes[
            numero
          ],

          [zona]: nuevos,

        },

      });

      return;

    }

    if (
      actuales.length >= 4
    ) {

      alert(
        "Máximo 4 tratamientos por zona"
      );

      return;

    }

    setEstadoDientes({

      ...estadoDientes,

      [numero]: {

        ...estadoDientes[
          numero
        ],

        [zona]: [

          ...actuales,

          tratamiento,

        ],

      },

    });

  }

  function renderDiente(
    numero: number
  ) {

    const zonas =

      estadoDientes[numero]
      || {};

    const colores = {

      oclusal:
        obtenerColor(
          zonas.oclusal
        ),

      vestibular:
        obtenerColor(
          zonas.vestibular
        ),

      distal:
        obtenerColor(
          zonas.distal
        ),

      mesial:
        obtenerColor(
          zonas.mesial
        ),

    };

    const invertido =
      superiores.includes(numero);

    let componente;

    const propsDiente = {

      colores,

      invertido,

      onZonaClick:
        (zona:string)=>

          clickZona(
            numero,
            zona as keyof ZonaDiente
          ),

    };

    if (

      [11,12,21,22,31,32,41,42]
      .includes(numero)

    ) {

      componente = (

        <Incisor
          {...propsDiente}
        />

      );

    }

    else if (

      [13,23,33,43]
      .includes(numero)

    ) {

      componente = (

        <Canino
          {...propsDiente}
        />

      );

    }

    else if (

      [14,15,24,25,34,35,44,45]
      .includes(numero)

    ) {

      componente = (

        <Premolar
          {...propsDiente}
        />

      );

    }

    else {

      componente = (

        <Molar
          {...propsDiente}
        />

      );

    }

    return (

      <div

        key={numero}

        className="
          flex
          flex-col
          items-center
          hover:scale-105
          transition-all
          duration-200
        "

        style={{

          minWidth: "72px",

          marginLeft: "2px",

          marginRight: "2px",

        }}
      >

        {componente}

        <span className="
          text-[11px]
          font-bold
          mt-2
          text-slate-700
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

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-6
      ">

        <h2 className="
          text-3xl
          font-bold
          text-center
          text-teal-700
          mb-6
        ">

          Odontograma Clínico

        </h2>

        <div className="
          flex
          justify-center
        ">

          <select

            value={tratamiento}

            onChange={(e)=>
              setTratamiento(
                e.target.value
              )
            }

            className="
              border
              border-slate-300
              rounded-2xl
              p-4
              text-lg
              shadow-md
              bg-white
              min-w-[320px]
            "
          >

            {

              Object.keys(
                coloresTratamientos
              ).map((t)=>(

                <option
                  key={t}
                  value={t}
                >

                  {t}

                </option>

              ))

            }

          </select>

        </div>

      </div>

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-8
      ">

        <h3 className="
          text-center
          text-2xl
          font-bold
          text-teal-700
          mb-8
        ">

          MAXILAR SUPERIOR

        </h3>

        <div className="
          flex
          justify-center
          flex-wrap
          gap-[10px]
        ">

          {superiores.map(renderDiente)}

        </div>

      </div>

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-8
      ">

        <h3 className="
          text-center
          text-2xl
          font-bold
          text-teal-700
          mb-8
        ">

          MAXILAR INFERIOR

        </h3>

        <div className="
          flex
          justify-center
          flex-wrap
          gap-[10px]
        ">

          {inferiores.map(renderDiente)}

        </div>

      </div>

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-8
      ">

        <h3 className="
          text-2xl
          font-bold
          text-teal-700
          mb-6
        ">

          Tratamientos Activos

        </h3>

        <div className="
          overflow-x-auto
        ">

          <table className="
            w-full
            border-separate
            border-spacing-y-3
          ">

            <thead>

              <tr className="
                text-left
                text-slate-700
              ">

                <th className="
                  px-4
                  py-3
                  font-bold
                ">
                  Diente
                </th>

                <th className="
                  px-4
                  py-3
                  font-bold
                ">
                  Tratamientos
                </th>

                <th className="
                  px-4
                  py-3
                  font-bold
                ">
                  Observación
                </th>

                <th className="
                  px-4
                  py-3
                  font-bold
                ">
                  Acción
                </th>

              </tr>

            </thead>

            <tbody>

              {

                Object.entries(
                  estadoDientes
                ).map(([numero, zonas]) => {

                  const numeroDiente =
                    Number(numero);

                  return (

                    <tr

                      key={numero}

                      className="
                        bg-slate-50
                        shadow-sm
                      "
                    >

                      <td className="
                        px-4
                        py-4
                        rounded-l-2xl
                        font-bold
                        text-slate-800
                        align-top
                      ">

                        {numero}

                      </td>

                      <td className="
                        px-4
                        py-4
                        min-w-[420px]
                      ">

                        <div className="
                          flex
                          flex-wrap
                          gap-2
                        ">

                          {

                            Object.entries(
                              zonas
                            ).flatMap(

                              ([zona, tratamientos]) => {

                                const lista =
                                  (tratamientos || []) as string[];

                                return lista.map((t)=>(

                                  <div

                                    key={
                                      `${numero}-${zona}-${t}`
                                    }

                                    className="
                                      flex
                                      items-center
                                      gap-2
                                      px-3
                                      py-2
                                      rounded-full
                                      text-white
                                      text-sm
                                      font-semibold
                                    "

                                    style={{

                                      backgroundColor:
                                        coloresTratamientos[t]

                                    }}
                                  >

                                    <span className="
                                      capitalize
                                    ">

                                      {zona}

                                    </span>

                                    <span>

                                      :

                                    </span>

                                    <span>

                                      {t}

                                    </span>

                                  </div>

                                ));

                              }

                            )

                          }

                        </div>

                      </td>

                      <td className="
                        px-4
                        py-4
                        min-w-[320px]
                      ">

                        <textarea

                          value={
                            observacionesDientes[
                              numeroDiente
                            ] || ""
                          }

                          onChange={(e)=>

                            setObservacionesDientes({

                              ...observacionesDientes,

                              [numeroDiente]:
                                e.target.value,

                            })

                          }

                          className="
                            border
                            border-slate-300
                            rounded-xl
                            p-3
                            w-full
                            min-h-[90px]
                            resize-none
                          "

                          placeholder="
Observación clínica...
                          "

                        />

                      </td>

                      <td className="
                        px-4
                        py-4
                        rounded-r-2xl
                        align-top
                      ">

                        <button

                          onClick={() => {

                            const nuevoEstado = {
                              ...estadoDientes
                            };

                            delete nuevoEstado[
                              numeroDiente
                            ];

                            setEstadoDientes(
                              nuevoEstado
                            );

                          }}

                          className="
                            bg-red-500
                            hover:bg-red-600
                            text-white
                            px-4
                            py-2
                            rounded-xl
                            font-bold
                          "
                        >

                          Limpiar

                        </button>

                      </td>

                    </tr>

                  );

                })

              }

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}