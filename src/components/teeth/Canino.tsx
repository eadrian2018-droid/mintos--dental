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

  const colorBase =
    "#fffdf7";

  const borde =
    "#7c8797";

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

        overflow: "visible",

      }}

    >

      {/* SOMBRA */}

      <path

        d="
          M31 5
          C27 12 23 17 18 22
          C13 28 11 39 11 51
          C11 62 13 71 17 77
          C20 81 23 83 24 88
          C25 98 24 112 25 126
          C26 142 28 153 31 157
          C35 153 37 142 38 126
          C39 112 38 98 39 88
          C40 83 43 81 46 77
          C50 71 52 62 52 51
          C52 39 49 28 44 22
          C39 17 35 12 31 5
          Z
        "

        fill="#0f172a"

        opacity="0.06"

        transform="translate(1.5 2)"

      />

      {/* OCLUSAL / CORONA IZQUIERDA */}

      <path

        d="
          M31 5
          C27 12 23 17 18 22
          C13 28 11 39 11 51
          C11 62 13 71 17 77
          C20 80 25 82 31 82
          L31 5
          Z
        "

        fill={
          colores.oclusal ||
          colorBase
        }

        stroke={borde}

        strokeWidth="1.6"

        strokeLinejoin="round"

        onClick={() =>
          onZonaClick?.(
            "oclusal"
          )
        }

      />

      {/* VESTIBULAR / CORONA DERECHA */}

      <path

        d="
          M31 5
          C35 12 39 17 44 22
          C49 28 52 39 52 51
          C52 62 50 71 46 77
          C43 80 38 82 31 82
          L31 5
          Z
        "

        fill={
          colores.vestibular ||
          colorBase
        }

        stroke={borde}

        strokeWidth="1.6"

        strokeLinejoin="round"

        onClick={() =>
          onZonaClick?.(
            "vestibular"
          )
        }

      />

      {/* DISTAL / RAÍZ IZQUIERDA */}

      <path

        d="
          M17 77
          C21 81 25 82 31 82

          L31 157

          C28 153 26 142 25 126
          C24 112 25 98 24 88
          C23 83 20 81 17 77
          Z
        "

        fill={
          colores.distal ||
          colorBase
        }

        stroke={borde}

        strokeWidth="1.6"

        strokeLinejoin="round"

        onClick={() =>
          onZonaClick?.(
            "distal"
          )
        }

      />

      {/* MESIAL / RAÍZ DERECHA */}

      <path

        d="
          M31 82
          C37 82 42 81 46 77

          C43 81 40 83 39 88
          C38 98 39 112 38 126
          C37 142 35 153 31 157

          L31 82
          Z
        "

        fill={
          colores.mesial ||
          colorBase
        }

        stroke={borde}

        strokeWidth="1.6"

        strokeLinejoin="round"

        onClick={() =>
          onZonaClick?.(
            "mesial"
          )
        }

      />

      {/* CUELLO */}

      <path

        d="
          M17 77
          C21 74 26 73 31 73
          C36 73 42 74 46 77
        "

        fill="none"

        stroke="#cbd5e1"

        strokeWidth="1"

        pointerEvents="none"

      />

      {/* CRESTA CENTRAL DEL CANINO */}

      <path

        d="
          M31 12
          C29 27 28 45 31 67
        "

        fill="none"

        stroke="#dbe3ea"

        strokeWidth="1.2"

        strokeLinecap="round"

        opacity="0.9"

        pointerEvents="none"

      />

      {/* BRILLO DEL ESMALTE */}

      <path

        d="
          M22 25
          C18 34 17 46 19 57
        "

        fill="none"

        stroke="white"

        strokeWidth="2.5"

        strokeLinecap="round"

        opacity="0.7"

        pointerEvents="none"

      />

    </svg>

  );

}