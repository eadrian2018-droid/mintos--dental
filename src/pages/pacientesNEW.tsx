import { useEffect, useState } from "react";

import jsPDF from "jspdf";

import * as htmlToImage from "html-to-image";

import { supabase } from "../lib/supabase";

import Odontograma from "../components/Odontograma";

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

export default function Pacientes() {

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
    useState<Record<number, string>>({});

  const [estadoDientes,
    setEstadoDientes] =
    useState<Record<number, string[]>>({});

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

    const elemento =

      document.getElementById(
        "pdf-area"
      );

    if (!elemento)
      return;

    try {

      const dataUrl =

        await htmlToImage.toPng(

          elemento,

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

    } catch {

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

        as Record<number, string[]>

      );

      setImagenPreview(

        paciente
          .observaciones_dientes
          .imagen || ""

      );

    }

    else {

      setObservacionesDientes({});

      setEstadoDientes({});

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

    <div>

      <h1 className="
        text-5xl
        font-bold
        text-gray-800
        mb-10
      ">
        Pacientes
      </h1>

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-8
        mb-10
      ">

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

                    <h3 className="
                      text-xl
                      font-bold
                    ">
                      {p.nombre}
                    </h3>

                    <p>
                      {p.telefono}
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
            id="pdf-area"
            className="
              bg-white
              rounded-3xl
              shadow-xl
              p-8
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

            <div className="
              flex
              gap-4
              mt-10
            ">

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

  );

}