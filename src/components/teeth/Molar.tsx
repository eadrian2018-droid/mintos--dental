interface Props {

  colores?: {

    oclusal?: string;

    vestibular?: string;

    distal?: string;

    mesial?: string;

  };

  invertido?: boolean;

  onZonaClick?: (
    zona: string
  ) => void;

}

export default function Molar({

  colores = {},

  invertido = false,

  onZonaClick,

}: Props) {

  return (

    <svg

      width="92"

      height="165"

      viewBox="0 0 92 165"

      style={{

        transform:

          invertido

            ? "rotate(180deg)"

            : "none",

        cursor: "pointer",

      }}
    >

      {/* OCLUSAL */}

      <path

        d="

          M14 28

          Q18 2 34 12

          L46 82

          L14 82

          Q8 54 14 28

          Z

        "

        fill={
          colores.oclusal ||
          "white"
        }

        stroke="#94a3b8"

        strokeWidth="2"

        onClick={() =>
          onZonaClick?.(
            "oclusal"
          )
        }
      />

      {/* VESTIBULAR */}

      <path

        d="

          M34 12

          Q46 -2 58 12

          Q74 2 78 28

          Q80 54 74 82

          L46 82

          Z

        "

        fill={
          colores.vestibular ||
          "white"
        }

        stroke="#94a3b8"

        strokeWidth="2"

        onClick={() =>
          onZonaClick?.(
            "vestibular"
          )
        }
      />

      {/* DISTAL */}

      <path

        d="

          M14 82

          L46 82

          L32 104

          L18 160

          L14 90

          Z

        "

        fill={
          colores.distal ||
          "white"
        }

        stroke="#94a3b8"

        strokeWidth="2"

        onClick={() =>
          onZonaClick?.(
            "distal"
          )
        }
      />

      {/* MESIAL */}

      <path

        d="

          M46 82

          L74 82

          L64 160

          L50 104

          L46 160

          Z

        "

        fill={
          colores.mesial ||
          "white"
        }

        stroke="#94a3b8"

        strokeWidth="2"

        onClick={() =>
          onZonaClick?.(
            "mesial"
          )
        }
      />

    </svg>

  );

}