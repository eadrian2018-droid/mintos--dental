interface Props {
  color?: string;
  invertido?: boolean;
}

export default function Incisor({
  color = "white",
  invertido = false,
}: Props) {

  return (

    <svg
      width="58"
      height="145"
      viewBox="0 0 58 145"

      style={{
        transform:
          invertido
            ? "rotate(180deg)"
            : "none"
      }}
    >

      <path
        d="
          M16 18
          Q29 0 42 18
          Q44 38 40 72
          Q38 92 34 110
          Q31 128 29 142
          Q27 128 24 110
          Q20 92 18 72
          Q14 38 16 18
          Z
        "

        fill={color}

        stroke="#94a3b8"

        strokeWidth="2.5"
      />

    </svg>

  );
}