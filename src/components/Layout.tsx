import {

  LayoutDashboard,

  Users,

  Calendar,

  FileText,

  Image,

  Settings,

  LogOut,

} from "lucide-react";

type Props = {

  children: React.ReactNode;

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

        <div className="space-y-3">

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
              text-left
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
              text-left
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
              text-left
            "
          >

            <Calendar />

            Agenda

          </button>

          <button
            className="
              flex
              items-center
              gap-4
              w-full
              p-4
              rounded-2xl
              hover:bg-teal-100
              text-left
            "
          >

            <FileText />

            Tratamientos

          </button>

          <button
            className="
              flex
              items-center
              gap-4
              w-full
              p-4
              rounded-2xl
              hover:bg-teal-100
              text-left
            "
          >

            <Image />

            Radiografías

          </button>

          <button
            className="
              flex
              items-center
              gap-4
              w-full
              p-4
              rounded-2xl
              hover:bg-teal-100
              text-left
            "
          >

            <Settings />

            Configuración

          </button>

        </div>

        <div className="mt-20">

          <button
            className="
              flex
              items-center
              gap-4
              text-red-500
              hover:text-red-700
            "
          >

            <LogOut />

            Cerrar Sesión

          </button>

        </div>

      </div>

      {/* CONTENT */}

      <div className="
        flex-1
        p-10
      ">

        {children}

      </div>

    </div>

  );

}