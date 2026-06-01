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

const [tabActiva,
  setTabActiva] =
  useState("general");
    
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

                <div className="
  flex-1
">

  <div className="
    bg-slate-50
    border
    border-slate-200
    rounded-3xl
    p-5
  ">

    <div className="
      flex
      gap-5
      items-start
    ">

      <div className="
        w-20
        h-20
        rounded-full
        bg-teal-100
        flex
        items-center
        justify-center
        text-3xl
        font-bold
        text-teal-700
        shrink-0
      ">

        {pacienteAbierto.nombre
          ?.charAt(0)
          ?.toUpperCase()}

      </div>

      <div className="
        flex-1
      ">

        <h2 className="
          text-3xl
          font-bold
          text-slate-800
        ">

          {pacienteAbierto.nombre}

        </h2>

        <div className="
          grid
          grid-cols-2
          lg:grid-cols-3
          gap-y-2
          gap-x-6
          mt-4
          text-sm
        ">

          <div>

            <span className="
              font-semibold
            ">
              Edad:
            </span>

            {" "}

            {pacienteAbierto.edad || "-"}

          </div>

          <div>

            <span className="
              font-semibold
            ">
              Sexo:
            </span>

            {" "}

            {pacienteAbierto.sexo || "-"}

          </div>

          <div>

            <span className="
              font-semibold
            ">
              Teléfono:
            </span>

            {" "}

            {pacienteAbierto.telefono || "-"}

          </div>

          <div>

            <span className="
              font-semibold
            ">
              Email:
            </span>

            {" "}

            {pacienteAbierto.correo || "-"}

          </div>

          <div>

            <span className="
              font-semibold
            ">
              Registro:
            </span>

            {" "}

            #{pacienteAbierto.id}

          </div>

          <div>

            <span className="
              font-semibold
            ">
              Última cita:
            </span>

            {" "}

            Pendiente

          </div>

        </div>

      </div>

    </div>

  </div>

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

              <div className="
  flex
  gap-2
  mb-6
  bg-slate-100
  p-2
  rounded-2xl
  w-fit
">

  <button
    onClick={() =>
      setTabActiva("general")
    }
    className={`
      px-5
      py-3
      rounded-xl
      font-semibold
      transition-all

      ${
        tabActiva === "general"
          ? "bg-white text-teal-600 shadow-md"
          : "text-slate-500 hover:bg-white"
      }
    `}
  >
    General
  </button>

  <button
    onClick={() =>
      setTabActiva("expediente")
    }
    className={`
      px-5
      py-3
      rounded-xl
      font-semibold
      transition-all

      ${
        tabActiva === "expediente"
          ? "bg-white text-teal-600 shadow-md"
          : "text-slate-500 hover:bg-white"
      }
    `}
  >
    Expediente Clínico
  </button>

  <button
    onClick={() =>
      setTabActiva("historial")
    }
    className={`
      px-5
      py-3
      rounded-xl
      font-semibold
      transition-all

      ${
        tabActiva === "historial"
          ? "bg-white text-teal-600 shadow-md"
          : "text-slate-500 hover:bg-white"
      }
    `}
  >
    Historial Médico
  </button>

  <button
    onClick={() =>
      setTabActiva("citas")
    }
    className={`
      px-5
      py-3
      rounded-xl
      font-semibold
      transition-all

      ${
        tabActiva === "citas"
          ? "bg-white text-teal-600 shadow-md"
          : "text-slate-500 hover:bg-white"
      }
    `}
  >
    Citas
  </button>

</div>

{
  tabActiva ===
  "general" && (

    <div className="
      space-y-6
    ">

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-4
      ">

        <div className="
          bg-white
          border
          border-slate-200
          rounded-3xl
          p-5
        ">

          <p className="
            text-sm
            text-slate-500
          ">
            Tratamientos
          </p>

          <h3 className="
            text-3xl
            font-bold
            text-slate-800
            mt-2
          ">
            0
          </h3>

        </div>

        <div className="
          bg-white
          border
          border-green-200
          rounded-3xl
          p-5
        ">

          <p className="
            text-sm
            text-slate-500
          ">
            Total Pagado
          </p>

          <h3 className="
            text-3xl
            font-bold
            text-green-600
            mt-2
          ">
            $0
          </h3>

        </div>

        <div className="
          bg-white
          border
          border-red-200
          rounded-3xl
          p-5
        ">

          <p className="
            text-sm
            text-slate-500
          ">
            Saldo Pendiente
          </p>

          <h3 className="
            text-3xl
            font-bold
            text-red-600
            mt-2
          ">
            $0
          </h3>

        </div>

      </div>

      <div className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        overflow-hidden
      ">

        <div className="
          flex
          items-center
          justify-between
          p-5
          border-b
          border-slate-200
        ">

          <h3 className="
            text-xl
            font-bold
            text-slate-800
          ">

            Tratamientos

          </h3>

          <button
            className="
              bg-teal-600
              hover:bg-teal-700
              text-white
              px-4
              py-2
              rounded-xl
              font-semibold
            "
          >

            + Agregar

          </button>

        </div>

        <table className="
          w-full
        ">

          <thead>

            <tr className="
              bg-slate-50
            ">

              <th className="p-4 text-left">
                Fecha
              </th>

              <th className="p-4 text-left">
                Tratamiento
              </th>

              <th className="p-4 text-left">
                Total
              </th>

              <th className="p-4 text-left">
                Pagado
              </th>

              <th className="p-4 text-left">
                Pendiente
              </th>

              <th className="p-4 text-left">
                Estado
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td
                colSpan={6}
                className="
                  text-center
                  p-10
                  text-slate-400
                "
              >

                No hay tratamientos registrados

              </td>

            </tr>

          </tbody>

        </table>

      </div>

      <div className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        p-5
      ">

        <h3 className="
          text-lg
          font-bold
          mb-3
        ">

          Notas

        </h3>

        <textarea
          className="
            w-full
            border
            border-slate-300
            rounded-xl
            p-3
            min-h-[120px]
          "
          placeholder="Notas del paciente..."
        />

      </div>

    </div>

  )
}

{
  tabActiva ===
  "expediente" && (

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

  )
}

{
  tabActiva ===
  "historial" && (

    <div className="
      bg-slate-50
      rounded-3xl
      p-8
      min-h-[400px]
    ">

      <h3 className="
        text-2xl
        font-bold
        text-slate-800
      ">

        Historial Médico

      </h3>

    </div>

  )
}

{
  tabActiva ===
  "citas" && (

    <div className="
      bg-slate-50
      rounded-3xl
      p-8
      min-h-[400px]
    ">

      <h3 className="
        text-2xl
        font-bold
        text-slate-800
      ">

        Citas

      </h3>

    </div>

  )
}

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