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
  setNuevoTratamiento] =
  useState({
    fecha: "",
    tratamiento: "",
    doctor: "",
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

  const nuevo = {

    ...nuevoTratamiento,

    pendiente:

      Number(
        nuevoTratamiento.total || 0
      ) -

      Number(
        nuevoTratamiento.pagado || 0
      ),

  };

  if (
  pacienteAbierto?.id
) {

  if (
    editandoIndex !== null
  ) {

    const tratamientoEditar =
      tratamientos[
        editandoIndex
      ];

    await supabase

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

  metodo_pago:
  nuevo.metodo_pago,

  moneda:
  nuevo.moneda,

  laboratorio:
  Number(
    nuevo.laboratorio || 0
  ),

especialista:
  Number(
    nuevo.especialista || 0
  ),

comision_banco:
  Number(
    nuevo.comision_banco || 0
  ),

        total:
          Number(
            nuevo.total
          ),

        pago:
          Number(
            nuevo.pagado
          ),

        resta:
          Number(
            nuevo.pendiente
          ),

        pendiente:
          Number(
            nuevo.pendiente
          ) > 0,

      })

      .eq(
        "id",
        tratamientoEditar.id
      );

  }

  else {

    await supabase

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

          metodo_pago:
  nuevo.metodo_pago,

  moneda:
  nuevo.moneda,

  laboratorio:
  Number(
    nuevo.laboratorio || 0
  ),

especialista:
  Number(
    nuevo.especialista || 0
  ),

comision_banco:
  Number(
    nuevo.comision_banco || 0
  ),

        total:
          Number(
            nuevo.total
          ),

        pago:
          Number(
            nuevo.pagado
          ),

        resta:
          Number(
            nuevo.pendiente
          ),

        pendiente:
          Number(
            nuevo.pendiente
          ) > 0,

      });

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
    ] = nuevo;

    setTratamientos(
      copia
    );

  }

  else {

    setTratamientos([
      ...tratamientos,
      nuevo,
    ]);

  }

  setNuevoTratamiento({
  fecha: "",
  tratamiento: "",
  doctor: "",
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
    "",
})
          )

        );

      }

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
    Próxima cita:
  </span>

  {" "}

  {

    proximaCita

      ?

      `${new Date(
        proximaCita.inicio
      ).toLocaleDateString(
        "es-MX"
      )}`

      :

      "Sin citas"

  }

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
            {tratamientos.length}
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
  Utilidad
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

            <td className="
  p-4
">

  {

    Number(
      tratamiento.pendiente
    ) === 0

    ?

    (

      <span className="
        bg-green-100
        text-green-700
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
      ">

        Pagado

      </span>

    )

    :

    Number(
      tratamiento.pagado
    ) > 0

    ?

    (

      <span className="
        bg-yellow-100
        text-yellow-700
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
      ">

        Parcial

      </span>

    )

    :

    (

      <span className="
        bg-red-100
        text-red-700
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
      ">

        Pendiente

      </span>

    )

  }

</td>

<td className="
  p-4
  font-semibold
  text-green-600
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
  mostrarModalTratamiento && (

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

          Nuevo Tratamiento

        </h2>

        <div className="
          grid
          gap-4
        ">

          <input
  type="date"
  value={
    nuevoTratamiento.fecha
  }
  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      fecha: e.target.value,
    })
  }
  className="
    border
    rounded-xl
    p-3
  "
/>

          <input
  placeholder="Tratamiento"
  value={
    nuevoTratamiento.tratamiento
  }
  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      tratamiento:
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
    nuevoTratamiento.doctor || ""
  }

  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      doctor:
        e.target.value,
    })
  }

  className="
    border
    rounded-xl
    p-3
  "
>

  <option value="">

    Seleccionar Doctor

  </option>

  <option value="Dr. García">

    Dr. García

  </option>

  <option value="Dr. López">

    Dr. López

  </option>

  <option value="Dr. Martínez">

    Dr. Martínez

  </option>

</select>

<select

  value={
    nuevoTratamiento.metodo_pago || ""
  }

  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      metodo_pago:
        e.target.value,
    })
  }

  className="
    border
    rounded-xl
    p-3
  "
>

  <option value="">

    Método de Pago

  </option>

  <option value="Efectivo">

    Efectivo

  </option>

  <option value="Tarjeta">

    Tarjeta

  </option>

  <option value="Transferencia">

    Transferencia

  </option>

  <option value="Cheque">

    Cheque

  </option>

</select>

<select

  value={
    nuevoTratamiento.moneda || ""
  }

  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      moneda:
        e.target.value,
    })
  }

  className="
    border
    rounded-xl
    p-3
  "
>

  <option value="">

    Moneda

  </option>

  <option value="MXN">

    MXN

  </option>

  <option value="USD">

    USD

  </option>

</select>

<input

  type="number"

  placeholder="Costo Laboratorio"

  value={
    nuevoTratamiento.laboratorio || ""
  }

  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      laboratorio:
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

  type="number"

  placeholder="Costo Especialista"

  value={
    nuevoTratamiento.especialista || ""
  }

  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      especialista:
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

  type="number"

  placeholder="Comisión Banco"

  value={
    nuevoTratamiento.comision_banco || ""
  }

  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      comision_banco:
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
  placeholder="Costo Total"
  value={
    nuevoTratamiento.total
  }
  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      total: e.target.value,
    })
  }
  className="
    border
    rounded-xl
    p-3
  "
/>

         <input
  placeholder="Pagado"
  value={
    nuevoTratamiento.pagado
  }
  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      pagado: e.target.value,
    })
  }
  className="
    border
    rounded-xl
    p-3
  "
/>

          <textarea
  placeholder="Notas"
  value={
    nuevoTratamiento.notas
  }
  onChange={(e) =>
    setNuevoTratamiento({
      ...nuevoTratamiento,
      notas: e.target.value,
    })
  }
  className="
    border
    rounded-xl
    p-3
    min-h-[120px]
  "
/>

        </div>

        <div className="
          flex
          justify-end
          gap-3
          mt-6
        ">

          <button
            onClick={() =>
              setMostrarModalTratamiento(
                false
              )
            }
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
  onClick={
    guardarTratamiento
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