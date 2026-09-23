import { useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

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

  const { language } = useLanguage();
  const es = language === "es";

  const tratamientoLabel: Record<string, string> = {
    caries: "Caries",
    resina: es ? "Resina" : "Composite",
    extraccion: es ? "Extracción" : "Extraction",
    corona: es ? "Corona" : "Crown",
    implante: es ? "Implante" : "Implant",
    endodoncia: es ? "Endodoncia" : "Root canal",
    carillas: es ? "Carillas" : "Veneers",
    puente: es ? "Puente" : "Bridge",
    protesis: es ? "Prótesis" : "Prosthesis",
    sellador: es ? "Sellador" : "Sealant",
    limpieza: es ? "Limpieza" : "Cleaning",
    blanqueamiento: es ? "Blanqueamiento" : "Whitening",
    brackets: es ? "Brackets" : "Braces",
    incrustacion: es ? "Incrustación" : "Inlay / Onlay",
    amalgama: es ? "Amalgama" : "Amalgam",
    fractura: es ? "Fractura" : "Fracture",
    movilidad: es ? "Movilidad" : "Mobility",
    ausente: es ? "Ausente" : "Missing",
  };

  const zonaLabel: Record<keyof ZonaDiente, string> = {
    oclusal: es ? "Oclusal" : "Occlusal",
    vestibular: es ? "Vestibular" : "Buccal",
    distal: "Distal",
    mesial: "Mesial",
  };

  const tratamientosFrecuentes = [
    "caries",
    "resina",
    "extraccion",
    "corona",
    "implante",
    "endodoncia",
  ];

  const [mostrarMasTratamientos, setMostrarMasTratamientos] =
    useState(false);

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

  const [
    dientesSeleccionados,
    setDientesSeleccionados,
  ] = useState<number[]>([]);

  const arrastreActivoRef =
    useRef(false);

  const arrastreMovidoRef =
    useRef(false);

  const dienteInicioArrastreRef =
    useRef<number | null>(null);

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
  function iniciarSeleccionDiente(
    numero: number,
    event: React.PointerEvent<HTMLDivElement>
  ) {

    if (event.button !== 0) {
      return;
    }

    arrastreActivoRef.current = true;
    arrastreMovidoRef.current = false;
    dienteInicioArrastreRef.current = numero;

    setDientesSeleccionados([
      numero,
    ]);


  }

  function moverSeleccionDiente(
    event: React.PointerEvent<HTMLDivElement>
  ) {

    if (!arrastreActivoRef.current) {
      return;
    }

    const elemento =
      document.elementFromPoint(
        event.clientX,
        event.clientY
      )?.closest(
        "[data-odontograma-diente]"
      ) as HTMLElement | null;

    if (!elemento) {
      return;
    }

    const numero = Number(
      elemento.dataset.odontogramaDiente
    );

    if (!Number.isFinite(numero)) {
      return;
    }

    if (
      numero !==
      dienteInicioArrastreRef.current
    ) {
      arrastreMovidoRef.current = true;
    }

    setDientesSeleccionados(
      (actuales) =>
        actuales.includes(numero)
          ? actuales
          : [
              ...actuales,
              numero,
            ]
    );

  }

  function entrarSeleccionDiente(
    numero: number
  ) {

    if (!arrastreActivoRef.current) {
      return;
    }

    if (
      numero !==
      dienteInicioArrastreRef.current
    ) {
      arrastreMovidoRef.current = true;
    }

    setDientesSeleccionados(
      (actuales) =>
        actuales.includes(numero)
          ? actuales
          : [
              ...actuales,
              numero,
            ]
    );

    setDienteSeleccionado(numero);

  }

  function terminarSeleccionDiente(
    numero: number,
    _event: React.PointerEvent<HTMLDivElement>
  ) {

    if (!arrastreActivoRef.current) {
      return;
    }

    const fueArrastre =
      arrastreMovidoRef.current;

    arrastreActivoRef.current = false;
    arrastreMovidoRef.current = false;
    dienteInicioArrastreRef.current = null;


    if (!fueArrastre) {
      abrirDiente(numero);
    }

  }

  function cancelarSeleccionDiente() {

    arrastreActivoRef.current = false;
    arrastreMovidoRef.current = false;
    dienteInicioArrastreRef.current = null;

  }


  function seleccionarArcada(
    dientes: number[]
  ) {

    const todosSeleccionados =
      dientes.every(
        (numero) =>
          dientesSeleccionados.includes(
            numero
          )
      );

    setDientesSeleccionados(
      (actuales) =>
        todosSeleccionados
          ? actuales.filter(
              (numero) =>
                !dientes.includes(numero)
            )
          : Array.from(
              new Set([
                ...actuales,
                ...dientes,
              ])
            )
    );

  }

  function limpiarSeleccion() {

    setDientesSeleccionados([]);
    setDienteSeleccionado(null);

  }

  function abrirModalSeleccion() {

    if (
      dientesSeleccionados.length === 0
    ) {
      return;
    }

    setEstadoTemporal({});
    setObservacionTemporal("");
    setTratamiento("caries");
    setMostrarMasTratamientos(false);
    setModalAbierto(true);

  }

  function abrirDiente(
    numero: number
  ) {

    setDientesSeleccionados([
      numero,
    ]);

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

    setMostrarMasTratamientos(false);

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
        es ? "Máximo 4 tratamientos por zona" : "Maximum 4 findings per surface"
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
      dientesSeleccionados.length ===
      0
    ) {

      return;

    }

    const nuevosEstados = {
      ...estadoDientes,
    };

    const nuevasObservaciones = {
      ...observacionesDientes,
    };

    dientesSeleccionados.forEach(
      (numero) => {

        const estadoActual =
          estadoDientes[
            numero
          ] || {};

        const estadoCombinado:
          ZonaDiente = {
            ...estadoActual,
        };

        (
          [
            "oclusal",
            "vestibular",
            "distal",
            "mesial",
          ] as Array<
            keyof ZonaDiente
          >
        ).forEach(
          (zona) => {

            const actuales =
              estadoActual[
                zona
              ] || [];

            const nuevos =
              estadoTemporal[
                zona
              ] || [];

            if (
              nuevos.length >
              0
            ) {

              estadoCombinado[
                zona
              ] = Array.from(
                new Set([
                  ...actuales,
                  ...nuevos,
                ])
              );

            }

          }
        );

        nuevosEstados[
          numero
        ] = estadoCombinado;

        if (
          observacionTemporal.trim()
        ) {

          const observacionActual =
            observacionesDientes[
              numero
            ]?.trim();

          nuevasObservaciones[
            numero
          ] =
            observacionActual
              ? `${observacionActual}\n${observacionTemporal.trim()}`
              : observacionTemporal.trim();

        }

      }
    );

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

    limpiarSeleccion();

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
        () => {},

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
      dientesSeleccionados.includes(
        numero
      );

    return (

      <div

        key={numero}

        data-odontograma-diente={numero}

        onPointerDown={(event) =>
          iniciarSeleccionDiente(
            numero,
            event
          )
        }

        onPointerMove={moverSeleccionDiente}

        onPointerEnter={() =>
          entrarSeleccionDiente(
            numero
          )
        }

        onPointerUp={(event) =>
          terminarSeleccionDiente(
            numero,
            event
          )
        }

        onPointerCancel={
          cancelarSeleccionDiente
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
          touchAction: "none",
          userSelect: "none",
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
            {es ? "Expediente Clínico" : "Clinical Record"}
          </p>

          <h2
            className="
              text-xl
              font-bold
              mint-text-primary
              mt-1
            "
          >
            {es ? "Odontograma" : "Odontogram"}
          </h2>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >
            {es ? "Haz clic en un diente para registrar un hallazgo, o arrastra sobre varios para seleccionarlos juntos." : "Click a tooth to record a finding, or drag across several teeth to select them together."}
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
            {es ? "Maxilar Superior" : "Upper Arch"}
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-xs mint-text-muted">
              18 — 28
            </span>
            <button
              type="button"
              onClick={() =>
                seleccionarArcada(superiores)
              }
              className="mint-btn mint-btn-neutral mint-btn-sm"
            >
              {superiores.every((numero) =>
                dientesSeleccionados.includes(numero)
              )
                ? es ? "Quitar arcada" : "Clear arch"
                : es ? "Seleccionar arcada" : "Select arch"}
            </button>
          </div>

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
            {es ? "Maxilar Inferior" : "Lower Arch"}
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-xs mint-text-muted">
              48 — 38
            </span>
            <button
              type="button"
              onClick={() =>
                seleccionarArcada(inferiores)
              }
              className="mint-btn mint-btn-neutral mint-btn-sm"
            >
              {inferiores.every((numero) =>
                dientesSeleccionados.includes(numero)
              )
                ? es ? "Quitar arcada" : "Clear arch"
                : es ? "Seleccionar arcada" : "Select arch"}
            </button>
          </div>

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

      {
        dientesSeleccionados.length > 0 && (

          <div className="mint-card p-4 border border-[var(--mint-border-primary)] bg-[var(--mint-primary-soft)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

              <div>
                <p className="text-sm font-bold mint-text-primary">
                  {dientesSeleccionados.length} {
                    es
                      ? dientesSeleccionados.length === 1
                        ? "diente seleccionado"
                        : "dientes seleccionados"
                      : dientesSeleccionados.length === 1
                        ? "tooth selected"
                        : "teeth selected"
                  }
                </p>

                <p className="text-xs mint-text-secondary mt-1">
                  {dientesSeleccionados
                    .slice()
                    .sort((a, b) => a - b)
                    .join(", ")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={limpiarSeleccion}
                  className="mint-btn mint-btn-neutral mint-btn-sm"
                >
                  {es ? "Limpiar selección" : "Clear selection"}
                </button>

                <button
                  type="button"
                  onClick={abrirModalSeleccion}
                  className="mint-btn mint-btn-primary mint-btn-sm"
                >
                  {es ? "Registrar hallazgo" : "Record finding"}
                </button>
              </div>

            </div>
          </div>

        )
      }

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
                {es ? "Hallazgos" : "Findings"}
              </h3>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                {es ? "Dientes con tratamientos u observaciones registradas." : "Teeth with recorded findings or clinical notes."}
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
                    {es ? "Sin hallazgos" : "No findings"}
                  </p>

                  <p
                    className="
                      text-xs
                      mint-text-muted
                      mt-1
                    "
                  >
                    {es ? "Selecciona un diente del odontograma para comenzar." : "Select a tooth on the odontogram to begin."}
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
                                  ? es
                                    ? `${cantidad} hallazgo${cantidad === 1 ? "" : "s"}`
                                    : `${cantidad} finding${cantidad === 1 ? "" : "s"}`
                                  : es
                                    ? "Observación clínica"
                                    : "Clinical note"
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
                      {es ? "Aquí podrás consultar sus hallazgos registrados." : "Its recorded findings will appear here."}
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
                        {es ? "Detalle" : "Details"}
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
                      {es ? "Limpiar diente" : "Clear tooth"}
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
                              key={zonaLabel[zona]}
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
                                {zonaLabel[zona]}
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
                                          `${dienteSeleccionado}-${zonaLabel[zona]}-${tratamientoLabel[t] || t}`
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
                                          {tratamientoLabel[t] || t}
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
                          {es ? "Este diente no tiene tratamientos registrados." : "This tooth has no recorded findings."}
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
                      {es ? "Observación clínica" : "Clinical note"}
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

                      placeholder={es ? "Agregar observación clínica..." : "Add a clinical note..."}

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
                    {es ? "Registrar hallazgo" : "Record finding"}
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
                    {dientesSeleccionados.length > 1
                      ? es
                        ? `Se aplicará a: ${dientesSeleccionados.slice().sort((a, b) => a - b).join(", ")}`
                        : `Will apply to: ${dientesSeleccionados.slice().sort((a, b) => a - b).join(", ")}`
                      : es
                        ? "Selecciona el tratamiento y después la zona."
                        : "Select the finding and then the tooth surface."}
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
                        {es ? "1. Hallazgo / Tratamiento" : "1. Finding / Treatment"}
                      </p>

                      <p
                        className="
                          text-xs
                          mint-text-secondary
                          mt-0.5
                        "
                      >
                        {es ? "Selecciona el hallazgo que deseas registrar." : "Select the finding you want to record."}
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
                        {tratamientoLabel[tratamiento] || tratamiento}
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
                      Object.keys(coloresTratamientos)
                        .filter(
                          (t) =>
                            mostrarMasTratamientos ||
                            tratamientosFrecuentes.includes(t)
                        )
                        .map(
                        (t) => {

                          const activo =
                            tratamiento ===
                            t;

                          return (

                            <button

                              key={tratamientoLabel[t] || t}

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
                                {tratamientoLabel[t] || t}
                              </span>

                            </button>

                          );

                        }
                      )
                    }

                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setMostrarMasTratamientos((actual) => !actual)
                      }
                      className="mint-btn mint-btn-neutral mint-btn-sm"
                    >
                      {mostrarMasTratamientos
                        ? es ? "Mostrar frecuentes" : "Show common"
                        : es ? "Más opciones" : "More options"}
                    </button>
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
                    {es ? "2. Zona" : "2. Surface"}
                  </p>

                  <p
                    className="
                      text-xs
                      mint-text-secondary
                      mt-0.5
                      mb-3
                    "
                  >
                    {es ? "Toca una zona para agregar el tratamiento seleccionado." : "Select a surface to add the selected finding."}
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

                              key={zonaLabel[zona]}

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
                              {zonaLabel[zona]}
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
                        {es ? "Hallazgos del diente" : "Tooth findings"}
                      </p>

                      <p
                        className="
                          text-xs
                          mint-text-secondary
                          mt-0.5
                        "
                      >
                        {es ? "Puedes quitar un hallazgo únicamente con ×." : "Remove a finding only by using ×."}
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
                              key={zonaLabel[zona]}
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
                                {zonaLabel[zona]}
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
                                          `${zonaLabel[zona]}-${tratamientoLabel[t] || t}`
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
                                          {tratamientoLabel[t] || t}
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
                            {es ? "Todavía no hay hallazgos seleccionados." : "No findings selected yet."}
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
                    {es ? "Observación clínica" : "Clinical note"}
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

                    placeholder={es ? "Agregar observación clínica..." : "Add a clinical note..."}

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
                  {es ? "Cancelar" : "Cancel"}
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
                  {es ? "Guardar" : "Save"}
                </button>

              </div>

            </div>

          </div>

        )
      }

    </div>

  );

}