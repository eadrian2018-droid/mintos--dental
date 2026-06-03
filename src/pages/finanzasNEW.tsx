export default function Finanzas() {

  return (

    <div>

      <h1
        className="
          text-4xl
          font-bold
          text-slate-800
          mb-8
        "
      >

        Finanzas

      </h1>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-4
          gap-6
          mb-8
        "
      >

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p className="text-slate-500">
            Ingresos
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            $0

          </h2>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p className="text-slate-500">
            Cobrado
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            $0

          </h2>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p className="text-slate-500">
            Pendiente
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            $0

          </h2>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p className="text-slate-500">
            Tratamientos
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            0

          </h2>

        </div>

      </div>

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            mb-6
          "
        >

          Movimientos

        </h2>

        Próximamente...

      </div>

    </div>

  );

}