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

export default function Premolar({

  colores = {},

  invertido = false,

  onZonaClick,

}: Props) {

  return (

    <svg

      width="72"

      height="155"

      viewBox="0 0 72 155"

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

          M18 24

          Q28 0 36 10

          L36 76

          L12 76

          Q10 44 18 24

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

          M36 10

          Q46 0 54 24

          Q62 44 60 76

          L36 76

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

          L36 76

          L28 154

          L16 120

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

          M36 76

          L60 76

          L46 120

          L36 154

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