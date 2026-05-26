import { useEffect, useState } from "react";

import {
  Routes,
  Route,
} from "react-router-dom";

import jsPDF from "jspdf";

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

  observaciones?: any;

};

function AdminApp() {

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

    const { data, error } =
      await supabase

        .from("pacientes")

        .select("*")

        .order(
          "id",
          { ascending: false }
        );

    if (!error && data) {

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

          observaciones: {

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

  function generarPDF() {

    if (!pacienteAbierto)
      return;

    const pdf =
      new jsPDF();

    let y = 20;

    pdf.setFontSize(22);

    pdf.text(
      "Expediente Clínico Dental",
      20,
      y
    );

    y += 20;

    pdf.setFontSize(14);

    pdf.text(
      `Nombre: ${pacienteAbierto.nombre}`,
      20,
      y
    );

    y += 10;

    pdf.text(
      `Teléfono: ${pacienteAbierto.telefono}`,
      20,
      y
    );

    y += 10;

    pdf.text(
      `Correo: ${pacienteAbierto.correo || ""}`,
      20,
      y
    );

    y += 10;

    pdf.text(
      `Edad: ${pacienteAbierto.edad}`,
      20,
      y
    );

    y += 10;

    pdf.text(
      `Sexo: ${pacienteAbierto.sexo}`,
      20,
      y
    );

    y += 20;

    pdf.setFontSize(18);

    pdf.text(
      "Historial Médico",
      20,
      y
    );

    y += 15;

    const preguntas =

      pacienteAbierto
        .historial_clinico
        ?.preguntas || {};

    Object.entries(
      preguntas
    ).forEach(

      ([pregunta, respuesta]) => {

        pdf.setFontSize(11);

        pdf.text(

          `${pregunta}: ${respuesta}`,

          20,

          y

        );

        y += 8;

      }

    );

    y += 10;

    pdf.setFontSize(14);

    pdf.text(
      "Observaciones:",
      20,
      y
    );

    y += 10;

    const observaciones =

      pacienteAbierto
        .historial_clinico
        ?.observaciones || "";

    pdf.text(
      observaciones,
      20,
      y
    );

    y += 20;

    pdf.text(

      `Consentimiento: ${
        pacienteAbierto
          .consentimiento_firmado

          ? "Aceptado"

          : "No aceptado"
      }`,

      20,

      y

    );

    y += 10;

    pdf.text(

      `Firma: ${
        pacienteAbierto
          .firma_paciente || ""
      }`,

      20,

      y

    );

    pdf.save(

      `expediente-${pacienteAbierto.nombre}.pdf`

    );

  }

  function abrirPaciente(
    paciente: Paciente
  ) {

    setPacienteAbierto(
      paciente
    );

    if (
      paciente.observaciones
    ) {

      setObservacionesDientes(

        paciente
          .observaciones
          .dientes || {}

      );

      setEstadoDientes(

        paciente
          .observaciones
          .estados || {}

      );

      setImagenPreview(

        paciente
          .observaciones
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

            <div className="
              bg-white
              rounded-3xl
              shadow-xl
              p-8
              mb-10
            ">

              <h2 className="
                text-4xl
                font-bold
                text-teal-700
                mb-8
              ">
                Expediente Clínico
              </h2>

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
                  Generar PDF
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