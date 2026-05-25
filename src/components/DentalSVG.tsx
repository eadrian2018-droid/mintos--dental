import { useState } from "react";

export default function DentalSVG() {

  const [seleccionado, setSeleccionado] =
    useState<number | null>(null);

  const dientes = [

    // SUPERIOR

    { numero: 18, x: 70, y: 170 },
    { numero: 17, x: 150, y: 170 },
    { numero: 16, x: 230, y: 170 },
    { numero: 15, x: 310, y: 170 },
    { numero: 14, x: 390, y: 170 },
    { numero: 13, x: 470, y: 170 },
    { numero: 12, x: 550, y: 170 },
    { numero: 11, x: 630, y: 170 },

    { numero: 21, x: 740, y: 170 },
    { numero: 22, x: 820, y: 170 },
    { numero: 23, x: 900, y: 170 },
    { numero: 24, x: 980, y: 170 },
    { numero: 25, x: 1060, y: 170 },
    { numero: 26, x: 1140, y: 170 },
    { numero: 27, x: 1220, y: 170 },
    { numero: 28, x: 1300, y: 170 },

    // INFERIOR

    { numero: 48, x: 70, y: 470 },
    { numero: 47, x: 150, y: 470 },
    { numero: 46, x: 230, y: 470 },
    { numero: 45, x: 310, y: 470 },
    { numero: 44, x: 390, y: 470 },
    { numero: 43, x: 470, y: 470 },
    { numero: 42, x: 550, y: 470 },
    { numero: 41, x: 630, y: 470 },

    { numero: 31, x: 740, y: 470 },
    { numero: 32, x: 820, y: 470 },
    { numero: 33, x: 900, y: 470 },
    { numero: 34, x: 980, y: 470 },
    { numero: 35, x: 1060, y: 470 },
    { numero: 36, x: 1140, y: 470 },
    { numero: 37, x: 1220, y: 470 },
    { numero: 38, x: 1300, y: 470 },

  ];

  return (

    <div className="overflow-x-auto">

      <svg
        width="1400"
        height="700"
        viewBox="0 0 1400 700"
      >

        {/* FONDO */}

        <image
          href="/odontograma-base.png"
          x="0"
          y="0"
          width="1400"
          height="700"
        />

        {/* DIENTES */}

        {dientes.map((diente) => (

          <g
            key={diente.numero}

            onClick={() =>
              setSeleccionado(
                diente.numero
              )
            }

            className="
              cursor-pointer
            "
          >

            <ellipse

              cx={diente.x}
              cy={diente.y}

              rx="34"
              ry="54"

              fill={
                seleccionado ===
                diente.numero

                  ? "rgba(239,68,68,0.45)"

                  : "transparent"
              }

              stroke={
                seleccionado ===
                diente.numero

                  ? "#ef4444"

                  : "transparent"
              }

              strokeWidth="4"

            />

          </g>

        ))}

      </svg>

      <div
        className="
          text-center
          text-2xl
          font-bold
          mt-6
          text-gray-700
        "
      >

        {

          seleccionado

            ? `Diente seleccionado: ${seleccionado}`

            : "Selecciona un diente"

        }

      </div>

    </div>

  );
}