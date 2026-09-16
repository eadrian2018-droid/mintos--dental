import {
  useRef,
  useState,
} from "react";

import SignatureCanvas from "react-signature-canvas";

import { supabase } from "../lib/supabase";

import { registrarBitacora } from "../lib/registrarBitacora";

const TEXTO_CONSENTIMIENTO = `CONSENTIMIENTO INFORMADO GENERAL PARA ATENCIÓN ODONTOLÓGICA

Declaro que la información médica proporcionada es verdadera y completa según mi conocimiento, y me comprometo a informar cualquier cambio relevante en mi estado de salud o medicamentos.

Autorizo al personal odontológico de la clínica a realizar evaluaciones, estudios diagnósticos y los tratamientos odontológicos que sean previamente explicados y aceptados por mí. Estos pueden incluir, según corresponda, procedimientos preventivos y restaurativos, anestesia local, resinas, coronas y prótesis, tratamientos de conductos, extracciones, cirugía oral, tratamientos periodontales, implantes dentales y otros procedimientos necesarios para mi atención.

Entiendo que los tratamientos odontológicos pueden presentar riesgos, molestias, complicaciones y alternativas, y que los resultados clínicos no pueden garantizarse. Tendré oportunidad de hacer preguntas y recibir información sobre el tratamiento recomendado antes de realizarlo.

Entiendo también que determinados procedimientos, incluyendo cirugías, implantes u otros tratamientos que lo requieran, podrán contar con un consentimiento informado específico adicional.

Confirmo que he leído y comprendido esta información y autorizo voluntariamente mi atención odontológica.`;

type Pregunta = {
  id: string;
  texto: string;
  detalle?: string;
};

const preguntasMedicas: Pregunta[] = [
  {
    id: "tratamiento_medico",
    texto: "¿Está actualmente bajo tratamiento médico o tomando medicamentos?",
    detalle: "Indique el motivo, desde cuándo y qué medicamentos toma.",
  },
  {
    id: "alergias",
    texto: "¿Tiene alergia a penicilina, antibióticos, anestésicos u otros medicamentos?",
    detalle: "Indique a qué medicamento o sustancia y, si lo conoce, qué reacción presenta.",
  },
  {
    id: "embarazo",
    texto: "¿Está embarazada o cree que podría estarlo?",
    detalle: "Indique semanas o meses de embarazo, si corresponde.",
  },
  {
    id: "cardiaca_presion",
    texto: "¿Tiene enfermedad cardíaca o problemas de presión arterial?",
    detalle: "Explique la condición e indique si su presión suele ser alta o baja.",
  },
  {
    id: "fiebre_reumatica",
    texto: "¿Ha padecido fiebre reumática?",
  },
  {
    id: "enfermedad_cirugia",
    texto: "¿Ha tenido alguna enfermedad grave, hospitalización u operación importante?",
    detalle: "Explique brevemente.",
  },
  {
    id: "sangrado",
    texto: "¿Padece algún trastorno sanguíneo, anemia o problema de coagulación?",
    detalle: "Explique brevemente.",
  },
  {
    id: "retroviral_bifosfonato",
    texto: "¿Toma o ha tomado medicamentos antirretrovirales o bifosfonatos?",
    detalle: "Indique cuál y durante cuánto tiempo.",
  },
  {
    id: "transfusion",
    texto: "¿Ha recibido alguna transfusión sanguínea?",
    detalle: "Indique aproximadamente cuándo.",
  },
  {
    id: "estomago_higado_rinon",
    texto: "¿Tiene problemas de estómago, hígado o riñón?",
    detalle: "Explique brevemente.",
  },
  {
    id: "diabetes",
    texto: "¿Padece diabetes?",
    detalle: "Indique si está bajo tratamiento y cuál.",
  },
  {
    id: "tiroides",
    texto: "¿Tiene problemas de tiroides?",
    detalle: "Explique brevemente.",
  },
  {
    id: "mareos_asma",
    texto: "¿Padece mareos frecuentes, desmayos o asma?",
    detalle: "Explique cuál de ellos y cualquier tratamiento actual.",
  },
  {
    id: "epilepsia",
    texto: "¿Padece epilepsia, convulsiones o ataques nerviosos?",
    detalle: "Explique brevemente.",
  },
  {
    id: "hepatitis_tuberculosis_its",
    texto: "¿Ha tenido hepatitis, tuberculosis o alguna infección de transmisión sexual relevante para su atención médica?",
    detalle: "Indique cuál y cualquier información médica relevante.",
  },
  {
    id: "tabaco_drogas",
    texto: "¿Fuma, mastica tabaco o consume alguna droga?",
    detalle: "Indique qué consume y con qué frecuencia.",
  },
  {
    id: "alcohol",
    texto: "¿Consume bebidas alcohólicas frecuentemente?",
    detalle: "Indique con qué frecuencia.",
  },
  {
    id: "tratamiento_psiquiatrico",
    texto: "¿Está o ha estado bajo tratamiento psiquiátrico?",
    detalle: "Indique información relevante para su atención odontológica.",
  },
  {
    id: "perdida_peso",
    texto: "¿Está tomando medicamentos para perder peso?",
    detalle: "Indique cuál.",
  },
  {
    id: "osteoporosis_cancer",
    texto: "¿Está o ha estado bajo tratamiento por osteoporosis o cáncer?",
    detalle: "Indique diagnóstico y tratamiento, si corresponde.",
  },
  {
    id: "otra_condicion",
    texto: "¿Tiene alguna enfermedad, condición o problema de salud no mencionado anteriormente?",
    detalle: "Explique brevemente.",
  },
];

const preguntasHabitos: Pregunta[] = [
  {
    id: "morder_unas_objetos",
    texto: "¿Se muerde las uñas u otros objetos?",
  },
  {
    id: "apretamiento",
    texto: "¿Aprieta o rechina los dientes?",
  },
  {
    id: "respiracion_bucal",
    texto: "¿Respira habitualmente por la boca?",
  },
  {
    id: "aftas_herpes",
    texto: "¿Presenta aftas o herpes con frecuencia?",
  },
  {
    id: "ruidos_atm",
    texto: "¿Presenta ruidos, dolor o molestias al abrir o cerrar la boca?",
    detalle: "Explique brevemente.",
  },
];

export default function FormularioPacientePublico() {

  const firmaRef =
    useRef<SignatureCanvas | null>(
      null
    );

  const [nombre, setNombre] =
    useState("");

  const [
    fechaNacimiento,
    setFechaNacimiento,
  ] = useState("");

  const [edad, setEdad] =
    useState("");

  const [sexo, setSexo] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [correo, setCorreo] =
    useState("");

  const [direccion, setDireccion] =
    useState("");

  const [
    estadoCivil,
    setEstadoCivil,
  ] = useState("");

  const [ocupacion, setOcupacion] =
    useState("");

  const [
    recomendacion,
    setRecomendacion,
  ] = useState("");

  const [
    motivoConsulta,
    setMotivoConsulta,
  ] = useState("");

  const [
    antecedentesHeredofamiliares,
    setAntecedentesHeredofamiliares,
  ] = useState("");

  const [
    observaciones,
    setObservaciones,
  ] = useState("");

  const [
    respuestas,
    setRespuestas,
  ] = useState<Record<string, string>>({});

  const [
    detalles,
    setDetalles,
  ] = useState<Record<string, string>>({});

  const [
    consentimiento,
    setConsentimiento,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  function responder(
    id: string,
    valor: "Sí" | "No"
  ) {

    setRespuestas((actual) => ({
      ...actual,
      [id]: valor,
    }));

    if (valor === "No") {

      setDetalles((actual) => ({
        ...actual,
        [id]: "",
      }));

    }

  }

  function actualizarDetalle(
    id: string,
    valor: string
  ) {

    setDetalles((actual) => ({
      ...actual,
      [id]: valor,
    }));

  }

  function limpiarFormulario() {

    setNombre("");
    setFechaNacimiento("");
    setEdad("");
    setSexo("");
    setTelefono("");
    setCorreo("");
    setDireccion("");
    setEstadoCivil("");
    setOcupacion("");
    setRecomendacion("");
    setMotivoConsulta("");
    setAntecedentesHeredofamiliares("");
    setObservaciones("");
    setRespuestas({});
    setDetalles({});
    setConsentimiento(false);

    firmaRef.current?.clear();

  }

  async function enviarFormulario() {

    if (!nombre.trim()) {

      alert(
        "Ingrese el nombre completo del paciente"
      );

      return;
    }

    if (!consentimiento) {

      alert(
        "Debe leer y aceptar el consentimiento informado"
      );

      return;
    }

    if (
      !firmaRef.current ||
      firmaRef.current.isEmpty()
    ) {

      alert(
        "La firma del paciente es obligatoria"
      );

      return;
    }

    const firmaBase64 =
      firmaRef.current.toDataURL();

    const historialDeclarado = {

      version_formulario: 1,

      datos_generales: {
        estado_civil:
          estadoCivil.trim() || null,
        ocupacion:
          ocupacion.trim() || null,
        recomendacion:
          recomendacion.trim() || null,
        motivo_consulta:
          motivoConsulta.trim() || null,
        antecedentes_heredofamiliares:
          antecedentesHeredofamiliares.trim()
          || null,
      },

      antecedentes_medicos:
        preguntasMedicas.map(
          (pregunta) => ({
            id: pregunta.id,
            pregunta: pregunta.texto,
            respuesta:
              respuestas[pregunta.id]
              || null,
            detalle:
              detalles[pregunta.id]
                ?.trim()
              || null,
          })
        ),

      habitos_salud_oral:
        preguntasHabitos.map(
          (pregunta) => ({
            id: pregunta.id,
            pregunta: pregunta.texto,
            respuesta:
              respuestas[pregunta.id]
              || null,
            detalle:
              detalles[pregunta.id]
                ?.trim()
              || null,
          })
        ),

      observaciones:
        observaciones.trim() || null,

    };

    setLoading(true);

    try {

      const {
        data: pacienteId,
        error,
      } = await supabase.rpc(
        "registrar_paciente_inicial",
        {
          p_nombre:
            nombre.trim(),

          p_telefono:
            telefono.trim(),

          p_correo:
            correo.trim(),

          p_edad:
            edad.trim(),

          p_sexo:
            sexo.trim(),

          p_direccion:
            direccion.trim(),

          p_fecha_nacimiento:
            fechaNacimiento || null,

          p_historial_declarado:
            historialDeclarado,

          p_consentimiento_firmado:
            consentimiento,

          p_firma_paciente:
            firmaBase64,

          p_texto_consentimiento:
            TEXTO_CONSENTIMIENTO,
        }
      );

      if (error) {

        console.error(
          "Error registrando paciente:",
          error
        );

        alert(
          "No se pudo registrar el paciente. Verifique la información e intente nuevamente."
        );

        return;
      }

      const {
        data: {
          user,
        },
      } = await supabase.auth
        .getUser();

      if (user?.id) {

        await registrarBitacora({
          accion:
            "Registrar paciente",
          modulo:
            "Pacientes",
          detalle:
            `Paciente ID: ${pacienteId} | Paciente: ${nombre.trim()}`,
        });

      }

      alert(
        "Formulario enviado correctamente"
      );

      limpiarFormulario();

    } catch (error) {

      console.error(
        "Error inesperado guardando formulario:",
        error
      );

      alert(
        "Error guardando formulario"
      );

    } finally {

      setLoading(false);

    }

  }

  function renderPreguntas(
    preguntas: Pregunta[]
  ) {

    return preguntas.map(
      (pregunta, index) => {

        const respuesta =
          respuestas[pregunta.id];

        return (

          <div
            key={pregunta.id}
            className="
              border
              border-slate-200
              rounded-2xl
              p-5
              bg-slate-50
            "
          >

            <div className="
              flex
              gap-3
              items-start
            ">

              <span className="
                shrink-0
                w-7
                h-7
                rounded-full
                bg-teal-100
                text-teal-700
                text-sm
                font-bold
                flex
                items-center
                justify-center
              ">
                {index + 1}
              </span>

              <p className="
                font-semibold
                text-slate-800
                pt-0.5
              ">
                {pregunta.texto}
              </p>

            </div>

            <div className="
              flex
              gap-3
              mt-4
              ml-10
            ">

              {["Sí", "No"].map(
                (opcion) => (

                  <button
                    key={opcion}
                    type="button"
                    onClick={() =>
                      responder(
                        pregunta.id,
                        opcion as "Sí" | "No"
                      )
                    }
                    className={`
                      px-5
                      py-2
                      rounded-xl
                      border
                      font-semibold
                      transition
                      ${
                        respuesta === opcion
                          ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                          : "bg-white border-slate-300 text-slate-700 hover:border-teal-400"
                      }
                    `}
                  >
                    {opcion}
                  </button>

                )
              )}

            </div>

            {
              respuesta === "Sí" &&
              pregunta.detalle && (

                <textarea
                  value={
                    detalles[pregunta.id]
                    || ""
                  }
                  onChange={(e) =>
                    actualizarDetalle(
                      pregunta.id,
                      e.target.value
                    )
                  }
                  placeholder={
                    pregunta.detalle
                  }
                  className="
                    mt-4
                    ml-10
                    w-[calc(100%-2.5rem)]
                    min-h-24
                    border
                    border-slate-300
                    rounded-xl
                    p-3
                    bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-teal-500/20
                    focus:border-teal-500
                  "
                />

              )
            }

          </div>

        );

      }
    );

  }

  return (

    <div className="
      min-h-screen
      bg-slate-100
      p-4
      md:p-8
    ">

      <div className="
        max-w-5xl
        mx-auto
        bg-white
        rounded-3xl
        shadow-xl
        border
        border-slate-200
        overflow-hidden
      ">

        <header className="
          px-6
          md:px-10
          py-8
          bg-slate-900
          text-white
        ">

          <p className="
            text-sm
            uppercase
            tracking-[0.18em]
            text-teal-300
            font-bold
            mb-2
          ">
            Registro de Nuevo Paciente
          </p>

          <h1 className="
            text-3xl
            md:text-4xl
            font-bold
          ">
            Historial Clínico Dental
          </h1>

          <p className="
            text-slate-300
            mt-3
            max-w-2xl
          ">
            Complete la información con la mayor
            precisión posible. Estos datos ayudan
            al equipo dental a brindarle una
            atención segura y adecuada.
          </p>

        </header>

        <div className="
          p-6
          md:p-10
          space-y-10
        ">

          <section>

            <div className="mb-5">

              <h2 className="
                text-2xl
                font-bold
                text-slate-900
              ">
                Información del paciente
              </h2>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                Datos generales y motivo de consulta.
              </p>

            </div>

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            ">

              <input
                type="text"
                placeholder="Nombre completo *"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
              />

              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) =>
                  setFechaNacimiento(
                    e.target.value
                  )
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
                aria-label="Fecha de nacimiento"
              />

              <input
                type="number"
                placeholder="Edad"
                value={edad}
                onChange={(e) =>
                  setEdad(e.target.value)
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
              />

              <select
                value={sexo}
                onChange={(e) =>
                  setSexo(e.target.value)
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                  bg-white
                "
              >
                <option value="">
                  Sexo
                </option>
                <option value="Femenino">
                  Femenino
                </option>
                <option value="Masculino">
                  Masculino
                </option>
                <option value="Otro">
                  Otro
                </option>
                <option value="Prefiero no responder">
                  Prefiero no responder
                </option>
              </select>

              <input
                type="text"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) =>
                  setTelefono(e.target.value)
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
              />

              <input
                type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) =>
                  setCorreo(e.target.value)
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
              />

              <input
                type="text"
                placeholder="Domicilio"
                value={direccion}
                onChange={(e) =>
                  setDireccion(e.target.value)
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                  md:col-span-2
                "
              />

              <input
                type="text"
                placeholder="Estado civil"
                value={estadoCivil}
                onChange={(e) =>
                  setEstadoCivil(
                    e.target.value
                  )
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
              />

              <input
                type="text"
                placeholder="Ocupación"
                value={ocupacion}
                onChange={(e) =>
                  setOcupacion(
                    e.target.value
                  )
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
              />

              <select
                value={recomendacion}
                onChange={(e) =>
                  setRecomendacion(
                    e.target.value
                  )
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                  bg-white
                "
              >
                <option value="">
                  ¿Cómo conoció la clínica?
                </option>
                <option value="Recomendación">
                  Recomendación
                </option>
                <option value="Facebook">
                  Facebook
                </option>
                <option value="Google">
                  Google
                </option>
                <option value="Instagram">
                  Instagram
                </option>
                <option value="Otro">
                  Otro
                </option>
              </select>

              <input
                type="text"
                placeholder="Motivo de consulta"
                value={motivoConsulta}
                onChange={(e) =>
                  setMotivoConsulta(
                    e.target.value
                  )
                }
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
              />

              <textarea
                placeholder="Antecedentes heredofamiliares"
                value={
                  antecedentesHeredofamiliares
                }
                onChange={(e) =>
                  setAntecedentesHeredofamiliares(
                    e.target.value
                  )
                }
                className="
                  md:col-span-2
                  min-h-24
                  border
                  border-slate-300
                  rounded-xl
                  p-4
                "
              />

            </div>

          </section>

          <section>

            <div className="mb-5">

              <h2 className="
                text-2xl
                font-bold
                text-slate-900
              ">
                Antecedentes médicos
              </h2>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                Responda Sí o No. Cuando corresponda,
                agregue la información solicitada.
              </p>

            </div>

            <div className="space-y-4">
              {renderPreguntas(
                preguntasMedicas
              )}
            </div>

          </section>

          <section>

            <div className="mb-5">

              <h2 className="
                text-2xl
                font-bold
                text-slate-900
              ">
                Hábitos y salud oral
              </h2>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                Información adicional relevante para
                su evaluación odontológica.
              </p>

            </div>

            <div className="space-y-4">
              {renderPreguntas(
                preguntasHabitos
              )}
            </div>

          </section>

          <section>

            <h2 className="
              text-2xl
              font-bold
              text-slate-900
              mb-4
            ">
              Observaciones
            </h2>

            <textarea
              placeholder="Información médica adicional que considere importante..."
              value={observaciones}
              onChange={(e) =>
                setObservaciones(
                  e.target.value
                )
              }
              className="
                w-full
                min-h-32
                border
                border-slate-300
                rounded-xl
                p-4
              "
            />

          </section>

          <section className="
            border
            border-teal-200
            bg-teal-50/50
            rounded-2xl
            p-5
            md:p-7
          ">

            <h2 className="
              text-2xl
              font-bold
              text-slate-900
            ">
              Consentimiento informado
            </h2>

            <div className="
              mt-4
              bg-white
              border
              border-slate-200
              rounded-xl
              p-5
              text-sm
              leading-7
              text-slate-700
              whitespace-pre-line
            ">
              {TEXTO_CONSENTIMIENTO}
            </div>

            <label className="
              flex
              items-start
              gap-3
              mt-5
              cursor-pointer
            ">

              <input
                type="checkbox"
                checked={consentimiento}
                onChange={(e) =>
                  setConsentimiento(
                    e.target.checked
                  )
                }
                className="
                  mt-1
                  w-5
                  h-5
                  accent-teal-600
                "
              />

              <span className="
                font-semibold
                text-slate-800
              ">
                He leído y comprendido el
                consentimiento informado anterior y
                acepto voluntariamente.
              </span>

            </label>

          </section>

          <section>

            <h2 className="
              text-2xl
              font-bold
              text-slate-900
              mb-2
            ">
              Firma del paciente
            </h2>

            <p className="
              text-sm
              text-slate-500
              mb-4
            ">
              Firme dentro del recuadro.
            </p>

            <div className="
              border-2
              border-slate-300
              rounded-2xl
              overflow-hidden
              bg-white
            ">

              <SignatureCanvas
                ref={firmaRef}
                penColor="black"
                canvasProps={{
                  width: 900,
                  height: 220,
                  className:
                    "w-full",
                }}
              />

            </div>

            <button
              type="button"
              onClick={() =>
                firmaRef.current?.clear()
              }
              className="
                mt-4
                border
                border-slate-300
                bg-white
                hover:bg-slate-50
                text-slate-700
                px-4
                py-2
                rounded-xl
                font-bold
              "
            >
              Limpiar firma
            </button>

          </section>

          <button
            type="button"
            onClick={enviarFormulario}
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
              text-lg
              shadow-sm
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {
              loading
                ? "Enviando..."
                : "Enviar formulario"
            }
          </button>

        </div>

      </div>

    </div>

  );
}
