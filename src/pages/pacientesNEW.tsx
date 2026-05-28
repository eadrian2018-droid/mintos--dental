import { useEffect, useState } from "react";

import jsPDF from "jspdf";

import * as htmlToImage from "html-to-image";

import { supabase } from "../lib/supabase";

import Odontograma from "../components/Odontograma";

import QRCodePaciente from "../components/QRCodePaciente";

interface ZonaDiente {

  oclusal?: string[];

  vestibular?: string[];

  distal?: string[];

  mesial?: string[];

}

type Paciente = {

  id?: number;

  nombre: string;

  telefono: string;

  correo?: string;

  edad?: string;

  sexo?: string;

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
    useState<
      Record<number, ZonaDiente>
    >({});

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

    <div className="
      h-[calc(100vh-90px)]
      flex
      gap-3
    ">

      <div className="
        w-[155px]
        min-w-[155px]
        bg-white
        rounded-2xl
        shadow-lg
        p-2
        overflow-y-auto
      ">

        <div className="
          flex
          items-center
          justify-between
          mb-3
        ">

          <h1 className="
            text-sm
            font-bold
            text-gray-800
          ">

            Pacientes

          </h1>

          <a

            href="/qr-pacientes"

            className="
              bg-teal-600
              hover:bg-teal-700
              text-white
              px-2
              py-1
              rounded-lg
              font-semibold
              text-[10px]
            "
          >

            QR

          </a>

        </div>

        <input
          value={busqueda}
          onChange={(e)=>
            setBusqueda(
              e.target.value
            )
          }
          placeholder="Buscar..."
          className="
            border
            border-slate-300
            rounded-lg
            p-2
            w-full
            mb-3
            text-xs
          "
        />

        <div className="
          space-y-2
        ">

          {

            pacientesFiltrados
              .map((p)=>(

                <button

                  key={p.id}

                  onClick={()=>
                    abrirPaciente(p)
                  }

                  className={`
                    w-full
                    text-left
                    border
                    rounded-xl
                    p-2
                    transition-all
                    hover:shadow-md

                    ${
                      pacienteAbierto?.id === p.id

                      ? "border-teal-500 bg-teal-50"

                      : "border-slate-200 bg-white"
                    }
                  `}
                >

                  <h3 className="
                    text-xs
                    font-bold
                    text-slate-800
                    truncate
                  ">

                    {p.nombre}

                  </h3>

                  <p className="
                    text-slate-500
                    mt-1
                    text-[10px]
                    truncate
                  ">

                    {p.telefono}

                  </p>

                </button>

              ))

          }

        </div>

      </div>

      <div className="
        flex-1
        overflow-y-auto
      ">

        {

          pacienteAbierto ? (

            <div
              id="pdf-area"
              className="
                bg-white
                rounded-3xl
                shadow-xl
                p-4
              "
            >

              <div className="
                flex
                items-center
                justify-between
                mb-5
              ">

                <div>

                  <h2 className="
                    text-2xl
                    font-bold
                    text-teal-700
                  ">

                    Expediente Clínico

                  </h2>

                  <p className="
                    text-slate-500
                    mt-1
                    text-sm
                  ">

                    {pacienteAbierto.nombre}

                  </p>

                </div>

                <div className="
                  flex
                  gap-2
                ">

                  <button
                    onClick={
                      guardarExpediente
                    }
                    className="
                      bg-teal-600
                      hover:bg-teal-700
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                      text-sm
                    "
                  >

                    Guardar

                  </button>

                  <button
                    onClick={
                      generarPDF
                    }
                    className="
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                      text-sm
                    "
                  >

                    PDF

                  </button>

                </div>

              </div>

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

              <div className="
                mt-8
                bg-slate-50
                rounded-3xl
                p-4
              ">

                <h3 className="
                  text-lg
                  font-bold
                  mb-4
                  text-slate-800
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

                {

                  imagenPreview && (

                    <img
                      src={imagenPreview}
                      alt="Radiografía"
                      className="
                        mt-5
                        rounded-2xl
                        max-h-[500px]
                        border
                        border-slate-200
                      "
                    />

                  )

                }

              </div>

            </div>

          )

          :

          (

            <div className="
              h-full
              flex
              items-center
              justify-center
              bg-white
              rounded-3xl
              shadow-xl
              p-6
            ">

              <div className="
                max-w-md
                w-full
              ">

                <QRCodePaciente />

                <a

                  href="/#/registro-paciente"

                  target="_blank"

                  rel="noopener noreferrer"

                  className="
                    block
                    mt-6
                    w-full
                    bg-teal-600
                    hover:bg-teal-700
                    text-white
                    py-4
                    rounded-2xl
                    font-bold
                    text-lg
                    text-center
                  "
                >

                  Abrir Formulario

                </a>

              </div>

            </div>

          )

        }

      </div>

    </div>

  );

}