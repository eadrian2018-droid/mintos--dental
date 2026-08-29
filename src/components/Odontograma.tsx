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

  onGuardar?: (
    nuevosEstados:
      Record<number, ZonaDiente>,
    nuevasObservaciones:
      Record<number, string>
  ) => Promise<boolean> | boolean;
}

export default function Odontograma({
  observacionesDientes,
  setObservacionesDientes,

  estadoDientes,
  setEstadoDientes,

  onGuardar,
}: Props) {

  const [
    tratamiento,
    setTratamiento,
  ] = useState("caries");

  const [
    dienteSeleccionado,
    setDienteSeleccionado,
  ] = useState<number | null>(
    null
  );

  /*
    NUEVO:
    Los cambios del modal se guardan
    temporalmente aquí.

    No modificamos estadoDientes
    hasta presionar Guardar.
  */
  const [
    estadoTemporal,
    setEstadoTemporal,
  ] = useState<ZonaDiente>({});

  const [
    observacionTemporal,
    setObservacionTemporal,
  ] = useState("");

  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const superiores = [
    18, 17, 16, 15,
    14, 13, 12, 11,
    21, 22, 23, 24,
    25, 26, 27, 28,
  ];

  const inferiores = [
    48, 47, 46, 45,
    44, 43, 42, 41,
    31, 32, 33, 34,
    35, 36, 37, 38,
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

    return (
      coloresTratamientos[
        tratamientos[0]
      ] || "white"
    );

  }

  /*
    NUEVO FLUJO:

    Click en diente
    ↓
    Abrimos modal
    ↓
    Copiamos sus datos actuales
    a estadoTemporal
  */
  function abrirDiente(
    numero: number
  ) {

    setDienteSeleccionado(
      numero
    );

    const zonasActuales =
      estadoDientes[
        numero
      ] || {};

    setEstadoTemporal({

      oclusal: [
        ...(zonasActuales.oclusal || []),
      ],

      vestibular: [
        ...(zonasActuales.vestibular || []),
      ],

      distal: [
        ...(zonasActuales.distal || []),
      ],

      mesial: [
        ...(zonasActuales.mesial || []),
      ],

    });

    setObservacionTemporal(
      observacionesDientes[
        numero
      ] || ""
    );

    setTratamiento(
      "caries"
    );

    setModalAbierto(
      true
    );

  }

  function cerrarModal() {

    setModalAbierto(
      false
    );

    setEstadoTemporal(
      {}
    );

    setObservacionTemporal(
      ""
    );

  }

  /*
    Ahora tocar una zona dentro
    del modal solamente modifica
    estadoTemporal.

    Si el tratamiento ya existe,
    NO se elimina.
  */
  function seleccionarZona(
    zona: keyof ZonaDiente
  ) {

    const actuales =
      estadoTemporal[
        zona
      ] || [];

    if (
      actuales.includes(
        tratamiento
      )
    ) {

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

    setEstadoTemporal({

      ...estadoTemporal,

      [zona]: [
        ...actuales,
        tratamiento,
      ],

    });

  }

  /*
    Eliminación intencional
    solamente mediante ×.
  */
  function eliminarTemporal(
    zona: keyof ZonaDiente,
    tratamientoEliminar: string
  ) {

    const actuales =
      estadoTemporal[
        zona
      ] || [];

    setEstadoTemporal({

      ...estadoTemporal,

      [zona]:
        actuales.filter(
          (tratamientoActual) =>
            tratamientoActual !==
            tratamientoEliminar
        ),

    });

  }

  /*
    Guardar aplica todos los
    cambios del modal.
  */
async function guardarModal() {

  if (
    dienteSeleccionado ===
    null
  ) {

    return;

  }

  const nuevosEstados = {

    ...estadoDientes,

    [dienteSeleccionado]:
      estadoTemporal,

  };

  const nuevasObservaciones = {

    ...observacionesDientes,

    [dienteSeleccionado]:
      observacionTemporal,

  };

  if (onGuardar) {

    const guardado =
      await onGuardar(
        nuevosEstados,
        nuevasObservaciones
      );

    if (!guardado) {
      return;
    }

  }

  setEstadoDientes(
    nuevosEstados
  );

  setObservacionesDientes(
    nuevasObservaciones
  );

  setModalAbierto(
    false
  );

  setEstadoTemporal(
    {}
  );

  setObservacionTemporal(
    ""
  );

}

  function eliminarTratamientoZona(
    numero: number,
    zona: keyof ZonaDiente,
    tratamientoEliminar: string
  ) {

    const tratamientosActuales =
      estadoDientes[numero]
        ?.[zona] || [];

    const nuevos =
      tratamientosActuales.filter(
        (tratamientoActual) =>
          tratamientoActual !==
          tratamientoEliminar
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

  }

  function limpiarDiente(
    numero: number
  ) {

    const nuevoEstado = {
      ...estadoDientes,
    };

    delete nuevoEstado[
      numero
    ];

    setEstadoDientes(
      nuevoEstado
    );

    const nuevasObservaciones = {
      ...observacionesDientes,
    };

    delete nuevasObservaciones[
      numero
    ];

    setObservacionesDientes(
      nuevasObservaciones
    );

    if (
      dienteSeleccionado ===
      numero
    ) {

      setDienteSeleccionado(
        null
      );

    }

  }

  function tieneTratamientos(
    zonas?: ZonaDiente
  ) {

    if (!zonas) {
      return false;
    }

    return Object.values(
      zonas
    ).some(
      (lista) =>
        Array.isArray(lista) &&
        lista.length > 0
    );

  }

  const dientesConHallazgos =
    Array.from(
      new Set([
        ...Object.keys(
          estadoDientes
        ).map(Number),

        ...Object.keys(
          observacionesDientes
        ).map(Number),
      ])
    )
      .filter(
        (numero) =>

          tieneTratamientos(
            estadoDientes[numero]
          ) ||

          Boolean(
            observacionesDientes[
              numero
            ]?.trim()
          )
      )
      .sort(
        (a, b) =>
          a - b
      );

  function obtenerCantidadHallazgos(
    numero: number
  ) {

    const zonas =
      estadoDientes[numero];

    if (!zonas) {
      return 0;
    }

    return Object.values(
      zonas
    ).reduce(
      (
        total,
        lista
      ) =>

        total +
        (
          Array.isArray(lista)
            ? lista.length
            : 0
        ),

      0
    );

  }

  function renderDiente(
    numero: number
  ) {

    const zonas =
      estadoDientes[
        numero
      ] || {};

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
      superiores.includes(
        numero
      );

    let componente;

    /*
      IMPORTANTE:
      Dentro del odontograma ya
      NO guardamos tratamientos
      al tocar una zona.

      El diente completo abre
      el modal.
     */
    const propsDiente = {

      colores,

      invertido,

      onZonaClick:
        () =>

          abrirDiente(
            numero
          ),

    };

    if (
      [
        11, 12,
        21, 22,
        31, 32,
        41, 42,
      ].includes(numero)
    ) {

      componente = (

        <Incisor
          {...propsDiente}
        />

      );

    }

    else if (
      [
        13, 23,
        33, 43,
      ].includes(numero)
    ) {

      componente = (

        <Canino
          {...propsDiente}
        />

      );

    }

    else if (
      [
        14, 15,
        24, 25,
        34, 35,
        44, 45,
      ].includes(numero)
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

    const seleccionado =
      dienteSeleccionado ===
      numero;

    return (

      <div

        key={numero}

        onClick={() =>
          abrirDiente(
            numero
          )
        }

        className={`
          flex
          flex-col
          items-center
          transition-all
          duration-200
          cursor-pointer
          rounded-xl
          px-1
          py-1

          ${
            seleccionado
              ? "bg-teal-50 ring-1 ring-teal-200"
              : "hover:bg-slate-50"
          }
        `}

        style={{
          minWidth: "46px",
          marginLeft: "0px",
          marginRight: "0px",
        }}

      >

        {componente}

        <span className="
          text-[9px]
          font-bold
          mt-1
          text-slate-700
        ">

          {numero}

        </span>

      </div>

    );

  }

  const zonasSeleccionadas =
    dienteSeleccionado
      ? estadoDientes[
          dienteSeleccionado
        ] || {}
      : {};

  return (

    <div className="
      space-y-4
    ">

      <div className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        shadow-sm
        p-5
      ">

        <div>

          <p className="
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-teal-600
          ">
            Expediente Clínico
          </p>

          <h2 className="
            text-xl
            font-bold
            text-slate-800
            mt-1
          ">
            Odontograma
          </h2>

          <p className="
            text-sm
            text-slate-500
            mt-1
          ">
            Selecciona un diente
            para registrar o consultar
            sus hallazgos clínicos.
          </p>

        </div>

      </div>

      <div className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        shadow-sm
        p-5
      ">

        <div className="
          flex
          items-center
          justify-between
          mb-4
        ">

          <h3 className="
            text-sm
            font-bold
            uppercase
            tracking-wide
            text-teal-700
          ">
            Maxilar Superior
          </h3>

          <span className="
            text-xs
            text-slate-400
          ">
            18 — 28
          </span>

        </div>

        <div className="
          flex
          justify-center
          gap-[2px]
          flex-wrap
        ">

          {
            superiores.map(
              renderDiente
            )
          }

        </div>

      </div>

      <div className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        shadow-sm
        p-5
      ">

        <div className="
          flex
          items-center
          justify-between
          mb-4
        ">

          <h3 className="
            text-sm
            font-bold
            uppercase
            tracking-wide
            text-teal-700
          ">
            Maxilar Inferior
          </h3>

          <span className="
            text-xs
            text-slate-400
          ">
            48 — 38
          </span>

        </div>

        <div className="
          flex
          justify-center
          gap-[2px]
          flex-wrap
        ">

          {
            inferiores.map(
              renderDiente
            )
          }

        </div>

      </div>

            <div className="
        grid
        grid-cols-1
        xl:grid-cols-[0.9fr_1.1fr]
        gap-4
      ">

        <div className="
          bg-white
          border
          border-slate-200
          rounded-3xl
          shadow-sm
          p-5
        ">

          <div className="
            flex
            items-center
            justify-between
            gap-3
            mb-4
          ">

            <div>

              <h3 className="
                text-lg
                font-bold
                text-slate-800
              ">
                Hallazgos
              </h3>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                Dientes con tratamientos
                u observaciones registradas.
              </p>

            </div>

            <span className="
              bg-slate-100
              text-slate-600
              rounded-full
              px-3
              py-1
              text-xs
              font-semibold
            ">

              {
                dientesConHallazgos.length
              }

            </span>

          </div>

          {
            dientesConHallazgos.length ===
            0

              ? (

                <div className="
                  border
                  border-dashed
                  border-slate-200
                  rounded-2xl
                  p-7
                  text-center
                ">

                  <p className="
                    text-sm
                    font-semibold
                    text-slate-600
                  ">
                    Sin hallazgos
                  </p>

                  <p className="
                    text-xs
                    text-slate-400
                    mt-1
                  ">
                    Selecciona un diente
                    del odontograma para comenzar.
                  </p>

                </div>

              )

              : (

                <div className="
                  grid
                  grid-cols-2
                  sm:grid-cols-3
                  lg:grid-cols-4
                  xl:grid-cols-2
                  gap-2
                ">

                  {
                    dientesConHallazgos.map(
                      (numero) => {

                        const cantidad =
                          obtenerCantidadHallazgos(
                            numero
                          );

                        const seleccionado =
                          dienteSeleccionado ===
                          numero;

                        return (

                          <button

                            key={numero}

                            type="button"

                            onClick={() =>
                              abrirDiente(
                                numero
                              )
                            }

                            className={`
                              text-left
                              border
                              rounded-2xl
                              px-4
                              py-3
                              transition

                              ${
                                seleccionado
                                  ? "border-teal-500 bg-teal-50"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                              }
                            `}

                          >

                            <div className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            ">

                              <span className="
                                text-base
                                font-bold
                                text-slate-800
                              ">
                                {numero}
                              </span>

                              {
                                cantidad > 0 && (

                                  <span className="
                                    bg-teal-100
                                    text-teal-700
                                    rounded-full
                                    px-2
                                    py-0.5
                                    text-[10px]
                                    font-bold
                                  ">

                                    {cantidad}

                                  </span>

                                )
                              }

                            </div>

                            <p className="
                              text-xs
                              text-slate-500
                              mt-1
                              truncate
                            ">

                              {
                                cantidad > 0
                                  ? `${cantidad} hallazgo${
                                      cantidad === 1
                                        ? ""
                                        : "s"
                                    }`
                                  : "Observación clínica"
                              }

                            </p>

                          </button>

                        );

                      }
                    )
                  }

                </div>

              )
          }

        </div>

        <div className="
          bg-white
          border
          border-slate-200
          rounded-3xl
          shadow-sm
          p-5
        ">

          {
            dienteSeleccionado ===
            null

              ? (

                <div className="
                  h-full
                  min-h-[220px]
                  flex
                  items-center
                  justify-center
                  text-center
                ">

                  <div>

                    <div className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-slate-100
                      text-slate-500
                      flex
                      items-center
                      justify-center
                      mx-auto
                      font-bold
                    ">
                      #
                    </div>

                    <p className="
                      text-sm
                      font-semibold
                      text-slate-700
                      mt-3
                    ">
                      Selecciona un diente
                    </p>

                    <p className="
                      text-xs
                      text-slate-400
                      mt-1
                    ">
                      Aquí podrás consultar
                      sus hallazgos registrados.
                    </p>

                  </div>

                </div>

              )

              : (

                <div>

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                    mb-5
                  ">

                    <div>

                      <p className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-teal-600
                      ">
                        Detalle
                      </p>

                      <h3 className="
                        text-xl
                        font-bold
                        text-slate-800
                        mt-1
                      ">
                        Diente {
                          dienteSeleccionado
                        }
                      </h3>

                    </div>

                    <button

                      type="button"

                      onClick={() =>
                        limpiarDiente(
                          dienteSeleccionado
                        )
                      }

                      className="
                        border
                        border-rose-200
                        text-rose-600
                        hover:bg-rose-50
                        px-3
                        py-2
                        rounded-xl
                        text-xs
                        font-semibold
                        transition
                      "

                    >
                      Limpiar diente
                    </button>

                  </div>

                  <div className="
                    space-y-3
                  ">

                    {
                      (
                        [
                          "oclusal",
                          "vestibular",
                          "distal",
                          "mesial",
                        ] as Array<
                          keyof ZonaDiente
                        >
                      ).map(
                        (zona) => {

                          const lista =
                            zonasSeleccionadas[
                              zona
                            ] || [];

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
                                p-3
                              "
                            >

                              <p className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-wide
                                text-slate-500
                                mb-2
                              ">
                                {zona}
                              </p>

                              <div className="
                                flex
                                flex-wrap
                                gap-2
                              ">

                                {
                                  lista.map(
                                    (t) => (

                                      <div

                                        key={
                                          `${dienteSeleccionado}-${zona}-${t}`
                                        }

                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          rounded-full
                                          pl-3
                                          pr-1.5
                                          py-1.5
                                          text-white
                                          text-xs
                                          font-semibold
                                        "

                                        style={{
                                          backgroundColor:
                                            coloresTratamientos[
                                              t
                                            ],
                                        }}

                                      >

                                        <span className="
                                          capitalize
                                        ">
                                          {t}
                                        </span>

                                        <button

                                          type="button"

                                          onClick={() =>
                                            eliminarTratamientoZona(
                                              dienteSeleccionado,
                                              zona,
                                              t
                                            )
                                          }

                                          className="
                                            w-5
                                            h-5
                                            rounded-full
                                            bg-white/20
                                            hover:bg-white/40
                                            flex
                                            items-center
                                            justify-center
                                            font-bold
                                          "

                                        >
                                          ×
                                        </button>

                                      </div>

                                    )
                                  )
                                }

                              </div>

                            </div>

                          );

                        }
                      )
                    }

                    {
                      !tieneTratamientos(
                        zonasSeleccionadas
                      ) && (

                        <div className="
                          bg-slate-50
                          border
                          border-dashed
                          border-slate-200
                          rounded-2xl
                          p-4
                          text-sm
                          text-slate-400
                        ">
                          Este diente no tiene
                          tratamientos registrados.
                        </div>

                      )
                    }

                  </div>

                  <div className="
                    mt-5
                  ">

                    <label className="
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      mb-2
                    ">
                      Observación clínica
                    </label>

                    <textarea

                      value={
                        observacionesDientes[
                          dienteSeleccionado
                        ] || ""
                      }

                      onChange={(e) =>
                        setObservacionesDientes({

                          ...observacionesDientes,

                          [dienteSeleccionado]:
                            e.target.value,

                        })
                      }

                      className="
                        border
                        border-slate-300
                        rounded-2xl
                        p-3
                        w-full
                        min-h-[100px]
                        resize-y
                        text-sm
                        outline-none
                        focus:border-teal-500
                      "

                      placeholder="Agregar observación clínica..."

                    />

                  </div>

                </div>

              )
          }

        </div>

      </div>

      {
        modalAbierto &&
        dienteSeleccionado !==
        null && (

          <div
            className="
              fixed
              inset-0
              z-[100]
              bg-slate-900/40
              backdrop-blur-[2px]
              flex
              items-center
              justify-center
              p-4
            "

            onMouseDown={(e) => {

              if (
                e.target ===
                e.currentTarget
              ) {

                cerrarModal();

              }

            }}
          >

            <div className="
              bg-white
              w-full
              max-w-3xl
              max-h-[90vh]
              overflow-y-auto
              rounded-3xl
              shadow-2xl
              border
              border-slate-200
            ">

              <div className="
                sticky
                top-0
                z-10
                bg-white
                border-b
                border-slate-100
                px-6
                py-5
                flex
                items-start
                justify-between
                gap-4
              ">

                <div>

                  <p className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-teal-600
                  ">
                    Registrar hallazgo
                  </p>

                  <h3 className="
                    text-2xl
                    font-bold
                    text-slate-800
                    mt-1
                  ">
                    Diente {
                      dienteSeleccionado
                    }
                  </h3>

                  <p className="
                    text-sm
                    text-slate-500
                    mt-1
                  ">
                    Selecciona el tratamiento
                    y después la zona.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    cerrarModal
                  }
                  className="
                    w-9
                    h-9
                    rounded-xl
                    bg-slate-100
                    hover:bg-slate-200
                    text-slate-500
                    flex
                    items-center
                    justify-center
                    text-xl
                    font-semibold
                    transition
                  "
                >
                  ×
                </button>

              </div>

              <div className="
                p-6
                space-y-6
              ">

                <div>

                  <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    mb-3
                  ">

                    <div>

                      <p className="
                        text-sm
                        font-bold
                        text-slate-800
                      ">
                        1. Tratamiento
                      </p>

                      <p className="
                        text-xs
                        text-slate-500
                        mt-0.5
                      ">
                        Selecciona el hallazgo
                        que deseas registrar.
                      </p>

                    </div>

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        border
                        border-slate-200
                        bg-slate-50
                        text-slate-700
                      "
                    >

                      <span
                        className="
                          w-2.5
                          h-2.5
                          rounded-full
                        "
                        style={{
                          backgroundColor:
                            coloresTratamientos[
                              tratamiento
                            ],
                        }}
                      />

                      <span className="
                        capitalize
                      ">
                        {tratamiento}
                      </span>

                    </span>

                  </div>

                  <div className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    gap-2
                  ">

                    {
                      Object.keys(
                        coloresTratamientos
                      ).map(
                        (t) => {

                          const activo =
                            tratamiento ===
                            t;

                          return (

                            <button

                              key={t}

                              type="button"

                              onClick={() =>
                                setTratamiento(
                                  t
                                )
                              }

                              className={`
                                flex
                                items-center
                                gap-2
                                text-left
                                border
                                rounded-xl
                                px-3
                                py-2.5
                                text-xs
                                font-semibold
                                transition

                                ${
                                  activo
                                    ? "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }
                              `}

                            >

                              <span
                                className="
                                  w-3
                                  h-3
                                  rounded-full
                                  shrink-0
                                  border
                                  border-black/10
                                "
                                style={{
                                  backgroundColor:
                                    coloresTratamientos[
                                      t
                                    ],
                                }}
                              />

                              <span className="
                                capitalize
                                truncate
                              ">
                                {t}
                              </span>

                            </button>

                          );

                        }
                      )
                    }

                  </div>

                </div>

                <div className="
                  border-t
                  border-slate-100
                  pt-5
                ">

                  <p className="
                    text-sm
                    font-bold
                    text-slate-800
                  ">
                    2. Zona
                  </p>

                  <p className="
                    text-xs
                    text-slate-500
                    mt-0.5
                    mb-3
                  ">
                    Toca una zona para agregar
                    el tratamiento seleccionado.
                  </p>

                  <div className="
                    grid
                    grid-cols-2
                    sm:grid-cols-4
                    gap-2
                  ">

                    {
                      (
                        [
                          "oclusal",
                          "vestibular",
                          "distal",
                          "mesial",
                        ] as Array<
                          keyof ZonaDiente
                        >
                      ).map(
                        (zona) => {

                          const seleccionado =
                            (
                              estadoTemporal[
                                zona
                              ] || []
                            ).includes(
                              tratamiento
                            );

                          return (

                            <button

                              key={zona}

                              type="button"

                              onClick={() =>
                                seleccionarZona(
                                  zona
                                )
                              }

                              className={`
                                rounded-xl
                                border
                                px-4
                                py-3
                                text-sm
                                font-semibold
                                capitalize
                                transition

                                ${
                                  seleccionado
                                    ? "border-teal-500 bg-teal-50 text-teal-700"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50"
                                }
                              `}

                            >
                              {zona}
                            </button>

                          );

                        }
                      )
                    }

                  </div>

                </div>

                <div className="
                  border-t
                  border-slate-100
                  pt-5
                ">

                  <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    mb-3
                  ">

                    <div>

                      <p className="
                        text-sm
                        font-bold
                        text-slate-800
                      ">
                        Hallazgos del diente
                      </p>

                      <p className="
                        text-xs
                        text-slate-500
                        mt-0.5
                      ">
                        Puedes quitar un hallazgo
                        únicamente con ×.
                      </p>

                    </div>

                  </div>

                  <div className="
                    space-y-2
                  ">

                    {
                      (
                        [
                          "oclusal",
                          "vestibular",
                          "distal",
                          "mesial",
                        ] as Array<
                          keyof ZonaDiente
                        >
                      ).map(
                        (zona) => {

                          const lista =
                            estadoTemporal[
                              zona
                            ] || [];

                          if (
                            lista.length === 0
                          ) {

                            return null;

                          }

                          return (

                            <div
                              key={zona}
                              className="
                                bg-slate-50
                                border
                                border-slate-200
                                rounded-2xl
                                p-3
                              "
                            >

                              <p className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-slate-500
                                mb-2
                              ">
                                {zona}
                              </p>

                              <div className="
                                flex
                                flex-wrap
                                gap-2
                              ">

                                {
                                  lista.map(
                                    (t) => (

                                      <div
                                        key={
                                          `${zona}-${t}`
                                        }
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          rounded-full
                                          pl-3
                                          pr-1.5
                                          py-1.5
                                          text-white
                                          text-xs
                                          font-semibold
                                        "
                                        style={{
                                          backgroundColor:
                                            coloresTratamientos[
                                              t
                                            ],
                                        }}
                                      >

                                        <span className="
                                          capitalize
                                        ">
                                          {t}
                                        </span>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            eliminarTemporal(
                                              zona,
                                              t
                                            )
                                          }
                                          className="
                                            w-5
                                            h-5
                                            rounded-full
                                            bg-white/20
                                            hover:bg-white/40
                                            flex
                                            items-center
                                            justify-center
                                            font-bold
                                          "
                                        >
                                          ×
                                        </button>

                                      </div>

                                    )
                                  )
                                }

                              </div>

                            </div>

                          );

                        }
                      )
                    }

                    {
                      !tieneTratamientos(
                        estadoTemporal
                      ) && (

                        <div className="
                          border
                          border-dashed
                          border-slate-200
                          rounded-2xl
                          p-4
                          text-center
                        ">

                          <p className="
                            text-sm
                            text-slate-400
                          ">
                            Todavía no hay hallazgos
                            seleccionados.
                          </p>

                        </div>

                      )
                    }

                  </div>

                </div>

                <div className="
                  border-t
                  border-slate-100
                  pt-5
                ">

                  <label className="
                    block
                    text-sm
                    font-bold
                    text-slate-800
                    mb-2
                  ">
                    Observación clínica
                  </label>

                  <textarea

                    value={
                      observacionTemporal
                    }

                    onChange={(e) =>
                      setObservacionTemporal(
                        e.target.value
                      )
                    }

                    className="
                      border
                      border-slate-300
                      rounded-2xl
                      p-3
                      w-full
                      min-h-[90px]
                      resize-y
                      text-sm
                      outline-none
                      focus:border-teal-500
                    "

                    placeholder="Agregar observación clínica..."

                  />

                </div>

              </div>

              <div className="
                sticky
                bottom-0
                bg-white
                border-t
                border-slate-100
                px-6
                py-4
                flex
                items-center
                justify-end
                gap-3
              ">

                <button

                  type="button"

                  onClick={
                    cerrarModal
                  }

                  className="
                    border
                    border-slate-300
                    text-slate-700
                    hover:bg-slate-50
                    px-5
                    py-2.5
                    rounded-xl
                    text-sm
                    font-semibold
                    transition
                  "

                >
                  Cancelar
                </button>

                <button

                  type="button"

                  onClick={
                    guardarModal
                  }

                  className="
                    bg-teal-600
                    hover:bg-teal-700
                    text-white
                    px-6
                    py-2.5
                    rounded-xl
                    text-sm
                    font-bold
                    transition
                    shadow-sm
                  "

                >
                  Guardar
                </button>

              </div>

            </div>

          </div>

        )
      }

    </div>

  );

}