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

      p-3
      rounded-xl
      font-semibold
      transition

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
      min-h-screen
      bg-gray-100
    ">

      <aside className="
        w-72
        bg-white
        shadow-xl
        p-6
        flex
        flex-col
      ">

        <h1 className="
          text-4xl
          font-bold
          text-teal-600
          mb-10
        ">
          MintOS
        </h1>

        <nav className="
          flex
          flex-col
          gap-4
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
          pt-10
          text-sm
          text-gray-400
        ">
          MintOS Dental System
        </div>

      </aside>

      <main className="
        flex-1
        p-8
      ">

        <Outlet />

      </main>

    </div>

  );

}