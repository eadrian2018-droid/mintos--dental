import { useEffect, useRef, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import { useLanguage } from "../context/LanguageContext";

import { registrarBitacora } from "../lib/registrarBitacora";

import QRCodePaciente from "../components/QRCodePaciente";
import PacientesLanding from "../components/pacientes/PacientesLanding";
import PacienteGeneral from "../components/pacientes/PacienteGeneral";
import PacienteExpedienteClinico from "../components/pacientes/PacienteExpedienteClinico";
import PacienteHistorialMedico from "../components/pacientes/PacienteHistorialMedico";
import PacienteCitas from "../components/pacientes/PacienteCitas";
import ConsentimientosPaciente from "../components/pacientes/consentimientos/ConsentimientosPaciente";
import ModalTratamientoPaciente from "../components/pacientes/modales/ModalTratamientoPaciente";
import ModalCobroPaciente from "../components/pacientes/modales/ModalCobroPaciente";
import ModalEditarPaciente from "../components/pacientes/modales/ModalEditarPaciente";
import ModalCitaPaciente from "../components/pacientes/modales/ModalCitaPaciente";

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

  created_at?: string | null;

  nombre: string;

  telefono: string;

  correo?: string;

  edad?: string;

  sexo?: string;

  direccion?: string;

  fecha_nacimiento?: string | null;

  historial_clinico?: any;

  historial_declarado?: any;

  consentimiento_firmado?: boolean;

  firma_paciente?: string;

  texto_consentimiento?: string | null;

  observaciones_dientes?: any;

};

export default function Pacientes() {

  const { permisos, perfil } = useAuth();

  const { language } = useLanguage();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const es = language === "es";

  // FIN-01: conservar el ID en reintentos; renovarlo solo tras éxito confirmado.
  const solicitudCobroPendienteRef = useRef<{ id: string; payload: string } | null>(null);
  const cobroEnCursoRef = useRef(false);


  function textoEstado(valor: any) {
    const estado = String(valor || "").toLowerCase();

    if (estado === "pendiente") return es ? "Pendiente" : "Pending";
    if (estado === "confirmado" || estado === "confirmada") return es ? "Confirmado" : "Confirmed";
    if (estado === "completado" || estado === "completada") return es ? "Completado" : "Completed";
    if (estado === "cancelado" || estado === "cancelada") return es ? "Cancelado" : "Cancelled";
    if (estado === "tratamiento") return es ? "Tratamiento" : "Treatment";

    return valor || "-";
  }


  function traducirPreguntaHistorial(
    id: string,
    preguntaGuardada: string
  ) {
    if (es) return preguntaGuardada;

    const preguntasEn: Record<string, string> = {
      tratamiento_medico: "Are you currently under medical treatment or taking any medications?",
      alergias: "Are you allergic to penicillin, antibiotics, anesthetics, or any other medications?",
      presion_arterial: "Do you have high or low blood pressure?",
      enfermedad_cardiaca: "Do you have any heart condition?",
      diabetes: "Do you have diabetes?",
      embarazo: "Are you pregnant or think you may be pregnant?",
      fiebre_reumatica: "Have you ever had rheumatic fever?",
      enfermedad_cirugia: "Have you had any serious illness, hospitalization, or major surgery?",
      sangrado: "Do you have any blood disorder, anemia, or clotting problem?",
      retroviral_bifosfonato: "Do you take or have you taken antiretroviral medications or bisphosphonates?",
      transfusion: "Have you ever received a blood transfusion?",
      estomago_higado_rinon: "Do you have any stomach, liver, or kidney problems?",
      tiroides: "Do you have any thyroid problems?",
      mareos_asma: "Do you experience frequent dizziness, fainting, or asthma?",
      epilepsia: "Do you have epilepsy, seizures, or nervous attacks?",
      hepatitis_tuberculosis: "Have you ever had hepatitis or tuberculosis?",
      tabaco: "Do you smoke or chew tobacco?",
      drogas: "Do you use any recreational drugs?",
      alcohol: "Do you frequently consume alcoholic beverages?",
      tratamiento_psiquiatrico: "Are you currently or have you ever been under psychiatric treatment?",
      perdida_peso: "Have you experienced unexplained weight loss?",
      osteoporosis_cancer: "Do you have or have you had osteoporosis or cancer?",
      otra_condicion: "Do you have any other medical condition we should know about?",
      morder_unas_objetos: "Do you bite your nails or other objects?",
      apretamiento: "Do you clench or grind your teeth?",
      respiracion_bucal: "Do you usually breathe through your mouth?",
      aftas_herpes: "Do you frequently experience canker sores or cold sores?",
      ruidos_atm: "Do you experience clicking, pain, or discomfort when opening or closing your mouth?",
      cardiaca_presion: "Do you have heart disease or blood pressure problems?",
      hepatitis_tuberculosis_its: "Have you ever had hepatitis, tuberculosis, or a sexually transmitted infection?",
      tabaco_drogas: "Do you smoke, chew tobacco, or use recreational drugs?",
    };

    return preguntasEn[id] || preguntaGuardada || "Medical question";
  }

  const puedeRegistrarCobros =
    perfil?.rol === "admin" ||
    permisos?.registrar_cobros === true;

  const puedeAplicarDescuentos =
    perfil?.rol === "admin" ||
    permisos?.aplicar_descuentos === true;

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
    filtroRapido,
    setFiltroRapido,
  ] = useState<
    "todos" |
    "nuevos" |
    "saldo" |
    "tratamientos"
  >("todos");

  const [
    pacientesConSaldoFiltro,
    setPacientesConSaldoFiltro,
  ] = useState<Set<number>>(
    new Set()
  );

  const [
    pacientesConTratamientosPendientesFiltro,
    setPacientesConTratamientosPendientesFiltro,
  ] = useState<Set<number>>(
    new Set()
  );

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

const [
  registroInicialPaciente,
  setRegistroInicialPaciente,
] = useState<any>(null);

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

  especialista_tratamiento_id: null as number | null,

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
  cargandoPresupuestosPaciente,
  setCargandoPresupuestosPaciente,
] = useState(false);

const [
  mostrarFormularioPresupuestoPaciente,
  setMostrarFormularioPresupuestoPaciente,
] = useState(false);

const [
  expedienteClinicoBase,
  setExpedienteClinicoBase,
] = useState<any>(null);

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
      .order("id", { ascending: true });

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
      "tipo_cambio"
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

    const pacientesConTratamientosPendientesIds =
      new Set<number>(
        tratamientosActivos
          .map(
            (tratamiento: any) =>
              Number(
                tratamiento.paciente_id
              )
          )
          .filter(
            (pacienteId: number) =>
              Number.isFinite(pacienteId) &&
              pacienteId > 0
          )
      );

    setPacientesConSaldo(
      pacientesConSaldoIds.size
    );

    setPacientesConSaldoFiltro(
      new Set(
        Array.from(
          pacientesConSaldoIds
        ).map(
          (pacienteId: any) =>
            Number(pacienteId)
        )
      )
    );

    setPacientesConTratamientosPendientesFiltro(
      pacientesConTratamientosPendientesIds
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
      data.filter(
        (doctor: any) => doctor.activo !== false
      )
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

  async function cargarPresupuestosPaciente(pacienteId: number) {

    setCargandoPresupuestosPaciente(true);
    setExpedienteClinicoBase(null);

    const { data, error } = await supabase
      .from("presupuestos")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error cargando presupuestos del paciente:", error);
      setCargandoPresupuestosPaciente(false);
      return;
    }

    const presupuestos = data || [];

    const presupuestoInicial = presupuestos.length > 0
      ? [...presupuestos].sort(
          (a: any, b: any) =>
            new Date(a.fecha || a.created_at || 0).getTime() -
            new Date(b.fecha || b.created_at || 0).getTime()
        )[0]
      : null;

    if (presupuestoInicial) {
      const { data: items, error: errorItems } = await supabase
        .from("presupuesto_items")
        .select("*")
        .eq("presupuesto_id", presupuestoInicial.id)
        .order("id", { ascending: true });

      if (errorItems) {
        console.error("Error cargando plan clínico inicial:", errorItems);
      } else {
        setExpedienteClinicoBase({
          ...presupuestoInicial,
          items: (items || []).map((item: any) => ({
            ...item,
            dientes: Array.isArray(item.dientes)
              ? item.dientes.map((diente: unknown) => Number(diente))
              : [],
          })),
        });
      }
    }

    setCargandoPresupuestosPaciente(false);
  }

  async function guardarPresupuestoPaciente(datos: any) {

    if (!pacienteAbierto?.id) {
      return;
    }

    const items = Array.isArray(datos.items) ? datos.items : [];
    const subtotal = items.reduce(
      (acumulado: number, item: any) =>
        acumulado + Number(item.cantidad || 0) * Number(item.precio_unitario || 0),
      0
    );

    const descuento = Math.min(
      Math.max(Number(datos.descuento || 0), 0),
      subtotal
    );

    const total = Math.max(subtotal - descuento, 0);

    const { data: presupuestoCreado, error: errorPresupuesto } = await supabase
      .from("presupuestos")
      .insert([{
        paciente_id: pacienteAbierto.id,
        nombre_paciente: pacienteAbierto.nombre,
        estado: "Borrador",
        moneda: datos.moneda,
        idioma: datos.idioma,
        subtotal,
        descuento,
        total,
        notas: datos.notas || null,
        updated_at: new Date().toISOString(),
      }])
      .select("*")
      .single();

    if (errorPresupuesto || !presupuestoCreado) {
      console.error("Error creando presupuesto:", errorPresupuesto);
      alert(es ? "No se pudo guardar el presupuesto." : "The estimate could not be saved.");
      throw errorPresupuesto;
    }

    const itemsInsertar = items.map((item: any) => ({
      presupuesto_id: presupuestoCreado.id,
      diente: String(item.diente || "").trim() || null,
      tratamiento: String(item.tratamiento || "").trim(),
      catalogo_tratamiento_id: item.catalogo_tratamiento_id ?? null,
      dientes: Array.isArray(item.dientes) ? item.dientes : [],
      arcada: item.arcada || null,
      cantidad: Number(item.cantidad || 0),
      precio_unitario: Number(item.precio_unitario || 0),
      total: Number(item.cantidad || 0) * Number(item.precio_unitario || 0),
    }));

    const { error: errorItems } = await supabase
      .from("presupuesto_items")
      .insert(itemsInsertar);

    if (errorItems) {
      console.error("Error guardando tratamientos del presupuesto:", errorItems);
      await supabase.from("presupuestos").delete().eq("id", presupuestoCreado.id);
      alert(es ? "No se pudieron guardar los tratamientos del presupuesto." : "The estimate treatments could not be saved.");
      throw errorItems;
    }

    await registrarBitacora({
      accion: "Crear presupuesto",
      modulo: "Pacientes",
      detalle: `Presupuesto ID: ${presupuestoCreado.id} | Paciente ID: ${pacienteAbierto.id} | Paciente: ${pacienteAbierto.nombre} | Total: ${total} ${datos.moneda}`,
    });

    setMostrarFormularioPresupuestoPaciente(false);
    await cargarPresupuestosPaciente(pacienteAbierto.id);
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
      "tipo_cambio"
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

  // Para tratamientos MXN, el saldo contable es `pendiente`.
  // `resta_original` solo representa unidades originales en tratamientos USD.
  const pendienteMonedaTratamiento =
    monedaInicial === "USD"
      ? Number(tratamiento.resta_original ??
          Math.max(Number(tratamiento.total_original ?? 0) - Number(tratamiento.pagado_original ?? 0), 0))
      : saldoMonetarioMXN(tratamiento);

  const montoInicial = String(Math.max(pendienteMonedaTratamiento, 0));

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

// FIN-01: `pendiente` en Supabase es un indicador booleano; el saldo MXN vive en `resta`.
// Usar siempre el saldo monetario persistido, nunca Number(pendiente).
const saldoMonetarioMXN = (tratamiento: any): number => {
  const saldo = tratamiento?.resta;
  if (saldo !== null && saldo !== undefined && Number.isFinite(Number(saldo))) {
    return Math.max(0, Number(saldo));
  }
  return Math.max(0, Number(tratamiento?.total ?? 0) - Number(tratamiento?.pagado ?? tratamiento?.pago ?? 0));
};

const monedaPrecioCobro =
  tratamientoCobro?.moneda_precio ||
  "MXN";

const totalOriginalCobro =
  Number(monedaPrecioCobro === "USD"
    ? tratamientoCobro?.total_original ?? tratamientoCobro?.total ?? 0
    : tratamientoCobro?.total ?? 0);

const pagadoOriginalCobro =
  Number(monedaPrecioCobro === "USD"
    ? tratamientoCobro?.pagado_original ?? tratamientoCobro?.pagado ?? 0
    : tratamientoCobro?.pagado ?? 0);

const pendienteOriginalCobro = Math.max(
  Number(monedaPrecioCobro === "USD"
    ? tratamientoCobro?.resta_original ?? (totalOriginalCobro - pagadoOriginalCobro)
    : saldoMonetarioMXN(tratamientoCobro)),
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

  const totalOriginalActual = Number(
    monedaPrecioTratamiento === "USD"
      ? tratamientoCobro.total_original ?? tratamientoCobro.total ?? 0
      : tratamientoCobro.total ?? 0
  );

  const pagadoOriginalAnterior = Number(
    monedaPrecioTratamiento === "USD"
      ? tratamientoCobro.pagado_original ?? tratamientoCobro.pagado ?? 0
      : tratamientoCobro.pagado ?? 0
  );

  const pendienteOriginalAnterior = Math.max(Number(
    monedaPrecioTratamiento === "USD"
      ? tratamientoCobro.resta_original ?? (totalOriginalActual - pagadoOriginalAnterior)
      : saldoMonetarioMXN(tratamientoCobro)
  ), 0);

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

  const nuevoTotalOriginalTratamiento =
    Number(
      Math.max(
        totalOriginalActual -
          descuentoOriginalAplicar,
        pagadoOriginalAnterior
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

  // FIN-01: registrar el porcentaje vigente como dato historico del cobro.
  // Un porcentaje ausente NO equivale a una comision legitima de 0%.
  const doctorIdCobro = tratamientoCobro.doctor_id;
  const doctorCobro = doctores.find(
    (doctor: any) =>
      doctorIdCobro != null &&
      Number(doctor.id) === Number(doctorIdCobro)
  );

  if (montoCobro > 0) {
    const porcentajeSinRegistrar =
      doctorCobro?.porcentaje == null ||
      String(doctorCobro.porcentaje).trim() === "";

    if (
      doctorIdCobro == null ||
      !doctorCobro ||
      porcentajeSinRegistrar ||
      !Number.isFinite(Number(doctorCobro.porcentaje)) ||
      Number(doctorCobro.porcentaje) < 0 ||
      Number(doctorCobro.porcentaje) > 100
    ) {
      alert(
        es
          ? "No se puede registrar el cobro: asigna un doctor con porcentaje de comisión válido (0–100%)."
          : "Cannot record payment: assign a doctor with a valid commission rate (0–100%)."
      );
      return;
    }
  }

  // FIN-02: laboratorio es un costo del tratamiento, nunca un costo por abono.
  // Solo enviamos cambios explícitos. Especialista continúa bajo su tarifario.
  const laboratorioTexto = nuevoCobro.laboratorio.trim();
  const laboratorioNuevo = laboratorioTexto === "" ? null : Number(laboratorioTexto);
  const laboratorioActual = tratamientoCobro.laboratorio == null
    ? null : Number(tratamientoCobro.laboratorio);
  const laboratorioCambio = laboratorioNuevo !== null &&
    laboratorioNuevo !== laboratorioActual;
  if (laboratorioTexto !== "" &&
      (!Number.isFinite(laboratorioNuevo) || laboratorioNuevo! < 0 ||
       laboratorioNuevo! > 1000000000000 ||
       Math.round(laboratorioNuevo! * 100) / 100 !== laboratorioNuevo)) {
    alert(es ? "Ingresa un costo de laboratorio válido (máximo dos decimales)."
             : "Enter a valid laboratory cost (up to two decimals).");
    return;
  }
  if (laboratorioCambio &&
      (modo !== "cobro" || tratamientoCobro.estado === "Finalizado")) {
    alert(es ? "El laboratorio solo puede modificarse al cobrar un tratamiento no finalizado."
             : "Laboratory cost can only be changed when charging an unfinished treatment.");
    return;
  }
  if (Number(nuevoCobro.especialista || 0) !== Number(tratamientoCobro.especialista || 0)) {
    alert(es ? "El costo del especialista se administra desde el tratamiento."
             : "Specialist costs are managed from the treatment.");
    return;
  }

  // FIN-01: el servidor registra el cobro/descuento y actualiza el saldo
  // en una sola transacción. Nunca insertar en pagos desde el navegador.
  // Impide solicitudes simultáneas y doble clic sobre el mismo cobro.
  if (cobroEnCursoRef.current) return;
  cobroEnCursoRef.current = true;
  try {
  const payloadCobro = JSON.stringify({
    tratamiento: tratamientoCobro.id, paciente: pacienteAbierto.id,
    modo, montoCobro, moneda: nuevoCobro.moneda,
    metodo: nuevoCobro.metodo_pago, tipoDescuentoCobro, valorDescuento,
    tipoCambioCobro,
    laboratorio: modo === "cobro" && laboratorioCambio ? laboratorioNuevo : null,
  });
  if (solicitudCobroPendienteRef.current?.payload !== payloadCobro) {
    solicitudCobroPendienteRef.current = {
      id: crypto.randomUUID(), payload: payloadCobro,
    };
  }

  const { data: resultadoCobro, error: errorCobroAtomico } = await supabase.rpc(
    "mintos_registrar_cobro_v2",
    {
      p_solicitud_id: solicitudCobroPendienteRef.current.id,
      p_tratamiento_id: tratamientoCobro.id,
      p_paciente_id: pacienteAbierto.id,
      p_modo: modo,
      p_monto: modo === "cobro" ? montoCobro : 0,
      p_moneda: nuevoCobro.moneda,
      p_metodo_pago: modo === "cobro" ? nuevoCobro.metodo_pago : null,
      p_tipo_descuento: tipoDescuentoCobro,
      p_valor_descuento: modo === "descuento" ? valorDescuento : 0,
      p_laboratorio: modo === "cobro" && laboratorioCambio ? laboratorioNuevo : null,
      p_especialista: null,
      p_tipo_cambio_confirmado:
        nuevoCobro.moneda === "USD" || monedaPrecioTratamiento === "USD"
          ? tipoCambioCobro
          : null,
    }
  );

  if (errorCobroAtomico || !resultadoCobro) {
    console.error("Error en cobro transaccional:", errorCobroAtomico);
    alert(es
      ? "No se pudo completar la operación. Verifica los datos antes de reintentar."
      : "The operation could not be completed. Verify the details before retrying.");
    // No regenerar ID: reintentar la misma operación evita duplicados.
    return;
  }

  // La RPC devuelve JSONB: validar el contrato antes de actualizar el estado local.
  // Si el servidor confirmó pero la respuesta es inválida, conservar el ID para reintentar
  // de forma idempotente y evitar mostrar un saldo inventado.
  const saldoServidor = Number(resultadoCobro.saldo_original);
  if (
    Number(resultadoCobro.tratamiento_id) !== Number(tratamientoCobro.id) ||
    resultadoCobro.modo !== modo ||
    resultadoCobro.solicitud_id !== solicitudCobroPendienteRef.current?.id ||
    resultadoCobro.saldo_original == null ||
    !Number.isFinite(saldoServidor) ||
    saldoServidor < 0
  ) {
    console.error("Respuesta de cobro no válida:", resultadoCobro);
    alert(es
      ? "El servidor devolvió una respuesta inesperada. Actualiza los datos antes de continuar."
      : "The server returned an unexpected response. Refresh the data before continuing.");
    return;
  }

  // El cobro ya fue confirmado por PostgreSQL. Consultar la fila persistida
  // evita reconstruir saldos desde cálculos locales que pueden usar otro FX.
  const { data: tratamientoConfirmado, error: errorRecargaCobro } =
    await supabase
      .from("tratamientos")
      .select("*")
      .eq("id", tratamientoCobro.id)
      .eq("paciente_id", pacienteAbierto.id)
      .single();

  if (errorRecargaCobro || !tratamientoConfirmado) {
    console.error("Cobro confirmado, pero no se pudo recargar el tratamiento:", errorRecargaCobro);
    alert(es
      ? "La operación quedó registrada, pero no se pudo actualizar la pantalla. No vuelvas a cobrar: recarga la página para consultar el saldo."
      : "The operation was recorded, but the screen could not refresh. Do not charge again: reload the page to see the balance.");
    // Conservar el ID: un reintento idéntico devuelve la operación anterior.
    return;
  }

  if (
    Number(tratamientoConfirmado.id) !== Number(tratamientoCobro.id) ||
    Number(tratamientoConfirmado.paciente_id) !== Number(pacienteAbierto.id) ||
    tratamientoConfirmado.resta_original == null ||
    !Number.isFinite(Number(tratamientoConfirmado.resta_original)) ||
    Math.abs(Number(tratamientoConfirmado.resta_original) - saldoServidor) > 0.01
  ) {
    console.error("El saldo persistido no coincide con la confirmación RPC:", {
      resultadoCobro, tratamientoConfirmado,
    });
    alert(es
      ? "La operación quedó registrada, pero el saldo requiere verificación. Recarga la página antes de continuar."
      : "The operation was recorded, but the balance needs verification. Reload the page before continuing.");
    return;
  }

  // Únicamente el registro persistido es fuente de verdad para la UI.
  setTratamientos((anteriores) =>
    anteriores.map((tratamiento) =>
      Number(tratamiento.id) === Number(tratamientoConfirmado.id)
        ? { ...tratamiento, ...tratamientoConfirmado, pagado: tratamientoConfirmado.pago, pendiente: tratamientoConfirmado.resta }
        : tratamiento
    )
  );
  solicitudCobroPendienteRef.current = null;

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

  // La RPC registra la bitacora en la misma transaccion.
  // No duplicar aqui el evento con registrarBitacora().

  alert(
    montoCobro > 0 &&
    descuentoOriginalAplicar > 0
      ? es ? "Descuento y cobro registrados correctamente." : "Discount and payment recorded successfully."
      : montoCobro > 0
        ? es ? "Cobro registrado correctamente." : "Payment recorded successfully."
        : es ? "Descuento aplicado correctamente." : "Discount applied successfully."
  );

  } catch (errorInesperado) {
    console.error("Error inesperado en flujo de cobro:", errorInesperado);
    alert(es
      ? "No se pudo verificar la operación. Consulta el saldo antes de intentar otro cobro."
      : "The operation could not be verified. Check the balance before attempting another payment.");
  } finally {
    cobroEnCursoRef.current = false;
  }

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

const tratamientoCatalogoSeleccionado = catalogoTratamientos.find(
  (tratamiento: any) => tratamiento.nombre === nuevoTratamiento.tratamiento
);

const monedaPrecioTratamiento =
  nuevoTratamiento.moneda_precio ||
  "MXN";

// FIN-01: editar responsable o notas no debe recalcular un tratamiento
// con cobros/descuentos ya registrados ni borrar su historial financiero.
const tratamientoExistenteEdicion =
  editandoIndex !== null ? tratamientos[editandoIndex] : null;
const tieneActividadFinanciera = Boolean(
  tratamientoExistenteEdicion && (
    Number(tratamientoExistenteEdicion.pagado ?? tratamientoExistenteEdicion.pago ?? 0) > 0 ||
    Number(tratamientoExistenteEdicion.descuento ?? 0) > 0 ||
    Number(tratamientoExistenteEdicion.descuento_original ?? 0) > 0
  )
);
if (tratamientoExistenteEdicion?.estado === "Finalizado") {
  alert(es ? "Un tratamiento finalizado no puede editarse." : "A completed treatment cannot be edited.");
  return;
}
if (tieneActividadFinanciera && (
  String(doctorSeleccionado?.id ?? tratamientoExistenteEdicion?.doctor_id ?? "") !==
    String(tratamientoExistenteEdicion?.doctor_id ?? "") ||
  nuevoTratamiento.doctor !== tratamientoExistenteEdicion?.doctor
)) {
  alert(es ? "No se puede cambiar el doctor después de registrar movimientos financieros." : "The doctor cannot be changed after financial transactions have been recorded.");
  return;
}
if (
  tieneActividadFinanciera &&
  (
    nuevoTratamiento.tratamiento !== tratamientoExistenteEdicion?.tratamiento ||
    monedaPrecioTratamiento !== (tratamientoExistenteEdicion?.moneda_precio || "MXN")
  )
) {
  alert(es
    ? "Este tratamiento ya tiene movimientos financieros. No cambies su tratamiento o moneda desde Editar; conserva los cobros y descuentos existentes."
    : "This treatment already has financial transactions. Do not change its treatment or currency here; preserve existing payments and discounts.");
  return;
}

// FIN-02: nunca permitir que una edición con actividad financiera
// cambie la tarifa, costo o especialista asociados.
if (tieneActividadFinanciera && (
  Number(nuevoTratamiento.especialista_tratamiento_id || 0) !==
    Number(tratamientoExistenteEdicion?.especialista_tratamiento_id || 0) ||
  Number(nuevoTratamiento.especialista || 0) !== Number(tratamientoExistenteEdicion?.especialista || 0) ||
  String(nuevoTratamiento.especialista_id || "") !== String(tratamientoExistenteEdicion?.especialista_id || "") ||
  String(nuevoTratamiento.moneda_especialista || "MXN") !== String(tratamientoExistenteEdicion?.moneda_especialista || "MXN") ||
  Number(nuevoTratamiento.laboratorio || 0) !== Number(tratamientoExistenteEdicion?.laboratorio || 0)
)) {
  alert(es ? "No se pueden cambiar los costos ni la tarifa después de registrar movimientos financieros."
           : "Costs and specialist fees cannot be changed after financial transactions are recorded.");
  return;
}

// El tarifario anterior deja de intervenir en los nuevos tratamientos.
// Los honorarios son un importe propio del tratamiento del paciente.
if (!tratamientoCatalogoSeleccionado && editandoIndex === null) {
  alert(es ? "Selecciona un tratamiento del catálogo." : "Select a catalog treatment.");
  return;
}
if (doctorSeleccionado?.tipo_doctor === "especialista") {
  if (!Number.isFinite(Number(nuevoTratamiento.especialista)) || Number(nuevoTratamiento.especialista) < 0) {
    alert(es ? "Ingresa honorarios válidos." : "Enter a valid specialist fee.");
    return;
  }
}

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

      if (tratamientoEditar.estado === "Finalizado" &&
          Number(nuevo.laboratorio || 0) !== Number(tratamientoEditar.laboratorio || 0)) {
        alert(es ? "No puedes modificar el laboratorio de un tratamiento finalizado."
                 : "You cannot change the laboratory cost of a completed treatment.");
        return;
      }

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

// Si hubo cobros/descuentos, NO sobrescribir los importes
// persistidos por la RPC al cambiar doctor/fecha/notas/estado.
...(tieneActividadFinanciera ? {} : {
  total_original: Number(nuevo.total_original || 0),
  pagado_original: Number(tratamientoEditar.pagado_original || 0),
  resta_original: Math.max(
    Number(nuevo.total_original || 0) - Number(tratamientoEditar.pagado_original || 0), 0
  ),
  total: Number(nuevo.total || 0),
  resta: Math.max(
    Number(nuevo.total || 0) - Number(tratamientoEditar.pagado ?? tratamientoEditar.pago ?? 0), 0
  ),
}),

laboratorio: tratamientoEditar.estado === "Finalizado"
  ? Number(tratamientoEditar.laboratorio || 0)
  : Number(nuevo.laboratorio || 0),

especialista: Number(nuevo.especialista || 0),

especialista_id: nuevo.especialista_id ? Number(nuevo.especialista_id) : null,

especialista_tratamiento_id: nuevo.especialista_tratamiento_id ?? null,

especialista_nombre: nuevo.especialista_nombre || null,

moneda_especialista: nuevo.moneda_especialista || "MXN",

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

especialista_id: nuevo.especialista_id ? Number(nuevo.especialista_id) : null,

especialista_tratamiento_id: nuevo.especialista_tratamiento_id ?? null,

especialista_nombre: nuevo.especialista_nombre || null,

moneda_especialista: nuevo.moneda_especialista || "MXN",

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

    especialista_id: data.especialista_id ?? null,
    especialista_tratamiento_id: data.especialista_tratamiento_id ?? null,
    especialista_nombre: data.especialista_nombre ?? null,
    moneda_especialista: data.moneda_especialista || "MXN",

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
      // Conservar en pantalla los valores financieros originales;
      // solo el servidor modifica saldos y descuentos existentes.
      ...(tieneActividadFinanciera ? {
        total: copia[editandoIndex].total,
        total_original: copia[editandoIndex].total_original,
        pagado: copia[editandoIndex].pagado,
        pagado_original: copia[editandoIndex].pagado_original,
        resta: copia[editandoIndex].resta,
        resta_original: copia[editandoIndex].resta_original,
        pendiente: copia[editandoIndex].pendiente,
        descuento: copia[editandoIndex].descuento,
        descuento_original: copia[editandoIndex].descuento_original,
        total_antes_descuento: copia[editandoIndex].total_antes_descuento,
        total_original_antes_descuento: copia[editandoIndex].total_original_antes_descuento,
      } : {}),

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

  especialista_tratamiento_id: null as number | null,

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
  setRegistroInicialPaciente(null);

  const [
    registroInicialResponse,
    cambiosResponse,
  ] = await Promise.all([

    supabase
      .from("registros_iniciales_paciente")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),

    supabase
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
      }),

  ]);

  if (registroInicialResponse.error) {

    console.error(
      "Error cargando registro inicial del paciente:",
      registroInicialResponse.error
    );

  } else {

    setRegistroInicialPaciente(
      registroInicialResponse.data || null
    );

  }

  if (cambiosResponse.error) {

    console.error(
      "Error cargando historial médico:",
      cambiosResponse.error
    );

    setHistorialMedicoCambios([]);
    setCargandoHistorialMedico(false);

    return;
  }

  const cambios =
    (cambiosResponse.data || []) as HistorialMedicoCambio[];

  const usuariosIds = Array.from(
    new Set(
      cambios
        .map(
          (cambio) =>
            cambio.usuario_id
        )
        .filter(Boolean)
    )
  );

  let nombresPorUsuario:
    Record<string, string> = {};

  if (
    usuariosIds.length > 0
  ) {

    const {
      data: perfilesHistorial,
      error: errorPerfilesHistorial,
    } = await supabase

      .from("perfiles")

      .select(
        "id, nombre"
      )

      .in(
        "id",
        usuariosIds
      );

    if (
      !errorPerfilesHistorial
    ) {

      nombresPorUsuario =
        Object.fromEntries(

          (
            perfilesHistorial || []
          ).map(
            (perfil: any) => [

              perfil.id,

              perfil.nombre,

            ]
          )

        );

    }

  }

  setHistorialMedicoCambios(

    cambios.map(
      (cambio) => ({

        ...cambio,

        usuario_nombre:
          nombresPorUsuario[
            cambio.usuario_id
          ] ||
          "Usuario de MintOS",

      })
    )

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

cargarPresupuestosPaciente(
  paciente.id
);

setMostrarFormularioPresupuestoPaciente(false);

    setImagenPreview(
      paciente.observaciones_dientes?.imagen || ""
    );

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

  useEffect(() => {

    const pacienteParametro =
      searchParams.get("paciente");

    if (
      !pacienteParametro ||
      pacientes.length === 0
    ) {
      return;
    }

    const pacienteId =
      Number(pacienteParametro);

    if (!Number.isFinite(pacienteId)) {
      return;
    }

    const paciente =
      pacientes.find(
        (item) =>
          item.id === pacienteId
      );

    if (!paciente) {
      return;
    }

    const tabParametro =
      searchParams.get("tab");

    const tabsPermitidas = [
      "general",
      "expediente",
      "historial",
      "citas",
      "consentimientos",
    ];

    if (
      tabParametro &&
      tabsPermitidas.includes(tabParametro)
    ) {
      setTabActiva(tabParametro);
    }

    if (
      pacienteAbierto?.id ===
      paciente.id
    ) {
      return;
    }

    abrirPaciente(paciente);

  }, [
    pacientes,
    searchParams,
  ]);

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
      nuevoEstado === "Finalizado" &&
      error.message?.includes("FIN02F: no se puede finalizar un tratamiento")
        ? es
          ? "No se puede finalizar el tratamiento porque tiene saldo pendiente o un saldo inconsistente."
          : "This treatment cannot be completed because it has an outstanding or inconsistent balance."
        : es ? "Error actualizando estado." : "Error updating status."
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

    let coincideFiltroRapido =
      true;

    if (
      filtroRapido === "nuevos"
    ) {
      if (!p.created_at) {
        coincideFiltroRapido =
          false;
      } else {
        const fechaRegistro =
          new Date(p.created_at);

        const ahora =
          new Date();

        coincideFiltroRapido =
          fechaRegistro.getFullYear() ===
            ahora.getFullYear() &&
          fechaRegistro.getMonth() ===
            ahora.getMonth();
      }
    }

    if (
      filtroRapido === "saldo"
    ) {
      coincideFiltroRapido =
        pacientesConSaldoFiltro.has(
          p.id
        );
    }

    if (
      filtroRapido ===
      "tratamientos"
    ) {
      coincideFiltroRapido =
        pacientesConTratamientosPendientesFiltro.has(
          p.id
        );
    }

    return (
      coincideNombre &&
      coincideTelefono &&
      coincideFiltroRapido
    );

  });

  const abriendoPacienteDesdeUrl =
  Boolean(
    searchParams.get("paciente")
  ) &&
  !pacienteAbierto;

if (abriendoPacienteDesdeUrl) {
  return (
    <div
      className="
        min-h-[calc(100vh-32px)]
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          mint-card
          px-6
          py-5
          text-sm
          font-semibold
          text-[var(--mint-text-secondary)]
        "
      >
        {es
          ? "Abriendo expediente clínico..."
          : "Opening clinical record..."}
      </div>
    </div>
  );
}

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
          setSearchParams({});
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
                rounded-[26px]
                border
                border-[var(--mint-border-teal)]
                bg-[linear-gradient(180deg,var(--mint-surface-teal)_0%,var(--mint-app-bg)_100%)]
                p-4
                shadow-[var(--mint-shadow-soft)]
              "
            >

             <div className="
  mb-5
">

  <div
    className="relative overflow-hidden rounded-[22px] border border-white/10 p-5 text-white shadow-[var(--mint-shadow-brand)]"
    style={{ background: "var(--mint-gradient-brand)" }}
  >
    <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/[0.06]" />
    <div className="absolute right-24 -bottom-20 h-40 w-40 rounded-full border border-white/10" />
    <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: "var(--mint-gradient-accent)" }} />
    <div className="relative">

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
          bg-white/12
          border
          border-white/15
          flex
          items-center
          justify-center
          text-2xl
          font-bold
          text-white
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
              text-white
            ">

              {pacienteAbierto.nombre}

            </h2>

            <span className="
              bg-white/10
              text-white
              border
              border-white/20
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
            text-white/75
          ">

            <span>

              <strong className="
                text-white
                font-semibold
              ">
                {es ? "Edad:" : "Age:"}
              </strong>

              {" "}

              {pacienteAbierto.edad || "-"}

            </span>

            <span>

              <strong className="
                text-white
                font-semibold
              ">
                {es ? "Sexo:" : "Sex:"}
              </strong>

              {" "}

              {pacienteAbierto.sexo || "-"}

            </span>

            <span>

              <strong className="
                text-white
                font-semibold
              ">
                Tel:
              </strong>

              {" "}

              {pacienteAbierto.telefono || "-"}

            </span>

            <span>

              <strong className="
                text-white
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
        bg-white/10
        border
        border-white/15
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
          text-white/60
        ">
          {es ? "Próxima cita" : "Next appointment"}
        </p>

        <p className="
          text-sm
          font-bold
          text-white
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
              text-[var(--mint-gold)]
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

</div>

<div className="
  mb-6
">

  <div className="
    flex
    flex-wrap
    gap-2
    rounded-2xl
    border
    border-[var(--mint-border-teal)]
    bg-[var(--mint-surface-teal)]
    p-2
    shadow-[var(--mint-shadow-soft)]
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

    <button
      type="button"
      onClick={() => setTabActiva("consentimientos")}
      className={`
        mint-tab
        px-5
        py-2.5
        text-sm
        ${tabActiva === "consentimientos" ? "mint-tab-active" : ""}
      `}
    >
      {es ? "Consentimientos" : "Consents"}
    </button>

  </div>

</div>

<PacienteGeneral
  tabActiva={tabActiva}
  mostrarFormularioPresupuestoPaciente={mostrarFormularioPresupuestoPaciente}
  pacienteAbierto={pacienteAbierto}
  setMostrarFormularioPresupuestoPaciente={setMostrarFormularioPresupuestoPaciente}
  guardarPresupuestoPaciente={guardarPresupuestoPaciente}
  es={es}
  tratamientos={tratamientos}
  saldoMonetarioMXN={saldoMonetarioMXN}
  tipoCambioCobro={tipoCambioCobro}
  puedeCrearTratamientos={puedeCrearTratamientos}
  setMostrarModalTratamiento={setMostrarModalTratamiento}
  puedeCambiarEstadoTratamientos={puedeCambiarEstadoTratamientos}
  actualizarEstadoTratamiento={actualizarEstadoTratamiento}
  puedeRegistrarCobros={puedeRegistrarCobros}
  abrirModalCobro={abrirModalCobro}
  setNuevoTratamiento={setNuevoTratamiento}
  setDoctorSeleccionado={setDoctorSeleccionado}
  doctores={doctores}
  setEditandoIndex={setEditandoIndex}
  puedeAnularTratamientos={puedeAnularTratamientos}
  setTratamientos={setTratamientos}
  puedeAgregarNotasClinicas={puedeAgregarNotasClinicas}
  doctorNotaId={doctorNotaId}
  setDoctorNotaId={setDoctorNotaId}
  nuevaNotaClinica={nuevaNotaClinica}
  setNuevaNotaClinica={setNuevaNotaClinica}
  guardarNotaClinica={guardarNotaClinica}
  notasClinicas={notasClinicas}
  notaCorrigiendoId={notaCorrigiendoId}
  doctorCorreccionId={doctorCorreccionId}
  setDoctorCorreccionId={setDoctorCorreccionId}
  textoCorreccionNota={textoCorreccionNota}
  setTextoCorreccionNota={setTextoCorreccionNota}
  setNotaCorrigiendoId={setNotaCorrigiendoId}
  guardarCorreccionNotaClinica={guardarCorreccionNotaClinica}
/>

<ModalTratamientoPaciente
  mostrarModalTratamiento={mostrarModalTratamiento}
  es={es}
  nuevoTratamiento={nuevoTratamiento}
  setNuevoTratamiento={setNuevoTratamiento}
  doctores={doctores}
  doctorSeleccionado={doctorSeleccionado}
  setDoctorSeleccionado={setDoctorSeleccionado}
  catalogoTratamientos={catalogoTratamientos}
  especialistasDisponibles={especialistasDisponibles}
  editandoIndex={editandoIndex}
  tratamientos={tratamientos}
  setMostrarModalTratamiento={setMostrarModalTratamiento}
  setEditandoIndex={setEditandoIndex}
  guardarTratamiento={guardarTratamiento}
/>

<ModalCobroPaciente
  mostrarModalCobro={mostrarModalCobro}
  es={es}
  tratamientoCobro={tratamientoCobro}
  nuevoCobro={nuevoCobro}
  setNuevoCobro={setNuevoCobro}
  tipoCambioCobro={tipoCambioCobro}
  puedeAplicarDescuentos={puedeAplicarDescuentos}
  tipoDescuentoCobro={tipoDescuentoCobro}
  setTipoDescuentoCobro={setTipoDescuentoCobro}
  valorDescuentoCobro={valorDescuentoCobro}
  setValorDescuentoCobro={setValorDescuentoCobro}
  monedaPrecioCobro={monedaPrecioCobro}
  totalOriginalCobro={totalOriginalCobro}
  pendienteOriginalCobro={pendienteOriginalCobro}
  descuentoOriginalCobro={descuentoOriginalCobro}
  totalOriginalDespuesDescuentoCobro={totalOriginalDespuesDescuentoCobro}
  comisionBancoActual={comisionBancoActual}
  comisionBaseActual={comisionBaseActual}
  porcentajeComisionActual={porcentajeComisionActual}
  porcentajeIvaComisionActual={porcentajeIvaComisionActual}
  ivaComisionActual={ivaComisionActual}
  netoCobroActual={netoCobroActual}
  setMostrarModalCobro={setMostrarModalCobro}
  setTratamientoCobro={setTratamientoCobro}
  registrarCobro={registrarCobro}
  saldoMonetarioMXN={saldoMonetarioMXN}
/>

<ModalCitaPaciente
  mostrarModalCita={mostrarModalCita}
  es={es}
  nuevaCita={nuevaCita}
  setNuevaCita={setNuevaCita}
  setMostrarModalCita={setMostrarModalCita}
  guardarCitaPaciente={guardarCitaPaciente}
/>

{tabActiva === "expediente" && (
  <PacienteExpedienteClinico
    es={es}
    cargandoPresupuestosPaciente={cargandoPresupuestosPaciente}
    expedienteClinicoBase={expedienteClinicoBase}
    tratamientos={tratamientos}
    textoEstado={textoEstado}
    subirRadiografia={subirRadiografia}
    imagenPreview={imagenPreview}
  />
)}

{tabActiva === "historial" && (
  <PacienteHistorialMedico
    es={es}
    pacienteAbierto={pacienteAbierto}
    registroInicialPaciente={registroInicialPaciente}
    historialMedicoCambios={historialMedicoCambios}
    cargandoHistorialMedico={cargandoHistorialMedico}
    traducirPreguntaHistorial={traducirPreguntaHistorial}
  />
)}

{tabActiva === "consentimientos" && (
  <ConsentimientosPaciente
    es={es}
    pacienteAbierto={pacienteAbierto}
  />
)}

{tabActiva === "citas" && (
  <PacienteCitas
    es={es}
    citas={citas}
    puedeEditarCitas={puedeEditarCitas}
    setMostrarModalCita={setMostrarModalCita}
    textoEstado={textoEstado}
    editarCita={editarCita}
    eliminarCita={eliminarCita}
  />
)}

            </div>

          )

                    :

                   (

<PacientesLanding
              es={es}
              pacientes={pacientes}
              pacientesFiltrados={pacientesFiltrados}
              pacientesNuevosMes={pacientesNuevosMes}
              pacientesConSaldo={pacientesConSaldo}
              tratamientosPendientesGlobal={tratamientosPendientesGlobal}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              busquedaTelefono={busquedaTelefono}
              setBusquedaTelefono={setBusquedaTelefono}
              filtroRapido={filtroRapido}
              setFiltroRapido={setFiltroRapido}
              setMostrarQR={setMostrarQR}
              abrirPaciente={abrirPaciente}
            />

          )
        }

      </div>

      {mostrarEditarPaciente && pacienteAbierto && (
        <ModalEditarPaciente
          es={es}
          pacienteAbierto={pacienteAbierto}
          datosPacienteEditando={datosPacienteEditando}
          setDatosPacienteEditando={setDatosPacienteEditando}
          setMostrarEditarPaciente={setMostrarEditarPaciente}
          guardarDatosPaciente={guardarDatosPaciente}
        />
      )}

      {
        mostrarQR && (

          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-[rgba(15,42,65,0.62)]
              backdrop-blur-[3px]
              p-4
            "
            onClick={() =>
              setMostrarQR(false)
            }
          >

            <div
              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-[24px]
                border
                border-white/20
                bg-[var(--mint-surface)]
                shadow-[0_28px_80px_rgba(15,42,65,0.30)]
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
                  absolute
                  top-4
                  right-4
                  z-10
                  w-9
                  h-9
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10
                  text-white
                  text-xl
                  leading-none
                  hover:bg-white/20
                  transition-colors
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
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-[var(--mint-teal-soft)]
                  "
                >
                  {es ? "Registro de pacientes" : "Patient registration"}
                </p>

                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                    mt-1
                  "
                >
                  {es ? "Código QR" : "QR Code"}
                </h2>

                <p
                  className="
                    text-sm
                    text-white/65
                    mt-1
                  "
                >
                  {es ? "Escanea este código desde un teléfono" : "Scan this code from a phone"}
                  {es ? "para abrir el formulario de registro." : "to open the registration form."}
                </p>

                <div
                  className="
                    max-w-[260px]
                    mx-auto
                    my-6
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
