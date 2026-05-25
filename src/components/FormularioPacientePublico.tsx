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

  const [imagen,
    setImagen] =

    useState<File | null>(null);

  const [preview,
    setPreview] =

    useState("");

  const [preguntas,
    setPreguntas] =

    useState<Record<string, string>>({});

  const preguntasLista = [

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

  ];

  async function subirImagen() {

    if (!imagen)
      return "";

    const nombreArchivo =

      `${Date.now()}-${imagen.name}`;

    const {
      error
    } = await supabase

      .storage

      .from("radiografias")

      .upload(

        nombreArchivo,

        imagen

      );

    if (error) {

      console.error(error);

      return "";

    }

    const {
      data
    } = supabase

      .storage

      .from("radiografias")

      .getPublicUrl(
        nombreArchivo
      );

    return data.publicUrl;

  }

  async function enviarFormulario() {

    if (!nombre) {

      alert("Ingrese nombre");

      return;

    }

    setLoading(true);

    const imagenUrl =
      await subirImagen();

    const historial = {

      preguntas,

      observaciones,

      imagenUrl,

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

    setPreguntas({});

    setImagen(null);

    setPreview("");

  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-teal-700 mb-10 text-center">
          Historial Clínico Dental
        </h1>

        {/* DATOS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">

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

        {/* HISTORIAL */}

        <div className="space-y-5 mb-10">

          {preguntasLista.map((pregunta, index) => (

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
                    checked={
                      preguntas[pregunta]
                      === "Sí"
                    }
                    onChange={() =>

                      setPreguntas({

                        ...preguntas,

                        [pregunta]:
                          "Sí",

                      })

                    }
                  />

                  Sí

                </label>

                <label className="flex items-center gap-2">

                  <input
                    type="radio"
                    name={`pregunta-${index}`}
                    checked={
                      preguntas[pregunta]
                      === "No"
                    }
                    onChange={() =>

                      setPreguntas({

                        ...preguntas,

                        [pregunta]:
                          "No",

                      })

                    }
                  />

                  No

                </label>

              </div>

            </div>

          ))}

        </div>

        {/* OBSERVACIONES */}

        <textarea
          placeholder="Observaciones médicas..."
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
            mb-10
          "
        />

        {/* IMAGEN */}

        <div className="mb-10">

          <h2 className="
            text-2xl
            font-bold
            mb-4
          ">
            Radiografía / Foto
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {

              const file =
                e.target.files?.[0];

              if (!file)
                return;

              setImagen(file);

              setPreview(
                URL.createObjectURL(
                  file
                )
              );

            }}
          />

          {preview && (

            <img
              src={preview}
              alt="preview"
              className="
                mt-6
                rounded-2xl
                max-h-96
              "
            />

          )}

        </div>

        {/* CONSENTIMIENTO */}

        <div className="mb-10">

          <label className="
            flex
            items-center
            gap-3
          ">

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

        {/* FIRMA */}

        <input
          type="text"
          placeholder="Firma del paciente"
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
            mb-10
          "
        />

        {/* BOTON */}

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