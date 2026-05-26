import type { ReactNode } from "react";

import {

  LayoutDashboard,

  Users,

  Calendar,

} from "lucide-react";

type Props = {

  children: ReactNode;

  setPagina: (
    pagina: string
  ) => void;

};

export default function Layout({

  children,

  setPagina,

}: Props) {

  return (

    <div className="
      flex
      min-h-screen
      bg-gray-100
    ">

      {/* SIDEBAR */}

      <div className="
        w-72
        bg-white
        shadow-2xl
        p-6
      ">

        <h1 className="
          text-4xl
          font-bold
          text-teal-700
          mb-10
        ">
          MintOS
        </h1>

        <div className="space-y-4">

          <button
            onClick={()=>
              setPagina(
                "dashboard"
              )
            }
            className="
              flex
              items-center
              gap-4
              w-full
              p-4
              rounded-2xl
              hover:bg-teal-100
            "
          >

            <LayoutDashboard />

            Dashboard

          </button>

          <button
            onClick={()=>
              setPagina(
                "pacientes"
              )
            }
            className="
              flex
              items-center
              gap-4
              w-full
              p-4
              rounded-2xl
              hover:bg-teal-100
            "
          >

            <Users />

            Pacientes

          </button>

          <button
            onClick={()=>
              setPagina(
                "agenda"
              )
            }
            className="
              flex
              items-center
              gap-4
              w-full
              p-4
              rounded-2xl
              hover:bg-teal-100
            "
          >

            <Calendar />

            Agenda

          </button>

        </div>

      </div>

      {/* CONTENIDO */}

      <div className="
        flex-1
        p-10
      ">

        {children}

      </div>

    </div>

  );

}