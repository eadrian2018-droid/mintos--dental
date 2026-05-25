interface Props {
  color?: string;
  invertido?: boolean;
}

export default function Molar({
  color = "white",
  invertido = false,
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
            : "none"
      }}
    >

      <path
        d="
          M14 28

          Q18 2 34 12

          Q46 -2 58 12

          Q74 2 78 28

          Q80 54 74 90

          L64 160

          L50 104

          L46 160

          L32 104

          L18 160

          L14 90

          Q8 54 14 28

          Z
        "

        fill={color}

        stroke="#94a3b8"

        strokeWidth="2.5"
      />

    </svg>

  );
}