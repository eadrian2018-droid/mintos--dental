import UsuariosRoles
  from "../components/configuracion/UsuariosRoles";

export default function Configuracion() {

  return (

    <div
      className="
        space-y-5
      "
    >

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-slate-200
          p-5
        "
      >

        <h1
          className="
            text-2xl
            font-bold
            text-slate-800
          "
        >

          Configuración

        </h1>

        <p
          className="
            text-sm
            text-slate-500
            mt-1
          "
        >

          Administración y configuración general de MintOS.

        </p>

      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-4
        "
      >

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-200
            p-5
          "
        >

          <h2
            className="
              font-bold
              text-slate-800
            "
          >

            Usuarios y Roles

          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            Administra usuarios, roles, doctores y accesos al sistema.

          </p>

        </div>

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-200
            p-5
          "
        >

          <h2
            className="
              font-bold
              text-slate-800
            "
          >

            Seguridad

          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            Configuración de sesiones y seguridad del sistema.

          </p>

        </div>

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-200
            p-5
          "
        >

          <h2
            className="
              font-bold
              text-slate-800
            "
          >

            Bitácora

          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            Historial de accesos y actividad de los usuarios.

          </p>

        </div>

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-200
            p-5
          "
        >

          <h2
            className="
              font-bold
              text-slate-800
            "
          >

            Clínica

          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            Información y preferencias generales del consultorio.

          </p>

        </div>

      </div>

            <UsuariosRoles />

    </div>

  );

}