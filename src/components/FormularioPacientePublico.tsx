import {
  useEffect,
  useRef,
  useState,
} from "react";

import SignatureCanvas from "react-signature-canvas";

import { supabase } from "../lib/supabase";

import { registrarBitacora } from "../lib/registrarBitacora";

const TEXTO_CONSENTIMIENTO_ES = `CONSENTIMIENTO INFORMADO GENERAL PARA ATENCIÓN ODONTOLÓGICA

Declaro que la información médica proporcionada es verdadera y completa según mi conocimiento, y me comprometo a informar cualquier cambio relevante en mi estado de salud o medicamentos.

Autorizo al personal odontológico de la clínica a realizar evaluaciones, estudios diagnósticos y los tratamientos odontológicos que sean previamente explicados y aceptados por mí. Estos pueden incluir, según corresponda, procedimientos preventivos y restaurativos, anestesia local, resinas, coronas y prótesis, tratamientos de conductos, extracciones, cirugía oral, tratamientos periodontales, implantes dentales y otros procedimientos necesarios para mi atención.

Entiendo que los tratamientos odontológicos pueden presentar riesgos, molestias, complicaciones y alternativas, y que los resultados clínicos no pueden garantizarse. Tendré oportunidad de hacer preguntas y recibir información sobre el tratamiento recomendado antes de realizarlo.

Entiendo también que determinados procedimientos, incluyendo cirugías, implantes u otros tratamientos que lo requieran, podrán contar con un consentimiento informado específico adicional.

Confirmo que he leído y comprendido esta información y autorizo voluntariamente mi atención odontológica.`;

const TEXTO_CONSENTIMIENTO_EN = `GENERAL INFORMED CONSENT FOR DENTAL CARE

I declare that the medical information I have provided is true and complete to the best of my knowledge, and I agree to report any relevant changes in my health or medications.

I authorize the dental staff of the clinic to perform evaluations, diagnostic studies, and dental treatments that have been previously explained to and accepted by me. These may include, as appropriate, preventive and restorative procedures, local anesthesia, composite restorations, crowns and prostheses, root canal treatments, extractions, oral surgery, periodontal treatments, dental implants, and other procedures necessary for my care.

I understand that dental treatments may involve risks, discomfort, complications, and alternatives, and that clinical results cannot be guaranteed. I will have the opportunity to ask questions and receive information about the recommended treatment before it is performed.

I also understand that certain procedures, including surgeries, implants, or other treatments that require it, may have an additional procedure-specific informed consent.

I confirm that I have read and understood this information and voluntarily authorize my dental care.`;

type Idioma = "es" | "en";

type FormularioPacientePublicoProps = {
  idiomaInicial?: Idioma;
  pacienteId?: number | null;
  onFinalizar?: () => void;
};

type Pregunta = {
  id: string;
  texto: string;
  textoEn: string;
  detalle?: string;
  detalleEn?: string;
};

const preguntasMedicas: Pregunta[] = [
  {
    id: "tratamiento_medico",
    texto: "¿Está actualmente bajo tratamiento médico o tomando medicamentos?",
    textoEn: "Are you currently under medical treatment or taking any medications?",
    detalle: "Indique el motivo, desde cuándo y qué medicamentos toma.",
    detalleEn: "Please indicate the reason, since when, and which medications you take.",
  },
  {
    id: "alergias",
    texto: "¿Tiene alergia a penicilina, antibióticos, anestésicos u otros medicamentos?",
    textoEn: "Are you allergic to penicillin, antibiotics, anesthetics, or any other medications?",
    detalle: "Indique a qué medicamento o sustancia y, si lo conoce, qué reacción presenta.",
    detalleEn: "Please indicate the medication or substance and, if known, the reaction you experience.",
  },
  {
    id: "embarazo",
    texto: "¿Está embarazada o cree que podría estarlo?",
    textoEn: "Are you pregnant or do you think you may be pregnant?",
    detalle: "Indique semanas o meses de embarazo, si corresponde.",
    detalleEn: "Please indicate the number of weeks or months, if applicable.",
  },
  {
    id: "cardiaca_presion",
    texto: "¿Tiene enfermedad cardíaca o problemas de presión arterial?",
    textoEn: "Do you have heart disease or blood pressure problems?",
    detalle: "Explique la condición e indique si su presión suele ser alta o baja.",
    detalleEn: "Please explain the condition and indicate whether your blood pressure is usually high or low.",
  },
  {
    id: "fiebre_reumatica",
    texto: "¿Ha padecido fiebre reumática?",
    textoEn: "Have you ever had rheumatic fever?",
  },
  {
    id: "enfermedad_cirugia",
    texto: "¿Ha tenido alguna enfermedad grave, hospitalización u operación importante?",
    textoEn: "Have you had any serious illness, hospitalization, or major surgery?",
    detalle: "Explique brevemente.",
    detalleEn: "Please explain briefly.",
  },
  {
    id: "sangrado",
    texto: "¿Padece algún trastorno sanguíneo, anemia o problema de coagulación?",
    textoEn: "Do you have any blood disorder, anemia, or clotting problem?",
    detalle: "Explique brevemente.",
    detalleEn: "Please explain briefly.",
  },
  {
    id: "retroviral_bifosfonato",
    texto: "¿Toma o ha tomado medicamentos antirretrovirales o bifosfonatos?",
    textoEn: "Do you currently take or have you taken antiretroviral medications or bisphosphonates?",
    detalle: "Indique cuál y durante cuánto tiempo.",
    detalleEn: "Please indicate which one and for how long.",
  },
  {
    id: "transfusion",
    texto: "¿Ha recibido alguna transfusión sanguínea?",
    textoEn: "Have you ever received a blood transfusion?",
    detalle: "Indique aproximadamente cuándo.",
    detalleEn: "Please indicate approximately when.",
  },
  {
    id: "estomago_higado_rinon",
    texto: "¿Tiene problemas de estómago, hígado o riñón?",
    textoEn: "Do you have stomach, liver, or kidney problems?",
    detalle: "Explique brevemente.",
    detalleEn: "Please explain briefly.",
  },
  {
    id: "diabetes",
    texto: "¿Padece diabetes?",
    textoEn: "Do you have diabetes?",
    detalle: "Indique si está bajo tratamiento y cuál.",
    detalleEn: "Please indicate whether you are receiving treatment and what treatment.",
  },
  {
    id: "tiroides",
    texto: "¿Tiene problemas de tiroides?",
    textoEn: "Do you have thyroid problems?",
    detalle: "Explique brevemente.",
    detalleEn: "Please explain briefly.",
  },
  {
    id: "mareos_asma",
    texto: "¿Padece mareos frecuentes, desmayos o asma?",
    textoEn: "Do you experience frequent dizziness, fainting, or asthma?",
    detalle: "Explique cuál de ellos y cualquier tratamiento actual.",
    detalleEn: "Please indicate which condition and any current treatment.",
  },
  {
    id: "epilepsia",
    texto: "¿Padece epilepsia, convulsiones o ataques nerviosos?",
    textoEn: "Do you have epilepsy, seizures, or convulsions?",
    detalle: "Explique brevemente.",
    detalleEn: "Please explain briefly.",
  },
  {
    id: "hepatitis_tuberculosis_its",
    texto: "¿Ha tenido hepatitis, tuberculosis o alguna infección de transmisión sexual relevante para su atención médica?",
    textoEn: "Have you had hepatitis, tuberculosis, or a sexually transmitted infection relevant to your medical care?",
    detalle: "Indique cuál y cualquier información médica relevante.",
    detalleEn: "Please indicate which one and any medically relevant information.",
  },
  {
    id: "tabaco_drogas",
    texto: "¿Fuma, mastica tabaco o consume alguna droga?",
    textoEn: "Do you smoke, chew tobacco, or use recreational drugs?",
    detalle: "Indique qué consume y con qué frecuencia.",
    detalleEn: "Please indicate what you use and how often.",
  },
  {
    id: "alcohol",
    texto: "¿Consume bebidas alcohólicas frecuentemente?",
    textoEn: "Do you frequently consume alcoholic beverages?",
    detalle: "Indique con qué frecuencia.",
    detalleEn: "Please indicate how often.",
  },
  {
    id: "tratamiento_psiquiatrico",
    texto: "¿Está o ha estado bajo tratamiento psiquiátrico?",
    textoEn: "Are you currently or have you previously been under psychiatric treatment?",
    detalle: "Indique información relevante para su atención odontológica.",
    detalleEn: "Please provide information relevant to your dental care.",
  },
  {
    id: "perdida_peso",
    texto: "¿Está tomando medicamentos para perder peso?",
    textoEn: "Are you taking any medications for weight loss?",
    detalle: "Indique cuál.",
    detalleEn: "Please indicate which one.",
  },
  {
    id: "osteoporosis_cancer",
    texto: "¿Está o ha estado bajo tratamiento por osteoporosis o cáncer?",
    textoEn: "Are you currently or have you previously been treated for osteoporosis or cancer?",
    detalle: "Indique diagnóstico y tratamiento, si corresponde.",
    detalleEn: "Please indicate the diagnosis and treatment, if applicable.",
  },
  {
    id: "otra_condicion",
    texto: "¿Tiene alguna enfermedad, condición o problema de salud no mencionado anteriormente?",
    textoEn: "Do you have any illness, condition, or health problem not mentioned above?",
    detalle: "Explique brevemente.",
    detalleEn: "Please explain briefly.",
  },
];

const preguntasHabitos: Pregunta[] = [
  {
    id: "morder_unas_objetos",
    texto: "¿Se muerde las uñas u otros objetos?",
    textoEn: "Do you bite your nails or other objects?",
  },
  {
    id: "apretamiento",
    texto: "¿Aprieta o rechina los dientes?",
    textoEn: "Do you clench or grind your teeth?",
  },
  {
    id: "respiracion_bucal",
    texto: "¿Respira habitualmente por la boca?",
    textoEn: "Do you usually breathe through your mouth?",
  },
  {
    id: "aftas_herpes",
    texto: "¿Presenta aftas o herpes con frecuencia?",
    textoEn: "Do you frequently have canker sores or cold sores?",
  },
  {
    id: "ruidos_atm",
    texto: "¿Presenta ruidos, dolor o molestias al abrir o cerrar la boca?",
    textoEn: "Do you experience clicking, pain, or discomfort when opening or closing your mouth?",
    detalle: "Explique brevemente.",
    detalleEn: "Please explain briefly.",
  },
];

export default function FormularioPacientePublico({
  idiomaInicial = "es",
  pacienteId = null,
  onFinalizar,
}: FormularioPacientePublicoProps) {

  const [idioma, setIdioma] =
    useState<Idioma>(idiomaInicial);

  const esIngles = idioma === "en";

  const textoConsentimiento =
    esIngles
      ? TEXTO_CONSENTIMIENTO_EN
      : TEXTO_CONSENTIMIENTO_ES;

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

  const [
    cargandoPaciente,
    setCargandoPaciente,
  ] = useState(false);

  useEffect(() => {
    setIdioma(idiomaInicial);
  }, [idiomaInicial]);

  useEffect(() => {

    if (!pacienteId) {
      return;
    }

    let activo = true;

    async function cargarPaciente() {

      setCargandoPaciente(true);

      const { data, error } = await supabase.rpc(
        "obtener_paciente_tablet",
        {
          p_paciente_id: pacienteId,
        }
      );

      const paciente = data?.[0] ?? null;

      if (!activo) {
        return;
      }

      if (error || !paciente) {

        console.error(
          "Error cargando paciente:",
          error
        );

        alert(
          idiomaInicial === "en"
            ? "The patient information could not be loaded."
            : "No se pudo cargar la información del paciente."
        );

        setCargandoPaciente(false);
        return;
      }

      setNombre(paciente.nombre || "");
      setEdad(paciente.edad || "");
      setSexo(paciente.sexo || "");
      setTelefono(paciente.telefono || "");
      setCorreo(paciente.correo || "");
      setDireccion(paciente.direccion || "");

      setCargandoPaciente(false);
    }

    void cargarPaciente();

    return () => {
      activo = false;
    };

  }, [pacienteId, idiomaInicial]);

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
        esIngles ? "Enter the patient’s full name" : "Ingrese el nombre completo del paciente"
      );

      return;
    }

    if (!consentimiento) {

      alert(
        esIngles ? "You must read and accept the informed consent" : "Debe leer y aceptar el consentimiento informado"
      );

      return;
    }

    if (
      !firmaRef.current ||
      firmaRef.current.isEmpty()
    ) {

      alert(
        esIngles ? "The patient’s signature is required" : "La firma del paciente es obligatoria"
      );

      return;
    }

    const firmaBase64 =
      firmaRef.current.toDataURL();

    const historialDeclarado = {

      version_formulario: 1,

      idioma_formulario: idioma,

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
            pregunta: esIngles
              ? pregunta.textoEn
              : pregunta.texto,
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
            pregunta: esIngles
              ? pregunta.textoEn
              : pregunta.texto,
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

      const parametrosFormulario = {
        p_nombre: nombre.trim(),
        p_telefono: telefono.trim(),
        p_correo: correo.trim(),
        p_edad: edad.trim(),
        p_sexo: sexo.trim(),
        p_direccion: direccion.trim(),
        p_fecha_nacimiento: fechaNacimiento || null,
        p_historial_declarado: historialDeclarado,
        p_consentimiento_firmado: consentimiento,
        p_firma_paciente: firmaBase64,
        p_texto_consentimiento: textoConsentimiento,
      };

      const resultado = pacienteId
        ? await supabase.rpc(
            "completar_paciente_existente",
            {
              p_paciente_id: pacienteId,
              ...parametrosFormulario,
            }
          )
        : await supabase.rpc(
            "registrar_paciente_inicial",
            parametrosFormulario
          );

      const {
        data: pacienteGuardadoId,
        error,
      } = resultado;

      if (error) {

        console.error(
          "Error registrando paciente:",
          error
        );

        alert(
          esIngles ? "The patient could not be registered. Please verify the information and try again." : "No se pudo registrar el paciente. Verifique la información e intente nuevamente."
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
            pacienteId
              ? "Completar expediente paciente"
              : "Registrar paciente",
          modulo:
            "Pacientes",
          detalle:
            `Paciente ID: ${pacienteGuardadoId} | Paciente: ${nombre.trim()}`,
        });

      }

      alert(
        esIngles
          ? pacienteId
            ? "Patient record completed successfully"
            : "Form submitted successfully"
          : pacienteId
            ? "Expediente del paciente completado correctamente"
            : "Formulario enviado correctamente"
      );

      limpiarFormulario();
      onFinalizar?.();

    } catch (error) {

      console.error(
        "Error inesperado guardando formulario:",
        error
      );

      alert(
        esIngles ? "Error saving the form" : "Error guardando formulario"
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
                {esIngles
                  ? pregunta.textoEn
                  : pregunta.texto}
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
                    key={esIngles
                      ? opcion === "Sí"
                        ? "Yes"
                        : "No"
                      : opcion}
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
                    {esIngles
                      ? opcion === "Sí"
                        ? "Yes"
                        : "No"
                      : opcion}
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
                    esIngles
                      ? pregunta.detalleEn || pregunta.detalle
                      : pregunta.detalle
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

          <div className="flex justify-end mb-5">
            <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/15">
              <button
                type="button"
                onClick={() => setIdioma("es")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  idioma === "es"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                Español
              </button>

              <button
                type="button"
                onClick={() => setIdioma("en")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  idioma === "en"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <p className="
            text-sm
            uppercase
            tracking-[0.18em]
            text-teal-300
            font-bold
            mb-2
          ">
            {pacienteId
              ? esIngles
                ? "Existing Patient"
                : "Paciente existente"
              : esIngles
                ? "New Patient Registration"
                : "Registro de Nuevo Paciente"}
          </p>

          <h1 className="
            text-3xl
            md:text-4xl
            font-bold
          ">
            {esIngles ? "Dental Health History" : "Historial Clínico Dental"}
          </h1>

          <p className="
            text-slate-300
            mt-3
            max-w-2xl
          ">
            {esIngles
              ? "Please complete the information as accurately as possible. This information helps our dental team provide safe and appropriate care."
              : "Complete la información con la mayor precisión posible. Estos datos ayudan al equipo dental a brindarle una atención segura y adecuada."}
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
                {esIngles ? "Patient Information" : "Información del paciente"}
              </h2>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                {esIngles ? "General information and reason for visit." : "Datos generales y motivo de consulta."}
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
                placeholder={esIngles ? "Full name *" : "Nombre completo *"}
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
                aria-label={esIngles ? "Date of birth" : "Fecha de nacimiento"}
              />

              <input
                type="number"
                placeholder={esIngles ? "Age" : "Edad"}
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
                  {esIngles ? "Sex" : "Sexo"}
                </option>
                <option value="Femenino">
                  {esIngles ? "Female" : "Femenino"}
                </option>
                <option value="Masculino">
                  {esIngles ? "Male" : "Masculino"}
                </option>
                <option value="Otro">
                  {esIngles ? "Other" : "Otro"}
                </option>
                <option value="Prefiero no responder">
                  {esIngles ? "Prefer not to answer" : "Prefiero no responder"}
                </option>
              </select>

              <input
                type="text"
                placeholder={esIngles ? "Phone" : "Teléfono"}
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
                placeholder={esIngles ? "Email" : "Correo electrónico"}
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
                placeholder={esIngles ? "Address" : "Domicilio"}
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
                placeholder={esIngles ? "Marital status" : "Estado civil"}
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
                placeholder={esIngles ? "Occupation" : "Ocupación"}
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
                  {esIngles ? "How did you hear about the clinic?" : "¿Cómo conoció la clínica?"}
                </option>
                <option value="Recomendación">
                  {esIngles ? "Referral" : "Recomendación"}
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
                  {esIngles ? "Other" : "Otro"}
                </option>
              </select>

              <input
                type="text"
                placeholder={esIngles ? "Reason for visit" : "Motivo de consulta"}
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
                placeholder={esIngles ? "Family medical history" : "Antecedentes heredofamiliares"}
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
                {esIngles ? "Medical History" : "Antecedentes médicos"}
              </h2>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                {esIngles
                  ? "Answer Yes or No. When applicable, provide the requested details."
                  : "Responda Sí o No. Cuando corresponda, agregue la información solicitada."}
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
                {esIngles ? "Oral Habits and Health" : "Hábitos y salud oral"}
              </h2>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                {esIngles
                  ? "Additional information relevant to your dental evaluation."
                  : "Información adicional relevante para su evaluación odontológica."}
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
              {esIngles ? "Additional Information" : "Observaciones"}
            </h2>

            <textarea
              placeholder={esIngles ? "Additional medical information you consider important..." : "Información médica adicional que considere importante..."}
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
              {esIngles ? "Informed Consent" : "Consentimiento informado"}
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
              {textoConsentimiento}
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
                {esIngles
                  ? "I have read and understood the informed consent above and voluntarily accept it."
                  : "He leído y comprendido el consentimiento informado anterior y acepto voluntariamente."}
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
              {esIngles ? "Patient Signature" : "Firma del paciente"}
            </h2>

            <p className="
              text-sm
              text-slate-500
              mb-4
            ">
              {esIngles ? "Please sign inside the box." : "Firme dentro del recuadro."}
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
              {esIngles ? "Clear signature" : "Limpiar firma"}
            </button>

          </section>

          <button
            type="button"
            onClick={enviarFormulario}
            disabled={loading || cargandoPaciente}
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
              cargandoPaciente
                ? esIngles
                  ? "Loading patient..."
                  : "Cargando paciente..."
                : loading
                  ? esIngles
                    ? "Submitting..."
                    : "Enviando..."
                  : esIngles
                    ? "Submit form"
                    : "Enviar formulario"
            }
          </button>

        </div>

      </div>

    </div>

  );
}
