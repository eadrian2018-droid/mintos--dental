import { Link, Outlet } from "react-router-dom";

export default function Layout() {

  return (

    <div className="
      flex
      min-h-screen
      bg-gray-100
    ">

      <aside className="
        w-64
        bg-white
        shadow-lg
        p-6
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
            to="/agenda"
            className="
              p-3
              rounded-xl
              hover:bg-gray-100
              font-semibold
            "
          >
            Agenda
          </Link>

          <Link
            to="/pacientes"
            className="
              p-3
              rounded-xl
              hover:bg-gray-100
              font-semibold
            "
          >
            Pacientes
          </Link>

        </nav>

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