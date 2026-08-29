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

  const colorBase =
    "#fffdf7";

  const borde =
    "#7c8797";

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

        overflow: "visible",

      }}

    >

      {/* SOMBRA */}

      <path

        d="
          M20 20
          C14 22 10 31 9 43
          C8 57 10 70 15 79

          C18 84 22 87 24 91

          C24 101 22 115 21 128
          C20 143 22 156 28 162

          C33 156 36 143 38 128
          C40 118 42 108 46 104

          C50 108 52 118 54 128
          C56 143 59 156 64 162

          C70 156 72 143 71 128
          C70 115 68 101 68 91

          C70 87 74 84 77 79
          C82 70 84 57 83 43
          C82 31 78 22 72 20

          C66 17 61 11 55 11
          C51 11 48 14 46 17
          C44 14 41 11 37 11
          C31 11 26 17 20 20

          Z
        "

        fill="#0f172a"

        opacity="0.06"

        transform="translate(1.5 2)"

      />

      {/* OCLUSAL / MITAD IZQUIERDA DE CORONA */}

      <path

        d="
          M20 20

          C14 22 10 31 9 43
          C8 57 10 70 15 79

          C22 84 31 86 46 86

          L46 17

          C43 13 40 11 37 11
          C31 11 26 17 20 20

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
          M46 17

          C49 13 52 11 55 11
          C61 11 66 17 72 20

          C78 22 82 31 83 43
          C84 57 82 70 77 79

          C70 84 61 86 46 86

          L46 17

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
          M15 79

          C22 84 31 86 46 86

          C42 91 40 99 38 108
          C35 119 33 132 31 143
          C30 151 29 158 28 162

          C22 156 20 143 21 128
          C22 115 24 101 24 91

          C22 87 18 84 15 79

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
          M46 86

          C61 86 70 84 77 79

          C74 84 70 87 68 91
          C68 101 70 115 71 128
          C72 143 70 156 64 162

          C63 158 62 151 61 143
          C59 132 57 119 54 108
          C52 99 50 91 46 86

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
          M15 79
          C24 75 34 74 46 74
          C58 74 68 75 77 79
        "

        fill="none"

        stroke="#cbd5e1"

        strokeWidth="1"

        pointerEvents="none"

      />

      {/* CÚSPIDES OCLUSALES */}

      <path

        d="
          M18 34
          C23 23 30 19 36 29

          C39 23 42 21 46 27

          C50 21 53 23 56 29

          C62 19 69 23 74 34
        "

        fill="none"

        stroke="#d8dee6"

        strokeWidth="1.4"

        strokeLinecap="round"

        strokeLinejoin="round"

        pointerEvents="none"

      />

      {/* SURCO CENTRAL HORIZONTAL */}

      <path

        d="
          M19 48
          C28 53 36 54 46 51
          C56 54 64 53 73 48
        "

        fill="none"

        stroke="#cbd5e1"

        strokeWidth="1.2"

        strokeLinecap="round"

        pointerEvents="none"

      />

      {/* SURCO CENTRAL VERTICAL */}

      <path

        d="
          M46 28
          C44 38 44 49 46 61
        "

        fill="none"

        stroke="#cbd5e1"

        strokeWidth="1.2"

        strokeLinecap="round"

        pointerEvents="none"

      />

      {/* FOSAS */}

      <circle

        cx="35"

        cy="48"

        r="1.8"

        fill="#cbd5e1"

        opacity="0.9"

        pointerEvents="none"

      />

      <circle

        cx="57"

        cy="48"

        r="1.8"

        fill="#cbd5e1"

        opacity="0.9"

        pointerEvents="none"

      />

      {/* BRILLO */}

      <path

        d="
          M19 34
          C16 43 16 55 19 63
        "

        fill="none"

        stroke="white"

        strokeWidth="2.8"

        strokeLinecap="round"

        opacity="0.7"

        pointerEvents="none"

      />

    </svg>

  );

}