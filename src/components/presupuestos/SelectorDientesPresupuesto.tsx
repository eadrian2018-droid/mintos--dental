import {
  useRef,
  useState,
} from "react";

import { useLanguage } from "../../context/LanguageContext";

import Incisor from "../teeth/Incisor";
import Canino from "../teeth/Canino";
import Premolar from "../teeth/Premolar";
import Molar from "../teeth/Molar";

type Props = {
  dientesSeleccionados: number[];
  onChange: (dientes: number[]) => void;
  arcada: "superior" | "inferior" | null;
  onArcadaChange: (
    arcada: "superior" | "inferior" | null
  ) => void;
};

export default function SelectorDientesPresupuesto({
  dientesSeleccionados,
  onChange,
  arcada,
  onArcadaChange,
}: Props) {
  const { language } = useLanguage();

  const es = language === "es";

  const arrastreActivoRef =
    useRef(false);

  const arrastreMovidoRef =
    useRef(false);

  const dienteInicioArrastreRef =
    useRef<number | null>(null);

  const [
    dientePresionado,
    setDientePresionado,
  ] = useState<number | null>(null);

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

  function limpiarSeleccion() {
    onChange([]);
    onArcadaChange(null);
    setDientePresionado(null);
  }

  function iniciarSeleccionDiente(
    numero: number,
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (event.button !== 0) {
      return;
    }

    arrastreActivoRef.current = true;
    arrastreMovidoRef.current = false;
    dienteInicioArrastreRef.current =
      numero;

    setDientePresionado(numero);

    /*
      Al iniciar el arrastre partimos
      únicamente del primer diente.

      Si termina siendo solamente un
      click, terminarSeleccionDiente()
      se encargará de alternarlo.
    */
    onChange([numero]);

    onArcadaChange(null);
  }

  function moverSeleccionDiente(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!arrastreActivoRef.current) {
      return;
    }

    const elemento =
      document
        .elementFromPoint(
          event.clientX,
          event.clientY
        )
        ?.closest(
          "[data-presupuesto-diente]"
        ) as HTMLElement | null;

    if (!elemento) {
      return;
    }

    const numero = Number(
      elemento.dataset
        .presupuestoDiente
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

    onChange(
      Array.from(
        new Set([
          ...dientesSeleccionados,
          numero,
        ])
      )
    );

    setDientePresionado(numero);
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

    onChange(
      Array.from(
        new Set([
          ...dientesSeleccionados,
          numero,
        ])
      )
    );

    setDientePresionado(numero);
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
    dienteInicioArrastreRef.current =
      null;

    setDientePresionado(null);

    if (!fueArrastre) {
      /*
        iniciarSeleccionDiente ya dejó
        seleccionado este diente.

        Un click simple debe dejar una
        selección individual.
      */
      onChange([numero]);
      onArcadaChange(null);
    }
  }

  function cancelarSeleccionDiente() {
    arrastreActivoRef.current = false;
    arrastreMovidoRef.current = false;
    dienteInicioArrastreRef.current =
      null;

    setDientePresionado(null);
  }

  function seleccionarArcada(
    tipo:
      | "superior"
      | "inferior"
  ) {
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

    const presionado =
      dientePresionado === numero;

    const invertido =
      superiores.includes(numero);

    const colores = {
      oclusal: "white",
      vestibular: "white",
      distal: "white",
      mesial: "white",
    };

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
        onPointerDown={(event) =>
          iniciarSeleccionDiente(
            numero,
            event
          )
        }
        onPointerMove={
          moverSeleccionDiente
        }
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
                ? "Haz clic en un diente o arrastra sobre varios."
                : "Click a tooth or drag across several teeth."}
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
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
                  arcada === "superior"
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
                  arcada === "inferior"
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
          <h4
            className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              mint-text-brand
            "
          >
            {es
              ? "Maxilar superior"
              : "Upper arch"}
          </h4>

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
          {superiores.map(
            renderDiente
          )}
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
            gap-3
            mb-4
          "
        >
          <h4
            className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              mint-text-brand
            "
          >
            {es
              ? "Maxilar inferior"
              : "Lower arch"}
          </h4>

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
          {inferiores.map(
            renderDiente
          )}
        </div>
      </div>

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
              {arcada
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
    </div>
  );
}