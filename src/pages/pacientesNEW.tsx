import { useEffect, useState } from "react";

import jsPDF from "jspdf";

import * as htmlToImage from "html-to-image";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import { useLanguage } from "../context/LanguageContext";

import { registrarBitacora } from "../lib/registrarBitacora";

import Odontograma from "../components/Odontograma";

import QRCodePaciente from "../components/QRCodePaciente";

interface ZonaDiente {

  oclusal?: string[];

  vestibular?: string[];

  distal?: string[];

  mesial?: string[];

}

type HistorialMedicoCambio = {
  id: number;
  paciente_id: number;
  usuario_id: string;
  alergias?: string | null;
  enfermedades?: string | null;
  medicamentos?: string | null;
  historial_clinico?: any;
  created_at: string;
  usuario_nombre?: string | null;
};

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

  const { permisos } = useAuth();

  const { language } = useLanguage();

  const es = language === "es";

  function textoEstado(valor: any) {
    const estado = String(valor || "").toLowerCase();

    if (estado === "pendiente") return es ? "Pendiente" : "Pending";
    if (estado === "confirmado" || estado === "confirmada") return es ? "Confirmado" : "Confirmed";
    if (estado === "completado" || estado === "completada") return es ? "Completado" : "Completed";
    if (estado === "cancelado" || estado === "cancelada") return es ? "Cancelado" : "Cancelled";
    if (estado === "tratamiento") return es ? "Tratamiento" : "Treatment";

    return valor || "-";
  }

  const puedeRegistrarCobros =
    permisos?.registrar_cobros === true;

  const puedeAplicarDescuentos =
    (
      permisos as
        | Record<string, boolean>
        | null
        | undefined
    )?.aplicar_descuentos === true;

  const puedeAnularTratamientos =
    permisos?.anular_tratamientos === true;

  const puedeEditarPacientes =
    permisos?.editar_pacientes === true;

  const puedeEditarCitas =
    permisos?.editar_citas === true;

  const puedeAgregarNotasClinicas =
    permisos?.agregar_notas_clinicas === true;

  const puedeCrearTratamientos =
    permisos?.crear_tratamientos === true;

  const puedeCambiarEstadoTratamientos =
    permisos?.cambiar_estado_tratamientos === true;

  const [busqueda,
    setBusqueda] =
    useState("");

  const [
    busquedaTelefono,
    setBusquedaTelefono,
  ] = useState("");

    const [
  mostrarQR,
  setMostrarQR,
] = useState(false);

  const [
    pacientesNuevosMes,
    setPacientesNuevosMes,
  ] = useState(0);

  const [
    pacientesConSaldo,
    setPacientesConSaldo,
  ] = useState(0);

  const [
    tratamientosPendientesGlobal,
    setTratamientosPendientesGlobal,
  ] = useState(0);

  const [pacientes,
    setPacientes] =
    useState<Paciente[]>([]);

  const [pacienteAbierto,
    setPacienteAbierto] =
    useState<Paciente | null>(null);

  const [
    mostrarEditarPaciente,
    setMostrarEditarPaciente,
  ] = useState(false);

  const [
    datosPacienteEditando,
    setDatosPacienteEditando,
  ] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    edad: "",
    sexo: "",
    direccion: "",
  });

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

const [
  historialMedicoCambios,
  setHistorialMedicoCambios,
] = useState<HistorialMedicoCambio[]>([]);

const [
  cargandoHistorialMedico,
  setCargandoHistorialMedico,
] = useState(false);

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

  fecha:
    new Date().toLocaleDateString(
      "en-CA"
    ),

  tratamiento: "",

  doctor: "",

  estado: "Pendiente",

  metodo_pago: "",

  moneda: "",

  moneda_precio: "MXN" as "MXN" | "USD",

  laboratorio: "",

  especialista: "",

  especialista_id: "",

  especialista_nombre: "",

  moneda_especialista: "MXN" as "MXN" | "USD",

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
  especialistasDisponibles,
  setEspecialistasDisponibles,
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

const [
  notaCorrigiendoId,
  setNotaCorrigiendoId,
] = useState<number | null>(null);

const [
  textoCorreccionNota,
  setTextoCorreccionNota,
] = useState("");

const [
  doctorCorreccionId,
  setDoctorCorreccionId,
] = useState("");

const [
  mostrarModalCobro,
  setMostrarModalCobro,
] = useState(false);

const [
  tratamientoCobro,
  setTratamientoCobro,
] = useState<any>(null);

const [
  nuevoCobro,
  setNuevoCobro,
] = useState({
  metodo_pago: "",
  moneda: "MXN",
  monto: "",
  laboratorio: "",
  especialista: "",
  comision_banco: "",
});

const [
  tipoDescuentoCobro,
  setTipoDescuentoCobro,
] = useState<"monto" | "porcentaje">(
  "monto"
);

const [
  valorDescuentoCobro,
  setValorDescuentoCobro,
] = useState("");

const [
  configuracionPagosCobro,
  setConfiguracionPagosCobro,
] = useState<any[]>([]);

const [
  tipoCambioCobro,
  setTipoCambioCobro,
] = useState(0);
    
useEffect(() => {

  cargarPacientes();

  cargarDoctores();

  cargarCatalogoTratamientos();

  cargarTipoCambio();

  cargarResumenPacientes();

}, []);

useEffect(() => {

  let activo = true;

  async function cargarTarifarioEspecialistas() {

    if (!mostrarModalTratamiento) {
      if (activo) {
        setEspecialistasDisponibles([]);
      }
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        "especialista_tratamientos"
      )
      .select(
        "id, doctor_id, tratamiento_id, nombre_tratamiento, costo, moneda, activo"
      )
      .eq(
        "activo",
        true
      )
      .order(
        "nombre_tratamiento",
        { ascending: true }
      );

    if (!activo) {
      return;
    }

    if (error) {

      console.error(
        "Error cargando tratamientos de especialistas:",
        error
      );

      setEspecialistasDisponibles([]);
      return;
    }

    setEspecialistasDisponibles(
      data || []
    );

  }

  cargarTarifarioEspecialistas();

  return () => {
    activo = false;
  };

}, [mostrarModalTratamiento]);

async function cargarTipoCambio() {

  const {
    data,
    error,
  } = await supabase
    .from(
      "configuracion_finanzas"
    )
    .select("valor")
    .eq(
      "clave",
      "tipo_cambio_usd_mxn"
    )
    .maybeSingle();

  if (error) {

    console.error(
      "Error cargando tipo de cambio:",
      error
    );

    return;

  }

  setTipoCambioCobro(
    Number(
      data?.valor || 0
    )
  );

}

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

  async function cargarResumenPacientes() {

    const ahora =
      new Date();

    const inicioMes =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        1
      ).toISOString();

    const [
      pacientesMesResponse,
      tratamientosResponse,
    ] = await Promise.all([

      supabase
        .from("pacientes")
        .select(
          "*",
          {
            count: "exact",
            head: true,
          }
        )
        .gte(
          "created_at",
          inicioMes
        ),

      supabase
        .from("tratamientos")
        .select(
          "paciente_id, resta, pendiente"
        ),

    ]);

    setPacientesNuevosMes(
      pacientesMesResponse.count || 0
    );

    const tratamientosActivos =
      (
        tratamientosResponse.data || []
      ).filter(
        (tratamiento: any) =>
          Number(
            tratamiento.resta || 0
          ) > 0 ||
          tratamiento.pendiente === true
      );

    setTratamientosPendientesGlobal(
      tratamientosActivos.length
    );

    const pacientesConSaldoIds =
      new Set(
        tratamientosActivos
          .filter(
            (tratamiento: any) =>
              Number(
                tratamiento.resta || 0
              ) > 0
          )
          .map(
            (tratamiento: any) =>
              tratamiento.paciente_id
          )
          .filter(Boolean)
      );

    setPacientesConSaldo(
      pacientesConSaldoIds.size
    );

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
    !puedeAgregarNotasClinicas
  ) {

    return;

  }

  if (
    !pacienteAbierto?.id
  ) {

    return;

  }

  if (
    !nuevaNotaClinica.trim()
  ) {

    alert(
      es ? "Escribe una nota clínica." : "Write a clinical note."
    );

    return;

  }

  if (
    !doctorNotaId
  ) {

    alert(
      es ? "Selecciona un doctor." : "Select a doctor."
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
      es ? "Error guardando nota clínica." : "Error saving clinical note."
    );

    return;

  }

  await registrarBitacora({
    accion: "Agregar nota clínica",
    modulo: "Pacientes",
    detalle:
      `Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre} | Doctor: ${doctor.nombre}`,
  });

  setNuevaNotaClinica("");

  setDoctorNotaId("");

  await cargarNotasClinicas(
    pacienteAbierto.id
  );

}

async function guardarCorreccionNotaClinica(
  notaOriginalId: number
) {

  if (!puedeAgregarNotasClinicas) {
    return;
  }

  if (!pacienteAbierto?.id) {
    return;
  }

  if (!textoCorreccionNota.trim()) {
    alert(es ? "Escribe la corrección clínica." : "Write the clinical correction.");
    return;
  }

  if (!doctorCorreccionId) {
    alert(es ? "Selecciona un doctor." : "Select a doctor.");
    return;
  }

  const doctor = doctores.find(
    (d: any) =>
      String(d.id) === doctorCorreccionId
  );

  if (!doctor) {
    return;
  }

  const { error } = await supabase
    .from("notas_clinicas")
    .insert({
      paciente_id: pacienteAbierto.id,
      tratamiento_id: null,
      doctor_id: doctor.id,
      doctor_nombre: doctor.nombre,
      nota: textoCorreccionNota.trim(),
      tipo: "correccion",
      nota_original_id: notaOriginalId,
    });

  if (error) {
    console.error(
      "Error guardando corrección clínica:",
      error
    );
    alert(
      es ? "Error guardando corrección clínica." : "Error saving clinical correction."
    );
    return;
  }

  await registrarBitacora({
    accion: "Registrar corrección clínica",
    modulo: "Pacientes",
    detalle:
      `Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre} | Nota original ID: ${notaOriginalId} | Doctor: ${doctor.nombre}`,
  });

  setNotaCorrigiendoId(null);
  setTextoCorreccionNota("");
  setDoctorCorreccionId("");

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
      es ? "¿Eliminar esta cita?" : "Delete this appointment?"
    );

  if (!confirmar)
    return;

  const {
    error,
  } = await supabase

    .from("citas")

    .delete()

    .eq(
      "id",
      citaId
    );

  if (error) {

    console.error(
      "Error eliminando cita:",
      error
    );

    return;

  }

  await registrarBitacora({
    accion: "Eliminar cita",
    modulo: "Pacientes",
    detalle:
      `Cita ID: ${citaId} | Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre}`,
  });

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

  const {
    error,
  } = await supabase

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

  if (error) {
    console.error(
      "Error actualizando cita:",
      error
    );
    return;
  }

  await registrarBitacora({
    accion: "Editar cita",
    modulo: "Pacientes",
    detalle:
      `Cita ID: ${citaEditando} | Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre} | Inicio: ${inicio.toISOString()} | Fin: ${fin.toISOString()}`,
  });

}

else {

  const {
    data,
    error,
  } = await supabase

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

    ])
    .select("id")
    .single();

  if (error) {
    console.error(
      "Error creando cita:",
      error
    );
    return;
  }

  await registrarBitacora({
    accion: "Crear cita",
    modulo: "Pacientes",
    detalle:
      `Cita ID: ${data?.id || "-"} | Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre} | Inicio: ${inicio.toISOString()} | Fin: ${fin.toISOString()}`,
  });

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
        es ? "Error subiendo imagen" : "Error uploading image"
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

    await registrarBitacora({
      accion: "Subir radiografía",
      modulo: "Pacientes",
      detalle:
        `Paciente ID: ${pacienteAbierto?.id || "-"} | Paciente: ${pacienteAbierto?.nombre || "-"} | Archivo: ${archivo.name}`,
    });

    alert(
      es ? "Radiografía subida" : "X-ray uploaded"
    );

  }

  async function guardarExpediente() {

    if (!pacienteAbierto?.id)
      return;

const {
  data,
  error,
} =
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
    )
    .select(
      "id, observaciones_dientes"
    )
    .single();

console.log(
  "ODONTOGRAMA GUARDADO:",
  data
);

console.log(
  "ERROR ODONTOGRAMA:",
  error
);

    if (error) {

      alert(
        es ? "Error guardando expediente" : "Error saving patient record"
      );

      return;

    }

    await registrarBitacora({
      accion: "Guardar expediente clínico",
      modulo: "Pacientes",
      detalle:
        `Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre}`,
    });

    alert(
      es ? "Expediente guardado" : "Patient record saved"
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
        es ? "Error generando PDF" : "Error generating PDF"
      );

    }

  }
async function abrirModalCobro(

  tratamiento: any

) {

  const {

    data: configuracionPagosData,

    error: errorConfiguracionPagos,

  } = await supabase

    .from(
      "configuracion_pagos"
    )

    .select("*")

    .eq(
      "activo",
      true
    );

  if (
    errorConfiguracionPagos
  ) {

    console.error(
      "Error cargando configuración de pagos:",
      errorConfiguracionPagos
    );

  } else {

    setConfiguracionPagosCobro(
      configuracionPagosData ||
      []
    );

  }

  const {

    data: tipoCambioData,

    error: errorTipoCambio,

  } = await supabase

    .from(
      "configuracion_finanzas"
    )

    .select("valor")

    .eq(
      "clave",
      "tipo_cambio_usd_mxn"
    )

    .maybeSingle();

  const tipoCambioActual =
    Number(
      tipoCambioData?.valor || 0
    );

  if (
    errorTipoCambio
  ) {

    console.error(
      "Error cargando tipo de cambio:",
      errorTipoCambio
    );

  } else {

    setTipoCambioCobro(
      tipoCambioActual
    );

  }

  const monedaInicial =
    tratamiento.moneda_precio ||
    tratamiento.moneda ||
    "MXN";

  const montoInicial =
    String(
      Math.max(
        Number(
          tratamiento.resta_original ??
          (
            Number(
              tratamiento.total_original ??
              tratamiento.total ??
              0
            ) -
            Number(
              tratamiento.pagado_original ??
              tratamiento.pagado ??
              0
            )
          )
        ),
        0
      )
    );

  setTipoDescuentoCobro(
    "monto"
  );

  setValorDescuentoCobro(
    ""
  );

  setTratamientoCobro(
    tratamiento
  );

  setNuevoCobro({

    metodo_pago:
      tratamiento.metodo_pago ||
      "",

    moneda:
      monedaInicial,

    monto:
      montoInicial,

    laboratorio:
      String(
        tratamiento.laboratorio ||
        ""
      ),

    especialista:
      String(
        tratamiento.especialista ||
        ""
      ),

    comision_banco:
      String(
        tratamiento.comision_banco ||
        ""
      ),

  });

  setMostrarModalCobro(
    true
  );

}

const monedaPrecioCobro =
  tratamientoCobro?.moneda_precio ||
  "MXN";

const totalOriginalCobro =
  Number(
    tratamientoCobro?.total_original ??
    tratamientoCobro?.total ??
    0
  );

const pagadoOriginalCobro =
  Number(
    tratamientoCobro?.pagado_original ??
    tratamientoCobro?.pagado ??
    0
  );

const pendienteOriginalCobro =
  Math.max(
    Number(
      tratamientoCobro?.resta_original ??
      totalOriginalCobro -
        pagadoOriginalCobro
    ),
    0
  );

const valorDescuentoCobroSeguro =
  Math.max(
    Number(
      valorDescuentoCobro || 0
    ),
    0
  );

const descuentoOriginalCobro =
  Math.min(
    tipoDescuentoCobro ===
    "porcentaje"
      ? totalOriginalCobro *
        Math.min(
          valorDescuentoCobroSeguro,
          100
        ) /
        100
      : valorDescuentoCobroSeguro,
    pendienteOriginalCobro
  );

const totalOriginalDespuesDescuentoCobro =
  Math.max(
    totalOriginalCobro -
      descuentoOriginalCobro,
    pagadoOriginalCobro
  );

const configuracionPagoSeleccionada =
  configuracionPagosCobro.find(
    (configuracion: any) =>
      configuracion.metodo ===
      nuevoCobro.metodo_pago
  );

const montoCobroActual =
  Number(
    nuevoCobro.monto || 0
  );

const montoCobroActualMXN =
  nuevoCobro.moneda === "USD"
    ? montoCobroActual *
      tipoCambioCobro
    : montoCobroActual;

const porcentajeComisionActual =
  configuracionPagoSeleccionada
    ?.aplica_comision
      ? Number(
          configuracionPagoSeleccionada
            .comision_porcentaje || 0
        )
      : 0;

const porcentajeIvaComisionActual =
  configuracionPagoSeleccionada
    ?.aplica_comision
      ? Number(
          configuracionPagoSeleccionada
            .iva_comision_porcentaje || 0
        )
      : 0;

const comisionBaseActual =
  montoCobroActualMXN *
  (
    porcentajeComisionActual /
    100
  );

const ivaComisionActual =
  comisionBaseActual *
  (
    porcentajeIvaComisionActual /
    100
  );

const comisionBancoActual =
  comisionBaseActual +
  ivaComisionActual;

const netoCobroActual =
  montoCobroActualMXN -
  comisionBancoActual;
async function registrarCobro(
  modo: "cobro" | "descuento"
) {

  if (
    !tratamientoCobro?.id ||
    !pacienteAbierto?.id
  ) {
    return;
  }

  if (
    modo === "descuento" &&
    !puedeAplicarDescuentos
  ) {
    alert(
      es ? "No tienes permiso para aplicar descuentos." : "You do not have permission to apply discounts."
    );
    return;
  }

  const montoCobro =
    modo === "cobro"
      ? Number(
          nuevoCobro.monto || 0
        )
      : 0;

  const monedaPrecioTratamiento =
    tratamientoCobro.moneda_precio ||
    "MXN";

  const totalOriginalActual =
    Number(
      tratamientoCobro.total_original ??
      tratamientoCobro.total ??
      0
    );

  const pagadoOriginalAnterior =
    Number(
      tratamientoCobro.pagado_original ??
      0
    );

  const pendienteOriginalAnterior =
    Math.max(
      Number(
        tratamientoCobro.resta_original ??
        totalOriginalActual -
          pagadoOriginalAnterior
      ),
      0
    );

  const valorDescuento =
    Math.max(
      Number(
        valorDescuentoCobro || 0
      ),
      0
    );

  const descuentoOriginalAplicar =
    modo === "descuento"
      ? Math.min(
          tipoDescuentoCobro ===
          "porcentaje"
            ? totalOriginalActual *
              Math.min(
                valorDescuento,
                100
              ) /
              100
            : valorDescuento,
          pendienteOriginalAnterior
        )
      : 0;

  if (
    modo === "cobro" &&
    montoCobro <= 0
  ) {

    alert(
      es ? "Ingresa un monto de cobro válido." : "Enter a valid payment amount."
    );

    return;
  }

  if (
    modo === "descuento" &&
    descuentoOriginalAplicar <= 0
  ) {

    alert(
      es ? "Ingresa un descuento válido." : "Enter a valid discount."
    );

    return;
  }

  const tipoCambioAplicado =
    nuevoCobro.moneda === "USD"
      ? tipoCambioCobro
      : 1;

  if (
    montoCobro > 0 &&
    nuevoCobro.moneda === "USD" &&
    tipoCambioAplicado <= 0
  ) {

    alert(
      "No hay un tipo de cambio válido configurado."
    );

    return;
  }

  if (
    monedaPrecioTratamiento === "USD" &&
    tipoCambioCobro <= 0
  ) {

    alert(
      "No hay un tipo de cambio válido configurado."
    );

    return;
  }

  if (
    montoCobro > 0 &&
    !nuevoCobro.metodo_pago
  ) {

    alert(
      es ? "Selecciona un método de pago." : "Select a payment method."
    );

    return;
  }

  if (
    montoCobro > 0 &&
    !nuevoCobro.moneda
  ) {

    alert(
      es ? "Selecciona una moneda." : "Select a currency."
    );

    return;
  }

  const montoCobroMXN =
    montoCobro > 0
      ? nuevoCobro.moneda === "USD"
        ? montoCobro *
          tipoCambioAplicado
        : montoCobro
      : 0;

  const totalTratamientoActual =
    Number(
      tratamientoCobro.total || 0
    );

  const pagadoAnterior =
    Number(
      tratamientoCobro.pagado || 0
    );

  const descuentoMXNAplicar =
    totalOriginalActual > 0
      ? Math.min(
          totalTratamientoActual *
            (
              descuentoOriginalAplicar /
              totalOriginalActual
            ),
          Math.max(
            totalTratamientoActual -
              pagadoAnterior,
            0
          )
        )
      : 0;

  const nuevoTotalOriginalTratamiento =
    Number(
      Math.max(
        totalOriginalActual -
          descuentoOriginalAplicar,
        pagadoOriginalAnterior
      ).toFixed(2)
    );

  const nuevoTotalTratamiento =
    Number(
      Math.max(
        totalTratamientoActual -
          descuentoMXNAplicar,
        pagadoAnterior
      ).toFixed(2)
    );

  const montoAplicadoOriginal =
    montoCobro > 0
      ? monedaPrecioTratamiento === "USD"
        ? nuevoCobro.moneda === "USD"
          ? montoCobro
          : montoCobro /
            tipoCambioCobro
        : montoCobroMXN
      : 0;

  const nuevoPagadoOriginalSinAjuste =
    pagadoOriginalAnterior +
    montoAplicadoOriginal;

  const toleranciaOriginal =
    monedaPrecioTratamiento === "USD"
      ? 0.05
      : 0.50;

  const diferenciaExcedenteOriginal =
    nuevoPagadoOriginalSinAjuste -
    nuevoTotalOriginalTratamiento;

  if (
    nuevoTotalOriginalTratamiento > 0 &&
    diferenciaExcedenteOriginal >
      toleranciaOriginal
  ) {

    alert(
      es ? "El cobro supera el saldo pendiente después de aplicar el descuento." : "The payment exceeds the remaining balance after the discount."
    );

    return;
  }

  const nuevoPagadoOriginal =
    nuevoTotalOriginalTratamiento > 0 &&
    nuevoPagadoOriginalSinAjuste >
      nuevoTotalOriginalTratamiento
      ? nuevoTotalOriginalTratamiento
      : nuevoPagadoOriginalSinAjuste;

  const nuevoPendienteOriginal =
    Math.max(
      nuevoTotalOriginalTratamiento -
        nuevoPagadoOriginal,
      0
    );

  const nuevoTotalPagado =
    Math.min(
      pagadoAnterior +
        montoCobroMXN,
      nuevoTotalTratamiento
    );

  const nuevoPendiente =
    Math.max(
      nuevoTotalTratamiento -
        nuevoTotalPagado,
      0
    );

  const totalAntesDescuento =
    Number(
      tratamientoCobro.total_antes_descuento ??
      totalTratamientoActual
    );

  const totalOriginalAntesDescuento =
    Number(
      tratamientoCobro
        .total_original_antes_descuento ??
      totalOriginalActual
    );

  const descuentoAnterior =
    Number(
      tratamientoCobro.descuento || 0
    );

  const descuentoOriginalAnterior =
    Number(
      tratamientoCobro.descuento_original || 0
    );

  const nuevoDescuento =
    Number(
      (
        descuentoAnterior +
        descuentoMXNAplicar
      ).toFixed(2)
    );

  const nuevoDescuentoOriginal =
    Number(
      (
        descuentoOriginalAnterior +
        descuentoOriginalAplicar
      ).toFixed(2)
    );

  const comisionBancoCobro =
    montoCobro > 0
      ? comisionBancoActual
      : 0;

  const comisionBancoAnterior =
    Number(
      tratamientoCobro
        .comision_banco || 0
    );

  const nuevaComisionBanco =
    comisionBancoAnterior +
    comisionBancoCobro;

  const doctorCobro =
    doctores.find(
      (doctor: any) =>
        doctor.id ===
        tratamientoCobro.doctor_id
    );

  const porcentajeDoctorCobro =
    Number(
      doctorCobro?.porcentaje || 0
    );

  if (
    montoCobro > 0
  ) {

    const {
      error: errorPago,
    } = await supabase

      .from(
        "pagos"
      )

      .insert({

        paciente_id:
          pacienteAbierto.id,

        tratamiento_id:
          tratamientoCobro.id,

        metodo_pago:
          nuevoCobro.metodo_pago,

        moneda:
          nuevoCobro.moneda,

        monto_original:
          montoCobro,

        tipo_cambio:
          nuevoCobro.moneda === "USD"
            ? tipoCambioAplicado
            : null,

        monto_mxn:
          montoCobroMXN,

        comision_porcentaje:
          porcentajeComisionActual,

        iva_comision_porcentaje:
          porcentajeIvaComisionActual,

        comision_base:
          comisionBaseActual,

        iva_comision:
          ivaComisionActual,

        comision_banco:
          comisionBancoCobro,

        neto_recibido:
          netoCobroActual,

        comision_doctor_porcentaje:
          porcentajeDoctorCobro,

      });

    if (
      errorPago
    ) {

      console.error(
        "Error guardando pago:",
        errorPago
      );

      alert(
        es ? "Error registrando el pago." : "Error recording payment."
      );

      return;
    }

  }

  const {
    error: errorTratamiento,
  } = await supabase

    .from(
      "tratamientos"
    )

    .update({

      metodo_pago:
        montoCobro > 0
          ? nuevoCobro.metodo_pago
          : tratamientoCobro.metodo_pago,

      moneda:
        montoCobro > 0
          ? nuevoCobro.moneda
          : tratamientoCobro.moneda,

      tipo_cambio:
        montoCobro > 0 &&
        nuevoCobro.moneda === "USD"
          ? tipoCambioAplicado
          : tratamientoCobro.tipo_cambio,

      equivalente_mxn:
        montoCobro > 0
          ? montoCobroMXN
          : tratamientoCobro.equivalente_mxn,

      laboratorio:
        Number(
          nuevoCobro.laboratorio || 0
        ),

      especialista:
        Number(
          nuevoCobro.especialista || 0
        ),

      comision_banco:
        nuevaComisionBanco,

      total_antes_descuento:
        descuentoOriginalAplicar > 0
          ? totalAntesDescuento
          : tratamientoCobro.total_antes_descuento,

      descuento:
        nuevoDescuento,

      total_original_antes_descuento:
        descuentoOriginalAplicar > 0
          ? totalOriginalAntesDescuento
          : tratamientoCobro
              .total_original_antes_descuento,

      descuento_original:
        nuevoDescuentoOriginal,

      total_original:
        nuevoTotalOriginalTratamiento,

      pagado_original:
        nuevoPagadoOriginal,

      resta_original:
        nuevoPendienteOriginal,

      total:
        nuevoTotalTratamiento,

      pago:
        nuevoTotalPagado,

      resta:
        nuevoPendiente,

      pendiente:
        nuevoPendiente > 0,

    })

    .eq(
      "id",
      tratamientoCobro.id
    );

  if (
    errorTratamiento
  ) {

    console.error(
      "Error actualizando tratamiento:",
      errorTratamiento
    );

    alert(
      montoCobro > 0
        ? es ? "El pago se registró, pero ocurrió un error actualizando el tratamiento." : "The payment was recorded, but the treatment could not be updated."
        : es ? "Ocurrió un error aplicando el descuento." : "An error occurred while applying the discount."
    );

    return;
  }

  setTratamientos(

    tratamientos.map(
      (
        tratamiento
      ) =>

        tratamiento.id ===
        tratamientoCobro.id

          ? {

              ...tratamiento,

              metodo_pago:
                montoCobro > 0
                  ? nuevoCobro.metodo_pago
                  : tratamiento.metodo_pago,

              moneda:
                montoCobro > 0
                  ? nuevoCobro.moneda
                  : tratamiento.moneda,

              tipo_cambio:
                montoCobro > 0 &&
                nuevoCobro.moneda === "USD"
                  ? tipoCambioAplicado
                  : tratamiento.tipo_cambio,

              equivalente_mxn:
                montoCobro > 0
                  ? montoCobroMXN
                  : tratamiento.equivalente_mxn,

              laboratorio:
                Number(
                  nuevoCobro.laboratorio || 0
                ),

              especialista:
                Number(
                  nuevoCobro.especialista || 0
                ),

              comision_banco:
                nuevaComisionBanco,

              total_antes_descuento:
                descuentoOriginalAplicar > 0
                  ? totalAntesDescuento
                  : tratamiento.total_antes_descuento,

              descuento:
                nuevoDescuento,

              total_original_antes_descuento:
                descuentoOriginalAplicar > 0
                  ? totalOriginalAntesDescuento
                  : tratamiento
                      .total_original_antes_descuento,

              descuento_original:
                nuevoDescuentoOriginal,

              total_original:
                nuevoTotalOriginalTratamiento,

              pagado_original:
                nuevoPagadoOriginal,

              resta_original:
                nuevoPendienteOriginal,

              total:
                nuevoTotalTratamiento,

              pagado:
                nuevoTotalPagado,

              pendiente:
                nuevoPendiente,

            }

          : tratamiento
    )

  );

  setMostrarModalCobro(
    false
  );

  setTratamientoCobro(
    null
  );

  setTipoDescuentoCobro(
    "monto"
  );

  setValorDescuentoCobro(
    ""
  );

  setNuevoCobro({

    metodo_pago: "",

    moneda: "MXN",

    monto: "",

    laboratorio: "",

    especialista: "",

    comision_banco: "",

  });

  await registrarBitacora({
    accion:
      montoCobro > 0 &&
      descuentoOriginalAplicar > 0
        ? "Registrar cobro con descuento"
        : montoCobro > 0
          ? "Registrar cobro"
          : "Aplicar descuento",
    modulo: "Cobros",
    detalle:
      `Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre} | Tratamiento ID: ${tratamientoCobro.id} | Tratamiento: ${tratamientoCobro.tratamiento || "-"} | Descuento: ${descuentoOriginalAplicar.toFixed(2)} ${monedaPrecioTratamiento} | Cobro real: ${montoCobro.toFixed(2)} ${nuevoCobro.moneda}${montoCobro > 0 ? ` | Método: ${nuevoCobro.metodo_pago}` : ""}`,
  });

  alert(
    montoCobro > 0 &&
    descuentoOriginalAplicar > 0
      ? es ? "Descuento y cobro registrados correctamente." : "Discount and payment recorded successfully."
      : montoCobro > 0
        ? es ? "Cobro registrado correctamente." : "Payment recorded successfully."
        : es ? "Descuento aplicado correctamente." : "Discount applied successfully."
  );

}

async function guardarTratamiento() {

  if (
    editandoIndex === null &&
    !puedeCrearTratamientos
  ) {

    return;

  }

  if (
    editandoIndex !== null &&
    (
      !puedeCrearTratamientos ||
      !puedeCambiarEstadoTratamientos
    )
  ) {

    return;

  }

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
      es ? "Completa fecha, tratamiento y doctor." : "Complete the date, treatment, and doctor."
    );

    return;

  }

const tratamientoCatalogoSeleccionado =
  catalogoTratamientos.find(
    (tratamiento: any) =>
      tratamiento.nombre ===
      nuevoTratamiento.tratamiento
  );

const monedaPrecioTratamiento =
  nuevoTratamiento.moneda_precio ||
  "MXN";

const totalOriginalTratamiento =
  tratamientoCatalogoSeleccionado
    ? Number(
        monedaPrecioTratamiento === "USD"
          ? tratamientoCatalogoSeleccionado
              .precio_usd || 0
          : tratamientoCatalogoSeleccionado
              .precio_mxn || 0
      )
    : Number(
        nuevoTratamiento.total || 0
      );

if (
  monedaPrecioTratamiento === "USD" &&
  tipoCambioCobro <= 0
) {
  alert(
    "No hay un tipo de cambio válido configurado."
  );
  return;
}

const totalTratamiento =
  monedaPrecioTratamiento === "USD"
    ? totalOriginalTratamiento *
      tipoCambioCobro
    : totalOriginalTratamiento;

const tratamientoExistente =
  editandoIndex !== null
    ? tratamientos[editandoIndex]
    : null;

const pagadoOriginalTratamiento =
  Number(
    tratamientoExistente
      ?.pagado_original || 0
  );

const pendienteOriginalTratamiento =
  Math.max(
    totalOriginalTratamiento -
      pagadoOriginalTratamiento,
    0
  );

const pagadoTratamiento =
  Number(
    tratamientoExistente
      ?.pagado || 0
  );

const pendienteTratamiento =
  Math.max(
    totalTratamiento -
      pagadoTratamiento,
    0
  );

const nuevo = {

  ...nuevoTratamiento,

  metodo_pago:
    nuevoTratamiento.metodo_pago ||
    "",

  moneda:
    nuevoTratamiento.moneda ||
    "MXN",

  moneda_precio:
    monedaPrecioTratamiento,

  total_original:
    totalOriginalTratamiento,

  pagado_original:
    pagadoOriginalTratamiento,

  resta_original:
    pendienteOriginalTratamiento,

  laboratorio:
    nuevoTratamiento.laboratorio ||
    "0",

  especialista:
    nuevoTratamiento.especialista ||
    "0",

  comision_banco:
    nuevoTratamiento.comision_banco ||
    "0",

  total:
    String(
      totalTratamiento
    ),

  pagado:
    String(
      pagadoTratamiento
    ),

  pendiente:
    pendienteTratamiento,

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

moneda_precio:
  nuevo.moneda_precio,

total_original:
  Number(
    nuevo.total_original || 0
  ),

pagado_original:
  Number(
    tratamientoEditar.pagado_original || 0
  ),

resta_original:
  Math.max(
    Number(
      nuevo.total_original || 0
    ) -
      Number(
        tratamientoEditar.pagado_original || 0
      ),
    0
  ),

total:
  Number(
    nuevo.total || 0
  ),

resta:
  Math.max(
    Number(
      nuevo.total || 0
    ) -
      Number(
        tratamientoEditar.pagado || 0
      ),
    0
  ),

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
          es ? "Error actualizando tratamiento." : "Error updating treatment."
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

metodo_pago:
  nuevo.metodo_pago,

moneda:
  nuevo.moneda,

moneda_precio:
  nuevo.moneda_precio,

total_original:
  Number(
    nuevo.total_original || 0
  ),

pagado_original:
  Number(
    nuevo.pagado_original || 0
  ),

resta_original:
  Number(
    nuevo.resta_original || 0
  ),

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
    nuevo.total || 0
  ),

pago:
  Number(
    nuevo.pagado || 0
  ),

resta:
  Number(
    nuevo.pendiente || 0
  ),

pendiente:
  Number(
    nuevo.pendiente || 0
  ) > 0,

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
        es ? "Error guardando tratamiento." : "Error saving treatment."
      );

      return;

    }

 if (data) {

  const tratamientoGuardado = {

    id:
      data.id,

    fecha:
      data.fecha,

    tratamiento:
      data.tratamiento,

    doctor:
      data.doctor,

    doctor_id:
      data.doctor_id,

    estado:
      data.estado ||
      "Pendiente",

    metodo_pago:
      data.metodo_pago ||
      "",

    moneda:
      data.moneda ||
      "MXN",

    moneda_precio:
      data.moneda_precio ||
      "MXN",

    total_antes_descuento:
      data.total_antes_descuento,

    descuento:
      data.descuento || 0,

    total_original_antes_descuento:
      data.total_original_antes_descuento,

    descuento_original:
      data.descuento_original || 0,

    total_original:
      data.total_original ||
      0,

    pagado_original:
      data.pagado_original ||
      0,

    resta_original:
      data.resta_original ||
      0,

    laboratorio:
      data.laboratorio ||
      0,

    especialista:
      data.especialista ||
      0,

    comision_banco:
      data.comision_banco ||
      0,

    total:
      data.total ||
      0,

    pagado:
      data.pago ||
      0,

    pendiente:
      data.resta ||
      0,

    notas:
      data.notas ||
      "",

  };

  setTratamientos(
    (
      tratamientosActuales
    ) => [
      tratamientoGuardado,
      ...tratamientosActuales,
    ]
  );

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

  fecha:
    new Date().toLocaleDateString(
      "en-CA"
    ),

  tratamiento: "",

  doctor: "",

  estado: "Pendiente",

  metodo_pago: "",

  moneda: "",

  moneda_precio: "MXN",

  laboratorio: "",

  especialista: "",

  especialista_id: "",

  especialista_nombre: "",

  moneda_especialista: "MXN",

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

  function abrirEditarPaciente() {

    if (
      !pacienteAbierto ||
      !puedeEditarPacientes
    ) {

      return;

    }

    setDatosPacienteEditando({
      nombre:
        pacienteAbierto.nombre || "",

      telefono:
        pacienteAbierto.telefono || "",

      correo:
        pacienteAbierto.correo || "",

      edad:
        pacienteAbierto.edad || "",

      sexo:
        pacienteAbierto.sexo || "",

      direccion:
        pacienteAbierto.direccion || "",
    });

    setMostrarEditarPaciente(
      true
    );

  }

  async function guardarDatosPaciente() {

    if (
      !pacienteAbierto?.id ||
      !puedeEditarPacientes
    ) {

      return;

    }

    const nombre =
      datosPacienteEditando.nombre.trim();

    if (!nombre) {

      alert(
        es ? "El nombre del paciente es obligatorio." : "Patient name is required."
      );

      return;

    }

    const datosActualizados = {
      nombre,

      telefono:
        datosPacienteEditando.telefono.trim(),

      correo:
        datosPacienteEditando.correo.trim(),

      edad:
        datosPacienteEditando.edad.trim(),

      sexo:
        datosPacienteEditando.sexo.trim(),

      direccion:
        datosPacienteEditando.direccion.trim(),
    };

    const {
      data,
      error,
    } = await supabase
      .from("pacientes")
      .update(
        datosActualizados
      )
      .eq(
        "id",
        pacienteAbierto.id
      )
      .select(
        "id, nombre, telefono, correo, edad, sexo, direccion"
      )
      .single();

    if (
      error ||
      !data
    ) {

      console.error(
        "Error actualizando paciente:",
        error
      );

      alert(
        es ? "No se pudieron actualizar los datos del paciente." : "Patient information could not be updated."
      );

      return;

    }

    const pacienteActualizado = {
      ...pacienteAbierto,
      ...data,
    };

    setPacienteAbierto(
      pacienteActualizado
    );

    setPacientes(
      pacientes.map((p) =>
        p.id === pacienteAbierto.id
          ? {
              ...p,
              ...data,
            }
          : p
      )
    );

    await registrarBitacora({
      accion: "Editar paciente",
      modulo: "Pacientes",
      detalle:
        `Paciente ID: ${pacienteAbierto.id} | Paciente: ${data.nombre}`,
    });

    setMostrarEditarPaciente(
      false
    );

    alert(
      es ? "Datos del paciente actualizados." : "Patient information updated."
    );

  }

  async function cargarHistorialMedico(
    pacienteId: number
  ) {

    setCargandoHistorialMedico(true);

    const { data, error } =
      await supabase
        .from("historial_medico_cambios")
        .select(`
          id,
          paciente_id,
          usuario_id,
          alergias,
          enfermedades,
          medicamentos,
          historial_clinico,
          created_at
        `)
        .eq("paciente_id", pacienteId)
        .order("created_at", {
          ascending: false,
        });

    if (error) {

      console.error(
        "Error cargando historial médico:",
        error
      );

      setHistorialMedicoCambios([]);
      setCargandoHistorialMedico(false);

      return;
    }

    const cambios =
      (data || []) as HistorialMedicoCambio[];

    const usuariosIds = Array.from(
      new Set(
        cambios
          .map((cambio) => cambio.usuario_id)
          .filter(Boolean)
      )
    );

    let nombresPorUsuario:
      Record<string, string> = {};

    if (usuariosIds.length > 0) {

      const {
        data: perfilesHistorial,
        error: errorPerfilesHistorial,
      } = await supabase
        .from("perfiles")
        .select("id, nombre")
        .in("id", usuariosIds);

      if (!errorPerfilesHistorial) {

        nombresPorUsuario =
          Object.fromEntries(
            (perfilesHistorial || []).map(
              (perfil: any) => [
                perfil.id,
                perfil.nombre,
              ]
            )
          );

      }

    }

    setHistorialMedicoCambios(
      cambios.map((cambio) => ({
        ...cambio,
        usuario_nombre:
          nombresPorUsuario[
            cambio.usuario_id
          ] || "Usuario de MintOS",
      }))
    );

    setCargandoHistorialMedico(false);
  }

  async function abrirPaciente(
  paciente: Paciente
) {

    await registrarBitacora({
      accion: "Abrir expediente clínico",
      modulo: "Pacientes",
      detalle:
        `Paciente ID: ${paciente.id} | Paciente: ${paciente.nombre}`,
    });

    setPacienteAbierto(
      paciente
    );

   cargarCitas(
  paciente.id
);

cargarNotasClinicas(
  paciente.id
);

cargarHistorialMedico(
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

moneda_precio:
  t.moneda_precio || "MXN",

total_antes_descuento:
  t.total_antes_descuento,

descuento:
  t.descuento ?? 0,

total_original_antes_descuento:
  t.total_original_antes_descuento,

descuento_original:
  t.descuento_original ?? 0,

total_original:
  t.total_original ?? t.total ?? 0,

pagado_original:
  t.pagado_original ?? t.pago ?? 0,

resta_original:
  t.resta_original ?? t.resta ?? 0,

  laboratorio:
  t.laboratorio,

especialista:
  t.especialista,

especialista_id:
  t.especialista_id,

especialista_nombre:
  t.especialista_nombre || "",

moneda_especialista:
  t.moneda_especialista || "MXN",

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

  if (
    !puedeCambiarEstadoTratamientos
  ) {

    return;

  }

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
      es ? "Error actualizando estado." : "Error updating status."
    );

    return;

  }

  await registrarBitacora({
    accion: "Cambiar estado de tratamiento",
    modulo: "Tratamientos",
    detalle:
      `Tratamiento ID: ${tratamientoId} | Paciente ID: ${pacienteAbierto?.id || "-"} | Paciente: ${pacienteAbierto?.nombre || "-"} | Nuevo estado: ${nuevoEstado}`,
  });

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

const pacientesFiltrados =
  pacientes.filter((p) => {

    const textoNombre =
      busqueda
        .toLowerCase()
        .trim();

    const textoTelefono =
      busquedaTelefono
        .toLowerCase()
        .trim();

    const nombre =
      p.nombre
        ?.toLowerCase() || "";

    const telefono =
      p.telefono
        ?.toLowerCase() || "";

    const coincideNombre =
      !textoNombre ||
      nombre.includes(
        textoNombre
      );

    const coincideTelefono =
      !textoTelefono ||
      telefono.includes(
        textoTelefono
      );

    return (
      coincideNombre &&
      coincideTelefono
    );

  });

  return (

<div className="
  min-h-[calc(100vh-32px)]
  flex
  flex-col
  gap-3
">

{
  pacienteAbierto && (

    <div
      className="
        mint-card
        px-4
        py-3
        flex
        items-center
        justify-between
        gap-3
      "
    >

      <button
        type="button"
        onClick={() => {
          setPacienteAbierto(null);
          setBusqueda("");
          setBusquedaTelefono("");
        }}
        className="
          mint-btn
          mint-btn-secondary
          px-4
          py-2
          text-sm
        "
      >
        {es ? "← Todos los pacientes" : "← All patients"}
      </button>

      <button
        type="button"
        onClick={() =>
          setMostrarQR(true)
        }
        className="
          mint-btn
          mint-btn-primary
          px-4
          py-2
          text-sm
        "
      >
        + QR
      </button>

    </div>

  )
}

   <div className="
  flex-1
">

        {

          pacienteAbierto ? (

            <div
              id="pdf-area"
              className="
                mint-card
                p-4
              "
            >

             <div className="
  mb-5
">

  <div className="
    mint-card
    p-5
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
          bg-[var(--mint-accent-soft)]
          flex
          items-center
          justify-center
          text-2xl
          font-bold
         mint-text-accent
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
              mint-text-primary
            ">

              {pacienteAbierto.nombre}

            </h2>

            <span className="
              bg-[var(--mint-primary-soft)]
              text-[var(--mint-primary)]
              border
              border-[var(--mint-border-primary)]
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
            ">

              {es ? "Expediente" : "Record"} #{pacienteAbierto.id}

            </span>

            {
              puedeEditarPacientes && (

                <button
                  type="button"
                  onClick={
                    abrirEditarPaciente
                  }
                  className="
                    mint-btn
                    mint-btn-secondary
                    px-3
                    py-1.5
                    text-xs
                  "
                >
                  {es ? "Editar paciente" : "Edit patient"}
                </button>

              )
            }

          </div>

          <div className="
            flex
            flex-wrap
            items-center
            gap-x-5
            gap-y-2
            mt-3
            text-sm
            mint-text-secondary
          ">

            <span>

              <strong className="
                mint-text-primary
                font-semibold
              ">
                {es ? "Edad:" : "Age:"}
              </strong>

              {" "}

              {pacienteAbierto.edad || "-"}

            </span>

            <span>

              <strong className="
                mint-text-primary
                font-semibold
              ">
                {es ? "Sexo:" : "Sex:"}
              </strong>

              {" "}

              {pacienteAbierto.sexo || "-"}

            </span>

            <span>

              <strong className="
                mint-text-primary
                font-semibold
              ">
                Tel:
              </strong>

              {" "}

              {pacienteAbierto.telefono || "-"}

            </span>

            <span>

              <strong className="
                mint-text-primary
                font-semibold
              ">
                {es ? "Correo:" : "Email:"}
              </strong>

              {" "}

              {pacienteAbierto.correo || "-"}

            </span>

          </div>

        </div>

      </div>

      <div className="
        bg-[var(--mint-bg-soft)]
        border
        border-[var(--mint-border)]
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
          mint-text-muted
        ">
          {es ? "Próxima cita" : "Next appointment"}
        </p>

        <p className="
          text-sm
          font-bold
          mint-text-primary
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

              : (es ? "Sin citas programadas" : "No appointments scheduled")
          }

        </p>

        {
          proximaCita && (

            <p className="
              text-xs
              mint-text-brand
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
  mb-6
">

  <div className="
    flex
    flex-wrap
    gap-2
  ">

    <button
      type="button"
      onClick={() =>
        setTabActiva("general")
      }
      className={`
        mint-tab
        px-5
        py-2.5
        text-sm

        ${
          tabActiva === "general"
            ? "mint-tab-active"
            : ""
        }
      `}
    >
      {es ? "General" : "General"}
    </button>

    <button
      type="button"
      onClick={() =>
        setTabActiva("expediente")
      }
      className={`
        mint-tab
        px-5
        py-2.5
        text-sm

        ${
          tabActiva === "expediente"
            ? "mint-tab-active"
            : ""
        }
      `}
    >
      {es ? "Expediente Clínico" : "Clinical Record"}
    </button>

    <button
      type="button"
      onClick={() =>
        setTabActiva("historial")
      }
      className={`
        mint-tab
        px-5
        py-2.5
        text-sm

        ${
          tabActiva === "historial"
            ? "mint-tab-active"
            : ""
        }
      `}
    >
      {es ? "Historial Médico" : "Medical History"}
    </button>

    <button
      type="button"
      onClick={() =>
        setTabActiva("citas")
      }
      className={`
        mint-tab
        px-5
        py-2.5
        text-sm

        ${
          tabActiva === "citas"
            ? "mint-tab-active"
            : ""
        }
      `}
    >
      {es ? "Citas" : "Appointments"}
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
  mint-card-accent
  p-5
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
              mint-text-muted
            ">
              {es ? "Tratamientos" : "Treatments"}
            </p>

            <h3 className="
              text-3xl
              font-bold
              mint-text-primary
              mt-2
            ">
              {tratamientos.length}
            </h3>

            <p className="
              text-sm
              mint-text-secondary
              mt-1
            ">
              {es ? "Registrados" : "Registered"}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-[var(--mint-primary-light)]
            flex
            items-center
            justify-center
            text-[var(--mint-primary)]
            font-bold
            text-lg
          ">
            #
          </div>

        </div>

      </div>

      <div className="
        mint-card-success
        p-5
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
              mint-text-muted
            ">
              {es ? "Total Pagado" : "Total Paid"}
            </p>

            <h3 className="
              text-3xl
              font-bold
              text-[var(--mint-success)]
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
              mint-text-secondary
              mt-1
            ">
              {es ? "Pagos recibidos" : "Payments received"}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-[var(--mint-success-bg)]
            flex
            items-center
            justify-center
            text-[var(--mint-success)]
            font-bold
            text-xl
          ">
            $
          </div>

        </div>

      </div>

      <div className="
        mint-card-danger
        p-5
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
              mint-text-muted
            ">
              {es ? "Saldo Pendiente" : "Outstanding Balance"}
            </p>

            <h3 className="
              text-3xl
              font-bold
              text-[var(--mint-danger)]
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

            {
  tipoCambioCobro > 0 && (

    <p
      className="
        text-sm
        font-semibold
        mint-text-secondary
        mt-1
      "
    >
      ≈ $
      {(
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
        ) /
        tipoCambioCobro
      ).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}
      {" "}
      USD
    </p>

  )
}

            <p className="
              text-sm
              mint-text-secondary
              mt-1
            ">
              {es ? "Por cobrar" : "Outstanding"}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-[var(--mint-danger-bg)]
            flex
            items-center
            justify-center
            text-[var(--mint-danger)]
            font-bold
            text-xl
          ">
            $
          </div>

        </div>

      </div>

    </div>

      <div className="
        mint-card
        overflow-hidden
      ">

        <div className="
          flex
          items-center
          justify-between
          p-5
          border-b
          border-[var(--mint-border)]
        ">

          <h3 className="
            text-xl
            font-bold
            mint-text-primary
          ">

            {es ? "Tratamientos" : "Treatments"}

          </h3>

          {
            puedeCrearTratamientos && (

              <button
                onClick={() =>
                  setMostrarModalTratamiento(
                    true
                  )
                }
                className="
                  mint-btn
                  mint-btn-primary
                  px-4
                  py-2
                  text-sm
                "
              >

                {es ? "+ Agregar" : "+ Add"}

              </button>

            )
          }

        </div>

        <div className="
          overflow-x-auto
        ">

          <table className="
            w-full
            min-w-[900px]
          ">

            <thead>

              <tr className="
                bg-[var(--mint-bg-soft)]
                border-b
                border-[var(--mint-border)]
              ">

                <th className="
                  p-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Fecha" : "Date"}
                </th>

                <th className="
                  p-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Tratamiento" : "Treatment"}
                </th>

                <th className="
                  p-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Doctor" : "Doctor"}
                </th>

                <th className="
                  p-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Total" : "Total"}
                </th>

                <th className="
                  p-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Pagado" : "Paid"}
                </th>

                <th className="
                  p-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Pendiente" : "Pending"}
                </th>

                <th className="
                  p-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Estado" : "Status"}
                </th>

                <th className="
                  p-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Acciones" : "Actions"}
                </th>

              </tr>

            </thead>

            <tbody>

              {

                tratamientos.length === 0

                  ? (

                    <tr>

                      <td
                        colSpan={8}
                        className="
                          text-center
                          p-10
                          mint-text-muted
                        "
                      >
                        {es ? "No hay tratamientos registrados" : "No treatments registered"}
                      </td>

                    </tr>

                  )

                  : (

                    tratamientos.map(
                      (
                        tratamiento,
                        index
                      ) => (

                        <tr
                          key={
                            tratamiento.id ||
                            index
                          }
                          className="
                            border-b
                            border-[var(--mint-border)]
                            hover:bg-[var(--mint-bg-soft)]
                            transition-colors
                          "
                        >

                          <td className="
                            p-4
                            text-sm
                            mint-text-secondary
                            whitespace-nowrap
                          ">

                            {
                              tratamiento.fecha ||
                              "-"
                            }

                          </td>

                          <td className="
                            p-4
                          ">

                            <p className="
                              font-semibold
                              mint-text-primary
                            ">
                              {
                                tratamiento.tratamiento ||
                                "-"
                              }
                            </p>

                            {
                              tratamiento.notas && (

                                <p className="
                                  text-xs
                                  mint-text-muted
                                  mt-1
                                  max-w-[260px]
                                  truncate
                                ">
                                  {tratamiento.notas}
                                </p>

                              )
                            }

                          </td>

                          <td className="
                            p-4
                            text-sm
                            mint-text-secondary
                            whitespace-nowrap
                          ">

                            {
                              tratamiento.doctor ||
                              "-"
                            }

                          </td>

                          <td className="
                            p-4
                            text-right
                            text-sm
                            font-semibold
                            mint-text-primary
                            whitespace-nowrap
                          ">

                            $
                            {
                              Number(
                                tratamiento.moneda_precio === "USD"
                                  ? tratamiento.total_original ??
                                    tratamiento.total ??
                                    0
                                  : tratamiento.total || 0
                              ).toLocaleString()
                            }
                            {" "}
                            {
                              tratamiento.moneda_precio ||
                              "MXN"
                            }

                          </td>

                          <td className="
                            p-4
                            text-right
                            text-sm
                            font-semibold
                            text-[var(--mint-success)]
                            whitespace-nowrap
                          ">

                            $
                            {
                              Number(
                                tratamiento.moneda_precio === "USD"
                                  ? tratamiento.pagado_original ??
                                    tratamiento.pagado ??
                                    0
                                  : tratamiento.pagado || 0
                              ).toLocaleString()
                            }
                            {" "}
                            {
                              tratamiento.moneda_precio ||
                              "MXN"
                            }

                          </td>

                          <td className="
                            p-4
                            text-right
                            text-sm
                            font-semibold
                            text-[var(--mint-danger)]
                            whitespace-nowrap
                          ">

                            $
                            {
                              Number(
                                tratamiento.moneda_precio === "USD"
                                  ? tratamiento.resta_original ??
                                    tratamiento.pendiente ??
                                    0
                                  : tratamiento.pendiente || 0
                              ).toLocaleString()
                            }
                            {" "}
                            {
                              tratamiento.moneda_precio ||
                              "MXN"
                            }

                          </td>

                          <td className="
                            p-4
                          ">

                            {
                              tratamiento.estado ===
                              "Finalizado"

                                ? (

                                  <span className="
                                    inline-flex
                                    bg-[var(--mint-success-bg)]
                                    text-[var(--mint-success)]
                                    border
                                    border-[var(--mint-success-border)]
                                    px-3
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-semibold
                                    whitespace-nowrap
                                  ">
                                    {es ? "Finalizado" : "Completed"}
                                  </span>

                                )

                                : tratamiento.estado ===
                                  "En proceso"

                                  ? (

                                    <span className="
                                      inline-flex
                                      bg-[var(--mint-info-bg)]
                                      text-[var(--mint-info)]
                                      border
                                      border-[var(--mint-info-border)]
                                      px-3
                                      py-1
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      whitespace-nowrap
                                    ">
                                      {es ? "En proceso" : "In progress"}
                                    </span>

                                  )

                                  : tratamiento.estado ===
                                    "Confirmado"

                                    ? (

                                      <span className="
                                        inline-flex
                                        bg-[var(--mint-primary-soft)]
                                        text-[var(--mint-primary)]
                                        border
                                        border-[var(--mint-border-primary)]
                                        px-3
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-semibold
                                        whitespace-nowrap
                                      ">
                                        {es ? "Confirmado" : "Confirmed"}
                                      </span>

                                    )

                                    : tratamiento.estado ===
                                      "Cancelado"

                                      ? (

                                        <span className="
                                          inline-flex
                                          bg-[var(--mint-bg-muted)]
                                          text-[var(--mint-text-secondary)]
                                          border
                                          border-[var(--mint-border)]
                                          px-3
                                          py-1
                                          rounded-full
                                          text-xs
                                          font-semibold
                                          whitespace-nowrap
                                        ">
                                          {es ? "Cancelado" : "Cancelled"}
                                        </span>

                                      )

                                      : (

                                        <span className="
                                          inline-flex
                                          bg-[var(--mint-warning-bg)]
                                          text-[var(--mint-warning)]
                                          border
                                          border-[var(--mint-warning-border)]
                                          px-3
                                          py-1
                                          rounded-full
                                          text-xs
                                          font-semibold
                                          whitespace-nowrap
                                        ">
                                          {es ? "Pendiente" : "Pending"}
                                        </span>

                                      )
                            }

                          </td>

                          <td className="
                            p-4
                          ">

                            <div className="
                              flex
                              justify-end
                              items-center
                              gap-2
                            ">

                              {
                                puedeCambiarEstadoTratamientos && (

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
                                      mint-input
                                      px-3
                                      py-2
                                      text-xs
                                    "
                                  >

                                    <option value="Pendiente">
                                      {es ? "Pendiente" : "Pending"}
                                    </option>

                                    <option value="Confirmado">
                                      {es ? "Confirmado" : "Confirmed"}
                                    </option>

                                    <option value="En proceso">
                                      {es ? "En proceso" : "In progress"}
                                    </option>

                                    <option value="Finalizado">
                                      {es ? "Finalizado" : "Completed"}
                                    </option>

                                    <option value="Cancelado">
                                      {es ? "Cancelado" : "Cancelled"}
                                    </option>

                                  </select>

                                )
                              }

                              {
                                puedeRegistrarCobros && (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirModalCobro(
                                        tratamiento
                                      )
                                    }
                                    className="
                                      mint-btn
                                      mint-btn-action
                                      px-3
                                      py-2
                                      text-xs
                                    "
                                  >
                                    {es ? "Registrar cobro" : "Record payment"}
                                  </button>

                                )
                              }

                              {
                                puedeCrearTratamientos &&
                                puedeCambiarEstadoTratamientos && (

                                  <button
                                    type="button"
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
                                      mint-btn
                                      mint-btn-secondary
                                      px-3
                                      py-2
                                      text-xs
                                    "
                                  >
                                    {es ? "Editar" : "Edit"}
                                  </button>

                                )
                              }

                              {
                                puedeAnularTratamientos && (

                              <button
                                type="button"
                                onClick={async () => {

                                  const tratamientoEliminar =
                                    tratamientos[index];

                                  if (
                                    !tratamientoEliminar?.id
                                  ) {

                                    return;

                                  }

                                  const confirmar =
                                    window.confirm(
                                      es ? "¿Seguro que deseas eliminar este tratamiento?" : "Are you sure you want to delete this treatment?"
                                    );

                                  if (
                                    !confirmar
                                  ) {

                                    return;

                                  }

                                  const {
                                    data,
                                    error,
                                  } = await supabase
                                    .from(
                                      "tratamientos"
                                    )
                                    .delete()
                                    .eq(
                                      "id",
                                      tratamientoEliminar.id
                                    )
                                    .select("id");

                                  if (
                                    error ||
                                    !data ||
                                    data.length === 0
                                  ) {

                                    console.error(
                                      "Error eliminando tratamiento:",
                                      error
                                    );

                                    alert(
                                      es ? "No tienes permiso para eliminar tratamientos." : "You do not have permission to delete treatments."
                                    );

                                    return;

                                  }

                                  await registrarBitacora({
                                    accion: "Eliminar tratamiento",
                                    modulo: "Tratamientos",
                                    detalle:
                                      `Tratamiento ID: ${tratamientoEliminar.id} | Paciente ID: ${pacienteAbierto?.id || "-"} | Paciente: ${pacienteAbierto?.nombre || "-"} | Tratamiento: ${tratamientoEliminar.tratamiento || "-"}`,
                                  });

                                  setTratamientos(

                                    tratamientos.filter(
                                      (
                                        _,
                                        i
                                      ) =>
                                        i !== index
                                    )

                                  );

                                }}
                                className="
                                  mint-btn
                                  mint-btn-danger
                                  px-3
                                  py-2
                                  text-xs
                                "
                              >
                                {es ? "Eliminar" : "Delete"}
                              </button>

                                )
                              }

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

      </div>

      <div
        className="
          mint-card
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
                mint-text-primary
              "
            >

              {es ? "Evolución Clínica" : "Clinical Progress"}

            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >

              {es ? "Historial de notas y observaciones clínicas del paciente." : "History of patient clinical notes and observations."}

            </p>

          </div>

        </div>

        {
          puedeAgregarNotasClinicas && (

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
              mint-input
              p-3
              w-full
            "
          >

            <option value="">

              {es ? "Seleccionar Doctor" : "Select Doctor"}

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
            placeholder={es ? "Agregar nueva nota clínica..." : "Add a new clinical note..."}
            className="
              mint-input
              w-full
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
                mint-btn
                mint-btn-primary
                px-5
                py-2.5
                text-sm
              "
            >

              {es ? "Guardar Nota Clínica" : "Save Clinical Note"}

            </button>

          </div>

        </div>

          )
        }

        <div
          className="
            border-t
            border-[var(--mint-border)]
            pt-5
          "
        >

          <h4
            className="
              font-bold
              mint-text-primary
              mb-4
            "
          >

            {es ? "Historial" : "History"}

          </h4>

          {

            notasClinicas.length === 0

              ? (

                <div
                  className="
                    bg-[var(--mint-bg-soft)]
                    rounded-xl
                    p-5
                    text-sm
                    mint-text-secondary
                  "
                >

                  {es ? "No hay notas clínicas registradas." : "No clinical notes recorded."}

                </div>

              )

              : (

                <div
                  className="
                    space-y-3
                  "
                >

                  {

                    notasClinicas
                      .filter(
                        (nota: any) =>
                          nota.tipo !== "correccion"
                      )
                      .map(
                        (nota: any) => {

                          const correcciones =
                            notasClinicas.filter(
                              (item: any) =>
                                item.tipo === "correccion" &&
                                Number(item.nota_original_id) ===
                                  Number(nota.id)
                            );

                          return (

                            <div
                              key={nota.id}
                              className="
                                bg-[var(--mint-bg-card)]
                                border
                                border-[var(--mint-border)]
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

                                <div className="flex items-center gap-2">
                                  <span
                                    className="
                                      font-semibold
                                      mint-text-primary
                                    "
                                  >
                                    {nota.doctor_nombre}
                                  </span>

                                  {correcciones.length > 0 && (
                                    <span
                                      className="
                                        text-xs
                                        font-semibold
                                        px-2
                                        py-1
                                        rounded-full
                                        bg-amber-50
                                        text-amber-700
                                        border
                                        border-amber-200
                                      "
                                    >
                                      Corregida
                                    </span>
                                  )}
                                </div>

                                <span
                                  className="
                                    text-xs
                                    mint-text-secondary
                                  "
                                >
                                  {new Date(
                                    nota.created_at
                                  ).toLocaleString(
                                    "es-MX"
                                  )}
                                </span>

                              </div>

                              <p
                                className="
                                  text-sm
                                  mint-text-primary
                                  whitespace-pre-wrap
                                "
                              >
                                {nota.nota}
                              </p>

                              {correcciones.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {correcciones
                                    .slice()
                                    .sort(
                                      (a: any, b: any) =>
                                        new Date(a.created_at).getTime() -
                                        new Date(b.created_at).getTime()
                                    )
                                    .map(
                                      (correccion: any) => (
                                        <div
                                          key={correccion.id}
                                          className="
                                            rounded-xl
                                            border
                                            border-amber-200
                                            bg-amber-50/60
                                            p-4
                                          "
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                                {es ? "Corrección" : "Correction"}
                                              </span>
                                              <span className="text-sm font-semibold mint-text-primary">
                                                {correccion.doctor_nombre}
                                              </span>
                                            </div>

                                            <span className="text-xs mint-text-secondary">
                                              {new Date(
                                                correccion.created_at
                                              ).toLocaleString(
                                                "es-MX"
                                              )}
                                            </span>
                                          </div>

                                          <p className="text-sm mint-text-primary whitespace-pre-wrap">
                                            {correccion.nota}
                                          </p>

                                          <p className="text-xs mint-text-secondary mt-2">
                                            {es ? "Corrige la nota" : "Correct note"} #{nota.id}
                                          </p>
                                        </div>
                                      )
                                    )}
                                </div>
                              )}

                              {puedeAgregarNotasClinicas && (
                                <div className="mt-4">
                                  {notaCorrigiendoId === nota.id ? (
                                    <div className="grid gap-3 rounded-xl border border-[var(--mint-border)] bg-[var(--mint-bg-soft)] p-4">
                                      <div>
                                        <p className="text-sm font-semibold mint-text-primary">
                                          {es ? "Registrar corrección" : "Record correction"}
                                        </p>
                                        <p className="text-xs mint-text-secondary mt-1">
                                          {es ? "La nota original permanecerá intacta en el expediente." : "The original note will remain unchanged in the record."}
                                        </p>
                                      </div>

                                      <select
                                        value={doctorCorreccionId}
                                        onChange={(e) =>
                                          setDoctorCorreccionId(
                                            e.target.value
                                          )
                                        }
                                        className="mint-input p-3 w-full"
                                      >
                                        <option value="">
                                          {es ? "Seleccionar Doctor" : "Select Doctor"}
                                        </option>
                                        {doctores.map(
                                          (doctor: any) => (
                                            <option
                                              key={doctor.id}
                                              value={doctor.id}
                                            >
                                              {doctor.nombre}
                                            </option>
                                          )
                                        )}
                                      </select>

                                      <textarea
                                        value={textoCorreccionNota}
                                        onChange={(e) =>
                                          setTextoCorreccionNota(
                                            e.target.value
                                          )
                                        }
                                        placeholder={es ? "Escribe la corrección clínica..." : "Write the clinical correction..."}
                                        className="mint-input w-full p-3 min-h-[100px] resize-y"
                                      />

                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNotaCorrigiendoId(
                                              null
                                            );
                                            setTextoCorreccionNota(
                                              ""
                                            );
                                            setDoctorCorreccionId(
                                              ""
                                            );
                                          }}
                                          className="mint-btn mint-btn-secondary px-4 py-2 text-sm"
                                        >
                                          {es ? "Cancelar" : "Cancel"}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            guardarCorreccionNotaClinica(
                                              nota.id
                                            )
                                          }
                                          className="mint-btn mint-btn-primary px-4 py-2 text-sm"
                                        >
                                          {es ? "Guardar corrección" : "Save correction"}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNotaCorrigiendoId(
                                          nota.id
                                        );
                                        setTextoCorreccionNota(
                                          ""
                                        );
                                        setDoctorCorreccionId(
                                          ""
                                        );
                                      }}
                                      className="mint-btn mint-btn-secondary px-3 py-2 text-xs"
                                    >
                                      {es ? "Registrar corrección" : "Record correction"}
                                    </button>
                                  )}
                                </div>
                              )}

                            </div>

                          );

                        }
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
          mint-card
          p-6
          w-full
          max-w-xl
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            mint-text-primary
            mb-2
          "
        >

          {es ? "Nuevo Tratamiento" : "New Treatment"}

        </h2>

        <p
          className="
            text-sm
            mint-text-secondary
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
                mint-text-primary
                mb-2
              "
            >

              {es ? "Fecha" : "Date"}

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
                mint-input
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
                mint-text-primary
                mb-2
              "
            >

              {es ? "Doctor" : "Doctor"}

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
                mint-input
                p-3
                w-full
              "
            >

              <option value="">

                {es ? "Seleccionar Doctor" : "Select Doctor"}

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
                mint-text-primary
                mb-2
              "
            >

              {es ? "Tratamiento" : "Treatment"}

            </label>

            <select
              value={
                nuevoTratamiento.tratamiento ||
                ""
              }
              onChange={(e) => {

                const nombreTratamiento =
                  e.target.value;

                const esEspecialista =
                  doctorSeleccionado?.tipo_doctor ===
                    "especialista" ||
                  doctorSeleccionado?.tipo_doctor ===
                    "ambos";

                if (esEspecialista) {

                  const tarifaEspecialista =
                    especialistasDisponibles.find(
                      (precio: any) =>
                        String(precio.doctor_id) ===
                          String(doctorSeleccionado.id) &&
                        precio.nombre_tratamiento ===
                          nombreTratamiento
                    );

                  if (!tarifaEspecialista) {
                    return;
                  }

                  setNuevoTratamiento({
                    ...nuevoTratamiento,

                    tratamiento:
                      tarifaEspecialista.nombre_tratamiento,

                    total: "",

                    pagado: "0",

                    laboratorio: "",

                    especialista:
                      String(
                        Number(
                          tarifaEspecialista.costo || 0
                        )
                      ),

                    especialista_id:
                      String(doctorSeleccionado.id),

                    especialista_nombre:
                      doctorSeleccionado.nombre || "",

                    moneda_especialista:
                      tarifaEspecialista.moneda === "USD"
                        ? "USD"
                        : "MXN",

                    comision_banco: "0",
                  });

                  return;
                }

                const tratamientoSeleccionado =
                  catalogoTratamientos.find(
                    (tratamiento: any) =>
                      tratamiento.nombre ===
                      nombreTratamiento
                  );

                if (!tratamientoSeleccionado) {
                  return;
                }

                setNuevoTratamiento({
                  ...nuevoTratamiento,

                  tratamiento:
                    tratamientoSeleccionado.nombre,

                  moneda: "MXN",

                  moneda_precio: "MXN",

                  total:
                    String(
                      Number(
                        tratamientoSeleccionado
                          .precio_mxn || 0
                      )
                    ),

                  pagado: "0",

                  laboratorio: "",

                  especialista: "",

                  especialista_id: "",

                  especialista_nombre: "",

                  moneda_especialista: "MXN",

                  comision_banco: "0",
                });

              }}
              className="
                mint-input
                p-3
                w-full
              "
              disabled={
                !doctorSeleccionado
              }
            >

              <option value="">
                {
                  doctorSeleccionado
                    ? "Seleccionar Tratamiento"
                    : "Selecciona primero un doctor"
                }
              </option>

              {
                doctorSeleccionado &&
                (
                  doctorSeleccionado.tipo_doctor ===
                    "especialista" ||
                  doctorSeleccionado.tipo_doctor ===
                    "ambos"
                )

                  ? especialistasDisponibles
                      .filter(
                        (precio: any) =>
                          String(precio.doctor_id) ===
                            String(doctorSeleccionado.id)
                      )
                      .map(
                        (precio: any) => (

                          <option
                            key={precio.id}
                            value={
                              precio.nombre_tratamiento
                            }
                          >
                            {
                              precio.nombre_tratamiento
                            }
                          </option>

                        )
                      )

                  : doctorSeleccionado
                    ? catalogoTratamientos.map(
                        (tratamiento: any) => (

                          <option
                            key={tratamiento.id}
                            value={tratamiento.nombre}
                          >
                            {tratamiento.nombre}
                          </option>

                        )
                      )
                    : null
              }

            </select>

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                mint-text-primary
                mb-2
              "
            >

              {es ? "Estado" : "Status"}

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
                mint-input
                p-3
                w-full
              "
              disabled
            >

              <option value="Pendiente">

                {es ? "Pendiente" : "Pending"}

              </option>

            </select>

            <p
              className="
                text-xs
                mint-text-muted
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
                mint-text-primary
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
                mint-input
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
              mint-btn
              mint-btn-secondary
              px-4
              py-2
              text-sm
            "
          >

            {es ? "Cancelar" : "Cancel"}

          </button>

          <button
            type="button"
            onClick={
              guardarTratamiento
            }
            className="
              mint-btn
              mint-btn-primary
              px-4
              py-2
              text-sm
            "
          >

            {es ? "Guardar Tratamiento" : "Save Treatment"}

          </button>

        </div>

      </div>

    </div>

  )
}

{
  mostrarModalCobro && (
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
          mint-card
          p-6
          w-full
          max-w-xl
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            mint-text-primary
            mb-2
          "
        >
          {es ? "Registrar cobro" : "Record payment"}
        </h2>

        <p
          className="
            text-sm
            mint-text-secondary
            mb-5
          "
        >
          {
            tratamientoCobro
              ?.tratamiento
          }
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
                mint-text-primary
                mb-2
              "
            >
              {es ? "Método de pago" : "Payment method"}
            </label>

            <select
              value={
                nuevoCobro
                  .metodo_pago
              }
              onChange={(e) =>
                setNuevoCobro({
                  ...nuevoCobro,
                  metodo_pago:
                    e.target.value,
                })
              }
              className="
                mint-input
                w-full
                p-3
              "
            >
              <option value="">
                {es ? "Seleccionar método" : "Select method"}
              </option>

              <option value="Efectivo">
                {es ? "Efectivo" : "Cash"}
              </option>

              <option value="Tarjeta">
                {es ? "Tarjeta" : "Card"}
              </option>

              <option value="Transferencia">
                {es ? "Transferencia" : "Bank transfer"}
              </option>

              <option value="Cheque">
                Cheque
              </option>
            </select>
          </div>

          <div>
            <label
              className="
                block
                text-sm
                font-semibold
                mint-text-primary
                mb-2
              "
            >
              {es ? "Moneda" : "Currency"}
            </label>

            <select
              value={
                nuevoCobro.moneda
              }
              onChange={(e) => {

  const nuevaMoneda =
    e.target.value;

  const saldoPendienteMXN =
    Number(
      tratamientoCobro
        ?.pendiente || 0
    );

  const montoConvertido =
    nuevaMoneda === "USD"
      ? (
          tipoCambioCobro > 0
            ? saldoPendienteMXN /
              tipoCambioCobro
            : 0
        ).toFixed(2)
      : saldoPendienteMXN.toFixed(2);

  setNuevoCobro({
    ...nuevoCobro,

    moneda:
      nuevaMoneda,

    monto:
      montoConvertido,
  });

}}
              className="
                mint-input
                w-full
                p-3
              "
            >
              <option value="MXN">
                MXN
              </option>

              <option value="USD">
                USD
              </option>
            </select>
          </div>

          {
  nuevoCobro.moneda === "USD" &&
  tipoCambioCobro > 0 && (

    <div
      className="
        bg-[var(--mint-primary-soft)]
        border
        border-[var(--mint-border-primary)]
        rounded-xl
        p-3
      "
    >

      <p
        className="
          text-sm
          font-semibold
          mint-text-brand
        "
      >
        {es ? "Tipo de cambio:" : "Exchange rate:"}
        {" "}
        1 USD = ${tipoCambioCobro.toFixed(2)} MXN
      </p>

      <p
  className="
    text-sm
    font-bold
    mint-text-primary
    mt-1
  "
>
  Equivalente:
  {" "}
  $
  {(
    Number(
      nuevoCobro.monto || 0
    ) *
    tipoCambioCobro
  ).toLocaleString(
    "es-MX",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}
  {" "}
  MXN
</p>

    </div>

  )
}

          <div>
            <label
              className="
                block
                text-sm
                font-semibold
                mint-text-primary
                mb-2
              "
            >
              {es ? "Monto del cobro" : "Payment amount"}
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                nuevoCobro.monto
              }
              onChange={(e) =>
                setNuevoCobro({
                  ...nuevoCobro,
                  monto:
                    e.target.value,
                })
              }
              className="
                mint-input
                w-full
                p-3
              "
              placeholder="0.00"
            />
          </div>

          {
            puedeAplicarDescuentos && (
          <div
            className="
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
              rounded-2xl
              p-4
              space-y-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    mint-text-primary
                  "
                >
                  {es ? "Descuento" : "Discount"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "No se registra como pago." : "It is not recorded as a payment."}
                </p>
              </div>

              <div
                className="
                  inline-flex
                  rounded-xl
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg-card)]
                  p-1
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setTipoDescuentoCobro(
                      "monto"
                    )
                  }
                  className={`
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-bold
                    transition
                    ${
                      tipoDescuentoCobro ===
                      "monto"
                        ? "bg-[var(--mint-primary)] text-white"
                        : "mint-text-secondary"
                    }
                  `}
                >
                  {monedaPrecioCobro}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTipoDescuentoCobro(
                      "porcentaje"
                    )
                  }
                  className={`
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-bold
                    transition
                    ${
                      tipoDescuentoCobro ===
                      "porcentaje"
                        ? "bg-[var(--mint-primary)] text-white"
                        : "mint-text-secondary"
                    }
                  `}
                >
                  %
                </button>
              </div>
            </div>

            <input
              type="number"
              min="0"
              max={
                tipoDescuentoCobro ===
                "porcentaje"
                  ? 100
                  : pendienteOriginalCobro
              }
              step="0.01"
              value={
                valorDescuentoCobro
              }
              onChange={(e) =>
                setValorDescuentoCobro(
                  e.target.value
                )
              }
              className="
                mint-input
                w-full
                p-3
              "
              placeholder="0.00"
            />

            <div
              className="
                flex
                justify-between
                gap-4
                text-sm
              "
            >
              <span
                className="
                  mint-text-secondary
                "
              >
                {es ? "Descuento aplicado" : "Discount applied"}
              </span>

              <strong
                className="
                  text-[var(--mint-danger)]
                "
              >
                -$
                {descuentoOriginalCobro.toLocaleString(
                  "es-MX",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
                {" "}
                {monedaPrecioCobro}
              </strong>
            </div>

            <button
              type="button"
              onClick={() =>
                registrarCobro(
                  "descuento"
                )
              }
              disabled={
                descuentoOriginalCobro <= 0
              }
              className="
                mint-btn
                mint-btn-primary
                w-full
                px-4
                py-2.5
                text-sm
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {es ? "Aplicar descuento" : "Apply discount"}
            </button>
          </div>
            )
          }

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-3
            "
          >

            <div>
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Laboratorio" : "Laboratory"}
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  nuevoCobro
                    .laboratorio
                }
                onChange={(e) =>
                  setNuevoCobro({
                    ...nuevoCobro,
                    laboratorio:
                      e.target.value,
                  })
                }
                className="
                  mint-input
                  w-full
                  p-3
                "
              />
            </div>

            <div>
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Especialista" : "Specialist"}
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  nuevoCobro
                    .especialista
                }
                onChange={(e) =>
                  setNuevoCobro({
                    ...nuevoCobro,
                    especialista:
                      e.target.value,
                  })
                }
                className="
                  mint-input
                  w-full
                  p-3
                "
              />
            </div>

          <div>

  <label
    className="
      block
      text-xs
      font-semibold
      mint-text-secondary
      mb-2
    "
  >
    {es ? "Comisión banco" : "Bank fee"}
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    value={
      comisionBancoActual.toFixed(2)
    }
    readOnly
    className="
      mint-input
      w-full
      p-3
    "
  />

  {
    porcentajeComisionActual > 0 && (
      <div
        className="
          mt-2
          text-xs
          mint-text-secondary
          space-y-1
        "
      >

        <div>
          Comisión {porcentajeComisionActual}%:{" "}
          ${comisionBaseActual.toFixed(2)}
        </div>

        <div>
          IVA {porcentajeIvaComisionActual}%:{" "}
          ${ivaComisionActual.toFixed(2)}
        </div>

        <div
          className="
            font-semibold
            mint-text-primary
          "
        >
          Neto clínica:{" "}
          ${netoCobroActual.toFixed(2)}
        </div>

      </div>
    )
  }

</div>

          </div>

          <div
            className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-4
            "
          >
            <div
              className="
                flex
                justify-between
                text-sm
                mb-2
              "
            >
              <span
                className="
                  mint-text-secondary
                "
              >
                {es ? "Total actual" : "Current total"}
              </span>

              <strong
                className="
                  mint-text-primary
                "
              >
                $
                {totalOriginalCobro.toLocaleString(
                  "es-MX",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
                {" "}
                {monedaPrecioCobro}
              </strong>
            </div>

            {
              descuentoOriginalCobro > 0 && (
                <>
                  <div
                    className="
                      flex
                      justify-between
                      text-sm
                      mb-2
                    "
                  >
                    <span
                      className="
                        mint-text-secondary
                      "
                    >
                      {es ? "Descuento nuevo" : "New discount"}
                    </span>

                    <strong
                      className="
                        text-[var(--mint-danger)]
                      "
                    >
                      -$
                      {descuentoOriginalCobro.toLocaleString(
                        "es-MX",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                      {" "}
                      {monedaPrecioCobro}
                    </strong>
                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      text-sm
                      mb-2
                    "
                  >
                    <span
                      className="
                        mint-text-secondary
                      "
                    >
                      {es ? "Total a cobrar" : "Amount to charge"}
                    </span>

                    <strong
                      className="
                        mint-text-brand
                      "
                    >
                      $
                      {totalOriginalDespuesDescuentoCobro.toLocaleString(
                        "es-MX",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                      {" "}
                      {monedaPrecioCobro}
                    </strong>
                  </div>
                </>
              )
            }

            <div
              className="
                hidden
              "
            >
              <span>
                {es ? "Total tratamiento" : "Treatment total"}
              </span>

              <strong
                className="
                  mint-text-primary
                "
              >
                $
                {
                  Number(
                    tratamientoCobro
                      ?.moneda_precio ===
                    "USD"
                      ? tratamientoCobro
                          ?.total_original ??
                        tratamientoCobro
                          ?.total ??
                        0
                      : tratamientoCobro
                          ?.total || 0
                  ).toLocaleString()
                }
                {" "}
                {
                  tratamientoCobro
                    ?.moneda_precio ||
                  "MXN"
                }
              </strong>
            </div>

            <div
              className="
                flex
                justify-between
                text-sm
                mb-2
              "
            >
              <span
                className="
                  mint-text-secondary
                "
              >
                {es ? "Pagado" : "Paid"}
              </span>

              <strong
                className="
                  text-[var(--mint-success)]
                "
              >
                $
                {
                  Number(
                    tratamientoCobro
                      ?.moneda_precio ===
                    "USD"
                      ? tratamientoCobro
                          ?.pagado_original ??
                        tratamientoCobro
                          ?.pagado ??
                        0
                      : tratamientoCobro
                          ?.pagado || 0
                  ).toLocaleString()
                }
                {" "}
                {
                  tratamientoCobro
                    ?.moneda_precio ||
                  "MXN"
                }
              </strong>
            </div>

       <div
  className="
    flex
    justify-between
    items-start
    text-sm
  "
>
  <span
    className="
      mint-text-secondary
    "
  >
    {es ? "Pendiente" : "Pending"}
  </span>

  <div
    className="
      text-right
    "
  >
    <strong
      className="
        block
        text-[var(--mint-danger)]
      "
    >
      $
      {
        Number(
          tratamientoCobro
            ?.moneda_precio ===
          "USD"
            ? tratamientoCobro
                ?.resta_original ??
              tratamientoCobro
                ?.pendiente ??
              0
            : tratamientoCobro
                ?.pendiente || 0
        ).toLocaleString(
          "es-MX",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      }
      {" "}
      {
        tratamientoCobro
          ?.moneda_precio ||
        "MXN"
      }
    </strong>

    {
      tipoCambioCobro > 0 &&
      tratamientoCobro
        ?.moneda_precio ===
      "USD" && (

        <span
          className="
            block
            text-xs
            font-semibold
            mint-text-secondary
            mt-1
          "
        >
          ≈ $
          {(
            Number(
              tratamientoCobro
                ?.resta_original ??
              tratamientoCobro
                ?.pendiente ??
              0
            ) *
            tipoCambioCobro
          ).toLocaleString(
            "es-MX",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
          {" "}
          MXN
        </span>

      )
    }

    {
      tipoCambioCobro > 0 &&
      tratamientoCobro
        ?.moneda_precio !==
      "USD" && (

        <span
          className="
            block
            text-xs
            font-semibold
            mint-text-secondary
            mt-1
          "
        >
          ≈ $
          {(
            Number(
              tratamientoCobro
                ?.pendiente || 0
            ) /
            tipoCambioCobro
          ).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
          {" "}
          USD
        </span>

      )
    }
  </div>
</div>
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

              setMostrarModalCobro(
                false
              );

              setTratamientoCobro(
                null
              );

              setTipoDescuentoCobro(
                "monto"
              );

              setValorDescuentoCobro(
                ""
              );

            }}
            className="
              mint-btn
              mint-btn-neutral
              px-4
              py-2
              text-sm
            "
          >
            {es ? "Cancelar" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={() =>
              registrarCobro(
                "cobro"
              )
            }
            className="
              mint-btn
              mint-btn-primary
              px-4
              py-2
              text-sm
            "
          >
            {es ? "Registrar cobro" : "Record payment"}
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
        mint-card
        p-6
        w-full
        max-w-xl
      ">

        <h2 className="
          text-2xl
          font-bold
          mint-text-primary
          mb-5
        ">

          {es ? "Nueva Cita" : "New Appointment"}

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
      mint-input
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
      mint-input
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
      mint-input
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
      mint-input
      p-3
    "

  >

    <option value="pendiente">
      {es ? "Pendiente" : "Pending"}
    </option>

    <option value="confirmada">
      {es ? "Confirmada" : "Confirmed"}
    </option>

    <option value="cancelada">
      Cancelada
    </option>

    <option value="tratamiento">
      {es ? "Tratamiento" : "Treatment"}
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
      mint-input
      p-3
    "

    placeholder={es ? "Doctor" : "Doctor"}

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
              setMostrarModalCita(
                false
              )
            }

            className="
              mint-btn
              mint-btn-danger
              px-4
              py-2
              text-sm
            "

          >

            {es ? "Cancelar" : "Cancel"}

          </button>

          <button

            onClick={
              guardarCitaPaciente
            }

            className="
              mint-btn
              mint-btn-primary
              px-4
              py-2
              text-sm
            "

          >

            {es ? "Guardar" : "Save"}

          </button>

        </div>

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
  onGuardar={async (
    nuevosEstados,
    nuevasObservaciones
  ) => {

    if (!pacienteAbierto?.id) {
      return false;
    }

    const { error } =
      await supabase
        .from("pacientes")
        .update({
          observaciones_dientes: {
            dientes:
              nuevasObservaciones,

            estados:
              nuevosEstados,

            imagen:
              imagenPreview,
          },
        })
        .eq(
          "id",
          pacienteAbierto.id
        );

    if (error) {

      console.error(
        "Error guardando odontograma:",
        error
      );

      alert(
        es ? "Error guardando odontograma" : "Error saving odontogram"
      );

      return false;
    }

    await registrarBitacora({
      accion: "Guardar odontograma",
      modulo: "Pacientes",
      detalle:
        `Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre}`,
    });

    setPacienteAbierto({
      ...pacienteAbierto,

      observaciones_dientes: {
        dientes:
          nuevasObservaciones,

        estados:
          nuevosEstados,

        imagen:
          imagenPreview,
      },
    });

    setPacientes(
      pacientes.map((p) =>
        p.id === pacienteAbierto.id
          ? {
              ...p,

              observaciones_dientes: {
                dientes:
                  nuevasObservaciones,

                estados:
                  nuevosEstados,

                imagen:
                  imagenPreview,
              },
            }
          : p
      )
    );

    return true;
  }}
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
        mint-card
        p-6
      ">

        <h3 className="
          text-2xl
          font-bold
          mb-6
          mint-text-primary
        ">

          {es ? "Historial Médico" : "Medical History"}

        </h3>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        ">

          <div className="
            bg-[var(--mint-bg-soft)]
            border
            border-[var(--mint-border)]
            rounded-2xl
            p-4
          ">
            <p className="
              text-sm
              mint-text-secondary
            ">
              {es ? "Fuma" : "Smokes"}
            </p>

            <p className="
              font-bold
              mint-text-primary
            ">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.fuma

                  ? (es ? "Sí" : "Yes")

                  : "No"
              }
            </p>
          </div>

          <div className="
            bg-[var(--mint-bg-soft)]
            border
            border-[var(--mint-border)]
            rounded-2xl
            p-4
          ">
            <p className="
              text-sm
              mint-text-secondary
            ">
              {es ? "Consume alcohol" : "Consumes alcohol"}
            </p>

            <p className="
              font-bold
              mint-text-primary
            ">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.alcohol

                  ? (es ? "Sí" : "Yes")

                  : "No"
              }
            </p>
          </div>

          <div className="
            bg-[var(--mint-bg-soft)]
            border
            border-[var(--mint-border)]
            rounded-2xl
            p-4
          ">
            <p className="
              text-sm
              mint-text-secondary
            ">
              {es ? "Embarazo" : "Pregnancy"}
            </p>

            <p className="
              font-bold
              mint-text-primary
            ">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.embarazo

                  ? (es ? "Sí" : "Yes")

                  : "No"
              }
            </p>
          </div>

          <div className="
            bg-[var(--mint-primary-soft)]
            border
            border-[var(--mint-border-primary)]
            rounded-2xl
            p-4
          ">
            <p className="
              text-sm
              mint-text-secondary
            ">
              {es ? "Consentimiento" : "Consent"}
            </p>

            <p className="
              font-bold
              mint-text-primary
            ">
              {
                pacienteAbierto
                  ?.historial_clinico
                  ?.consentimiento

                  ? (es ? "Firmado" : "Signed")

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
              mint-text-secondary
              mb-1
            ">
              {es ? "Alergias" : "Allergies"}
            </p>

            <div className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-4
              mint-text-primary
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
              mint-text-secondary
              mb-1
            ">
              {es ? "Enfermedades" : "Conditions"}
            </p>

            <div className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-4
              mint-text-primary
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
              mint-text-secondary
              mb-1
            ">
              {es ? "Medicamentos" : "Medications"}
            </p>

            <div className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-4
              mint-text-primary
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

      <div className="
        mint-card
        p-6
      ">

        <div className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-3
          mb-5
        ">

          <div>

            <h3 className="
              text-xl
              font-bold
              mint-text-primary
            ">
              {es ? "Historial de cambios" : "Change history"}
            </h3>

            <p className="
              text-sm
              mint-text-secondary
              mt-1
            ">
              {es ? "Versiones anteriores del historial médico." : "Previous versions of the medical history."}
              {es ? "Este registro es de solo lectura." : "This record is read-only."}
            </p>

          </div>

          <span className="
            inline-flex
            items-center
            self-start
            rounded-full
            bg-[var(--mint-primary-soft)]
            border
            border-[var(--mint-border-primary)]
            px-3
            py-1
            text-xs
            font-semibold
            mint-text-brand
          ">
            {historialMedicoCambios.length}
            {" "}
            {
              historialMedicoCambios.length === 1
                ? (es ? "versión" : "version")
                : (es ? "versiones" : "versions")
            }
          </span>

        </div>

        {
          cargandoHistorialMedico ? (

            <div className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-5
              text-sm
              mint-text-secondary
            ">
              {es ? "Cargando historial de cambios..." : "Loading change history..."}
            </div>

          ) : historialMedicoCambios.length === 0 ? (

            <div className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-5
            ">

              <p className="
                font-semibold
                mint-text-primary
              ">
                {es ? "Sin cambios registrados" : "No changes recorded"}
              </p>

              <p className="
                text-sm
                mint-text-secondary
                mt-1
              ">
                {es
                  ? "Cuando se modifique información médica, la versión anterior aparecerá aquí automáticamente."
                  : "When medical information changes, the previous version will appear here automatically."}
              </p>

            </div>

          ) : (

            <div className="
              space-y-4
            ">

              {
                historialMedicoCambios.map(
                  (cambio, index) => {

                    const versionMasNueva =
                      index === 0
                        ? pacienteAbierto
                        : historialMedicoCambios[
                            index - 1
                          ];

                    const valorHistorial = (
                      registro: any,
                      campo: string
                    ) =>
                      registro?.[campo] ??
                      registro?.historial_clinico?.[
                        campo
                      ] ??
                      "";

                    const campos = [
                      {
                        clave: "alergias",
                        etiqueta: es ? "Alergias" : "Allergies",
                      },
                      {
                        clave: "enfermedades",
                        etiqueta: es ? "Enfermedades" : "Conditions",
                      },
                      {
                        clave: "medicamentos",
                        etiqueta: "Medicamentos",
                      },
                      {
                        clave: "fuma",
                        etiqueta: "Fuma",
                      },
                      {
                        clave: "alcohol",
                        etiqueta:
                          "Consume alcohol",
                      },
                      {
                        clave: "embarazo",
                        etiqueta: "Embarazo",
                      },
                    ];

                    const camposModificados =
                      campos.filter(
                        ({ clave }) =>
                          JSON.stringify(
                            valorHistorial(
                              cambio,
                              clave
                            )
                          ) !==
                          JSON.stringify(
                            valorHistorial(
                              versionMasNueva,
                              clave
                            )
                          )
                      );

                    return (

                      <div
                        key={cambio.id}
                        className="
                          bg-[var(--mint-bg-soft)]
                          border
                          border-[var(--mint-border)]
                          rounded-2xl
                          p-5
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          md:flex-row
                          md:items-start
                          md:justify-between
                          gap-3
                        ">

                          <div>

                            <p className="
                              font-bold
                              mint-text-primary
                            ">
                              Versión anterior
                            </p>

                            <p className="
                              text-sm
                              mint-text-secondary
                              mt-1
                            ">
                              {
                                cambio.usuario_nombre ||
                                "Usuario de MintOS"
                              }
                              {" · "}
                              {
                                new Date(
                                  cambio.created_at
                                ).toLocaleString(
                                  "es-MX",
                                  {
                                    dateStyle:
                                      "medium",
                                    timeStyle:
                                      "short",
                                  }
                                )
                              }
                            </p>

                          </div>

                          <span className="
                            inline-flex
                            self-start
                            rounded-full
                            bg-white
                            border
                            border-[var(--mint-border)]
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            mint-text-secondary
                          ">
                            Solo lectura
                          </span>

                        </div>

                        {
                          camposModificados.length > 0 && (

                            <div className="
                              mt-4
                              flex
                              flex-wrap
                              gap-2
                            ">

                              {
                                camposModificados.map(
                                  ({ clave, etiqueta }) => (

                                    <span
                                      key={clave}
                                      className="
                                        rounded-full
                                        bg-[var(--mint-primary-soft)]
                                        border
                                        border-[var(--mint-border-primary)]
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-semibold
                                        mint-text-brand
                                      "
                                    >
                                      {etiqueta} modificado
                                    </span>

                                  )
                                )
                              }

                            </div>

                          )
                        }

                        <div className="
                          mt-4
                          grid
                          grid-cols-1
                          md:grid-cols-3
                          gap-3
                        ">

                          {
                            [
                              [
                                es ? "Alergias" : "Allergies",
                                valorHistorial(
                                  cambio,
                                  "alergias"
                                ),
                              ],
                              [
                                es ? "Enfermedades" : "Conditions",
                                valorHistorial(
                                  cambio,
                                  "enfermedades"
                                ),
                              ],
                              [
                                "Medicamentos",
                                valorHistorial(
                                  cambio,
                                  "medicamentos"
                                ),
                              ],
                            ].map(
                              ([etiqueta, valor]) => (

                                <div
                                  key={String(etiqueta)}
                                  className="
                                    bg-white
                                    border
                                    border-[var(--mint-border)]
                                    rounded-xl
                                    p-3
                                  "
                                >

                                  <p className="
                                    text-xs
                                    font-semibold
                                    mint-text-muted
                                  ">
                                    {String(etiqueta)}
                                  </p>

                                  <p className="
                                    text-sm
                                    font-semibold
                                    mint-text-primary
                                    mt-1
                                    whitespace-pre-wrap
                                  ">
                                    {
                                      valor
                                        ? String(valor)
                                        : "-"
                                    }
                                  </p>

                                </div>

                              )
                            )
                          }

                        </div>

                      </div>

                    );

                  }
                )
              }

            </div>

          )
        }

      </div>

    </div>

  )
}

{
  tabActiva ===
  "citas" && (

    <div className="
      mint-card
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
    mint-text-primary
  ">

    {es ? "Citas" : "Appointments"}

  </h3>

  {
    puedeEditarCitas && (

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
          mint-btn
          mint-btn-primary
          px-4
          py-2
          text-sm
        "

      >

        {es ? "+ Agregar" : "+ Add"}

      </button>

    )
  }

</div>

      <div className="
        overflow-x-auto
      ">

        <table className="
          w-full
        ">

          <thead>

            <tr className="
              bg-[var(--mint-bg-soft)]
              border-b
              border-[var(--mint-border)]
            ">

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Fecha" : "Date"}
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Hora" : "Time"}
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Estado" : "Status"}
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Doctor" : "Doctor"}
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Acciones" : "Actions"}
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
                        mint-text-secondary
                      "
                    >

                      {es ? "No hay citas registradas" : "No appointments recorded"}

                    </td>

                  </tr>

                )

                : citas.map(

                                    (cita: any) => (

                    <tr
                      key={cita.id}
                      className="
                        border-b
                        border-[var(--mint-border)]
                        hover:bg-[var(--mint-bg-soft)]
                        transition-colors
                      "
                    >

                      <td className="
                        p-3
                        mint-text-primary
                      ">

                        {
                          new Date(
                            cita.inicio
                          ).toLocaleDateString(
                            "es-MX"
                          )
                        }

                      </td>

                      <td className="
                        p-3
                        mint-text-primary
                      ">

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

                      <td className="
                        p-3
                        mint-text-secondary
                      ">

                        {textoEstado(cita.estado)}

                      </td>

                      <td className="
                        p-3
                        mint-text-primary
                      ">

                        {cita.doctor}

                      </td>

                      <td className="p-3">

                        <div className="
                          flex
                          gap-2
                        ">

                          {
                            puedeEditarCitas && (

                              <>

                                <button

                                  onClick={() =>
                                    editarCita(
                                      cita
                                    )
                                  }

                                  className="
                                    mint-btn
                                    mint-btn-secondary
                                    px-3
                                    py-1
                                    text-sm
                                  "

                                >

                                  {es ? "Editar" : "Edit"}

                                </button>

                                <button

                                  onClick={() =>
                                    eliminarCita(
                                      cita.id
                                    )
                                  }

                                  className="
                                    mint-btn
                                    mint-btn-danger
                                    px-3
                                    py-1
                                    text-sm
                                  "

                                >

                                  {es ? "Eliminar" : "Delete"}

                                </button>

                              </>

                            )
                          }

                        </div>

                      </td>

                    </tr>

                  )
                )

            }

          </tbody>

        </table>

      </div>

    </div>

  )
}

              <div className="
                mt-8
                bg-[var(--mint-bg-soft)]
                border
                border-[var(--mint-border)]
                rounded-3xl
                p-4
              ">

                <h3 className="
                  text-lg
                  font-bold
                  mb-4
                  mint-text-primary
                ">

                  {es ? "Radiografías / Fotos" : "X-rays / Photos"}

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
                  className="
                    mint-input
                    w-full
                    p-2
                    text-sm
                  "
                />

                {

                  imagenPreview && (

                    <img
                      src={imagenPreview}
                      alt={es ? "Radiografía" : "X-ray"}
                      className="
                        mt-5
                        rounded-2xl
                        max-h-[500px]
                        border
                        border-[var(--mint-border)]
                      "
                    />

                  )

                }

              </div>

              <div className="
                mt-8
                pt-5
                border-t
                border-[var(--mint-border)]
                flex
                justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={
                    generarPDF
                  }
                  className="
                    mint-btn
                    mint-btn-secondary
                    px-5
                    py-2.5
                    text-sm
                  "
                >
                  PDF
                </button>

                <button
                  type="button"
                  onClick={
                    guardarExpediente
                  }
                  className="
                    mint-btn
                    mint-btn-primary
                    px-6
                    py-2.5
                    text-sm
                  "
                >
                  {es ? "Guardar" : "Save"}
                </button>

              </div>

            </div>

          )

                    :

                   (

            <div
              className="
                h-full
                flex
                flex-col
                gap-4
              "
            >

              <div
                className="
                  flex
                  flex-col
                  xl:flex-row
                  xl:items-end
                  xl:justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      mint-text-brand
                    "
                  >
                    {es ? "Pacientes" : "Patients"}
                  </p>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      mint-text-primary
                      mt-1
                    "
                  >
                    {es ? "Buscar expediente" : "Search patient records"}
                  </h2>

                  <p
                    className="
                      text-sm
                      mint-text-secondary
                      mt-2
                    "
                  >
                    {es ? "Encuentra rápidamente un paciente por nombre" : "Quickly find a patient by name"}
                    {es ? "o número de teléfono." : "or phone number."}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarQR(true)
                  }
                  className="
                    mint-btn
                    mint-btn-primary
                    px-5
                    py-2.5
                    text-sm
                    shrink-0
                  "
                >
                  + QR
                </button>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  xl:grid-cols-4
                  gap-3
                "
              >

                <div
                  className="
                    mint-card
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      mint-text-muted
                    "
                  >
                    {es ? "Pacientes registrados" : "Registered patients"}
                  </p>

                  <p
                    className="
                      text-2xl
                      font-bold
                      mint-text-primary
                      mt-2
                    "
                  >
                    {pacientes.length}
                  </p>
                </div>

                <div
                  className="
                    mint-card
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      mint-text-muted
                    "
                  >
                    {es ? "Nuevos este mes" : "New this month"}
                  </p>

                  <p
                    className="
                      text-2xl
                      font-bold
                      mint-text-brand
                      mt-2
                    "
                  >
                    {pacientesNuevosMes}
                  </p>
                </div>

                <div
                  className="
                    mint-card
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      mint-text-muted
                    "
                  >
                    {es ? "Con saldo pendiente" : "With outstanding balance"}
                  </p>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-danger)]
                      mt-2
                    "
                  >
                    {pacientesConSaldo}
                  </p>
                </div>

                <div
                  className="
                    mint-card
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      mint-text-muted
                    "
                  >
                    {es ? "Tratamientos pendientes" : "Pending treatments"}
                  </p>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-warning)]
                      mt-2
                    "
                  >
                    {tratamientosPendientesGlobal}
                  </p>
                </div>

              </div>

              <div
                className="
                  mint-card
                  p-5
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-end
                    gap-4
                  "
                >

                  <div
                    className="
                      flex-1
                    "
                  >

                    <label
                      className="
                        mint-label
                      "
                    >
                      {es ? "Buscar por nombre" : "Search by name"}
                    </label>

                    <input
                      value={busqueda}
                      onChange={(e) =>
                        setBusqueda(
                          e.target.value
                        )
                      }
                      placeholder={es ? "Ej. María López" : "E.g. Maria Lopez"}
                      className="
                        mint-input
                        w-full
                        px-4
                        py-2.5
                        text-sm
                      "
                    />

                  </div>

                  <div
                    className="
                      flex-1
                    "
                  >

                    <label
                      className="
                        mint-label
                      "
                    >
                      {es ? "Buscar por teléfono" : "Search by phone"}
                    </label>

                    <input
                      value={busquedaTelefono}
                      onChange={(e) =>
                        setBusquedaTelefono(
                          e.target.value
                        )
                      }
                      placeholder={es ? "Ej. 6531234567" : "E.g. 6531234567"}
                      className="
                        mint-input
                        w-full
                        px-4
                        py-2.5
                        text-sm
                      "
                    />

                  </div>

                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    mt-5
                    mb-3
                  "
                >

                  <h3
                    className="
                      text-base
                      font-bold
                      mint-text-primary
                    "
                  >
                    {es ? "Resultados" : "Results"}
                  </h3>

                  <span
                    className="
                      mint-badge
                      mint-badge-primary
                    "
                  >
                    {pacientesFiltrados.length} {es ? "pacientes" : "patients"}
                  </span>

                </div>

                {
                  pacientesFiltrados.length === 0

                    ? (

                      <div
                        className="
                          mint-empty
                          py-10
                        "
                      >
                        {es ? "No encontramos pacientes con esos datos." : "No patients found with that information."}
                      </div>

                    )

                    : (

                      <div
                        className="
                          border
                          border-[var(--mint-border)]
                          rounded-2xl
                          overflow-hidden
                        "
                      >

                        {
                          pacientesFiltrados.map(
                            (p) => (

                              <div
                                key={p.id}
                                className="
                                  px-4
                                  py-3
                                  flex
                                  flex-col
                                  md:flex-row
                                  md:items-center
                                  gap-3
                                  border-b
                                  last:border-b-0
                                  border-[var(--mint-border)]
                                  hover:bg-[var(--mint-bg-soft)]
                                  transition
                                "
                              >

                                <div
                                  className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-[var(--mint-primary-soft)]
                                    text-[var(--mint-primary)]
                                    flex
                                    items-center
                                    justify-center
                                    font-bold
                                    shrink-0
                                  "
                                >
                                  {
                                    p.nombre
                                      ?.charAt(0)
                                      ?.toUpperCase()
                                  }
                                </div>

                                <div
                                  className="
                                    flex-1
                                    min-w-0
                                  "
                                >

                                  <p
                                    className="
                                      text-sm
                                      font-bold
                                      mint-text-primary
                                      truncate
                                    "
                                  >
                                    {p.nombre}
                                  </p>

                                  <p
                                    className="
                                      text-xs
                                      mint-text-secondary
                                      mt-1
                                      truncate
                                    "
                                  >
                                    {
                                      p.telefono ||
                                      "Sin teléfono"
                                    }
                                    {
                                      p.correo
                                        ? ` · ${p.correo}`
                                        : ""
                                    }
                                  </p>

                                </div>

                                <div
                                  className="
                                    md:text-right
                                    shrink-0
                                  "
                                >

                                  <p
                                    className="
                                      text-xs
                                      uppercase
                                      tracking-wide
                                      mint-text-muted
                                    "
                                  >
                                    {es ? "Expediente" : "Record"}
                                  </p>

                                  <p
                                    className="
                                      text-sm
                                      font-bold
                                      mint-text-primary
                                      mt-0.5
                                    "
                                  >
                                    #{p.id}
                                  </p>

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirPaciente(p)
                                  }
                                  className="
                                    mint-btn
                                    mint-btn-primary
                                    px-4
                                    py-2
                                    text-sm
                                    shrink-0
                                  "
                                >
                                  {es ? "Abrir expediente" : "Open record"}
                                </button>

                              </div>

                            )
                          )
                        }

                      </div>

                    )
                }

              </div>

            </div>

          )
        }

      </div>

      {
        mostrarEditarPaciente &&
        pacienteAbierto && (

          <div
            className="
              fixed
              inset-0
              z-50
              bg-black/40
              flex
              items-center
              justify-center
              p-4
            "
            onClick={() =>
              setMostrarEditarPaciente(
                false
              )
            }
          >

            <div
              className="
                mint-card
                w-full
                max-w-2xl
                p-6
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="
                flex
                items-start
                justify-between
                gap-4
                mb-6
              ">

                <div>

                  <p className="
                    text-xs
                    uppercase
                    tracking-wide
                    font-semibold
                    mint-text-muted
                  ">
                    {es ? "Expediente" : "Record"} #{pacienteAbierto.id}
                  </p>

                  <h3 className="
                    text-xl
                    font-bold
                    mint-text-primary
                    mt-1
                  ">
                    {es ? "Editar paciente" : "Edit patient"}
                  </h3>

                  <p className="
                    text-sm
                    mint-text-secondary
                    mt-1
                  ">
                    {es ? "Actualiza los datos generales del paciente." : "Update the patient’s general information."}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarEditarPaciente(
                      false
                    )
                  }
                  className="
                    mint-btn
                    mint-btn-secondary
                    w-9
                    h-9
                    rounded-full
                    p-0
                    font-bold
                    shrink-0
                  "
                >
                  ×
                </button>

              </div>

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              ">

                <label className="
                  flex
                  flex-col
                  gap-2
                  md:col-span-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Nombre" : "Name"}
                  </span>

                  <input
                    type="text"
                    value={
                      datosPacienteEditando.nombre
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        nombre:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Teléfono" : "Phone"}
                  </span>

                  <input
                    type="tel"
                    value={
                      datosPacienteEditando.telefono
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        telefono:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Correo" : "Email"}
                  </span>

                  <input
                    type="email"
                    value={
                      datosPacienteEditando.correo
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        correo:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Edad" : "Age"}
                  </span>

                  <input
                    type="text"
                    value={
                      datosPacienteEditando.edad
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        edad:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Sexo" : "Sex"}
                  </span>

                  <input
                    type="text"
                    value={
                      datosPacienteEditando.sexo
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        sexo:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                  md:col-span-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Dirección" : "Address"}
                  </span>

                  <input
                    type="text"
                    value={
                      datosPacienteEditando.direccion
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        direccion:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

              </div>

              <div className="
                mt-6
                pt-5
                border-t
                border-[var(--mint-border)]
                flex
                justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={() =>
                    setMostrarEditarPaciente(
                      false
                    )
                  }
                  className="
                    mint-btn
                    mint-btn-secondary
                    px-5
                    py-2.5
                    text-sm
                  "
                >
                  {es ? "Cancelar" : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={
                    guardarDatosPaciente
                  }
                  className="
                    mint-btn
                    mint-btn-primary
                    px-5
                    py-2.5
                    text-sm
                  "
                >
                  {es ? "Guardar cambios" : "Save changes"}
                </button>

              </div>

            </div>

          </div>

        )
      }

      {
        mostrarQR && (

          <div
            className="
              fixed
              inset-0
              z-50
              bg-black/40
              flex
              items-center
              justify-center
              p-4
            "
            onClick={() =>
              setMostrarQR(false)
            }
          >

            <div
              className="
                mint-card
                w-full
                max-w-md
                p-6
                relative
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                type="button"
                onClick={() =>
                  setMostrarQR(false)
                }
                className="
                  mint-btn
                  mint-btn-secondary
                  absolute
                  top-4
                  right-4
                  w-9
                  h-9
                  rounded-full
                  p-0
                  font-bold
                "
              >
                ×
              </button>

              <div
                className="
                  text-center
                "
              >

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    mint-text-brand
                  "
                >
                  {es ? "Registro de pacientes" : "Patient registration"}
                </p>

                <h2
                  className="
                    text-2xl
                    font-bold
                    mint-text-primary
                    mt-2
                  "
                >
                  {es ? "Código QR" : "QR Code"}
                </h2>

                <p
                  className="
                    text-sm
                    mint-text-secondary
                    mt-2
                  "
                >
                  {es ? "Escanea este código desde un teléfono" : "Scan this code from a phone"}
                  {es ? "para abrir el formulario de registro." : "to open the registration form."}
                </p>

                <div
                  className="
                    max-w-[260px]
                    mx-auto
                    mt-6
                  "
                >
                  <QRCodePaciente />
                </div>

              </div>

            </div>

          </div>

        )
      }

    </div>

  );

}