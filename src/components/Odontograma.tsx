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
              ? "bg-[var(--mint-primary-soft)] ring-1 ring-[var(--mint-border-primary)]"
              : "hover:bg-[var(--mint-bg-soft)]"
          }
        `}

        style={{
          minWidth: "46px",
          marginLeft: "0px",
          marginRight: "0px",
        }}

      >

        {componente}

        <span
          className="
            text-[9px]
            font-bold
            mt-1
            mint-text-primary
          "
        >

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

    <div
      className="
        space-y-4
      "
    >

      <div
        className="
          mint-card
          p-5
        "
      >

        <div>

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              mint-text-brand
            "
          >
            Expediente Clínico
          </p>

          <h2
            className="
              text-xl
              font-bold
              mint-text-primary
              mt-1
            "
          >
            Odontograma
          </h2>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >
            Selecciona un diente
            para registrar o consultar
            sus hallazgos clínicos.
          </p>

        </div>

      </div>

      <div
        className="
          mint-card
          p-5
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            mb-4
          "
        >

          <h3
            className="
              text-sm
              font-bold
              uppercase
              tracking-wide
              mint-text-brand
            "
          >
            Maxilar Superior
          </h3>

          <span
            className="
              text-xs
              mint-text-muted
            "
          >
            18 — 28
          </span>

        </div>

        <div
          className="
            flex
            justify-center
            gap-[2px]
            flex-wrap
          "
        >

          {
            superiores.map(
              renderDiente
            )
          }

        </div>

      </div>

      <div
        className="
          mint-card
          p-5
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            mb-4
          "
        >

          <h3
            className="
              text-sm
              font-bold
              uppercase
              tracking-wide
              mint-text-brand
            "
          >
            Maxilar Inferior
          </h3>

          <span
            className="
              text-xs
              mint-text-muted
            "
          >
            48 — 38
          </span>

        </div>

        <div
          className="
            flex
            justify-center
            gap-[2px]
            flex-wrap
          "
        >

          {
            inferiores.map(
              renderDiente
            )
          }

        </div>

      </div>

            <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-[0.9fr_1.1fr]
          gap-4
        "
      >

        <div
          className="
            mint-card
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              mb-4
            "
          >

            <div>

              <h3
                className="
                  text-lg
                  font-bold
                  mint-text-primary
                "
              >
                Hallazgos
              </h3>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                Dientes con tratamientos
                u observaciones registradas.
              </p>

            </div>

            <span
              className="
                mint-badge
                mint-badge-muted
              "
            >

              {
                dientesConHallazgos.length
              }

            </span>

          </div>

          {
            dientesConHallazgos.length ===
            0

              ? (

                <div
                  className="
                    mint-empty
                    border
                    border-dashed
                    border-[var(--mint-border)]
                    rounded-2xl
                    p-7
                    text-center
                  "
                >

                  <p
                    className="
                      text-sm
                      font-semibold
                      mint-text-secondary
                    "
                  >
                    Sin hallazgos
                  </p>

                  <p
                    className="
                      text-xs
                      mint-text-muted
                      mt-1
                    "
                  >
                    Selecciona un diente
                    del odontograma para comenzar.
                  </p>

                </div>

              )

              : (

                <div
                  className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-2
                    gap-2
                  "
                >

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
                                  ? "border-[var(--mint-primary)] bg-[var(--mint-primary-soft)]"
                                  : "border-[var(--mint-border)] bg-[var(--mint-bg-card)] hover:bg-[var(--mint-bg-soft)]"
                              }
                            `}

                          >

                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                gap-2
                              "
                            >

                              <span
                                className="
                                  text-base
                                  font-bold
                                  mint-text-primary
                                "
                              >
                                {numero}
                              </span>

                              {
                                cantidad > 0 && (

                                  <span
                                    className="
                                      mint-badge
                                      mint-badge-primary
                                      text-[10px]
                                    "
                                  >

                                    {cantidad}

                                  </span>

                                )
                              }

                            </div>

                            <p
                              className="
                                text-xs
                                mint-text-secondary
                                mt-1
                                truncate
                              "
                            >

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

        <div
          className="
            mint-card
            p-5
          "
        >

          {
            dienteSeleccionado ===
            null

              ? (

                <div
                  className="
                    h-full
                    min-h-[220px]
                    flex
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <div>

                    <div
                      className="
                        w-12
                        h-12
                        rounded-2xl
                        bg-[var(--mint-bg-muted)]
                        mint-text-secondary
                        flex
                        items-center
                        justify-center
                        mx-auto
                        font-bold
                      "
                    >
                      #
                    </div>

                    <p
                      className="
                        text-sm
                        font-semibold
                        mint-text-primary
                        mt-3
                      "
                    >
                      Selecciona un diente
                    </p>

                    <p
                      className="
                        text-xs
                        mint-text-muted
                        mt-1
                      "
                    >
                      Aquí podrás consultar
                      sus hallazgos registrados.
                    </p>

                  </div>

                </div>

              )

              : (

                <div>

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                      mb-5
                    "
                  >

                    <div>

                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          mint-text-brand
                        "
                      >
                        Detalle
                      </p>

                      <h3
                        className="
                          text-xl
                          font-bold
                          mint-text-primary
                          mt-1
                        "
                      >
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
                        mint-btn
                        mint-btn-danger
                        mint-btn-sm
                      "

                    >
                      Limpiar diente
                    </button>

                  </div>

                  <div
                    className="
                      space-y-3
                    "
                  >

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
                                border-[var(--mint-border)]
                                rounded-2xl
                                p-3
                                bg-[var(--mint-bg-card)]
                              "
                            >

                              <p
                                className="
                                  text-xs
                                  font-bold
                                  uppercase
                                  tracking-wide
                                  mint-text-secondary
                                  mb-2
                                "
                              >
                                {zona}
                              </p>

                              <div
                                className="
                                  flex
                                  flex-wrap
                                  gap-2
                                "
                              >

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

                                        <span
                                          className="
                                            capitalize
                                          "
                                        >
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

                        <div
                          className="
                            bg-[var(--mint-bg-soft)]
                            border
                            border-dashed
                            border-[var(--mint-border)]
                            rounded-2xl
                            p-4
                            text-sm
                            mint-text-muted
                          "
                        >
                          Este diente no tiene
                          tratamientos registrados.
                        </div>

                      )
                    }

                  </div>

                  <div
                    className="
                      mt-5
                    "
                  >

                    <label
                      className="
                        mint-label
                        block
                        mb-2
                      "
                    >
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
                        mint-input
                        p-3
                        w-full
                        min-h-[100px]
                        resize-y
                        text-sm
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
              mint-modal-backdrop
              fixed
              inset-0
              z-[100]
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

            <div
              className="
                mint-modal
                w-full
                max-w-3xl
                max-h-[90vh]
                overflow-y-auto
              "
            >

              <div
                className="
                  sticky
                  top-0
                  z-10
                  bg-[var(--mint-bg-card)]
                  border-b
                  border-[var(--mint-border)]
                  px-6
                  py-5
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      mint-text-brand
                    "
                  >
                    Registrar hallazgo
                  </p>

                  <h3
                    className="
                      text-2xl
                      font-bold
                      mint-text-primary
                      mt-1
                    "
                  >
                    Diente {
                      dienteSeleccionado
                    }
                  </h3>

                  <p
                    className="
                      text-sm
                      mint-text-secondary
                      mt-1
                    "
                  >
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
                    mint-btn
                    mint-btn-neutral
                    w-9
                    h-9
                    p-0
                    flex
                    items-center
                    justify-center
                    text-xl
                    font-semibold
                  "
                >
                  ×
                </button>

              </div>

              <div
                className="
                  p-6
                  space-y-6
                "
              >

                <div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      mb-3
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          font-bold
                          mint-text-primary
                        "
                      >
                        1. Tratamiento
                      </p>

                      <p
                        className="
                          text-xs
                          mint-text-secondary
                          mt-0.5
                        "
                      >
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
                        border-[var(--mint-border)]
                        bg-[var(--mint-bg-soft)]
                        mint-text-primary
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

                      <span
                        className="
                          capitalize
                        "
                      >
                        {tratamiento}
                      </span>

                    </span>

                  </div>

                  <div
                    className="
                      grid
                      grid-cols-2
                      sm:grid-cols-3
                      md:grid-cols-4
                      gap-2
                    "
                  >

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
                                    ? "border-[var(--mint-primary)] bg-[var(--mint-primary-soft)] text-[var(--mint-primary)] ring-1 ring-[var(--mint-border-primary)]"
                                    : "border-[var(--mint-border)] bg-[var(--mint-bg-card)] text-[var(--mint-text-secondary)] hover:bg-[var(--mint-bg-soft)]"
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

                              <span
                                className="
                                  capitalize
                                  truncate
                                "
                              >
                                {t}
                              </span>

                            </button>

                          );

                        }
                      )
                    }

                  </div>

                </div>

                <div
                  className="
                    border-t
                    border-[var(--mint-border)]
                    pt-5
                  "
                >

                  <p
                    className="
                      text-sm
                      font-bold
                      mint-text-primary
                    "
                  >
                    2. Zona
                  </p>

                  <p
                    className="
                      text-xs
                      mint-text-secondary
                      mt-0.5
                      mb-3
                    "
                  >
                    Toca una zona para agregar
                    el tratamiento seleccionado.
                  </p>

                  <div
                    className="
                      grid
                      grid-cols-2
                      sm:grid-cols-4
                      gap-2
                    "
                  >

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
                                    ? "border-[var(--mint-primary)] bg-[var(--mint-primary-soft)] text-[var(--mint-primary)]"
                                    : "border-[var(--mint-border)] bg-[var(--mint-bg-card)] text-[var(--mint-text-secondary)] hover:border-[var(--mint-border-primary)] hover:bg-[var(--mint-primary-soft)]"
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

                <div
                  className="
                    border-t
                    border-[var(--mint-border)]
                    pt-5
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      mb-3
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          font-bold
                          mint-text-primary
                        "
                      >
                        Hallazgos del diente
                      </p>

                      <p
                        className="
                          text-xs
                          mint-text-secondary
                          mt-0.5
                        "
                      >
                        Puedes quitar un hallazgo
                        únicamente con ×.
                      </p>

                    </div>

                  </div>

                  <div
                    className="
                      space-y-2
                    "
                  >

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
                                bg-[var(--mint-bg-soft)]
                                border
                                border-[var(--mint-border)]
                                rounded-2xl
                                p-3
                              "
                            >

                              <p
                                className="
                                  text-[10px]
                                  font-bold
                                  uppercase
                                  tracking-wide
                                  mint-text-secondary
                                  mb-2
                                "
                              >
                                {zona}
                              </p>

                              <div
                                className="
                                  flex
                                  flex-wrap
                                  gap-2
                                "
                              >

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

                                        <span
                                          className="
                                            capitalize
                                          "
                                        >
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

                        <div
                          className="
                            mint-empty
                            border
                            border-dashed
                            border-[var(--mint-border)]
                            rounded-2xl
                            p-4
                            text-center
                          "
                        >

                          <p
                            className="
                              text-sm
                              mint-text-muted
                            "
                          >
                            Todavía no hay hallazgos
                            seleccionados.
                          </p>

                        </div>

                      )
                    }

                  </div>

                </div>

                <div
                  className="
                    border-t
                    border-[var(--mint-border)]
                    pt-5
                  "
                >

                  <label
                    className="
                      mint-label
                      block
                      mb-2
                    "
                  >
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
                      mint-input
                      p-3
                      w-full
                      min-h-[90px]
                      resize-y
                      text-sm
                    "

                    placeholder="Agregar observación clínica..."

                  />

                </div>

              </div>

              <div
                className="
                  sticky
                  bottom-0
                  bg-[var(--mint-bg-card)]
                  border-t
                  border-[var(--mint-border)]
                  px-6
                  py-4
                  flex
                  items-center
                  justify-end
                  gap-3
                "
              >

                <button

                  type="button"

                  onClick={
                    cerrarModal
                  }

                  className="
                    mint-btn
                    mint-btn-neutral
                    mint-btn-md
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
                    mint-btn
                    mint-btn-primary
                    mint-btn-md
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