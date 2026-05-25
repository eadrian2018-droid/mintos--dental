import { useState } from "react";

import { supabase } from "../lib/supabase";

export default function FormularioPacientePublico() {

  const [nombre, setNombre] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [edad, setEdad] =
    useState("");

  const [sexo, setSexo] =
    useState("");

  const [direccion, setDireccion] =
    useState("");

  const [observaciones, setObservaciones] =
    useState("");

  const [firma, setFirma] =
    useState("");

  const [consentimiento,
    setConsentimiento] =

    useState(false);

  const [loading,
    setLoading] =

    useState(false);

  async function enviarFormulario() {

    if (!nombre) {

      alert("Ingrese nombre");

      return;

    }

    setLoading(true);

    const historial = {

      alergias:
        observaciones,

      observaciones,

    };

    const {
      error
    } = await supabase

      .from("pacientes")

      .insert([{

        nombre,

        telefono,

        edad,

        sexo,

        direccion,

        historial_clinico:
          historial,

        consentimiento_firmado:
          consentimiento,

        firma_paciente:
          firma,

      }]);

    setLoading(false);

    if (error) {

      console.error(error);

      alert(
        "Error guardando formulario"
      );

      return;

    }

    alert(
      "Formulario enviado correctamente"
    );

    setNombre("");
    setTelefono("");
    setEdad("");
    setSexo("");
    setDireccion("");
    setObservaciones("");
    setFirma("");
    setConsentimiento(false);

  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-teal-700 mb-10 text-center">
          Historial Clínico Dental
        </h1>

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-6">
            Datos Personales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) =>
                setNombre(
                  e.target.value
                )
              }
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) =>
                setTelefono(
                  e.target.value
                )
              }
              className="border rounded-xl p-3"
            />

            <input
              type="number"
              placeholder="Edad"
              value={edad}
              onChange={(e) =>
                setEdad(
                  e.target.value
                )
              }
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Sexo"
              value={sexo}
              onChange={(e) =>
                setSexo(
                  e.target.value
                )
              }
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Dirección"
              value={direccion}
              onChange={(e) =>
                setDireccion(
                  e.target.value
                )
              }
              className="border rounded-xl p-3"
            />

          </div>

        </div>

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-4">
            Observaciones Médicas
          </h2>

          <textarea
            placeholder="
Alergias, medicamentos, enfermedades,
tratamientos médicos, observaciones...
            "
            value={observaciones}
            onChange={(e) =>
              setObservaciones(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded-2xl
              p-4
              h-40
            "
          />

        </div>

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-4">
            Consentimiento
          </h2>

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={consentimiento}
              onChange={(e) =>
                setConsentimiento(
                  e.target.checked
                )
              }
            />

            Acepto y autorizo el tratamiento dental.

          </label>

        </div>

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-4">
            Firma del Paciente
          </h2>

          <input
            type="text"
            placeholder="Escriba su nombre completo"
            value={firma}
            onChange={(e) =>
              setFirma(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded-2xl
              p-4
            "
          />

        </div>

        <button

          onClick={
            enviarFormulario
          }

          disabled={loading}

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

          {loading
            ? "Enviando..."
            : "Enviar Formulario"}

        </button>

      </div>

    </div>

  );

}