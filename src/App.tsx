import { Routes, Route } from "react-router-dom";

function Dashboard() {

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-5xl font-bold text-teal-700">
        Dashboard funcionando
      </h1>

      <a
        href="#/formulario"
        className="
          mt-10
          inline-block
          bg-teal-600
          text-white
          px-8
          py-4
          rounded-2xl
          font-bold
        "
      >
        Abrir Formulario
      </a>

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