import {

  Link,

  Outlet,

  useLocation,

} from "react-router-dom";

export default function Layout() {

  const location =
    useLocation();

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

        </nav>

        <div className="
          mt-auto
          text-[10px]
          text-slate-400
        ">

          MintOS Dental System

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