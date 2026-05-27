export default function Dashboard() {

  return (

    <div>

      <h1 className="
        text-5xl
        font-bold
        text-gray-800
        mb-10
      ">
        Bienvenido a MintOS Dental
      </h1>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
        ">

          <h2 className="
            text-2xl
            font-bold
            text-teal-700
          ">
            Pacientes
          </h2>

          <p className="
            text-5xl
            font-bold
            mt-6
          ">
            0
          </p>

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-600
          ">
            Citas Hoy
          </h2>

          <p className="
            text-5xl
            font-bold
            mt-6
          ">
            0
          </p>

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
        ">

          <h2 className="
            text-2xl
            font-bold
            text-purple-600
          ">
            Tratamientos
          </h2>

          <p className="
            text-5xl
            font-bold
            mt-6
          ">
            0
          </p>

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
        ">

          <h2 className="
            text-2xl
            font-bold
            text-red-500
          ">
            Pendientes
          </h2>

          <p className="
            text-5xl
            font-bold
            mt-6
          ">
            0
          </p>

        </div>

      </div>

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-10
        mt-10
      ">

        <h2 className="
          text-3xl
          font-bold
          mb-6
        ">
          Actividad Reciente
        </h2>

        <div className="space-y-4">

          <div className="
            border
            rounded-2xl
            p-5
          ">
            No hay actividad reciente.
          </div>

        </div>

      </div>

    </div>

  );

}