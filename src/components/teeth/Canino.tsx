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

export default function Canino({

  colores = {},

  invertido = false,

  onZonaClick,

}: Props) {

  return (

    <svg

      width="62"

      height="160"

      viewBox="0 0 62 160"

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

          M30 4

          L30 78

          L12 78

          Q14 38 30 4

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

          M30 4

          Q48 38 50 78

          L30 78

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

          M12 78

          L30 78

          L24 158

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

          M30 78

          L50 78

          L36 158

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