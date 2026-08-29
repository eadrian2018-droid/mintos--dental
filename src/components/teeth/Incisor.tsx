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

  const colorBase =
    "#fffdf7";

  const borde =
    "#7c8797";

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

        overflow: "visible",

      }}

    >

      {/* SOMBRA SUAVE */}

      <path

        d="
          M18 10
          C13 13 10 22 10 34
          C10 48 12 61 16 70
          C18 75 20 79 21 84
          C22 94 21 109 23 124
          C24 137 26 147 30 151
          C34 147 36 137 37 124
          C39 109 38 94 39 84
          C40 79 42 75 44 70
          C48 61 50 48 50 34
          C50 22 47 13 42 10
          C35 6 25 6 18 10
          Z
        "

        fill="#0f172a"

        opacity="0.06"

        transform="
          translate(1.5 2)
        "

      />

      {/* OCLUSAL - CORONA IZQUIERDA */}

      <path

        d="
          M18 10
          C13 13 10 22 10 34
          C10 48 12 61 16 70
          C19 76 23 79 30 80

          L30 10

          C26 8 21 8 18 10
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

      {/* VESTIBULAR - CORONA DERECHA */}

      <path

        d="
          M30 10

          L30 80

          C37 79 41 76 44 70
          C48 61 50 48 50 34
          C50 22 47 13 42 10
          C39 8 34 8 30 10
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

      {/* DISTAL - RAÍZ IZQUIERDA */}

      <path

        d="
          M16 70

          C19 76 23 79 30 80

          L30 151

          C26 147 24 137 23 124
          C21 109 22 94 21 84
          C20 79 18 75 16 70
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

      {/* MESIAL - RAÍZ DERECHA */}

      <path

        d="
          M30 80

          C37 79 41 76 44 70

          C42 75 40 79 39 84
          C38 94 39 109 37 124
          C36 137 34 147 30 151
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

      {/* CUELLO DEL DIENTE */}

      <path

        d="
          M16 70
          C21 74 25 76 30 76
          C35 76 39 74 44 70
        "

        fill="none"

        stroke="#cbd5e1"

        strokeWidth="1"

        pointerEvents="none"

      />

      {/* BRILLO DEL ESMALTE */}

      <path

        d="
          M18 18
          C15 29 15 43 18 54
        "

        fill="none"

        stroke="white"

        strokeWidth="2.5"

        strokeLinecap="round"

        opacity="0.65"

        pointerEvents="none"

      />

      {/* DETALLE CENTRAL DE CORONA */}

      <path

        d="
          M30 15
          C29 30 29 50 30 68
        "

        fill="none"

        stroke="#e2e8f0"

        strokeWidth="0.8"

        opacity="0.8"

        pointerEvents="none"

      />

    </svg>

  );

}