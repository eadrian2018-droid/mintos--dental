import {
  useRef,
  useState,
} from "react";

import { useLanguage } from "../../context/LanguageContext";

import Incisor from "../teeth/Incisor";
import Canino from "../teeth/Canino";
import Premolar from "../teeth/Premolar";
import Molar from "../teeth/Molar";

import type { ArcadaPresupuesto, CuadrantePresupuesto } from "../../types/Presupuesto";

export type AgrupacionDental = {
  cuadrantes: CuadrantePresupuesto[];
  arcadas: ArcadaPresupuesto[];
  boca_completa: boolean;
};

export type MarcaDental = {
  tratamiento: string;
  tipo: "corona" | "endodoncia" | "implante" | "extraccion" | "resina" | "otro";
  zona?: "oclusal" | "vestibular" | "distal" | "mesial";
};

type Props = {
  soloLectura?: boolean;
  marcasPorDiente?: Record<number, MarcaDental[]>;
  agrupacion?: AgrupacionDental;
  agrupacionesRegistradas?: AgrupacionDental[];
  onAgrupacionChange?: (agrupacion: AgrupacionDental) => void;
  dientesSeleccionados: number[];
  onChange: (dientes: number[]) => void;
  arcada: "superior" | "inferior" | null;
  onArcadaChange: (
    arcada: "superior" | "inferior" | null
  ) => void;
};

export default function SelectorDientesPresupuesto({
  soloLectura = false,
  dientesSeleccionados,
  onChange,
  arcada,
  onArcadaChange,
  agrupacion,
  agrupacionesRegistradas = [],
  marcasPorDiente,
  onAgrupacionChange,
}: Props) {
  const { language } = useLanguage();

  const es = language === "es";

  const gestoRef = useRef<{
    pointerId: number;
    seleccion: Set<number>;
    visitados: Set<number>;
    agregar: boolean;
  } | null>(null);
  const [dientePresionado, setDientePresionado] = useState<number | null>(null);

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

  const grupos = agrupacion ?? { cuadrantes: [], arcadas: [], boca_completa: false };
  const agrupando = Boolean(onAgrupacionChange && agrupacion);
  const cuadrantes = [1, 2, 3, 4] as const;
  const todos = [...superiores, ...inferiores];

  function limpiarGrupos() {
    onAgrupacionChange?.({ cuadrantes: [], arcadas: [], boca_completa: false });
  }

  function seleccionarGrupo(nuevo: AgrupacionDental) {
    const dientes = todos.filter((d) => nuevo.boca_completa ||
      nuevo.cuadrantes.some((q) => Math.floor(d / 10) === q) ||
      nuevo.arcadas.some((a) => (a === "superior" ? superiores : inferiores).includes(d)));
    onChange(dientes);
    onArcadaChange(nuevo.arcadas.length === 1 ? nuevo.arcadas[0] : null);
    onAgrupacionChange?.(nuevo);
  }

  function seleccionarCuadrante(q: CuadrantePresupuesto) {
    seleccionarGrupo({ cuadrantes: grupos.cuadrantes.includes(q)
      ? grupos.cuadrantes.filter((c) => c !== q) : [...grupos.cuadrantes, q],
      arcadas: [], boca_completa: false });
  }

  function limpiarSeleccion() {
    limpiarGrupos();
    onChange([]);
    onArcadaChange(null);
    setDientePresionado(null);
  }

  function iniciarSeleccionDiente(numero: number, event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || gestoRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const seleccion = new Set(dientesSeleccionados);
    const agregar = !seleccion.has(numero);
    gestoRef.current = { pointerId: event.pointerId, seleccion, visitados: new Set(), agregar };
    aplicarDiente(numero);
  }

  function aplicarDiente(numero: number) {
    const gesto = gestoRef.current;
    if (!gesto || gesto.visitados.has(numero)) return;
    gesto.visitados.add(numero);
    if (gesto.agregar) gesto.seleccion.add(numero);
    else gesto.seleccion.delete(numero);
    onChange(Array.from(gesto.seleccion));
    onArcadaChange(null);
    limpiarGrupos();
    setDientePresionado(numero);
  }

  function moverSeleccionDiente(event: React.PointerEvent<HTMLDivElement>) {
    if (gestoRef.current?.pointerId !== event.pointerId) return;
    const elemento = document.elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-presupuesto-diente]");
    const numero = Number(elemento?.dataset.presupuestoDiente);
    if (superiores.includes(numero) || inferiores.includes(numero)) aplicarDiente(numero);
  }

  function cancelarSeleccionDiente(event: React.PointerEvent<HTMLDivElement>) {
    if (gestoRef.current?.pointerId !== event.pointerId) return;
    gestoRef.current = null;
    setDientePresionado(null);
  }

  function seleccionarArcada(
    tipo:
      | "superior"
      | "inferior"
  ) {
    if (agrupando) {
      seleccionarGrupo({ cuadrantes: [], boca_completa: false,
        arcadas: grupos.arcadas.includes(tipo) ? grupos.arcadas.filter((a) => a !== tipo) : [...grupos.arcadas, tipo] });
      return;
    }
    const dientes =
      tipo === "superior"
        ? superiores
        : inferiores;

    if (arcada === tipo) {
      limpiarSeleccion();
      return;
    }

    onChange([...dientes]);
    onArcadaChange(tipo);
  }

  function renderDiente(
    numero: number
  ) {
    const seleccionado =
      dientesSeleccionados.includes(
        numero
      );

    const marcadoPorGrupo = agrupando && (grupos.boca_completa ||
      grupos.cuadrantes.some((q) => Math.floor(numero / 10) === q) ||
      grupos.arcadas.some((a) => (a === "superior" ? superiores : inferiores).includes(numero)));
    const marcadoIndividual = seleccionado && !marcadoPorGrupo;
    const presionado =
      dientePresionado === numero;

    const invertido =
      superiores.includes(numero);

    const marcas = marcasPorDiente?.[numero] ?? [];
    const corona = marcas.some((m) => m.tipo === "corona");
    const endodoncia = marcas.some((m) => m.tipo === "endodoncia");
    const implante = marcas.some((m) => m.tipo === "implante");
    const extraccion = marcas.some((m) => m.tipo === "extraccion");
    // Neutral highlight for proposed treatments without a recorded zone.
    const colorBase = marcas.length > 0 ? "#d1d5db" : "white";
    const colores = {
      oclusal: corona ? "#60a5fa" : colorBase,
      vestibular: corona ? "#60a5fa" : colorBase,
      distal: colorBase,
      mesial: colorBase,
    };
    for (const marca of marcas) {
      if (marca.tipo === "resina" && marca.zona) colores[marca.zona] = "#fbbf24";
    }

    const propsDiente = {
      colores,
      invertido,
      onZonaClick: () => {},
    };

    let componente;

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
    } else if (
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
    } else if (
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
    } else {
      componente = (
        <Molar
          {...propsDiente}
        />
      );
    }

    return (
      <div
        key={numero}
        data-presupuesto-diente={
          numero
        }
        onPointerDown={soloLectura ? undefined : (event) =>
          iniciarSeleccionDiente(
            numero,
            event
          )
        }
        onPointerMove={
          soloLectura ? undefined : moverSeleccionDiente
        }
        onPointerUp={cancelarSeleccionDiente}
        onPointerCancel={cancelarSeleccionDiente}
        onLostPointerCapture={cancelarSeleccionDiente}
        role={soloLectura ? undefined : "button"}
        tabIndex={soloLectura ? undefined : 0}
        aria-pressed={soloLectura ? undefined : seleccionado}
        aria-label={`${es ? "Diente" : "Tooth"} ${numero}${marcas.length ? `: ${marcas.map((m) => m.tratamiento).join(", ")}` : ""}`}
        title={marcas.map((m) => m.tratamiento).join(" · ") || undefined}
        onKeyDown={soloLectura ? undefined : (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onChange(seleccionado ? dientesSeleccionados.filter((d) => d !== numero) : [...dientesSeleccionados, numero]);
          onArcadaChange(null);
          limpiarGrupos();
        }}
        className={`
          flex
          flex-col
          items-center
          transition-all
          duration-200
          ${soloLectura ? "cursor-default" : "cursor-pointer"}
          rounded-xl
          px-1
          py-1

          ${
            marcadoIndividual
              ? `
                  bg-[var(--mint-primary-soft)]
                  ring-1
                  ring-[var(--mint-border-primary)]
                `
              : `
                  hover:bg-[var(--mint-bg-soft)]
                `
          }

          ${
            presionado
              ? "scale-[0.97]"
              : ""
          }
        `}
        style={{
          minWidth: "0",
          marginLeft: "0px",
          marginRight: "0px",
          touchAction: soloLectura ? "auto" : "none",
          userSelect: "none",
        }}
      >
        <div className="pointer-events-none relative mx-auto flex h-[76px] w-full max-w-[49px] items-center justify-center overflow-hidden [&>svg]:block [&>svg]:h-full [&>svg]:w-full">
          {componente}
          {(endodoncia || implante || extraccion) && (
            <svg viewBox="0 0 48 76" preserveAspectRatio="none" className="absolute inset-0" aria-hidden="true">
              {endodoncia && <path d={invertido ? "M24 39 V9" : "M24 37 V67"} stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />}
              {implante && <g transform={invertido ? "translate(0 0)" : "translate(0 40)"} stroke="#7c3aed" strokeWidth="2" fill="none"><rect x="18" y="8" width="12" height="25" rx="3" />{[13, 19, 25].map((y) => <path key={y} d={`M18 ${y} H30`} />)}</g>}
              {extraccion && <path d="M9 15 L39 61 M39 15 L9 61" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />}
            </svg>
          )}
        </div>

        <span
          className="
            text-[13px]
            font-bold
            mt-1
            mint-text-primary
          "
        >
          {numero}
        </span>
        {marcas.length > 0 && (
          <span className="rounded-full bg-[var(--mint-teal)] px-1.5 text-xs font-bold text-white"
            aria-label={`${marcas.length} ${es ? "tratamientos" : "treatments"}`}>
            {marcas.length}
          </span>
        )}
      </div>
    );
  }

  function renderGrupos(a: ArcadaPresupuesto) {
    if (!agrupando && !soloLectura) return null;
    const qs = a === "superior" ? [1, 2] : [4, 3];
    const linea = "h-3 border-x-2 border-b-2 rounded-b-sm";
    const renderLinea = (grupo: AgrupacionDental, activa: boolean, key: string) => {
      const completa = grupo.boca_completa || grupo.arcadas.includes(a);
      if (!completa && !qs.some(q => grupo.cuadrantes.some(c => c === q))) return null;
      const estilo = `${linea} ${activa ? "border-[var(--mint-teal)]" : "border-blue-500"}`;
      return <div key={key} className="grid grid-cols-2 gap-1" aria-hidden="true">
        {completa ? <div className={`${estilo} col-span-2`} /> : qs.map(q =>
          <div key={q} className={grupo.cuadrantes.some(c => c === q) ? estilo : "h-3"} />)}
      </div>;
    };
    return <div className="space-y-1">
      {agrupacionesRegistradas.map((grupo, i) => renderLinea(grupo, false, `registrada-${i}`))}
      {renderLinea(grupos, true, "activa")}
    </div>;
  }

  const dientesOrdenados =
    dientesSeleccionados
      .slice()
      .sort(
        (a, b) => a - b
      );

  return (
    <div
      className="
        space-y-4
      "
    >
      {!soloLectura && (
      <div
        className="
          rounded-2xl
          border
          border-[var(--mint-border)]
          bg-[var(--mint-bg-soft)]
          p-4
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
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
              {es
                ? "Selección dental"
                : "Dental selection"}
            </p>

            <p
              className="
                text-xs
                mint-text-secondary
                mt-1
              "
            >
              {es
                ? "Haz clic para seleccionar o quitar dientes. Arrastra para seleccionar o quitar varios."
                : "Click to select or remove teeth. Drag to select or remove several."}
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {agrupando && <>
              {cuadrantes.map((q) => <button key={q} type="button"
                aria-pressed={grupos.cuadrantes.includes(q)}
                className={`mint-btn mint-btn-sm ${grupos.cuadrantes.includes(q) ? "mint-btn-primary" : "mint-btn-neutral"}`}
                onClick={() => seleccionarCuadrante(q)}>{es ? "Cuadrante" : "Quadrant"} {q}</button>)}
              <button type="button" aria-pressed={grupos.boca_completa}
                className={`mint-btn mint-btn-sm ${grupos.boca_completa ? "mint-btn-primary" : "mint-btn-neutral"}`}
                onClick={() => seleccionarGrupo({ cuadrantes: [], arcadas: [], boca_completa: !grupos.boca_completa })}>
                {es ? "Boca completa" : "Full mouth"}</button>
            </>}
            <button
              type="button"
              onClick={() =>
                seleccionarArcada(
                  "superior"
                )
              }
              className={`
                mint-btn
                mint-btn-sm

                ${
                  (agrupando ? grupos.arcadas.includes("superior") : arcada === "superior")
                    ? "mint-btn-primary"
                    : "mint-btn-neutral"
                }
              `}
            >
              {es
                ? "Arcada superior"
                : "Upper arch"}
            </button>

            <button
              type="button"
              onClick={() =>
                seleccionarArcada(
                  "inferior"
                )
              }
              className={`
                mint-btn
                mint-btn-sm

                ${
                  (agrupando ? grupos.arcadas.includes("inferior") : arcada === "inferior")
                    ? "mint-btn-primary"
                    : "mint-btn-neutral"
                }
              `}
            >
              {es
                ? "Arcada inferior"
                : "Lower arch"}
            </button>

            {dientesSeleccionados.length >
              0 && (
              <button
                type="button"
                onClick={
                  limpiarSeleccion
                }
                className="
                  mint-btn
                  mint-btn-neutral
                  mint-btn-sm
                "
              >
                {es
                  ? "Limpiar"
                  : "Clear"}
              </button>
            )}
          </div>
        </div>
      </div>

      )}
      <div className="mint-card overflow-x-auto p-3 sm:p-4">
        <div className="mx-auto w-full min-w-[880px] max-w-[1060px] space-y-2">
          <h4 className="text-xs font-bold uppercase mint-text-primary">{es ? "Maxilar superior" : "Upper arch"}</h4>
          <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px]">
            {superiores.map(renderDiente)}
          </div>
          {renderGrupos("superior")}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--mint-border-teal)]" />
            <span className="text-xs font-bold uppercase text-[var(--mint-teal)]">{es ? "Línea oclusal" : "Occlusal line"}</span>
            <div className="h-px flex-1 bg-[var(--mint-border-teal)]" />
          </div>
          <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px]">
            {inferiores.map(renderDiente)}
          </div>
          {renderGrupos("inferior")}
          <h4 className="text-xs font-bold uppercase mint-text-primary">{es ? "Maxilar inferior" : "Lower arch"}</h4>
        </div>
      </div>

      {!soloLectura && (
      <div
        className="
          rounded-2xl
          border
          border-[var(--mint-border)]
          bg-[var(--mint-bg-soft)]
          px-4
          py-3
        "
      >
        {dientesOrdenados.length >
        0 ? (
          <div>
            <p
              className="
                text-sm
                font-bold
                mint-text-primary
              "
            >
              {agrupando && grupos.boca_completa ? (es ? "Boca completa" : "Full mouth")
                : agrupando && grupos.cuadrantes.length ? `${es ? "Cuadrantes" : "Quadrants"}: ${grupos.cuadrantes.join(", ")}`
                : agrupando && grupos.arcadas.length === 2 ? (es ? "Ambas arcadas" : "Both arches")
                : arcada
                ? arcada ===
                  "superior"
                  ? es
                    ? "Arcada superior seleccionada"
                    : "Upper arch selected"
                  : es
                    ? "Arcada inferior seleccionada"
                    : "Lower arch selected"
                : es
                  ? `${dientesOrdenados.length} ${
                      dientesOrdenados.length ===
                      1
                        ? "diente seleccionado"
                        : "dientes seleccionados"
                    }`
                  : `${dientesOrdenados.length} ${
                      dientesOrdenados.length ===
                      1
                        ? "tooth selected"
                        : "teeth selected"
                    }`}
            </p>

            <p
              className="
                text-xs
                mint-text-secondary
                mt-1
              "
            >
              {dientesOrdenados.join(
                ", "
              )}
            </p>
          </div>
        ) : (
          <p
            className="
              text-sm
              mint-text-muted
            "
          >
            {es
              ? "Sin dientes seleccionados."
              : "No teeth selected."}
          </p>
        )}
      </div>
      )}
    </div>
  );
}