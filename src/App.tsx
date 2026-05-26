import { useEffect, useRef, useState } from "react";

import {
  Routes,
  Route,
} from "react-router-dom";

import jsPDF from "jspdf";

import * as htmlToImage from "html-to-image";

import { supabase } from "./lib/supabase";

import Odontograma from "./components/Odontograma";

import FormularioPacientePublico from "./components/FormularioPacientePublico";

import QRCodePaciente from "./components/QRCodePaciente";

type Paciente = {

  id?: number;

  nombre: string;

  telefono: string;

  correo?: string;

  edad: string;

  sexo: string;

  direccion?: string;

  historial_clinico?: any;

  consentimiento_firmado?: boolean;

  firma_paciente?: string;

  observaciones_dientes?: any;

};

function AdminApp() {

  const expedienteRef =
    useRef<HTMLDivElement>(null);

  const [busqueda,
    setBusqueda] =
    useState("");

  const [pacientes,
    setPacientes] =
    useState<Paciente[]>([]);

  const [pacienteAbierto,
    setPacienteAbierto] =
    useState<Paciente | null>(null);

  const [observacionesDientes,
    setObservacionesDientes] =
    useState<Record<string, string>>({});

  const [estadoDientes,
    setEstadoDientes] =
    useState<Record<string, string>>({});

  const [imagenPreview,
    setImagenPreview] =
    useState("");

  useEffect(() => {

    cargarPacientes();

  }, []);

  async function cargarPacientes() {

    const { data } =
      await supabase

        .from("pacientes")

        .select("*")

        .order(
          "id",
          { ascending: false }
        );

    if (data) {

      setPacientes(data);

    }

  }

  async function subirRadiografia(
    archivo: File
  ) {

    const nombreArchivo =

      `${Date.now()}-${archivo.name}`;

    const { error } =
      await supabase

        .storage

        .from("radiografias")

        .upload(

          nombreArchivo,

          archivo

        );

    if (error) {

      alert(
        "Error subiendo imagen"
      );

      return;

    }

    const { data } =
      supabase

        .storage

        .from("radiografias")

        .getPublicUrl(
          nombreArchivo
        );

    setImagenPreview(
      data.publicUrl
    );

    alert(
      "Radiografía subida"
    );

  }

  async function guardarExpediente() {

    if (!pacienteAbierto?.id)
      return;

    const { error } =
      await supabase

        .from("pacientes")

        .update({

          observaciones_dientes: {

            dientes:
              observacionesDientes,

            estados:
              estadoDientes,

            imagen:
              imagenPreview,

          },

        })

        .eq(
          "id",
          pacienteAbierto.id
        );

    if (error) {

      alert(
        "Error guardando expediente"
      );

      return;

    }

    alert(
      "Expediente guardado"
    );

  }

  async function generarPDF() {

    if (!expedienteRef.current)
      return;

    try {

      const dataUrl =

        await htmlToImage.toPng(

          expedienteRef.current,

          {

            cacheBust: true,

            pixelRatio: 2,

          }

        );

      const pdf =
        new jsPDF(
          "p",
          "mm",
          "a4"
        );

      const imgProps =

        pdf.getImageProperties(
          dataUrl
        );

      const pdfWidth =
        pdf.internal.pageSize.getWidth();

      const pdfHeight =

        (
          imgProps.height *
          pdfWidth
        ) / imgProps.width;

      pdf.addImage(

        dataUrl,

        "PNG",

        0,

        0,

        pdfWidth,

        pdfHeight

      );

      pdf.save(

        `expediente-${pacienteAbierto?.nombre}.pdf`

      );

    } catch (error) {

      console.error(error);

      alert(
        "Error generando PDF"
      );

    }

  }

  function abrirPaciente(
    paciente: Paciente
  ) {

    setPacienteAbierto(
      paciente
    );

    if (
      paciente.observaciones_dientes
    ) {

      setObservacionesDientes(

        paciente
          .observaciones_dientes
          .dientes || {}

      );

      setEstadoDientes(

        paciente
          .observaciones_dientes
          .estados || {}

      );

      setImagenPreview(

        paciente
          .observaciones_dientes
          .imagen || ""

      );

    } else {

      setObservacionesDientes(
        {}
      );

      setEstadoDientes(
        {}
      );

      setImagenPreview("");

    }

  }

  const pacientesFiltrados =
    pacientes.filter((p)=>

      p.nombre
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )

    );

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold text-teal-700 mb-10">
          MintOS Dental
        </h1>

        <div className="mb-10">

          <QRCodePaciente />

        </div>

        {/* LISTA */}

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">

          <h2 className="text-3xl font-bold mb-8">
            Lista de Pacientes
          </h2>

          <input
            value={busqueda}
            onChange={(e)=>
              setBusqueda(
                e.target.value
              )
            }
            placeholder="Buscar paciente..."
            className="
              border
              rounded-xl
              p-4
              w-full
              mb-6
            "
          />

          <div className="space-y-4">

            {

              pacientesFiltrados
                .map((p)=>(

                  <div
                    key={p.id}
                    className="
                      border
                      rounded-2xl
                      p-5
                      flex
                      justify-between
                      items-center
                    "
                  >

                    <div>

                      <h3 className="text-xl font-bold">
                        {p.nombre}
                      </h3>

                      <p>
                        Teléfono: {p.telefono}
                      </p>

                    </div>

                    <button
                      onClick={()=>
                        abrirPaciente(p)
                      }
                      className="
                        bg-teal-600
                        hover:bg-teal-700
                        text-white
                        px-6
                        py-3
                        rounded-xl
                      "
                    >
                      Abrir
                    </button>

                  </div>

                ))

            }

          </div>

        </div>

        {

          pacienteAbierto && (

            <div
              ref={expedienteRef}
              className="
                bg-white
                rounded-3xl
                shadow-xl
                p-8
                mb-10
              "
            >

              <h2 className="
                text-4xl
                font-bold
                text-teal-700
                mb-8
              ">
                Expediente Clínico
              </h2>

              {/* INFO */}

              <div className="
                bg-gray-50
                rounded-2xl
                p-6
                mb-10
              ">

                <h3 className="
                  text-2xl
                  font-bold
                  mb-6
                ">
                  Información Paciente
                </h3>

                <div className="
                  grid
                  md:grid-cols-2
                  gap-4
                ">

                  <p>
                    <strong>Nombre:</strong>
                    {" "}
                    {pacienteAbierto.nombre}
                  </p>

                  <p>
                    <strong>Teléfono:</strong>
                    {" "}
                    {pacienteAbierto.telefono}
                  </p>

                  <p>
                    <strong>Correo:</strong>
                    {" "}
                    {pacienteAbierto.correo}
                  </p>

                  <p>
                    <strong>Edad:</strong>
                    {" "}
                    {pacienteAbierto.edad}
                  </p>

                  <p>
                    <strong>Sexo:</strong>
                    {" "}
                    {pacienteAbierto.sexo}
                  </p>

                  <p>
                    <strong>Dirección:</strong>
                    {" "}
                    {pacienteAbierto.direccion}
                  </p>

                </div>

              </div>

              {/* HISTORIAL */}

              <div className="
                bg-gray-50
                rounded-2xl
                p-6
                mb-10
              ">

                <h3 className="
                  text-2xl
                  font-bold
                  mb-6
                ">
                  Historial Médico
                </h3>

                {

                  pacienteAbierto
                    .historial_clinico
                    ?.preguntas &&

                  Object.entries(

                    pacienteAbierto
                      .historial_clinico
                      .preguntas

                  ).map(([pregunta, respuesta]) => (

                    <div
                      key={pregunta}
                      className="
                        border-b
                        py-3
                      "
                    >

                      <p className="font-semibold">
                        {pregunta}
                      </p>

                      <p>
                        {String(respuesta)}
                      </p>

                    </div>

                  ))

                }

              </div>

              {/* ODONTOGRAMA */}

              <Odontograma
                observacionesDientes={
                  observacionesDientes
                }
                setObservacionesDientes={
                  setObservacionesDientes
                }
                estadoDientes={
                  estadoDientes
                }
                setEstadoDientes={
                  setEstadoDientes
                }
              />

              {/* RADIOGRAFIAS */}

              <div className="mt-10">

                <h3 className="
                  text-2xl
                  font-bold
                  mb-4
                ">
                  Radiografías / Fotos
                </h3>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {

                    const archivo =
                      e.target.files?.[0];

                    if (!archivo)
                      return;

                    subirRadiografia(
                      archivo
                    );

                  }}
                />

                {imagenPreview && (

                  <img
                    src={imagenPreview}
                    alt="Radiografía"
                    className="
                      mt-6
                      rounded-2xl
                      max-h-96
                    "
                  />

                )}

              </div>

              {/* BOTONES */}

              <div className="flex gap-4 mt-10">

                <button
                  onClick={
                    guardarExpediente
                  }
                  className="
                    bg-teal-600
                    hover:bg-teal-700
                    text-white
                    px-8
                    py-4
                    rounded-2xl
                    font-bold
                  "
                >
                  Guardar Expediente
                </button>

                <button
                  onClick={
                    generarPDF
                  }
                  className="
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-8
                    py-4
                    rounded-2xl
                    font-bold
                  "
                >
                  Generar PDF Visual
                </button>

              </div>

            </div>

          )

        }

      </div>

    </div>

  );

}

export default function App() {

  return (

    <Routes>

      <Route
        index
        element={<AdminApp />}
      />

      <Route
        path="/formulario"
        element={<FormularioPacientePublico />}
      />

    </Routes>

  );

}