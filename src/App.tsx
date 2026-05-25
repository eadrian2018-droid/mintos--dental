import { Routes, Route } from "react-router-dom";

import QRCodePaciente from "./components/QRCodePaciente";

function Dashboard() {

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold text-teal-700 mb-10">
          MintOS Dental
        </h1>

        <div className="mb-10">

          <QRCodePaciente />

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-10
        ">

          <h2 className="text-3xl font-bold mb-6">
            Dashboard Administrativo
          </h2>

          <p className="text-gray-600 text-xl">
            Sistema funcionando correctamente.
          </p>

          <div className="mt-10">

            <a
              href="#/formulario"
              className="
                bg-teal-600
                hover:bg-teal-700
                text-white
                px-8
                py-4
                rounded-2xl
                font-bold
                inline-block
              "
            >
              Abrir Formulario Público
            </a>

          </div>

        </div>

      </div>

    </div>

  );

}

function FormularioPacientePublico() {

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="
        max-w-4xl
        mx-auto
        bg-white
        rounded-3xl
        shadow-xl
        p-8
      ">

        <h1 className="
          text-4xl
          font-bold
          text-teal-700
          mb-10
          text-center
        ">
          Historial Clínico Dental
        </h1>

      </div>

    </div>

  );

}

export default function App() {

  return (

    <Routes>

      <Route
        index
        element={<Dashboard />}
      />

      <Route
        path="/formulario"
        element={<FormularioPacientePublico />}
      />

    </Routes>

  );

}