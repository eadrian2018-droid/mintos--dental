interface Props {
  color?: string;
  invertido?: boolean;
}

export default function Canino({
  color = "white",
  invertido = false,
}: Props) {

  return (

    <svg
      width="62"
      height="150"
      viewBox="0 0 62 150"

      style={{
        transform:
          invertido
            ? "rotate(180deg)"
            : "none"
      }}
    >

      <path
        d="
          M31 4

          Q48 18 44 58

          Q40 92 36 116

          Q34 132 31 148

          Q28 132 26 116

          Q22 92 18 58

          Q14 18 31 4

          Z
        "

        fill={color}

        stroke="#94a3b8"

        strokeWidth="2.5"
      />

    </svg>

  );
}