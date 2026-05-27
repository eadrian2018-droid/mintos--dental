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

export default function Incisor({

  colores = {},

  invertido = false,

  onZonaClick,

}: Props) {

  return (

    <svg

      width="60"

      height="155"

      viewBox="0 0 60 155"

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

          M16 12

          L30 12

          L30 76

          L12 76

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

          M30 12

          L44 12

          L48 76

          L30 76

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

          M12 76

          L30 76

          L26 154

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

          M30 76

          L48 76

          L34 154

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