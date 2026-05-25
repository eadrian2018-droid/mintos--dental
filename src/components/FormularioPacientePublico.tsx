export default function FormularioPacientePublico() {

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-teal-700 mb-10 text-center">
          Historial Clínico Dental
        </h1>

        <div className="space-y-6">

          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full border rounded-xl p-4"
          />

          <input
            type="text"
            placeholder="Teléfono"
            className="w-full border rounded-xl p-4"
          />

          <textarea
            placeholder="Observaciones médicas..."
            className="w-full border rounded-xl p-4 h-40"
          />

          <label className="flex items-center gap-3">

            <input type="checkbox" />

            Confirmo que la información es correcta.

          </label>

          <button
            className="
              bg-teal-600
              hover:bg-teal-700
              text-white
              px-8
              py-4
              rounded-2xl
              font-bold
              w-full
            "
          >
            Enviar Formulario
          </button>

        </div>

      </div>

    </div>

  );

}