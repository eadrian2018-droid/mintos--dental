export default function FormularioPacientePublico() {

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-teal-700 mb-10 text-center">
          Historial Clínico Dental
        </h1>

        {/* DATOS PERSONALES */}

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-6">
            Datos Personales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Nombre completo"
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Teléfono"
              className="border rounded-xl p-3"
            />

            <input
              type="number"
              placeholder="Edad"
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Sexo"
              className="border rounded-xl p-3"
            />

            <input
              type="date"
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Dirección"
              className="border rounded-xl p-3"
            />

          </div>

        </div>

        {/* HISTORIAL MEDICO */}

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-6">
            Historial Médico
          </h2>

          <div className="space-y-5">

            {[
              "¿Es alérgico a algún medicamento?",
              "¿Padece diabetes?",
              "¿Tiene presión alta?",
              "¿Tiene problemas cardíacos?",
              "¿Toma medicamentos actualmente?",
              "¿Ha sido hospitalizado recientemente?",
              "¿Tiene hepatitis?",
              "¿Tiene problemas de sangrado?",
              "¿Está embarazada?",
              "¿Ha tenido cirugías importantes?",
              "¿Fuma?",
              "¿Consume alcohol frecuentemente?"
            ].map((pregunta, index) => (

              <div
                key={index}
                className="
                  border
                  rounded-2xl
                  p-4
                  bg-gray-50
                "
              >

                <p className="font-semibold mb-3">
                  {pregunta}
                </p>

                <div className="flex gap-6">

                  <label className="flex items-center gap-2">

                    <input
                      type="radio"
                      name={`pregunta-${index}`}
                    />

                    Sí

                  </label>

                  <label className="flex items-center gap-2">

                    <input
                      type="radio"
                      name={`pregunta-${index}`}
                    />

                    No

                  </label>

                </div>

              </div>

            ))}

          </div>

          <div className="mt-8">

            <h3 className="text-xl font-bold mb-4">
              Observaciones Médicas
            </h3>

            <textarea
              placeholder="
Alergias, medicamentos, enfermedades,
tratamientos médicos, observaciones...
              "
              className="
                w-full
                border
                rounded-2xl
                p-4
                h-40
              "
            />

          </div>

        </div>

        {/* CONSENTIMIENTO */}

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-4">
            Consentimiento
          </h2>

          <div className="
            border
            rounded-2xl
            p-6
            bg-gray-50
          ">

            <p className="mb-6 text-gray-700 leading-relaxed">

              Confirmo que toda la información proporcionada es correcta y autorizo
              al consultorio dental a realizar tratamientos y procedimientos
              necesarios conforme al diagnóstico profesional.

            </p>

            <label className="flex items-center gap-3">

              <input type="checkbox" />

              Acepto y autorizo el tratamiento dental.

            </label>

          </div>

        </div>

        {/* FIRMA */}

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-4">
            Firma del Paciente
          </h2>

          <input
            type="text"
            placeholder="Escriba su nombre completo"
            className="
              w-full
              border
              rounded-2xl
              p-4
            "
          />

        </div>

        {/* BOTON */}

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
            text-xl
          "
        >
          Enviar Formulario
        </button>

      </div>

    </div>

  );

}