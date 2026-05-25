interface Props {
  color?: string;
  invertido?: boolean;
}

export default function Premolar({
  color = "white",
  invertido = false,
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
            : "none"
      }}
    >

      <path
        d="
          M18 18

          Q36 -2 54 18

          Q56 44 52 76

          Q48 108 42 128

          L36 152

          L30 128

          Q24 108 20 76

          Q16 44 18 18

          Z
        "

        fill={color}

        stroke="#94a3b8"

        strokeWidth="2.5"
      />

    </svg>

  );
}