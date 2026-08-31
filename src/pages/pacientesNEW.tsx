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

    const [
  mostrarQR,
  setMostrarQR,
] = useState(false);

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

}, []);

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

if (errorTipoCambio) {

  console.error(
    "Error cargando tipo de cambio:",
    errorTipoCambio
  );

} else {

  setTipoCambioCobro(
    Number(
      tipoCambioData?.valor || 0
    )
  );

}

  setTratamientoCobro(
    tratamiento
  );

  setNuevoCobro({

    metodo_pago:
      tratamiento.metodo_pago ||
      "",

    moneda:
      tratamiento.moneda ||
      "MXN",

    monto:
  String(
    Number(
      tratamiento.pendiente ||
      tratamiento.total ||
      0
    )
  ),

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

async function registrarCobro() {

  if (
    !tratamientoCobro?.id
  ) {

    return;

  }

  const montoCobro =
    Number(
      nuevoCobro.monto || 0
    );

    const tipoCambioAplicado =
  nuevoCobro.moneda === "USD"
    ? tipoCambioCobro
    : 1;

if (
  nuevoCobro.moneda === "USD" &&
  tipoCambioAplicado <= 0
) {

  alert(
    "No hay un tipo de cambio válido configurado."
  );

  return;

}

const montoCobroMXN =
  nuevoCobro.moneda === "USD"
    ? montoCobro *
      tipoCambioAplicado
    : montoCobro;

  if (
    montoCobro <= 0
  ) {

    alert(
      "Ingresa un monto válido."
    );

    return;

  }

  if (
    !nuevoCobro.metodo_pago
  ) {

    alert(
      "Selecciona un método de pago."
    );

    return;

  }

  if (
    !nuevoCobro.moneda
  ) {

    alert(
      "Selecciona una moneda."
    );

    return;

  }

  const totalTratamiento =
    Number(
      tratamientoCobro.total || 0
    );

  const pagadoAnterior =
    Number(
      tratamientoCobro.pagado || 0
    );

  const nuevoTotalPagado =
  pagadoAnterior +
  montoCobroMXN;

  if (
    totalTratamiento > 0 &&
    nuevoTotalPagado >
      totalTratamiento
  ) {

    alert(
      "El cobro supera el saldo pendiente del tratamiento."
    );

    return;

  }

  const nuevoPendiente =
    Math.max(
      totalTratamiento -
        nuevoTotalPagado,
      0
    );

const comisionBancoCobro =
  comisionBancoActual;

const comisionBancoAnterior =
  Number(
    tratamientoCobro
      .comision_banco || 0
  );

const nuevaComisionBanco =
  comisionBancoAnterior +
  comisionBancoCobro;

  const {
    error,
  } = await supabase

    .from(
      "tratamientos"
    )

   .update({

  metodo_pago:
    nuevoCobro.metodo_pago,

  moneda:
    nuevoCobro.moneda,

  tipo_cambio:
    nuevoCobro.moneda === "USD"
      ? tipoCambioAplicado
      : null,

  equivalente_mxn:
    montoCobroMXN,

  laboratorio:
    Number(
      nuevoCobro.laboratorio ||
      0
    ),

      especialista:
        Number(
          nuevoCobro.especialista ||
          0
        ),

comision_banco:
  nuevaComisionBanco,

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

  if (error) {

    console.error(
      error
    );

    alert(
      "Error registrando el cobro."
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
                nuevoCobro.metodo_pago,

              moneda:
                nuevoCobro.moneda,

                tipo_cambio:
  nuevoCobro.moneda === "USD"
    ? tipoCambioAplicado
    : null,

equivalente_mxn:
  montoCobroMXN,

              laboratorio:
                Number(
                  nuevoCobro.laboratorio ||
                  0
                ),

              especialista:
                Number(
                  nuevoCobro.especialista ||
                  0
                ),

              comision_banco:
                Number(
                  nuevoCobro.comision_banco ||
                  0
                ),

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

  setNuevoCobro({

    metodo_pago: "",

    moneda: "MXN",

    monto: "",

    laboratorio: "",

    especialista: "",

    comision_banco: "",

  });

  alert(
    "Cobro registrado correctamente."
  );

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

const tratamientoCatalogoSeleccionado =
  catalogoTratamientos.find(
    (tratamiento: any) =>
      tratamiento.nombre ===
      nuevoTratamiento.tratamiento
  );

const totalTratamiento =
  tratamientoCatalogoSeleccionado
    ? Number(
        tratamientoCatalogoSeleccionado
          .precio_mxn || 0
      )
    : Number(
        nuevoTratamiento.total || 0
      );

const pagadoTratamiento =
  Number(
    nuevoTratamiento.pagado || 0
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
        "Error guardando tratamiento."
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
  min-h-[calc(100vh-32px)]
  flex
  flex-col
  gap-3
">

<div
  className="
    mint-card
    p-4
  "
>

  <div
    className="
      flex
      flex-col
      xl:flex-row
      xl:items-center
      gap-4
    "
  >

    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        shrink-0
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
          Pacientes
        </p>

        <p
          className="
            text-sm
            font-bold
            mint-text-primary
            mt-1
          "
        >
          {pacientes.length} registrados
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
          px-4
          py-2
          text-sm
        "
      >
        + QR
      </button>

    </div>

    <div
      className="
        xl:w-[320px]
        shrink-0
      "
    >

      <input
        value={busqueda}
        onChange={(e) =>
          setBusqueda(
            e.target.value
          )
        }
        placeholder="Buscar por nombre, teléfono, correo o ID..."
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
        min-w-0
      "
    >

      {
        pacientesFiltrados.length === 0

          ? (

            <div
              className="
                mint-card
                h-[54px]
                flex
                items-center
                justify-center
                text-sm
                mint-text-muted
              "
            >
              Sin resultados
            </div>

          )

          : (

            <div
              className="
                flex
                gap-2
                overflow-x-auto
                pb-1
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
                          shrink-0
                          min-w-[180px]
                          max-w-[220px]
                          text-left
                          px-3
                          py-2.5
                          transition-all

                          ${
                            seleccionado
                              ? "mint-card-primary"
                              : "mint-card"
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
                              w-9
                              h-9
                              rounded-full
                              flex
                              items-center
                              justify-center
                              shrink-0
                              font-bold
                              text-sm

                              ${
                                seleccionado
                                  ? "mint-btn-primary"
                                  : "mint-card mint-text-secondary"
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
                                      ? "mint-text-brand"
                                      : "mint-text-primary"
                                  }
                                `}
                              >
                                {p.nombre}
                              </h3>

                              <span
                                className="
                                  text-[10px]
                                  mint-text-muted
                                  shrink-0
                                "
                              >
                                #{p.id}
                              </span>

                            </div>

                            <p
                              className="
                                text-xs
                                mint-text-secondary
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

</div>

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
            mint-text-secondary
          ">

            <span>

              <strong className="
                mint-text-primary
                font-semibold
              ">
                Edad:
              </strong>

              {" "}

              {pacienteAbierto.edad || "-"}

            </span>

            <span>

              <strong className="
                mint-text-primary
                font-semibold
              ">
                Sexo:
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
                Correo:
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
          Próxima cita
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

              : "Sin citas programadas"
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
      General
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
      Expediente Clínico
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
      Historial Médico
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
              Tratamientos
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
              Registrados
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
              Total Pagado
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
              Pagos recibidos
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
              Saldo Pendiente
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
              Por cobrar
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

            Tratamientos

          </h3>

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

            + Agregar

          </button>

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
                  Fecha
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
                  Tratamiento
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
                  Doctor
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
                  Total
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
                  Pagado
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
                  Pendiente
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
                  Estado
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
                  Acciones
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
                        No hay tratamientos registrados
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
                                tratamiento.total || 0
                              ).toLocaleString()
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
                                tratamiento.pagado || 0
                              ).toLocaleString()
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
                                tratamiento.pendiente || 0
                              ).toLocaleString()
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
                                    Finalizado
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
                                      En proceso
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
                                        Confirmado
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
                                          Cancelado
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
                                          Pendiente
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
  Registrar cobro
</button>

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
                                Editar
                              </button>

                              <button
                                type="button"
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

              Evolución Clínica

            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
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
              mint-input
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

              Guardar Nota Clínica

            </button>

          </div>

        </div>

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

            Historial

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

                            <span
                              className="
                                font-semibold
                                mint-text-primary
                              "
                            >

                              {
                                nota.doctor_nombre
                              }

                            </span>

                            <span
                              className="
                                text-xs
                                mint-text-secondary
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
                              mint-text-primary
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

          Nuevo Tratamiento

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

              Tratamiento

            </label>

            <select
              value={
                nuevoTratamiento.tratamiento ||
                ""
              }
              onChange={(e) => {

  const tratamientoSeleccionado =
    catalogoTratamientos.find(
      (tratamiento: any) =>
        tratamiento.nombre ===
        e.target.value
    );

  if (
    !tratamientoSeleccionado
  ) {

    setNuevoTratamiento({

      ...nuevoTratamiento,

      tratamiento:
        e.target.value,

      moneda: "MXN",

      total: "",

      pagado: "",

      laboratorio: "",

      especialista: "",

      comision_banco: "",

    });

    return;

  }

  setNuevoTratamiento({

    ...nuevoTratamiento,

    tratamiento:
      tratamientoSeleccionado.nombre,

    moneda: "MXN",

    total:
      String(
        Number(
          tratamientoSeleccionado
            .precio_mxn || 0
        )
      ),

    pagado: "0",

    laboratorio: "",

    especialista:
      tratamientoSeleccionado.tipo ===
      "especialista"
        ? String(
            Number(
              tratamientoSeleccionado
                .costo_especialista_mxn ||
                0
            )
          )
        : "0",

    comision_banco: "0",

  });

}}
              className="
                mint-input
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
                mint-text-primary
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
                mint-input
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
                mint-text-primary
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
                mint-input
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

            Cancelar

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

            Guardar Tratamiento

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
          Registrar cobro
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
              Método de pago
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
                Seleccionar método
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
              Moneda
            </label>

            <select
              value={
                nuevoCobro.moneda
              }
              onChange={(e) =>
                setNuevoCobro({
                  ...nuevoCobro,
                  moneda:
                    e.target.value,
                })
              }
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
        Tipo de cambio:
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
              Monto del cobro
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
                Laboratorio
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
                Especialista
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
    Comisión banco
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
                Total tratamiento
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
                      ?.total || 0
                  ).toLocaleString()
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
                Pagado
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
                      ?.pagado || 0
                  ).toLocaleString()
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
    Pendiente
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
      MXN
    </strong>

    {
      tipoCambioCobro > 0 && (

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

            }}
            className="
              mint-btn
              mint-btn-neutral
              px-4
              py-2
              text-sm
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={
              registrarCobro
            }
            className="
              mint-btn
              mint-btn-primary
              px-4
              py-2
              text-sm
            "
          >
            Registrar cobro
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
      mint-input
      p-3
    "

    placeholder="
      Doctor
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

            Cancelar

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

            Guardar

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
        "Error guardando odontograma"
      );

      return false;
    }

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

          Historial Médico

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
              Fuma
            </p>

            <p className="
              font-bold
              mint-text-primary
            ">
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
              Consume Alcohol
            </p>

            <p className="
              font-bold
              mint-text-primary
            ">
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
              Embarazo
            </p>

            <p className="
              font-bold
              mint-text-primary
            ">
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
              Consentimiento
            </p>

            <p className="
              font-bold
              mint-text-primary
            ">
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
              mint-text-secondary
              mb-1
            ">
              Alergias
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
              Enfermedades
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
              Medicamentos
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
      mint-btn
      mint-btn-primary
      px-4
      py-2
      text-sm
    "

  >

    + Agregar

  </button>

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
                Fecha
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                Hora
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                Estado
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                Doctor
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
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
                        mint-text-secondary
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

                        {cita.estado}

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

                            Editar

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
                      alt="Radiografía"
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
                  Guardar
                </button>

              </div>

            </div>

          )

                    :

                   (

            <div className="
              h-full
              mint-card
              p-6
            ">

              <div className="
                h-full
                max-w-4xl
                mx-auto
                flex
                flex-col
              ">

                <div>

                  <p className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    mint-text-brand
                  ">
                    Pacientes
                  </p>

                  <h2 className="
                    text-2xl
                    font-bold
                    mint-text-primary
                    mt-1
                  ">
                    Expedientes de Pacientes
                  </h2>

                  <p className="
                    text-sm
                    mint-text-secondary
                    mt-2
                  ">
                    Selecciona un paciente de la barra superior
                    para consultar su expediente.
                  </p>

                </div>

                <div className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  min-h-[250px]
                ">

                  <div className="
                    w-full
                    max-w-[360px]
                    text-center
                  ">

                    <p className="
                      text-sm
                      font-semibold
                      mint-text-brand
                      mb-2
                    ">
                      Registro de pacientes
                    </p>

                    <p className="
                      text-sm
                      mint-text-secondary
                      mb-4
                    ">
                      Escanea el código para abrir el formulario
                      de registro desde un teléfono.
                    </p>

                    <div className="
                      max-w-[340px]
                      mx-auto
                    ">
                      <QRCodePaciente />
                    </div>

                  </div>

                </div>

              </div>

            </div>

          )
        }

      </div>

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
                  Registro de pacientes
                </p>

                <h2
                  className="
                    text-2xl
                    font-bold
                    mint-text-primary
                    mt-2
                  "
                >
                  Código QR
                </h2>

                <p
                  className="
                    text-sm
                    mint-text-secondary
                    mt-2
                  "
                >
                  Escanea este código desde un teléfono
                  para abrir el formulario de registro.
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