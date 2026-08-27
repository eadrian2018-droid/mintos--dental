import {

  useEffect,

  useState,

} from "react";

import { supabase } from "../../lib/supabase";

type Perfil = {

  id: string;

  nombre: string;

  usuario:
    string | null;

  rol:
    "admin" |
    "doctor" |
    "recepcionista";

  doctor_id:
    number | null;

  activo: boolean;

};

export default function UsuariosRoles() {

  const [

    perfiles,

    setPerfiles,

  ] = useState<Perfil[]>([]);

  const [

    loading,

    setLoading,

  ] = useState(true);

  useEffect(() => {

    cargarPerfiles();

  }, []);

  async function cargarPerfiles() {

    setLoading(
      true
    );

    const {

      data,

      error,

    } = await supabase

      .from(
        "perfiles"
      )

      .select(
        `
          id,
          nombre,
          usuario,
          rol,
          doctor_id,
          activo
        `
      )

      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (error) {

      console.error(
        "Error cargando usuarios:",
        error
      );

      setLoading(
        false
      );

      return;

    }

    setPerfiles(
      (data ?? []) as Perfil[]
    );

    setLoading(
      false
    );

  }

  function nombreRol(
    rol: Perfil["rol"]
  ) {

    if (
      rol === "admin"
    ) {

      return "Administrador";

    }

    if (
      rol === "doctor"
    ) {

      return "Doctor";

    }

    return "Recepcionista";

  }

  return (

    <div
      className="
        bg-white
        rounded-2xl
        border
        border-slate-200
        overflow-hidden
      "
    >

      <div
        className="
          p-5
          border-b
          border-slate-200
          flex
          items-center
          justify-between
          gap-4
        "
      >

        <div>

          <h2
            className="
              text-lg
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
              mt-1
            "
          >

            Administra las cuentas y permisos de acceso a MintOS.

          </p>

        </div>

        <button
          type="button"
          className="
            bg-teal-600
            hover:bg-teal-700
            text-white
            px-4
            py-2
            rounded-xl
            font-semibold
            text-sm
          "
        >

          + Nuevo usuario

        </button>

      </div>

      {

        loading

          ? (

            <div
              className="
                p-6
                text-sm
                text-slate-500
              "
            >

              Cargando usuarios...

            </div>

          )

          : (

            <div
              className="
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                  text-left
                "
              >

                <thead
                  className="
                    bg-slate-50
                    text-slate-500
                  "
                >

                  <tr>

                    <th className="p-3">
                      Nombre
                    </th>

                    <th className="p-3">
                      Rol
                    </th>

                    <th className="p-3">
                      Estado
                    </th>

                    <th className="p-3">
                      Acciones
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {

                    perfiles.map(
                      (
                        perfil
                      ) => (

                        <tr
                          key={
                            perfil.id
                          }
                          className="
                            border-t
                            border-slate-100
                          "
                        >

                          <td
                            className="
                              p-3
                              font-semibold
                              text-slate-800
                            "
                          >

                            {
                              perfil.nombre
                            }

                          </td>

                          <td className="p-3">

                            {
                              nombreRol(
                                perfil.rol
                              )
                            }

                          </td>

                          <td className="p-3">

                            <span
                              className={`
                                px-2
                                py-1
                                rounded-full
                                text-xs
                                font-semibold

                                ${
                                  perfil.activo

                                    ? "bg-green-100 text-green-700"

                                    : "bg-slate-200 text-slate-600"
                                }
                              `}
                            >

                              {
                                perfil.activo

                                  ? "Activo"

                                  : "Inactivo"
                              }

                            </span>

                          </td>

                          <td className="p-3">

                            <button
                              type="button"
                              className="
                                text-teal-700
                                hover:underline
                                font-semibold
                                text-sm
                              "
                            >

                              Administrar

                            </button>

                          </td>

                        </tr>

                      )
                    )

                  }

                </tbody>

              </table>

            </div>

          )

      }

    </div>

  );

}