import { useState } from "react";
import { supabase } from "../lib/supabase";

type Pregunta = {
  id: string;
  pregunta: string;
};

const preguntas: Pregunta[] = [

  {
    id: "tratamientoMedico",
    pregunta:
      "¿Está bajo tratamiento médico?"
  },

  {
    id: "medicamentos",
    pregunta:
      "¿Toma medicamentos?"
  },

  {
    id: "alergias",
    pregunta:
      "¿Tiene alergias?"
  },

  {
    id: "embarazo",
    pregunta:
      "¿Está embarazada?"
  },

  {
    id: "enfermedadCardiaca",
    pregunta:
      "¿Tiene enfermedad cardíaca?"
  },

  {
    id: "presion",
    pregunta:
      "¿Problemas de presión?"
  },

  {
    id: "fiebreReumatica",
    pregunta:
      "¿Ha padecido fiebre reumática?"
  },

  {
    id: "enfermedadOperacion",
    pregunta:
      "¿Ha tenido enfermedad u operación grave?"
  },

  {
    id: "desordenSanguineo",
    pregunta:
      "¿Tiene desorden sanguíneo?"
  },

  {
    id: "retroviral",
    pregunta:
      "¿Toma medicamento retroviral?"
  },

  {
    id: "transfusion",
    pregunta:
      "¿Ha recibido transfusión sanguínea?"
  },

  {
    id: "problemasEstomacales",
    pregunta:
      "¿Problemas estomacales, hígado o riñón?"
  },

  {
    id: "diabetico",
    pregunta:
      "¿Es diabético?"
  },

  {
    id: "tiroides",
    pregunta:
      "¿Tiene problemas de tiroides?"
  },

  {
    id: "epilepsia",
    pregunta:
      "¿Padece epilepsia o ataques nerviosos?"
  },

  {
    id: "enfermedadVenerea",
    pregunta:
      "¿Tiene enfermedad venérea?"
  },

  {
    id: "hepatitis",
    pregunta:
      "¿Ha tenido hepatitis?"
  },

  {
    id: "tuberculosis",
    pregunta:
      "¿Tiene o tuvo tuberculosis?"
  },

  {
    id: "fuma",
    pregunta:
      "¿Fuma?"
  },

  {
    id: "alcohol",
    pregunta:
      "¿Consume alcohol?"
  },

  {
    id: "psiquiatrico",
    pregunta:
      "¿Está bajo tratamiento psiquiátrico?"
  },

  {
    id: "perderPeso",
    pregunta:
      "¿Toma medicamento para perder peso?"
  },

  {
    id: "osteoporosisCancer",
    pregunta:
      "¿Ha tenido osteoporosis o cáncer?"
  },

  {
    id: "otraEnfermedad",
    pregunta:
      "¿Tiene otra enfermedad?"
  },

];

export default function FormularioPaciente() {

  const [datos,
    setDatos] = useState({

    nombre: "",
    telefono: "",
    edad: "",
    sexo: "",
    domicilio: "",
    email: "",

    consentimiento: false,

    firmaPaciente: "",

  });

  const [historial,
    setHistorial] = useState(

    preguntas.reduce((acc, p) => {

      acc[p.id] = {

        respuesta: false,

        nota: "",

      };

      return acc;

    }, {} as any)

  );

  function actualizarDato(
    campo: string,
    valor: any
  ) {

    setDatos({

      ...datos,

      [campo]: valor,

    });

  }

  function actualizarRespuesta(
    id: string,
    valor: boolean
  ) {

    setHistorial({

      ...historial,

      [id]: {

        ...historial[id],

        respuesta: valor,

      },

    });

  }

  function actualizarNota(
    id: string,
    valor: string
  ) {

    setHistorial({

      ...historial,

      [id]: {

        ...historial[id],

        nota: valor,

      },

    });

  }

  async function enviarFormulario() {

    if (!datos.nombre) {

      alert(
        "Nombre obligatorio"
      );

      return;
    }

    if (!datos.consentimiento) {

      alert(
        "Debe aceptar consentimiento"
      );

      return;
    }

    const { error } =
      await supabase

        .from("pacientes")

        .insert([{

          nombre:
            datos.nombre,

          telefono:
            datos.telefono,

          edad:
            datos.edad,

          sexo:
            datos.sexo,

          historial_clinico: {

            datos,

            historial,

          },

          consentimiento_firmado:
            true,

          firma_paciente:
            datos.firmaPaciente,

        }]);

    if (error) {

      console.log(error);

      alert(
        "Error guardando formulario"
      );

      return;
    }

    alert(
      "Formulario enviado correctamente"
    );

  }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      p-6
    ">

      <div className="
        max-w-5xl
        mx-auto
        bg-white
        rounded-3xl
        shadow-xl
        p-8
      ">

        <h1 className="
          text-4xl
          font-bold
          text-center
          text-teal-700
          mb-10
        ">

          HISTORIA CLÍNICA

        </h1>

        <div className="
          grid
          md:grid-cols-2
          gap-4
        ">

          <input
            placeholder="Nombre completo"
            className="
              border
              rounded-xl
              p-3
            "
            onChange={(e)=>
              actualizarDato(
                "nombre",
                e.target.value
              )
            }
          />

          <input
            placeholder="Teléfono"
            className="
              border
              rounded-xl
              p-3
            "
            onChange={(e)=>
              actualizarDato(
                "telefono",
                e.target.value
              )
            }
          />

          <input
            placeholder="Edad"
            className="
              border
              rounded-xl
              p-3
            "
            onChange={(e)=>
              actualizarDato(
                "edad",
                e.target.value
              )
            }
          />

          <input
            placeholder="Sexo"
            className="
              border
              rounded-xl
              p-3
            "
            onChange={(e)=>
              actualizarDato(
                "sexo",
                e.target.value
              )
            }
          />

          <input
            placeholder="Domicilio"
            className="
              border
              rounded-xl
              p-3
            "
            onChange={(e)=>
              actualizarDato(
                "domicilio",
                e.target.value
              )
            }
          />

          <input
            placeholder="Email"
            className="
              border
              rounded-xl
              p-3
            "
            onChange={(e)=>
              actualizarDato(
                "email",
                e.target.value
              )
            }
          />

        </div>

        <h2 className="
          text-3xl
          font-bold
          text-teal-700
          mt-12
          mb-8
        ">

          HISTORIAL MÉDICO

        </h2>

        <div className="
          space-y-8
        ">

          {

            preguntas.map((p)=>(

              <div
                key={p.id}
                className="
                  border
                  rounded-2xl
                  p-5
                  bg-gray-50
                "
              >

                <p className="
                  text-lg
                  font-semibold
                  mb-4
                ">

                  {p.pregunta}

                </p>

                <div className="
                  flex
                  gap-4
                ">

                  <button

                    type="button"

                    className={`
                      px-6
                      py-2
                      rounded-xl
                      border
                      ${
                        historial[p.id]
                        .respuesta

                        ?

                        "bg-green-600 text-white"

                        :

                        "bg-white"
                      }
                    `}

                    onClick={()=>
                      actualizarRespuesta(
                        p.id,
                        true
                      )
                    }

                  >

                    Sí

                  </button>

                  <button

                    type="button"

                    className={`
                      px-6
                      py-2
                      rounded-xl
                      border
                      ${
                        !historial[p.id]
                        .respuesta

                        ?

                        "bg-red-600 text-white"

                        :

                        "bg-white"
                      }
                    `}

                    onClick={()=>
                      actualizarRespuesta(
                        p.id,
                        false
                      )
                    }

                  >

                    No

                  </button>

                </div>

                {

                  historial[p.id]
                  .respuesta

                  &&

                  <textarea

                    placeholder="
                      Explique...
                    "

                    className="
                      border
                      rounded-xl
                      p-3
                      w-full
                      mt-4
                      h-24
                    "

                    onChange={(e)=>
                      actualizarNota(
                        p.id,
                        e.target.value
                      )
                    }

                  />

                }

              </div>

            ))

          }

        </div>

        <div className="
          mt-12
          border-t
          pt-8
        ">

          <h2 className="
            text-3xl
            font-bold
            text-teal-700
            mb-6
          ">

            CONSENTIMIENTO

          </h2>

          <p className="
            text-gray-700
            leading-relaxed
          ">

            Declaro que toda la
            información proporcionada
            es correcta y autorizo
            a Mint Family Dental
            realizar procedimientos
            odontológicos necesarios.

          </p>

          <input

            placeholder="
              Nombre completo como firma
            "

            className="
              border
              rounded-xl
              p-4
              w-full
              mt-6
            "

            onChange={(e)=>
              actualizarDato(
                "firmaPaciente",
                e.target.value
              )
            }

          />

          <label className="
            flex
            items-center
            gap-3
            mt-6
          ">

            <input

              type="checkbox"

              onChange={(e)=>
                actualizarDato(
                  "consentimiento",
                  e.target.checked
                )
              }

            />

            Acepto consentimiento

          </label>

        </div>

        <button

          onClick={enviarFormulario}

          className="
            mt-10
            w-full
            bg-teal-600
            hover:bg-teal-700
            text-white
            p-4
            rounded-2xl
            text-xl
            font-bold
          "
        >

          ENVIAR FORMULARIO

        </button>

      </div>

    </div>
  );
}