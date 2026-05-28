import { useState } from "react";

import { supabase } from "../lib/supabase";

export default function FormularioPacientePublico() {

  const [nombre, setNombre] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [correo, setCorreo] =
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

  async function enviarFormulario() {

    if (!nombre) {

      alert(
        "Ingrese nombre"
      );

      return;

    }

    if (!consentimiento) {

      alert(
        "Debe aceptar el consentimiento"
      );

      return;

    }

    setLoading(true);

    const historial = {

      preguntas,

      observaciones,

    };

    const {
      error
    } = await supabase

      .from("pacientes")

      .insert([{

        nombre,

        telefono,

        correo,

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

    window.location.reload();

  }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      p-4
    ">

      <div className="
        max-w-5xl
        mx-auto
        bg-white
        rounded-3xl
        shadow-2xl
        p-6
        md:p-10
      ">

        <div className="
          text-center
          mb-10
        ">

          <h1 className="
            text-5xl
            font-bold
            text-teal-600
            mb-3
          ">

            MintOS

          </h1>

          <h2 className="
            text-3xl
            font-bold
            text-gray-800
            mb-4
          ">

            Historial Clínico Dental

          </h2>

          <p className="
            text-gray-500
            max-w-2xl
            mx-auto
          ">

            Complete el siguiente formulario antes de su consulta dental.

          </p>

        </div>

        <div className="
          mb-10
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-6
            text-teal-700
          ">

            Datos Personales

          </h2>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          ">

            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e)=>
                setNombre(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
              "
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e)=>
                setTelefono(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
              "
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e)=>
                setCorreo(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
              "
            />

            <input
              type="number"
              placeholder="Edad"
              value={edad}
              onChange={(e)=>
                setEdad(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
              "
            />

            <input
              type="text"
              placeholder="Sexo"
              value={sexo}
              onChange={(e)=>
                setSexo(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
              "
            />

            <input
              type="text"
              placeholder="Dirección"
              value={direccion}
              onChange={(e)=>
                setDireccion(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
              "
            />

          </div>

        </div>

        <div className="
          mb-10
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-6
            text-teal-700
          ">

            Historial Médico

          </h2>

          <div className="
            space-y-4
          ">

            {

              preguntasLista.map((pregunta, index)=>(

                <div

                  key={index}

                  className="
                    border
                    rounded-2xl
                    p-5
                    bg-gray-50
                  "
                >

                  <p className="
                    font-semibold
                    mb-4
                  ">

                    {pregunta}

                  </p>

                  <div className="
                    flex
                    gap-8
                  ">

                    <label className="
                      flex
                      items-center
                      gap-2
                    ">

                      <input
                        type="radio"
                        name={`pregunta-${index}`}
                        checked={
                          preguntas[pregunta]
                          === "Sí"
                        }
                        onChange={()=>

                          setPreguntas({

                            ...preguntas,

                            [pregunta]:
                              "Sí",

                          })

                        }
                      />

                      Sí

                    </label>

                    <label className="
                      flex
                      items-center
                      gap-2
                    ">

                      <input
                        type="radio"
                        name={`pregunta-${index}`}
                        checked={
                          preguntas[pregunta]
                          === "No"
                        }
                        onChange={()=>

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

              ))

            }

          </div>

        </div>

        <div className="
          mb-10
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-4
            text-teal-700
          ">

            Observaciones Médicas

          </h2>

          <textarea
            placeholder="
Alergias, medicamentos, enfermedades,
tratamientos médicos, observaciones...
            "
            value={observaciones}
            onChange={(e)=>
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

        <div className="
          mb-10
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-4
            text-teal-700
          ">

            Consentimiento

          </h2>

          <label className="
            flex
            items-center
            gap-3
          ">

            <input
              type="checkbox"
              checked={consentimiento}
              onChange={(e)=>
                setConsentimiento(
                  e.target.checked
                )
              }
            />

            Acepto y autorizo el tratamiento dental.

          </label>

        </div>

        <div className="
          mb-10
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-4
            text-teal-700
          ">

            Firma del Paciente

          </h2>

          <input
            type="text"
            placeholder="Escriba su nombre completo"
            value={firma}
            onChange={(e)=>
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
            transition-all
          "
        >

          {

            loading

            ? "Enviando..."

            : "Enviar Formulario"

          }

        </button>

      </div>

    </div>

  );

}