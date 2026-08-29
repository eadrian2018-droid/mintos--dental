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

  const colorBase =
    "#fffdf7";

  const borde =
    "#7c8797";

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

        overflow: "visible",

      }}

    >

      {/* SOMBRA */}

      <path

        d="
          M20 17
          C15 19 11 28 10 40
          C9 52 11 65 16 73
          C20 79 24 81 25 87

          C26 99 25 113 27 127
          C29 141 32 150 36 153

          C40 150 43 141 45 127
          C47 113 46 99 47 87

          C48 81 52 79 56 73
          C61 65 63 52 62 40
          C61 28 57 19 52 17

          C47 14 43 8 36 7
          C29 8 25 14 20 17
          Z
        "

        fill="#0f172a"

        opacity="0.06"

        transform="translate(1.5 2)"

      />

      {/* OCLUSAL / MITAD IZQUIERDA DE CORONA */}

      <path

        d="
          M20 17

          C15 19 11 28 10 40
          C9 52 11 65 16 73

          C21 78 27 80 36 80

          L36 7

          C30 8 26 13 23 16
          C22 17 21 17 20 17

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

      {/* VESTIBULAR / MITAD DERECHA DE CORONA */}

      <path

        d="
          M36 7

          C42 8 46 13 49 16
          C50 17 51 17 52 17

          C57 19 61 28 62 40
          C63 52 61 65 56 73

          C51 78 45 80 36 80

          L36 7

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
          M16 73

          C21 78 27 80 36 80

          L36 153

          C32 150 29 141 27 127
          C25 113 26 99 25 87

          C24 81 20 78 16 73

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
          M36 80

          C45 80 51 78 56 73

          C52 78 48 81 47 87
          C46 99 47 113 45 127
          C43 141 40 150 36 153

          L36 80

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
          M16 73
          C22 70 29 69 36 69
          C43 69 50 70 56 73
        "

        fill="none"

        stroke="#cbd5e1"

        strokeWidth="1"

        pointerEvents="none"

      />

      {/* DOS CÚSPIDES */}

      <path

        d="
          M18 28
          C23 20 28 16 36 27
          C44 16 49 20 54 28
        "

        fill="none"

        stroke="#d8dee6"

        strokeWidth="1.4"

        strokeLinecap="round"

        pointerEvents="none"

      />

      {/* SURCO CENTRAL */}

      <path

        d="
          M21 43
          C27 47 31 48 36 48
          C41 48 45 47 51 43
        "

        fill="none"

        stroke="#d1d9e2"

        strokeWidth="1.2"

        strokeLinecap="round"

        pointerEvents="none"

      />

      {/* FOSA CENTRAL */}

      <ellipse

        cx="36"

        cy="47"

        rx="2.2"

        ry="1.5"

        fill="#cbd5e1"

        opacity="0.75"

        pointerEvents="none"

      />

      {/* BRILLO */}

      <path

        d="
          M19 31
          C16 40 16 51 19 59
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