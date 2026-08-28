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

  id: number;

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

  const [mostrarModalTratamiento,
  setMostrarModalTratamiento] =
  useState(false);  

  const [tratamientos,
  setTratamientos] =
  useState<any[]>([]);

  const [
 citas,
  setCitas,
] = useState<any[]>([]);

const proximaCita =

  citas.length > 0

    ? citas[0]

    : null;

const [
  mostrarModalCita,
  setMostrarModalCita,
] = useState(false);

const [
  nuevaCita,
  setNuevaCita,
] = useState({

  fecha: "",

  horaInicio: "",

  horaFin: "",

  estado: "pendiente",

  doctor: "Dr. Edgar",

});

const [
  citaEditando,
  setCitaEditando,
] = useState<number | null>(
  null
);


const [nuevoTratamiento,
  setNuevoTratamiento

] = useState({

  fecha: "",

  tratamiento: "",

  doctor: "",

  estado: "Pendiente",

  metodo_pago: "",

  moneda: "",

  laboratorio: "",

  especialista: "",

  comision_banco: "",

  total: "",

  pagado: "",

  notas: "",

});

  const [editandoIndex,
  setEditandoIndex] =
  useState<number | null>(
    null
  );

  const [
  doctores,
  setDoctores,
] = useState<any[]>([]);

const [
  doctorSeleccionado,
  setDoctorSeleccionado,
] = useState<any>(null);

const [
  catalogoTratamientos,
  setCatalogoTratamientos,
] = useState<any[]>([]);

const [
  notasClinicas,
  setNotasClinicas,
] = useState<any[]>([]);

const [
  nuevaNotaClinica,
  setNuevaNotaClinica,
] = useState("");

const [
  doctorNotaId,
  setDoctorNotaId,
] = useState("");
    
useEffect(() => {

  cargarPacientes();

  cargarDoctores();

  cargarCatalogoTratamientos();

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

  async function cargarDoctores() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "doctores"
    )

    .select("*")

    .eq(
      "activo",
      true
    )

    .order(
      "nombre",
      {
        ascending: true,
      }
    );

  if (
    !error &&
    data
  ) {

    setDoctores(
      data
    );

  }

}

async function cargarCatalogoTratamientos() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "catalogo_tratamientos"
    )

    .select("*")

    .eq(
      "activo",
      true
    )

    .order(
      "nombre",
      {
        ascending: true,
      }
    );

  if (
    !error &&
    data
  ) {

    setCatalogoTratamientos(
      data
    );

  }

}

async function cargarNotasClinicas(
  pacienteId: number
) {

  const {
    data,
    error,
  } = await supabase

    .from(
      "notas_clinicas"
    )

    .select("*")

    .eq(
      "paciente_id",
      pacienteId
    )

    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (
    !error &&
    data
  ) {

    setNotasClinicas(
      data
    );

  }

}

async function guardarNotaClinica() {

  if (
    !pacienteAbierto?.id
  ) {

    return;

  }

  if (
    !nuevaNotaClinica.trim()
  ) {

    alert(
      "Escribe una nota clínica."
    );

    return;

  }

  if (
    !doctorNotaId
  ) {

    alert(
      "Selecciona un doctor."
    );

    return;

  }

  const doctor =

    doctores.find(
      (d: any) =>
        String(d.id) ===
        doctorNotaId
    );

  if (
    !doctor
  ) {

    return;

  }

  const {
    error,
  } = await supabase

    .from(
      "notas_clinicas"
    )

    .insert({

      paciente_id:
        pacienteAbierto.id,

      tratamiento_id:
        null,

      doctor_id:
        doctor.id,

      doctor_nombre:
        doctor.nombre,

      nota:
        nuevaNotaClinica.trim(),

    });

  if (error) {

    console.error(
      error
    );

    alert(
      "Error guardando nota clínica."
    );

    return;

  }

  setNuevaNotaClinica("");

  setDoctorNotaId("");

  await cargarNotasClinicas(
    pacienteAbierto.id
  );

}

  async function cargarCitas(
  pacienteId: number
) {

  const {
    data,
    error,
  } = await supabase

    .from("citas")

    .select("*")

    .eq(
      "paciente_id",
      pacienteId
    )

    .order(
      "inicio",
      {
        ascending: false,
      }
    );

  if (
    !error &&
    data
  ) {

    setCitas(
      data
    );

  }

}

 async function eliminarCita(
  citaId: number
) {

  if (
    !pacienteAbierto?.id
  )
    return;

  const confirmar =

    window.confirm(
      "¿Eliminar esta cita?"
    );

  if (!confirmar)
    return;

  await supabase

    .from("citas")

    .delete()

    .eq(
      "id",
      citaId
    );

  await cargarCitas(
    pacienteAbierto.id
  );

}

function editarCita(
  cita: any
) {

  const inicio =
    new Date(
      cita.inicio
    );

  const fin =
    new Date(
      cita.fin
    );

  setNuevaCita({

    fecha:
      inicio
        .toISOString()
        .split("T")[0],

    horaInicio:
      inicio
        .toTimeString()
        .slice(0, 5),

    horaFin:
      fin
        .toTimeString()
        .slice(0, 5),

    estado:
      cita.estado,

    doctor:
      cita.doctor,

  });

  setCitaEditando(
    cita.id
  );

  setMostrarModalCita(
    true
  );

}

async function guardarCitaPaciente() {

 

  if (!pacienteAbierto?.id)
    return;

  const inicio = new Date(
    `${nuevaCita.fecha}T${nuevaCita.horaInicio}`
  );

  const fin = new Date(
    `${nuevaCita.fecha}T${nuevaCita.horaFin}`
  );

  if (
  citaEditando
) {

  await supabase

    .from("citas")

    .update({

      inicio:
        inicio.toISOString(),

      fin:
        fin.toISOString(),

      estado:
        nuevaCita.estado,

      doctor:
        nuevaCita.doctor,

    })

    .eq(
      "id",
      citaEditando
    );

}

else {

  await supabase

    .from("citas")

    .insert([

      {

        paciente:
          pacienteAbierto.nombre,

        paciente_id:
          pacienteAbierto.id,

        inicio:
          inicio.toISOString(),

        fin:
          fin.toISOString(),

        estado:
          nuevaCita.estado,

        doctor:
          nuevaCita.doctor,

      },

    ]);

}

  await cargarCitas(
    pacienteAbierto.id
  );

  setMostrarModalCita(
    false
  );

  setNuevaCita({

    fecha: "",

    horaInicio: "",

    horaFin: "",

    estado: "pendiente",

    doctor: "Dr. Edgar",

  });

  setCitaEditando(
  null
);

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

async function guardarTratamiento() {

  if (
    !pacienteAbierto?.id
  ) {

    return;

  }

  if (
    !nuevoTratamiento.fecha ||
    !nuevoTratamiento.tratamiento ||
    !nuevoTratamiento.doctor
  ) {

    alert(
      "Completa fecha, tratamiento y doctor."
    );

    return;

  }

  const nuevo = {

    ...nuevoTratamiento,

    metodo_pago: "",

    moneda: "",

    laboratorio: "",

    especialista: "",

    comision_banco: "",

    total: "",

    pagado: "",

    pendiente: 0,

  };

  if (
    editandoIndex !== null
  ) {

    const tratamientoEditar =
      tratamientos[
        editandoIndex
      ];

    if (
      tratamientoEditar?.id
    ) {

      const {
        error,
      } = await supabase

        .from(
          "tratamientos"
        )

        .update({

          fecha:
            nuevo.fecha,

          tratamiento:
            nuevo.tratamiento,

          doctor:
            nuevo.doctor,

    doctor_id:
  doctorSeleccionado?.id ||
  tratamientoEditar.doctor_id ||
  null,

estado:
  nuevo.estado ||
  tratamientoEditar.estado ||
  "Pendiente",

notas:
  nuevo.notas || "",

        })

        .eq(
          "id",
          tratamientoEditar.id
        );

      if (error) {

        console.error(
          error
        );

        alert(
          "Error actualizando tratamiento."
        );

        return;

      }

    }

  }

  else {

    const {
      data,
      error,
    } = await supabase

      .from(
        "tratamientos"
      )

      .insert({

        paciente_id:
          pacienteAbierto.id,

        fecha:
          nuevo.fecha,

        tratamiento:
          nuevo.tratamiento,

        doctor:
          nuevo.doctor,

 doctor_id:
  doctorSeleccionado?.id ||
  null,

estado:
  nuevo.estado ||
  "Pendiente",

notas:
  nuevo.notas || "",

      })

      .select()
      .single();

    if (error) {

      console.error(
        error
      );

      alert(
        "Error guardando tratamiento."
      );

      return;

    }

 if (data) {

  setTratamientos([
    ...tratamientos,
    {
      ...nuevo,
      id: data.id,
    },
  ]);

}

  }

  if (
    editandoIndex !== null
  ) {

    const copia = [
      ...tratamientos,
    ];

    copia[
      editandoIndex
    ] = {

      ...copia[
        editandoIndex
      ],

      ...nuevo,

    };

    setTratamientos(
      copia
    );

  }

 else {

  // El nuevo tratamiento ya fue agregado
  // después de guardarse en Supabase.

}

setNuevoTratamiento({

  fecha: "",

  tratamiento: "",

  doctor: "",

  estado: "Pendiente",

  metodo_pago: "",

  moneda: "",

  laboratorio: "",

  especialista: "",

  comision_banco: "",

  total: "",

  pagado: "",

  notas: "",

});

  setEditandoIndex(
    null
  );

  setDoctorSeleccionado(
    null
  );

  setMostrarModalTratamiento(
    false
  );

}

  async function abrirPaciente(
  paciente: Paciente
) {

    setPacienteAbierto(
      paciente
    );

   cargarCitas(
  paciente.id
);

cargarNotasClinicas(
  paciente.id
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

    if (
      paciente.id
    ) {

      const {
        data,
        error,
      } = await supabase

        .from(
          "tratamientos"
        )

        .select("*")

        .eq(
          "paciente_id",
          paciente.id
        )

        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (
        !error &&
        data
      ) {

        setTratamientos(

          data.map(
            (
              t
            ) => ({

              id:
    t.id,

  fecha:
    t.fecha,

  tratamiento:
    t.tratamiento,

    doctor:
  t.doctor,

doctor_id:
  t.doctor_id,

estado:
  t.estado || "Pendiente",

metodo_pago:
  t.metodo_pago,

moneda:
  t.moneda,

  laboratorio:
  t.laboratorio,

especialista:
  t.especialista,

comision_banco:
  t.comision_banco,

  total:
    t.total,

  pagado:
    t.pago,

  pendiente:
    t.resta,

 notas:
  t.notas || "",
})
          )

        );

      }

    }

  }

  async function actualizarEstadoTratamiento(
  tratamientoId: number,
  nuevoEstado: string
) {

  const {
    error,
  } = await supabase

    .from(
      "tratamientos"
    )

    .update({

      estado:
        nuevoEstado,

    })

    .eq(
      "id",
      tratamientoId
    );

  if (error) {

    console.error(
      error
    );

    alert(
      "Error actualizando estado."
    );

    return;

  }

  setTratamientos(
    tratamientos.map(
      (
        tratamiento
      ) =>

        tratamiento.id ===
        tratamientoId

          ? {
              ...tratamiento,
              estado:
                nuevoEstado,
            }

          : tratamiento
    )
  );

}

  function obtenerDoctor(
  doctorId: number
) {

  return doctores.find(
    (d: any) =>
      d.id === doctorId
  );

}
const pacientesFiltrados =
  pacientes.filter((p) => {

    const textoBusqueda =
      busqueda
        .toLowerCase()
        .trim();

    if (!textoBusqueda) {
      return true;
    }

    const nombre =
      p.nombre
        ?.toLowerCase() || "";

    const telefono =
      p.telefono
        ?.toLowerCase() || "";

    const correo =
      p.correo
        ?.toLowerCase() || "";

    const idPaciente =
      String(p.id);

    return (
      nombre.includes(textoBusqueda) ||
      telefono.includes(textoBusqueda) ||
      correo.includes(textoBusqueda) ||
      idPaciente.includes(textoBusqueda)
    );

  });

  return (

    <div className="
      h-[calc(100vh-90px)]
      flex
      gap-3
    ">

      <div
  className="
    w-[280px]
    min-w-[280px]
    bg-white
    border
    border-slate-200
    rounded-2xl
    overflow-hidden
    flex
    flex-col
  "
>

  <div
    className="
      p-4
      border-b
      border-slate-200
    "
  >

    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        mb-4
      "
    >

      <div>

        <h1
          className="
            text-lg
            font-bold
            text-slate-800
          "
        >
          Pacientes
        </h1>

        <p
          className="
            text-xs
            text-slate-500
            mt-1
          "
        >
          {pacientes.length}
          {" "}
          pacientes registrados
        </p>

      </div>

      <a
        href="/qr-pacientes"
        className="
          bg-teal-600
          hover:bg-teal-700
          text-white
          px-3
          py-2
          rounded-xl
          font-semibold
          text-xs
          transition
          shrink-0
        "
      >
        + QR
      </a>

    </div>

    <input
      value={busqueda}
      onChange={(e) =>
        setBusqueda(
          e.target.value
        )
      }
      placeholder="Buscar paciente..."
      className="
        w-full
        border
        border-slate-200
        bg-slate-50
        rounded-xl
        px-3
        py-2.5
        text-sm
        outline-none
        focus:ring-2
        focus:ring-teal-100
        focus:border-teal-500
        transition
      "
    />

  </div>

  <div
    className="
      flex-1
      overflow-y-auto
      p-3
    "
  >

    {
      pacientesFiltrados.length === 0

        ? (

          <div
            className="
              text-center
              py-10
              px-4
            "
          >

            <div
              className="
                w-12
                h-12
                rounded-full
                bg-slate-100
                flex
                items-center
                justify-center
                mx-auto
                mb-3
                text-lg
                font-bold
                text-slate-400
              "
            >
              ?
            </div>

            <p
              className="
                text-sm
                font-semibold
                text-slate-600
              "
            >
              Sin resultados
            </p>

            <p
              className="
                text-xs
                text-slate-400
                mt-1
              "
            >
              No encontramos pacientes
              con esa búsqueda.
            </p>

          </div>

        )

        : (

          <div
            className="
              space-y-2
            "
          >

            {
              pacientesFiltrados.map(
                (p) => {

                  const seleccionado =
                    pacienteAbierto?.id ===
                    p.id;

                  return (

                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        abrirPaciente(p)
                      }
                      className={`
                        w-full
                        text-left
                        rounded-xl
                        border
                        p-3
                        transition-all

                        ${
                          seleccionado

                            ? `
                              border-teal-500
                              bg-teal-50
                              shadow-sm
                            `

                            : `
                              border-transparent
                              bg-white
                              hover:bg-slate-50
                              hover:border-slate-200
                            `
                        }
                      `}
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <div
                          className={`
                            w-10
                            h-10
                            rounded-full
                            flex
                            items-center
                            justify-center
                            shrink-0
                            font-bold
                            text-sm

                            ${
                              seleccionado

                                ? `
                                  bg-teal-600
                                  text-white
                                `

                                : `
                                  bg-slate-100
                                  text-slate-600
                                `
                            }
                          `}
                        >

                          {
                            p.nombre
                              ?.charAt(0)
                              ?.toUpperCase()
                          }

                        </div>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            "
                          >

                            <h3
                              className={`
                                text-sm
                                font-semibold
                                truncate

                                ${
                                  seleccionado
                                    ? "text-teal-800"
                                    : "text-slate-800"
                                }
                              `}
                            >
                              {p.nombre}
                            </h3>

                            <span
                              className="
                                text-[10px]
                                text-slate-400
                                shrink-0
                              "
                            >
                              #{p.id}
                            </span>

                          </div>

                          <p
                            className="
                              text-xs
                              text-slate-500
                              truncate
                              mt-1
                            "
                          >
                            {
                              p.telefono ||
                              "Sin teléfono"
                            }
                          </p>

                        </div>

                      </div>

                    </button>

                  );

                }
              )
            }

          </div>

        )
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
  mb-5
">

  <div className="
    bg-white
    border
    border-slate-200
    rounded-3xl
    p-5
    shadow-sm
  ">

    <div className="
      flex
      flex-col
      xl:flex-row
      xl:items-center
      justify-between
      gap-5
    ">

      <div className="
        flex
        items-start
        gap-4
        min-w-0
      ">

        <div className="
          w-16
          h-16
          rounded-2xl
          bg-teal-100
          flex
          items-center
          justify-center
          text-2xl
          font-bold
          text-teal-700
          shrink-0
        ">

          {pacienteAbierto.nombre
            ?.charAt(0)
            ?.toUpperCase()}

        </div>

        <div className="
          min-w-0
          flex-1
        ">

          <div className="
            flex
            flex-wrap
            items-center
            gap-3
          ">

            <h2 className="
              text-2xl
              lg:text-3xl
              font-bold
              text-slate-800
            ">

              {pacienteAbierto.nombre}

            </h2>

            <span className="
              bg-teal-50
              text-teal-700
              border
              border-teal-100
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
            ">

              Expediente #{pacienteAbierto.id}

            </span>

          </div>

          <div className="
            flex
            flex-wrap
            items-center
            gap-x-5
            gap-y-2
            mt-3
            text-sm
            text-slate-500
          ">

            <span>

              <strong className="
                text-slate-700
                font-semibold
              ">
                Edad:
              </strong>

              {" "}

              {pacienteAbierto.edad || "-"}

            </span>

            <span>

              <strong className="
                text-slate-700
                font-semibold
              ">
                Sexo:
              </strong>

              {" "}

              {pacienteAbierto.sexo || "-"}

            </span>

            <span>

              <strong className="
                text-slate-700
                font-semibold
              ">
                Tel:
              </strong>

              {" "}

              {pacienteAbierto.telefono || "-"}

            </span>

            <span>

              <strong className="
                text-slate-700
                font-semibold
              ">
                Correo:
              </strong>

              {" "}

              {pacienteAbierto.correo || "-"}

            </span>

          </div>

        </div>

      </div>

      <div className="
        bg-slate-50
        border
        border-slate-200
        rounded-2xl
        px-4
        py-3
        min-w-[190px]
        shrink-0
      ">

        <p className="
          text-xs
          uppercase
          tracking-wide
          font-semibold
          text-slate-400
        ">
          Próxima cita
        </p>

        <p className="
          text-sm
          font-bold
          text-slate-800
          mt-1
        ">

          {
            proximaCita

              ? new Date(
                  proximaCita.inicio
                ).toLocaleDateString(
                  "es-MX",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )

              : "Sin citas programadas"
          }

        </p>

        {
          proximaCita && (

            <p className="
              text-xs
              text-teal-600
              font-semibold
              mt-1
            ">

              {
                new Date(
                  proximaCita.inicio
                ).toLocaleTimeString(
                  "es-MX",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              }

            </p>

          )
        }

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

        <div className="
  mb-6
  border-b
  border-slate-200
">

  <div className="
    flex
    flex-wrap
    gap-1
  ">

    <button
      onClick={() =>
        setTabActiva("general")
      }
      className={`
        px-5
        py-3
        text-sm
        font-semibold
        border-b-2
        transition-colors

        ${
          tabActiva === "general"
            ? "border-teal-600 text-teal-700"
            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
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
        text-sm
        font-semibold
        border-b-2
        transition-colors

        ${
          tabActiva === "expediente"
            ? "border-teal-600 text-teal-700"
            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
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
        text-sm
        font-semibold
        border-b-2
        transition-colors

        ${
          tabActiva === "historial"
            ? "border-teal-600 text-teal-700"
            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
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
        text-sm
        font-semibold
        border-b-2
        transition-colors

        ${
          tabActiva === "citas"
            ? "border-teal-600 text-teal-700"
            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
        }
      `}
    >
      Citas
    </button>

  </div>

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
    rounded-2xl
    p-5
    shadow-sm
  ">

    <div className="
      flex
      items-center
      justify-between
      gap-4
    ">

      <div>

        <p className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-400
        ">
          Tratamientos
        </p>

        <h3 className="
          text-3xl
          font-bold
          text-slate-800
          mt-2
        ">
          {tratamientos.length}
        </h3>

        <p className="
          text-sm
          text-slate-500
          mt-1
        ">
          Registrados
        </p>

      </div>

      <div className="
        w-12
        h-12
        rounded-2xl
        bg-slate-100
        flex
        items-center
        justify-center
        text-slate-600
        font-bold
        text-lg
      ">
        #
      </div>

    </div>

  </div>

  <div className="
    bg-white
    border
    border-emerald-200
    rounded-2xl
    p-5
    shadow-sm
  ">

    <div className="
      flex
      items-center
      justify-between
      gap-4
    ">

      <div>

        <p className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-400
        ">
          Total Pagado
        </p>

        <h3 className="
          text-3xl
          font-bold
          text-emerald-600
          mt-2
        ">
          $
          {
            tratamientos.reduce(
              (
                total,
                tratamiento
              ) =>
                total +
                Number(
                  tratamiento.pagado || 0
                ),
              0
            )
          }
        </h3>

        <p className="
          text-sm
          text-slate-500
          mt-1
        ">
          Pagos recibidos
        </p>

      </div>

      <div className="
        w-12
        h-12
        rounded-2xl
        bg-emerald-50
        flex
        items-center
        justify-center
        text-emerald-600
        font-bold
        text-xl
      ">
        $
      </div>

    </div>

  </div>

  <div className="
    bg-white
    border
    border-rose-200
    rounded-2xl
    p-5
    shadow-sm
  ">

    <div className="
      flex
      items-center
      justify-between
      gap-4
    ">

      <div>

        <p className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-400
        ">
          Saldo Pendiente
        </p>

        <h3 className="
          text-3xl
          font-bold
          text-rose-600
          mt-2
        ">
          $
          {
            tratamientos.reduce(
              (
                total,
                tratamiento
              ) =>
                total +
                Number(
                  tratamiento.pendiente || 0
                ),
              0
            )
          }
        </h3>

        <p className="
          text-sm
          text-slate-500
          mt-1
        ">
          Por cobrar
        </p>

      </div>

      <div className="
        w-12
        h-12
        rounded-2xl
        bg-rose-50
        flex
        items-center
        justify-center
        text-rose-600
        font-bold
        text-xl
      ">
        $
      </div>

    </div>

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
  onClick={() =>
    setMostrarModalTratamiento(
      true
    )
  }
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
                Doctor
              </th>

              <th className="p-4 text-left">
  Método
</th>

<th className="p-4 text-left">
  Moneda
</th>

<th className="p-4 text-left">
  Lab
</th>

<th className="p-4 text-left">
  Esp
</th>

<th className="p-4 text-left">
  Banco
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

<th className="p-4 text-left">
  Base Clínica
</th>

<th className="p-4 text-left">
  Comisión Dr
</th>

<th className="p-4 text-left">
  Utilidad Clínica
</th>

<th className="p-4 text-left">
  Notas
</th>

<th className="p-4 text-left">
  Acciones
</th>
            </tr>

          </thead>

          <tbody>

  {

    tratamientos.length === 0

    ?

    (

      <tr>

        <td
          colSpan={15}
          className="
            text-center
            p-10
            text-slate-400
          "
        >

          No hay tratamientos registrados

        </td>

      </tr>

    )

    :

    (

      tratamientos.map(

        (
          tratamiento,
          index
        ) => (

          <tr
            key={index}
            className="
              border-t
              border-slate-200
            "
          >

            <td className="
              p-4
            ">

              {
                tratamiento.fecha
              }

            </td>

            <td className="
  p-4
">

  {

    tratamiento.doctor ||

    "-"

  }

</td>

<td className="
  p-4
">

  {

    tratamiento.metodo_pago ||

    "-"

  }

</td>

<td className="
  p-4
">

  {

    tratamiento.moneda ||

    "-"

  }

</td>

<td className="
  p-4
">

  $

  {

    tratamiento.laboratorio ||

    0

  }

</td>

<td className="
  p-4
">

  $

  {

    tratamiento.especialista ||

    0

  }

</td>

<td className="
  p-4
">

  $

  {

    tratamiento.comision_banco ||

    0

  }

</td>



            <td className="
              p-4
            ">

              {
                tratamiento.tratamiento
              }

            </td>

            <td className="
              p-4
            ">

              $
              {
                tratamiento.total
              }

            </td>

            <td className="
              p-4
            ">

              $
              {
                tratamiento.pagado
              }

            </td>

            <td className="
              p-4
            ">

              $
              {
                tratamiento.pendiente
              }

            </td>
<td
  className="
    p-4
  "
>

  {
    tratamiento.estado ===
    "Finalizado"

      ? (

        <span
          className="
            bg-green-100
            text-green-700
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
          "
        >

          Finalizado

        </span>

      )

      : tratamiento.estado ===
        "En proceso"

        ? (

          <span
            className="
              bg-blue-100
              text-blue-700
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
            "
          >

            En proceso

          </span>

        )

        : tratamiento.estado ===
          "Confirmado"

          ? (

            <span
              className="
                bg-teal-100
                text-teal-700
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
              "
            >

              Confirmado

            </span>

          )

          : tratamiento.estado ===
            "Cancelado"

            ? (

              <span
                className="
                  bg-slate-200
                  text-slate-600
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                "
              >

                Cancelado

              </span>

            )

            : (

              <span
                className="
                  bg-yellow-100
                  text-yellow-700
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                "
              >

                Pendiente

              </span>

            )
  }

</td>

<td className="
  p-4
  font-semibold
  text-blue-600
">

  $

  {

    (

      Number(
        tratamiento.pagado || 0
      )

      -

      Number(
        tratamiento.laboratorio || 0
      )

      -

      Number(
        tratamiento.especialista || 0
      )

      -

      Number(
        tratamiento.comision_banco || 0
      )

    ).toLocaleString()

  }

</td>

<td className="
  p-4
  font-semibold
  text-orange-600
">

  $

  {

    (

      (

        Number(
          tratamiento.pagado || 0
        )

        -

        Number(
          tratamiento.laboratorio || 0
        )

        -

        Number(
          tratamiento.especialista || 0
        )

        -

        Number(
          tratamiento.comision_banco || 0
        )

      )

      *

      (

        Number(

          obtenerDoctor(
            tratamiento.doctor_id
          )?.porcentaje || 0

        )

        / 100

      )

    ).toLocaleString()

  }

</td>

<td className="
  p-4
  font-semibold
  text-green-600
">

  Próximamente

</td>

<td className="
  p-4
  max-w-[250px]
">

  {

    tratamiento.notas ||

    "-"

  }

</td>



<td className="
  p-4
">

  <div className="
    flex
    gap-2
  ">

    <select
  value={
    tratamiento.estado ||
    "Pendiente"
  }
  onChange={(e) =>
    actualizarEstadoTratamiento(
      tratamiento.id,
      e.target.value
    )
  }
  className="
    border
    border-slate-300
    rounded-lg
    px-2
    py-1
    text-sm
  "
>

  <option value="Pendiente">
    Pendiente
  </option>

  <option value="Confirmado">
    Confirmado
  </option>

  <option value="En proceso">
    En proceso
  </option>

  <option value="Finalizado">
    Finalizado
  </option>

  <option value="Cancelado">
    Cancelado
  </option>

</select>

    <button
      onClick={() => {

        setNuevoTratamiento(
          tratamiento
        );

        setEditandoIndex(
          index
        );

        setMostrarModalTratamiento(
          true
        );

      }}
      className="
        bg-blue-500
        hover:bg-blue-600
        text-white
        px-3
        py-1
        rounded-lg
        text-sm
      "
    >

      Editar

    </button>

    <button
  onClick={async () => {

    const tratamientoEliminar =
      tratamientos[index];

    if (
      tratamientoEliminar?.id
    ) {

      await supabase

        .from(
          "tratamientos"
        )

        .delete()

        .eq(
          "id",
          tratamientoEliminar.id
        );

    }

    setTratamientos(

      tratamientos.filter(
        (_,
        i) =>
          i !== index
      )

    );

  }}
  className="
    bg-red-500
    hover:bg-red-600
    text-white
    px-3
    py-1
    rounded-lg
    text-sm
  "
>

  Eliminar

</button>

  </div>

</td>

          </tr>

        )

      )

    )

  }

</tbody>

        </table>

      </div>

    <div
  className="
    bg-white
    border
    border-slate-200
    rounded-3xl
    p-5
  "
>

  <div
    className="
      flex
      items-center
      justify-between
      mb-5
    "
  >

    <div>

      <h3
        className="
          text-lg
          font-bold
          text-slate-800
        "
      >

        Evolución Clínica

      </h3>

      <p
        className="
          text-sm
          text-slate-500
          mt-1
        "
      >

        Historial de notas y observaciones clínicas del paciente.

      </p>

    </div>

  </div>

  <div
    className="
      grid
      gap-3
      mb-6
    "
  >

    <select
      value={
        doctorNotaId
      }
      onChange={(e) =>
        setDoctorNotaId(
          e.target.value
        )
      }
      className="
        border
        border-slate-300
        rounded-xl
        p-3
        w-full
      "
    >

      <option value="">

        Seleccionar Doctor

      </option>

      {
        doctores.map(
          (
            doctor: any
          ) => (

            <option
              key={
                doctor.id
              }
              value={
                doctor.id
              }
            >

              {doctor.nombre}

            </option>

          )
        )
      }

    </select>

    <textarea
      value={
        nuevaNotaClinica
      }
      onChange={(e) =>
        setNuevaNotaClinica(
          e.target.value
        )
      }
      placeholder="Agregar nueva nota clínica..."
      className="
        w-full
        border
        border-slate-300
        rounded-xl
        p-3
        min-h-[120px]
        resize-y
      "
    />

    <div
      className="
        flex
        justify-end
      "
    >

      <button
        type="button"
        onClick={
          guardarNotaClinica
        }
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

        Guardar Nota Clínica

      </button>

    </div>

  </div>

  <div
    className="
      border-t
      border-slate-200
      pt-5
    "
  >

    <h4
      className="
        font-bold
        text-slate-800
        mb-4
      "
    >

      Historial

    </h4>

    {

      notasClinicas.length === 0

        ? (

          <div
            className="
              bg-slate-50
              rounded-xl
              p-5
              text-sm
              text-slate-500
            "
          >

            No hay notas clínicas registradas.

          </div>

        )

        : (

          <div
            className="
              space-y-3
            "
          >

            {

              notasClinicas.map(
                (
                  nota: any
                ) => (

                  <div
                    key={
                      nota.id
                    }
                    className="
                      border
                      border-slate-200
                      rounded-2xl
                      p-4
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        mb-3
                      "
                    >

                      <span
                        className="
                          font-semibold
                          text-slate-800
                        "
                      >

                        {
                          nota.doctor_nombre
                        }

                      </span>

                      <span
                        className="
                          text-xs
                          text-slate-500
                        "
                      >

                        {
                          new Date(
                            nota.created_at
                          ).toLocaleString(
                            "es-MX"
                          )
                        }

                      </span>

                    </div>

                    <p
                      className="
                        text-sm
                        text-slate-700
                        whitespace-pre-wrap
                      "
                    >

                      {
                        nota.nota
                      }

                    </p>

                  </div>

                )
              )

            }

          </div>

        )

    }

  </div>

</div>

    </div>

  )
}

{
  mostrarModalTratamiento && (

    <div
      className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          p-6
          w-full
          max-w-xl
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            mb-2
          "
        >

          Nuevo Tratamiento

        </h2>

        <p
          className="
            text-sm
            text-slate-500
            mb-5
          "
        >

          Registra la información clínica del tratamiento.

        </p>

        <div
          className="
            grid
            gap-4
          "
        >

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >

              Fecha

            </label>

            <input
              type="date"
              value={
                nuevoTratamiento.fecha
              }
              onChange={(e) =>
                setNuevoTratamiento({
                  ...nuevoTratamiento,
                  fecha:
                    e.target.value,
                })
              }
              className="
                border
                rounded-xl
                p-3
                w-full
              "
            />

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >

              Tratamiento

            </label>

            <select
              value={
                nuevoTratamiento.tratamiento ||
                ""
              }
              onChange={(e) => {

                setNuevoTratamiento({

                  ...nuevoTratamiento,

                  tratamiento:
                    e.target.value,

                });

              }}
              className="
                border
                rounded-xl
                p-3
                w-full
              "
            >

              <option value="">

                Seleccionar Tratamiento

              </option>

              {
                catalogoTratamientos.map(
                  (
                    tratamiento: any
                  ) => (

                    <option
                      key={
                        tratamiento.id
                      }
                      value={
                        tratamiento.nombre
                      }
                    >

                      {
                        tratamiento.nombre
                      }

                    </option>

                  )
                )
              }

            </select>

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >

              Doctor

            </label>

            <select
              value={
                doctorSeleccionado?.id
                  ? String(
                      doctorSeleccionado.id
                    )
                  : ""
              }
              onChange={(e) => {

                const doctor =

                  doctores.find(
                    (d: any) =>
                      String(d.id) ===
                      e.target.value
                  );

                setDoctorSeleccionado(
                  doctor || null
                );

                setNuevoTratamiento({

                  ...nuevoTratamiento,

                  doctor:
                    doctor?.nombre ||
                    "",

                });

              }}
              className="
                border
                rounded-xl
                p-3
                w-full
              "
            >

              <option value="">

                Seleccionar Doctor

              </option>

              {
                doctores.map(
                  (
                    doctor: any
                  ) => (

                    <option
                      key={
                        doctor.id
                      }
                      value={
                        doctor.id
                      }
                    >

                      {doctor.nombre}

                    </option>

                  )
                )
              }

            </select>

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >

              Estado

            </label>

     <select
  value={
    nuevoTratamiento.estado ||
    "Pendiente"
  }
  onChange={(e) =>
    setNuevoTratamiento({

      ...nuevoTratamiento,

      estado:
        e.target.value,

    })
  }
  className="
    border
    rounded-xl
    p-3
    w-full
  "
  disabled
>

  <option value="Pendiente">

    Pendiente

  </option>

</select>

            <p
              className="
                text-xs
                text-slate-400
                mt-1
              "
            >

              El doctor podrá confirmar y actualizar el estado posteriormente.

            </p>

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >

              Notas clínicas iniciales

            </label>

            <textarea
              placeholder="Observaciones relevantes sobre el tratamiento..."
              value={
                nuevoTratamiento.notas
              }
              onChange={(e) =>
                setNuevoTratamiento({

                  ...nuevoTratamiento,

                  notas:
                    e.target.value,

                })
              }
              className="
                border
                rounded-xl
                p-3
                min-h-[120px]
                w-full
                resize-y
              "
            />

          </div>

        </div>

        <div
          className="
            flex
            justify-end
            gap-3
            mt-6
          "
        >

          <button
            type="button"
            onClick={() => {

              setMostrarModalTratamiento(
                false
              );

              setEditandoIndex(
                null
              );

              setDoctorSeleccionado(
                null
              );

            }}
            className="
              px-4
              py-2
              border
              rounded-xl
            "
          >

            Cancelar

          </button>

          <button
            type="button"
            onClick={
              guardarTratamiento
            }
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

            Guardar Tratamiento

          </button>

        </div>

      </div>

    </div>

  )
}

{
  mostrarModalCita && (

    <div className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
    ">

      <div className="
        bg-white
        rounded-3xl
        p-6
        w-full
        max-w-xl
      ">

        <h2 className="
          text-2xl
          font-bold
          mb-5
        ">

          Nueva Cita

        </h2>

       <div className="
  grid
  gap-4
">

  <input
    type="date"
    value={
      nuevaCita.fecha
    }
    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        fecha:
          e.target.value,
      })
    }
    className="
      border
      rounded-xl
      p-3
    "
  />

  <input
    type="time"
    value={
      nuevaCita.horaInicio
    }
    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        horaInicio:
          e.target.value,
      })
    }
    className="
      border
      rounded-xl
      p-3
    "
  />

  <input
    type="time"
    value={
      nuevaCita.horaFin
    }
    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        horaFin:
          e.target.value,
      })
    }
    className="
      border
      rounded-xl
      p-3
    "
  />

  <select

    value={
      nuevaCita.estado
    }

    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        estado:
          e.target.value,
      })
    }

    className="
      border
      rounded-xl
      p-3
    "

  >

    <option value="pendiente">
      Pendiente
    </option>

    <option value="confirmada">
      Confirmada
    </option>

    <option value="cancelada">
      Cancelada
    </option>

    <option value="tratamiento">
      Tratamiento
    </option>

  </select>

  <input

    value={
      nuevaCita.doctor
    }

    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        doctor:
          e.target.value,
      })
    }

    className="
      border
      rounded-xl
      p-3
    "

    placeholder="
      Doctor
    "

  />

</div>

        <button

          onClick={() =>
            setMostrarModalCita(
              false
            )
          }

          className="
            bg-red-500
            text-white
            px-4
            py-2
            rounded-xl
          "

        >

          Cancelar

        </button>

        <button

 onClick={
  guardarCitaPaciente
}

  className="
    bg-teal-600
    text-white
    px-4
    py-2
    rounded-xl
  "

>

  Guardar

</button>

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
      space-y-6
    ">

      <div className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        p-6
      ">

        <h3 className="
          text-2xl
          font-bold
          mb-6
          text-slate-800
        ">

          Historial Médico

        </h3>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        ">



          

          <div className="
            bg-slate-50
            rounded-2xl
            p-4
          ">
            <p className="text-sm text-slate-500">
              Fuma
            </p>
            <p className="font-bold">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.fuma

                  ? "Sí"

                  : "No"
              }
            </p>
          </div>

          <div className="
            bg-slate-50
            rounded-2xl
            p-4
          ">
            <p className="text-sm text-slate-500">
              Consume Alcohol
            </p>
            <p className="font-bold">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.alcohol

                  ? "Sí"

                  : "No"
              }
            </p>
          </div>

          <div className="
            bg-slate-50
            rounded-2xl
            p-4
          ">
            <p className="text-sm text-slate-500">
              Embarazo
            </p>
            <p className="font-bold">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.embarazo

                  ? "Sí"

                  : "No"
              }
            </p>
          </div>

          <div className="
            bg-slate-50
            rounded-2xl
            p-4
          ">
            <p className="text-sm text-slate-500">
              Consentimiento
            </p>
            <p className="font-bold">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.consentimiento

                  ? "Firmado"

                  : "No"
              }
            </p>
          </div>

        </div>

        <div className="
          mt-6
          space-y-4
        ">

          

          <div>
            <p className="
              text-sm
              text-slate-500
              mb-1
            ">
              Alergias
            </p>

            <div className="
              bg-slate-50
              rounded-2xl
              p-4
            ">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.alergias || "-"
              }
            </div>
          </div>

          <div>
            <p className="
              text-sm
              text-slate-500
              mb-1
            ">
              Enfermedades
            </p>

            <div className="
              bg-slate-50
              rounded-2xl
              p-4
            ">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.enfermedades || "-"
              }
            </div>
          </div>

          <div>
            <p className="
              text-sm
              text-slate-500
              mb-1
            ">
              Medicamentos
            </p>

            <div className="
              bg-slate-50
              rounded-2xl
              p-4
            ">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.medicamentos || "-"
              }
            </div>
          </div>

        </div>

      </div>

    </div>

  )
}

{
  tabActiva ===
  "citas" && (

    <div className="
      bg-white
      border
      border-slate-200
      rounded-3xl
      p-6
    ">

     <div className="
  flex
  justify-between
  items-center
  mb-6
">

  <h3 className="
    text-2xl
    font-bold
  ">

    Citas

  </h3>

  <button

    onClick={() => {

  console.log(
    "CLICK CITA"
  );

  setMostrarModalCita(
    true
  );

}}

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
            border-b
            border-slate-200
          ">

            <th className="p-3 text-left">
              Fecha
            </th>

            <th className="p-3 text-left">
              Hora
            </th>

            <th className="p-3 text-left">
              Estado
            </th>

            <th className="p-3 text-left">
              Doctor
            </th>

            <th className="p-3 text-left">
  Acciones
</th>

          </tr>

        </thead>

        <tbody>

          {

            citas.length === 0

              ? (

                <tr>

                  <td
                    colSpan={4}
                    className="
                      p-6
                      text-center
                      text-slate-500
                    "
                  >

                    No hay citas registradas

                  </td>

                </tr>

              )

              : citas.map(
                (cita: any) => (

                  <tr
                    key={cita.id}
                    className="
                      border-b
                      border-slate-100
                    "
                  >

                    <td className="p-3">

                      {
                        new Date(
  cita.inicio
).toLocaleDateString(
  "es-MX"
)
                      }

                    </td>

                    <td className="p-3">

                      {
                        new Date(
                          cita.inicio
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      }

                    </td>

                    <td className="p-3">

                      {cita.estado}

                    </td>

                    <td className="p-3">

                      {cita.doctor}

                    </td>

                    <td className="p-3">

  <div className="
    flex
    gap-2
  ">

    <button

      onClick={() =>
        editarCita(
          cita
        )
      }

      className="
        bg-blue-500
        hover:bg-blue-600
        text-white
        px-3
        py-1
        rounded-lg
        text-sm
      "

    >

      Editar

    </button>

    <button

      onClick={() =>
        eliminarCita(
          cita.id
        )
      }

      className="
        bg-red-500
        hover:bg-red-600
        text-white
        px-3
        py-1
        rounded-lg
        text-sm
      "

    >

      Eliminar

    </button>

  </div>

</td>

                  </tr>

                )
              )

          }

        </tbody>

      </table>

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
              bg-white
              rounded-3xl
              shadow-xl
              p-6
              overflow-y-auto
            ">

              <div className="
                max-w-5xl
                mx-auto
              ">

                <div className="
                  mb-8
                ">

                  <p className="
                    text-sm
                    font-semibold
                    text-teal-600
                    mb-2
                  ">
                    PACIENTES
                  </p>

                  <h2 className="
                    text-3xl
                    font-bold
                    text-slate-800
                  ">
                    Expedientes de Pacientes
                  </h2>

                  <p className="
                    text-slate-500
                    mt-3
                    max-w-2xl
                  ">
                    Selecciona un paciente de la lista
                    para consultar su información clínica,
                    tratamientos, citas e historial.
                  </p>

                </div>

                <div className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-4
                  mb-8
                ">

                  <div className="
                    bg-slate-50
                    border
                    border-slate-200
                    rounded-2xl
                    p-5
                  ">

                    <p className="
                      text-sm
                      text-slate-500
                    ">
                      Pacientes registrados
                    </p>

                    <p className="
                      text-3xl
                      font-bold
                      text-slate-800
                      mt-2
                    ">
                      {pacientes.length}
                    </p>

                  </div>

                  <div className="
                    bg-slate-50
                    border
                    border-slate-200
                    rounded-2xl
                    p-5
                  ">

                    <p className="
                      text-sm
                      text-slate-500
                    ">
                      Expedientes
                    </p>

                    <p className="
                      text-lg
                      font-bold
                      text-teal-700
                      mt-2
                    ">
                      Acceso rápido
                    </p>

                  </div>

                  <div className="
                    bg-slate-50
                    border
                    border-slate-200
                    rounded-2xl
                    p-5
                  ">

                    <p className="
                      text-sm
                      text-slate-500
                    ">
                      Nuevo paciente
                    </p>

                    <p className="
                      text-lg
                      font-bold
                      text-slate-800
                      mt-2
                    ">
                      Registro digital
                    </p>

                  </div>

                </div>

                <div className="
                  grid
                  grid-cols-1
                  xl:grid-cols-2
                  gap-6
                ">

                  <div className="
                    border
                    border-slate-200
                    rounded-3xl
                    p-6
                  ">

                    <h3 className="
                      text-xl
                      font-bold
                      text-slate-800
                    ">
                      Consulta un expediente
                    </h3>

                    <p className="
                      text-sm
                      text-slate-500
                      mt-3
                    ">
                      Utiliza el buscador o selecciona
                      un paciente de la columna izquierda
                      para abrir su expediente completo.
                    </p>

                  </div>

                  <div className="
                    border
                    border-slate-200
                    rounded-3xl
                    p-6
                  ">

                    <p className="
                      text-xs
                      font-semibold
                      text-teal-600
                      mb-2
                    ">
                      REGISTRO DE PACIENTES
                    </p>

                    <h3 className="
                      text-xl
                      font-bold
                      text-slate-800
                    ">
                      Formulario mediante QR
                    </h3>

                    <p className="
                      text-sm
                      text-slate-500
                      mt-2
                    ">
                      El paciente puede escanear el
                      código y completar su información
                      desde su teléfono.
                    </p>

                    <div className="
                      max-w-[260px]
                      mx-auto
                      mt-6
                    ">

                      <QRCodePaciente />

                    </div>

                    <a
                      href="/#/registro-paciente"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        block
                        mt-5
                        w-full
                        bg-teal-600
                        hover:bg-teal-700
                        text-white
                        py-3
                        rounded-xl
                        font-semibold
                        text-sm
                        text-center
                      "
                    >
                      Abrir formulario de registro
                    </a>

                  </div>

                </div>

              </div>

            </div>

          )

        }

      </div>

    </div>

  );

}