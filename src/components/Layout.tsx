import {

  Link,

  Outlet,

  useLocation,

  useNavigate,

} from "react-router-dom";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

export default function Layout() {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {

    perfil,

  } = useAuth();

  function linkClasses(
    path: string
  ) {

    return `

      px-3
      py-2
      rounded-lg
      font-semibold
      transition
      text-sm

      ${

        location.pathname === path

        ? "bg-teal-600 text-white"

        : "hover:bg-gray-100 text-gray-700"

      }

    `;

  }

  function obtenerNombreRol() {

    if (
      perfil?.rol === "admin"
    ) {

      return "Administrador";

    }

    if (
      perfil?.rol === "doctor"
    ) {

      return "Doctor";

    }

    if (
      perfil?.rol === "recepcionista"
    ) {

      return "Recepcionista";

    }

    return "";

  }

  async function cerrarSesion() {

    const {
      error,
    } = await supabase.auth
      .signOut();

    if (error) {

      console.error(
        "Error cerrando sesión:",
        error
      );

      alert(
        "No se pudo cerrar la sesión."
      );

      return;

    }

    navigate(
      "/",
      {
        replace: true,
      }
    );

  }

  return (

    <div className="
      flex
      h-screen
      bg-gray-100
      overflow-hidden
    ">

      <aside

        style={{

          width: "170px",

        }}

        className="
          bg-white
          border-r
          border-slate-200
          p-3
          flex
          flex-col
          flex-shrink-0
        "
      >

        <h1 className="
          text-2xl
          font-bold
          text-teal-600
          mb-6
        ">

          MintOS

        </h1>

        <nav className="
          flex
          flex-col
          gap-2
        ">

          <Link

            to="/dashboard"

            className={

              linkClasses(
                "/dashboard"
              )

            }

          >

            Dashboard

          </Link>

          <Link

            to="/agenda"

            className={

              linkClasses(
                "/agenda"
              )

            }

          >

            Agenda

          </Link>

          <Link

            to="/pacientes"

            className={

              linkClasses(
                "/pacientes"
              )

            }

          >

            Pacientes

          </Link>

          {

            perfil?.rol === "admin"

            &&

            <Link

              to="/finanzas"

              className={

                linkClasses(
                  "/finanzas"
                )

              }

            >

              Finanzas

            </Link>

          }

          {

            perfil?.rol === "admin"

            &&

            <Link

              to="/configuracion"

              className={

                linkClasses(
                  "/configuracion"
                )

              }

            >

              ⚙ Configuración

            </Link>

          }

        </nav>

        <div className="
          mt-auto
          pt-4
          border-t
          border-slate-200
        ">

          <div className="
            px-3
            mb-3
          ">

            <p className="
              text-sm
              font-bold
              text-slate-800
              truncate
            ">

              {
                perfil?.nombre ||
                "Usuario"
              }

            </p>

            <p className="
              text-xs
              text-slate-500
              mt-1
            ">

              {
                obtenerNombreRol()
              }

            </p>

          </div>

          <button

            type="button"

            onClick={
              cerrarSesion
            }

            className="
              w-full
              text-left
              px-3
              py-2
              rounded-lg
              font-semibold
              text-sm
              text-red-600
              hover:bg-red-50
              transition
            "
          >

            Cerrar sesión

          </button>

          <div className="
            mt-3
            px-3
            text-[10px]
            text-slate-400
          ">

            MintOS Dental System

          </div>

        </div>

      </aside>

      <main className="
        flex-1
        overflow-y-auto
        p-3
      ">

        <Outlet />

      </main>

    </div>

  );

}