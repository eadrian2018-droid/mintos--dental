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
          mb-8
        ">

          Tratamientos Activos

        </h3>

        <div className="
          space-y-6
        ">

          {

            Object.entries(
              estadoDientes
            ).map(([numero, zonas]) => {

              const numeroDiente =
                Number(numero);

              return (

                <div

                  key={numero}

                  className="
                    border
                    border-slate-200
                    rounded-3xl
                    p-6
                    shadow-sm
                  "
                >

                  <div className="
                    flex
                    items-center
                    justify-between
                    mb-5
                  ">

                    <h4 className="
                      text-xl
                      font-bold
                      text-slate-800
                    ">

                      Diente {numero}

                    </h4>

                  </div>

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
                      rounded-2xl
                      p-4
                      w-full
                      h-28
                      mb-6
                    "

                    placeholder="
Observaciones clínicas del diente...
                    "

                  />

                  <div className="
                    grid
                    grid-cols-2
                    gap-4
                  ">

                    {

                      Object.entries(
                        zonas
                      ).map(([zona, tratamientos]) => {

                        const lista =
                          (tratamientos || []) as string[];

                        if (
                          lista.length === 0
                        ) {

                          return null;

                        }

                        return (

                          <div

                            key={zona}

                            className="
                              border
                              border-slate-200
                              rounded-2xl
                              p-4
                              bg-slate-50
                            "
                          >

                            <h5 className="
                              font-bold
                              capitalize
                              text-slate-700
                              mb-3
                            ">

                              {zona}

                            </h5>

                            <div className="
                              flex
                              flex-wrap
                              gap-2
                            ">

                              {

                                lista.map((t)=>(

                                  <div

                                    key={t}

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

                                    <span>

                                      {t}

                                    </span>

                                    <button

                                      onClick={() => {

                                        const nuevos =
                                          lista.filter(

                                            (x)=>
                                              x !== t

                                          );

                                        setEstadoDientes({

                                          ...estadoDientes,

                                          [numeroDiente]: {

                                            ...estadoDientes[
                                              numeroDiente
                                            ],

                                            [zona]: nuevos,

                                          },

                                        });

                                      }}

                                      className="
                                        bg-white/20
                                        hover:bg-white/30
                                        rounded-full
                                        px-2
                                      "
                                    >

                                      ✕

                                    </button>

                                  </div>

                                ))

                              }

                            </div>

                          </div>

                        );

                      })

                    }

                  </div>

                </div>

              );

            })

          }

        </div>

      </div>

    </div>

  );

}