import {
  Fragment,
  useEffect,
  useState,
} from "react";

import {
  Pencil,
  Plus,
  Save,
  X,
} from "lucide-react";

import { supabase }
  from "../../lib/supabase";

import { registrarBitacora }
  from "../../lib/registrarBitacora";

import { useAuth }
  from "../../context/AuthContext";

import { useLanguage }
  from "../../context/LanguageContext";

type TipoDoctor =
  | "doctor"
  | "especialista"
  | "ambos";

type Doctor = {
  id: number;
  nombre: string;
  especialidad: string | null;
  porcentaje: number | null;
  telefono: string | null;
  activo: boolean;
  tipo_doctor: TipoDoctor;
};

type FormDoctor = {
  nombre: string;
  especialidad: string;
  porcentaje: string;
  telefono: string;
  activo: boolean;
  tipo_doctor: TipoDoctor;
};

type TratamientoCatalogo = {
  id: number;
  nombre: string;
  activo: boolean;
  doctor_id: number | null;
  costo_especialista_mxn: number;
  costo_especialista_usd: number;
};

type PrecioEspecialista = {
  id: number;
  doctor_id: number;
  tratamiento_id: number | null;
  nombre_tratamiento: string;
  costo: number;
  moneda: "MXN" | "USD";
  activo: boolean;

  tratamiento?: {
    id: number;
    nombre: string;
  }[] | null;
};

type FormPrecioEspecialista = {
  tratamiento_id: string;
  nombre_tratamiento: string;
  costo: string;
  moneda: "MXN" | "USD";
};

const formularioInicial: FormDoctor = {
  nombre: "",
  especialidad: "",
  porcentaje: "",
  telefono: "",
  activo: true,
  tipo_doctor: "doctor",
};

const formularioPrecioInicial:
  FormPrecioEspecialista = {
    tratamiento_id: "",
    nombre_tratamiento: "",
    costo: "",
    moneda: "MXN",
  };

export default function DoctoresConfig() {

  const {
    perfil,
    permisos,
  } = useAuth();

  const { language } = useLanguage();

  const es = language === "es";

  const esAdmin =
    perfil?.rol === "admin";

  const puedeConfigurarComisiones =
    esAdmin ||
    permisos?.configurar_comisiones === true;

  const [
    doctores,
    setDoctores,
  ] = useState<Doctor[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);
const [
  doctorEditando,
  setDoctorEditando,
] = useState<number | null>(
  null
);

const [
  doctorPreciosId,
  setDoctorPreciosId,
] = useState<number | null>(
  null
);

const [
  form,
  setForm,
] = useState<FormDoctor>(
  formularioInicial
);

const [
  catalogoTratamientos,
  setCatalogoTratamientos,
] = useState<TratamientoCatalogo[]>(
  []
);

const [
  preciosEspecialista,
  setPreciosEspecialista,
] = useState<PrecioEspecialista[]>(
  []
);

const [
  mostrarFormularioPrecio,
  setMostrarFormularioPrecio,
] = useState(false);

const [
  precioEditandoId,
  setPrecioEditandoId,
] = useState<number | null>(
  null
);

const [
  formPrecio,
  setFormPrecio,
] = useState<FormPrecioEspecialista>(
  formularioPrecioInicial
);

  const [
    guardandoPrecio,
    setGuardandoPrecio,
  ] = useState(false);

  const doctoresClinica =
    doctores.filter(
      (doctor) =>
        doctor.tipo_doctor === "doctor" ||
        doctor.tipo_doctor === "ambos"
    );

  const especialistas =
    doctores.filter(
      (doctor) =>
        doctor.tipo_doctor === "especialista" ||
        doctor.tipo_doctor === "ambos"
    );

  useEffect(() => {

    cargarDoctores();
    cargarCatalogoTratamientos();

  }, []);

  async function cargarDoctores() {

    setCargando(true);

    const {
      data,
      error,
    } = await supabase

      .from("doctores")

      .select(
        `
        id,
        nombre,
        especialidad,
        porcentaje,
        telefono,
        activo,
        tipo_doctor
        `
      )

      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (error) {

      console.error(
        "Error cargando doctores:",
        error
      );

      setCargando(false);

      return;

    }

setDoctores(
  data || []
);

setCargando(false);

}

async function cargarCatalogoTratamientos() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "catalogo_tratamientos"
    )

    .select(
      `
      id,
      nombre,
      activo,
      doctor_id,
      costo_especialista_mxn,
      costo_especialista_usd
      `
    )

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

  if (error) {

    console.error(
      "Error cargando catálogo de tratamientos:",
      error
    );

    return;

  }

  setCatalogoTratamientos(
    data || []
  );

}

async function cargarPreciosEspecialista(
  doctorId: number
) {

  const {
    data,
    error,
  } = await supabase

    .from(
      "especialista_tratamientos"
    )

    .select(
      `
      id,
      doctor_id,
      tratamiento_id,
      nombre_tratamiento,
      costo,
      moneda,
      activo,
      tratamiento:catalogo_tratamientos(
        id,
        nombre
      )
      `
    )

    .eq(
      "doctor_id",
      doctorId
    )

    .order(
      "id",
      {
        ascending: true,
      }
    );

  if (error) {

    console.error(
      "Error cargando precios del especialista:",
      error
    );

    setPreciosEspecialista(
      []
    );

    return;

  }

  setPreciosEspecialista(
    (data || []) as PrecioEspecialista[]
  );

}

  function abrirNuevoDoctor() {

    setDoctorEditando(
      null
    );

    setForm(
      formularioInicial
    );

    setMostrarFormulario(
      true
    );

  }

  function editarDoctor(
    doctor: Doctor
  ) {

    setDoctorEditando(
      doctor.id
    );

    setForm({

      nombre:
        doctor.nombre || "",

      especialidad:
        doctor.especialidad || "",

      porcentaje:
        doctor.porcentaje !== null
          ? String(
              doctor.porcentaje
            )
          : "",

      telefono:
        doctor.telefono || "",

      activo:
        doctor.activo,

      tipo_doctor:
        doctor.tipo_doctor || "doctor",

    });

    setMostrarFormulario(
      true
    );

  }

  function cancelarFormulario() {

    setDoctorEditando(
      null
    );

    setForm(
      formularioInicial
    );

    setMostrarFormulario(
      false
    );

  }

  async function guardarDoctor() {

    if (
      !esAdmin &&
      puedeConfigurarComisiones &&
      doctorEditando !== null
    ) {

      const porcentaje =
        form.porcentaje.trim()
          ? Number(
              form.porcentaje
            )
          : 0;

      if (
        Number.isNaN(
          porcentaje
        ) ||
        porcentaje < 0 ||
        porcentaje > 100
      ) {

        alert(
          es ? "El porcentaje debe estar entre 0 y 100." : "The percentage must be between 0 and 100."
        );

        return;

      }

      const doctorOriginal =
        doctores.find(
          (doctor) =>
            doctor.id ===
            doctorEditando
        );

      setGuardando(true);

      const {
        error,
      } = await supabase.rpc(
        "actualizar_comision_doctor",
        {
          p_doctor_id:
            doctorEditando,
          p_porcentaje:
            porcentaje,
        }
      );

      if (error) {

        console.error(
          "Error actualizando comisión:",
          error
        );

        alert(
          es ? "No se pudo actualizar la comisión." : "The commission could not be updated."
        );

        setGuardando(false);

        return;

      }

      await registrarBitacora({
        accion: "Cambiar comisión de doctor",
        modulo: "Doctores",
        detalle:
          `Doctor ID: ${doctorEditando} | Doctor: ${doctorOriginal?.nombre || form.nombre || "-"} | Comisión: ${doctorOriginal?.porcentaje ?? 0}% → ${porcentaje}%`,
      });

      await cargarDoctores();

      cancelarFormulario();

      setGuardando(false);

      return;

    }

    if (!esAdmin) {

      alert(
        es ? "No tienes permiso para administrar doctores." : "You do not have permission to manage doctors."
      );

      return;

    }

    const nombre =
      form.nombre.trim();

    if (!nombre) {

      alert(
        es ? "Escribe el nombre del doctor." : "Enter the doctor’s name."
      );

      return;

    }

    const porcentaje =
      form.porcentaje.trim()
        ? Number(
            form.porcentaje
          )
        : 0;

    if (
      Number.isNaN(
        porcentaje
      )
    ) {

      alert(
        es ? "El porcentaje no es válido." : "The percentage is not valid."
      );

      return;

    }

    if (
      porcentaje < 0 ||
      porcentaje > 100
    ) {

      alert(
        es ? "El porcentaje debe estar entre 0 y 100." : "The percentage must be between 0 and 100."
      );

      return;

    }

    const doctorOriginal =
      doctorEditando !== null
        ? doctores.find(
            (doctor) =>
              doctor.id ===
              doctorEditando
          )
        : null;

    setGuardando(true);

    const datosDoctor = {

      nombre,

      especialidad:
        form.especialidad
          .trim() || null,

      porcentaje,

      telefono:
        form.telefono
          .replace(
            /\D/g,
            ""
          ) || null,

      activo:
        form.activo,

      tipo_doctor:
        form.tipo_doctor,

    };

    let doctorCreadoId:
      number | null = null;

    if (
      doctorEditando !== null
    ) {

      const {
        error,
      } = await supabase

        .from("doctores")

        .update(
          datosDoctor
        )

        .eq(
          "id",
          doctorEditando
        );

      if (error) {

        console.error(
          "Error actualizando doctor:",
          error
        );

        alert(
          es ? "No se pudo actualizar el doctor." : "The doctor could not be updated."
        );

        setGuardando(false);

        return;

      }

    } else {

      const {
        data: doctorCreado,
        error,
      } = await supabase

        .from("doctores")

        .insert([
          datosDoctor,
        ])
        .select("id")
        .single();

      if (error) {

        console.error(
          "Error creando doctor:",
          error
        );

        alert(
          es ? "No se pudo crear el doctor." : "The doctor could not be created."
        );

        setGuardando(false);

        return;

      }

      doctorCreadoId =
        doctorCreado.id;

    }

    if (
      doctorEditando !== null
    ) {

      const cambios: string[] = [];

      if (
        doctorOriginal
      ) {

        if (
          doctorOriginal.nombre !==
          datosDoctor.nombre
        ) {
          cambios.push(
            `Nombre: ${doctorOriginal.nombre} → ${datosDoctor.nombre}`
          );
        }

        if (
          (doctorOriginal.especialidad || null) !==
          datosDoctor.especialidad
        ) {
          cambios.push(
            `Especialidad: ${doctorOriginal.especialidad || "-"} → ${datosDoctor.especialidad || "-"}`
          );
        }

        if (
          Number(
            doctorOriginal.porcentaje || 0
          ) !==
          Number(
            datosDoctor.porcentaje || 0
          )
        ) {
          cambios.push(
            `Comisión: ${doctorOriginal.porcentaje ?? 0}% → ${datosDoctor.porcentaje}%`
          );
        }

        if (
          (doctorOriginal.telefono || null) !==
          datosDoctor.telefono
        ) {
          cambios.push(
            `WhatsApp modificado`
          );
        }

        if (
          doctorOriginal.activo !==
          datosDoctor.activo
        ) {
          cambios.push(
            `Estado: ${doctorOriginal.activo ? "Activo" : "Inactivo"} → ${datosDoctor.activo ? "Activo" : "Inactivo"}`
          );
        }

        if (
          doctorOriginal.tipo_doctor !==
          datosDoctor.tipo_doctor
        ) {
          cambios.push(
            `Tipo: ${doctorOriginal.tipo_doctor} → ${datosDoctor.tipo_doctor}`
          );
        }

      }

      await registrarBitacora({
        accion: "Editar doctor",
        modulo: "Doctores",
        detalle:
          `Doctor ID: ${doctorEditando} | Doctor: ${datosDoctor.nombre} | Cambios: ${cambios.length > 0 ? cambios.join(" | ") : "Sin cambios efectivos"}`,
      });

    } else {

      await registrarBitacora({
        accion: "Crear doctor",
        modulo: "Doctores",
        detalle:
          `Doctor ID: ${doctorCreadoId ?? "-"} | Doctor: ${datosDoctor.nombre} | Tipo: ${datosDoctor.tipo_doctor} | Especialidad: ${datosDoctor.especialidad || "-"} | Comisión: ${datosDoctor.porcentaje}% | Estado: ${datosDoctor.activo ? "Activo" : "Inactivo"}`,
      });

    }

    await cargarDoctores();

    cancelarFormulario();

    setGuardando(false);

  }

  async function cambiarEstado(
    doctor: Doctor
  ) {

    if (!esAdmin) {
      return;
    }

    const {
      error,
    } = await supabase

      .from("doctores")

      .update({

        activo:
          !doctor.activo,

      })

      .eq(
        "id",
        doctor.id
      );

    if (error) {

      console.error(
        "Error cambiando estado:",
        error
      );

      alert(
        es ? "No se pudo cambiar el estado." : "The status could not be changed."
      );

      return;

    }

    await registrarBitacora({
      accion: "Cambiar estado de doctor",
      modulo: "Doctores",
      detalle:
        `Doctor ID: ${doctor.id} | Doctor: ${doctor.nombre} | Estado: ${doctor.activo ? "Activo" : "Inactivo"} → ${!doctor.activo ? "Activo" : "Inactivo"}`,
    });

    await cargarDoctores();

  }


  function abrirNuevoPrecioEspecialista() {

    setPrecioEditandoId(
      null
    );

    setFormPrecio(
      formularioPrecioInicial
    );

    setMostrarFormularioPrecio(
      true
    );

  }

  function editarPrecioEspecialista(
    precio: PrecioEspecialista
  ) {

    setPrecioEditandoId(
      precio.id
    );

    setFormPrecio({
      tratamiento_id:
        precio.tratamiento_id
          ? String(
              precio.tratamiento_id
            )
          : "",

      nombre_tratamiento:
        precio.nombre_tratamiento ||
        "",

      costo:
        String(
          precio.costo
        ),

      moneda:
        precio.moneda,
    });

    setMostrarFormularioPrecio(
      true
    );

  }

  function cancelarFormularioPrecio() {

    setPrecioEditandoId(
      null
    );

    setFormPrecio(
      formularioPrecioInicial
    );

    setMostrarFormularioPrecio(
      false
    );

  }

async function guardarPrecioEspecialista() {

  if (
    doctorPreciosId === null
  ) {
    return;
  }

  const tratamientoId =
    Number(
      formPrecio.tratamiento_id
    );

  if (
    !tratamientoId ||
    Number.isNaN(
      tratamientoId
    )
  ) {

    alert(
      es
        ? "Selecciona un tratamiento del catálogo."
        : "Select a treatment from the catalog."
    );

    return;
  }

  const tratamientoCatalogo =
    catalogoTratamientos.find(
      (tratamiento) =>
        tratamiento.id ===
        tratamientoId
    );

  if (!tratamientoCatalogo) {

    alert(
      es
        ? "No se encontró el tratamiento seleccionado."
        : "The selected treatment was not found."
    );

    return;
  }

  const costo =
    Number(
      formPrecio.costo
    );

  if (
    Number.isNaN(costo) ||
    costo <= 0
  ) {

    alert(
      es
        ? "Ingresa un precio válido."
        : "Enter a valid price."
    );

    return;
  }

  setGuardandoPrecio(
    true
  );

  const campoPrecio =
    formPrecio.moneda === "USD"
      ? "costo_especialista_usd"
      : "costo_especialista_mxn";

  const {
    error,
  } = await supabase

    .from(
      "catalogo_tratamientos"
    )

    .update({
      doctor_id:
        doctorPreciosId,
      tipo:
        "especialista",
      [campoPrecio]:
        costo,
    })

    .eq(
      "id",
      tratamientoId
    );

  if (error) {

    console.error(
      "Error actualizando precio del especialista:",
      error
    );

    alert(
      es
        ? "No se pudo actualizar el precio del especialista."
        : "The specialist price could not be updated."
    );

    setGuardandoPrecio(
      false
    );

    return;
  }

  const especialista =
    doctores.find(
      (doctor) =>
        doctor.id ===
        doctorPreciosId
    );

  await registrarBitacora({
    accion:
      precioEditandoId !== null
        ? "Editar precio de especialista"
        : "Asignar tratamiento a especialista",
    modulo: "Doctores",
    detalle:
      `Especialista ID: ${doctorPreciosId} | Especialista: ${especialista?.nombre || "-"} | Tratamiento ID: ${tratamientoId} | Tratamiento: ${tratamientoCatalogo.nombre} | Precio especialista: ${costo} ${formPrecio.moneda}`,
  });

  await cargarCatalogoTratamientos();

  await cargarPreciosEspecialista(
    doctorPreciosId
  );

  cancelarFormularioPrecio();

  setGuardandoPrecio(
    false
  );

}

  async function cambiarEstadoPrecioEspecialista(
    precio: PrecioEspecialista
  ) {

    if (
      doctorPreciosId === null
    ) {
      return;
    }

    const {
      error,
    } = await supabase

      .from(
        "especialista_tratamientos"
      )

      .update({
        activo:
          !precio.activo,
        updated_at:
          new Date().toISOString(),
      })

      .eq(
        "id",
        precio.id
      );

    if (error) {

      console.error(
        "Error cambiando estado del precio:",
        error
      );

      alert(
        es ? "No se pudo cambiar el estado del precio." : "The price status could not be changed."
      );

      return;

    }

    const especialista =
      doctores.find(
        (doctor) =>
          doctor.id ===
          doctorPreciosId
      );

    await registrarBitacora({
      accion: "Cambiar estado de precio de especialista",
      modulo: "Doctores",
      detalle:
        `Especialista ID: ${doctorPreciosId} | Especialista: ${especialista?.nombre || "-"} | Registro ID: ${precio.id} | Tratamiento: ${precio.nombre_tratamiento || "-"} | Estado: ${precio.activo ? "Activo" : "Inactivo"} → ${!precio.activo ? "Activo" : "Inactivo"}`,
    });

    await cargarPreciosEspecialista(
      doctorPreciosId
    );

  }

  return (

    <div
      className="
        mint-card
        overflow-hidden
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          p-5
          border-b
          border-[var(--mint-border)]
        "
      >

        <div>

          <h2
            className="
              text-lg
              font-bold
              mint-text-primary
            "
          >

            {es ? "Doctores" : "Doctors"}

          </h2>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >

            {es ? "Administra doctores, especialidades, porcentajes y WhatsApp." : "Manage doctors, specialties, percentages and WhatsApp."}

          </p>

        </div>

        {
          esAdmin

          &&

        <button
          type="button"
          onClick={
            abrirNuevoDoctor
          }
          className="
            mint-btn
            mint-btn-primary
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            text-sm
          "
        >

          <Plus
            size={17}
          />

          {es ? "Nuevo Doctor" : "New Doctor"}

        </button>
        }

      </div>

      {
        mostrarFormulario && (

          <div
            className="
              p-5
              bg-[var(--mint-bg-soft)]
              border-b
              border-[var(--mint-border)]
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-4
              "
            >

              <h3
                className="
                  font-bold
                  mint-text-primary
                "
              >

                {
                  esAdmin
                    ? (
                        doctorEditando !== null
                          ? (es ? "Editar Doctor" : "Edit Doctor")
                          : (es ? "Nuevo Doctor" : "New Doctor")
                      )
                    : (es ? "Editar comisión" : "Edit commission")
                }

              </h3>

              <button
                type="button"
                onClick={
                  cancelarFormulario
                }
                className="
                  mint-btn
                  mint-btn-ghost
                  p-2
                "
              >

                <X
                  size={20}
                />

              </button>

            </div>

            {
              esAdmin

              ? (

                <>

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      xl:grid-cols-5
                      gap-4
                    "
                  >

                    <div>

                      <label
                        className="
                          mint-label
                          block
                          mb-2
                        "
                      >
                        {es ? "Nombre" : "Name"}
                      </label>

                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            nombre:
                              e.target.value,
                          })
                        }
                        placeholder={es ? "Dr. Nombre" : "Dr. Name"}
                        className="
                          mint-input
                          w-full
                          px-3
                          py-2.5
                        "
                      />

                    </div>

                    <div>

                      <label
                        className="
                          mint-label
                          block
                          mb-2
                        "
                      >
                        {es ? "Especialidad" : "Specialty"}
                      </label>

                      <input
                        type="text"
                        value={form.especialidad}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            especialidad:
                              e.target.value,
                          })
                        }
                        placeholder={es ? "General" : "General"}
                        className="
                          mint-input
                          w-full
                          px-3
                          py-2.5
                        "
                      />

                    </div>

                    <div>

                      <label
                        className="
                          mint-label
                          block
                          mb-2
                        "
                      >
                        {es ? "Tipo" : "Type"}
                      </label>

                      <select
                        value={form.tipo_doctor}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tipo_doctor:
                              e.target.value as TipoDoctor,
                          })
                        }
                        className="
                          mint-input
                          w-full
                          px-3
                          py-2.5
                        "
                      >
                        <option value="doctor">
                          Doctor
                        </option>
                        <option value="especialista">
                          {es ? "Especialista" : "Specialist"}
                        </option>
                        <option value="ambos">
                          {es ? "Ambos" : "Both"}
                        </option>
                      </select>

                    </div>

                    <div>

                      <label
                        className="
                          mint-label
                          block
                          mb-2
                        "
                      >
                        {es ? "Porcentaje %" : "Percentage %"}
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.porcentaje}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            porcentaje:
                              e.target.value,
                          })
                        }
                        placeholder="30"
                        className="
                          mint-input
                          w-full
                          px-3
                          py-2.5
                        "
                      />

                    </div>

                    <div>

                      <label
                        className="
                          mint-label
                          block
                          mb-2
                        "
                      >
                        WhatsApp
                      </label>

                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            telefono:
                              e.target.value,
                          })
                        }
                        placeholder="526531234567"
                        className="
                          mint-input
                          w-full
                          px-3
                          py-2.5
                        "
                      />

                    </div>

                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      mt-5
                    "
                  >

                    <label
                      className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-semibold
                        mint-text-secondary
                        cursor-pointer
                      "
                    >

                      <input
                        type="checkbox"
                        checked={form.activo}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            activo:
                              e.target.checked,
                          })
                        }
                        className="
                          w-4
                          h-4
                          accent-[var(--mint-primary)]
                        "
                      />

                      {es ? "Doctor activo" : "Active doctor"}

                    </label>

                    <div
                      className="
                        flex
                        gap-2
                      "
                    >

                      <button
                        type="button"
                        onClick={
                          cancelarFormulario
                        }
                        className="
                          mint-btn
                          mint-btn-neutral
                          px-4
                          py-2.5
                          text-sm
                        "
                      >
                        {es ? "Cancelar" : "Cancel"}
                      </button>

                      <button
                        type="button"
                        disabled={guardando}
                        onClick={guardarDoctor}
                        className="
                          mint-btn
                          mint-btn-primary
                          inline-flex
                          items-center
                          gap-2
                          px-4
                          py-2.5
                          text-sm
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >

                        <Save
                          size={16}
                        />

                        {
                          guardando
                            ? (es ? "Guardando..." : "Saving...")
                            : (es ? "Guardar" : "Save")
                        }

                      </button>

                    </div>

                  </div>

                </>

              )

              : (

                <div
                  className="
                    max-w-md
                  "
                >

                  <p
                    className="
                      text-sm
                      font-semibold
                      mint-text-primary
                      mb-4
                    "
                  >
                    {form.nombre}
                  </p>

                  <label
                    className="
                      mint-label
                      block
                      mb-2
                    "
                  >
                    {es ? "Porcentaje de comisión" : "Commission percentage"}
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.porcentaje}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        porcentaje:
                          e.target.value,
                      })
                    }
                    className="
                      mint-input
                      w-full
                      px-3
                      py-2.5
                    "
                  />

                  <div
                    className="
                      flex
                      gap-2
                      mt-4
                    "
                  >

                    <button
                      type="button"
                      onClick={
                        cancelarFormulario
                      }
                      className="
                        mint-btn
                        mint-btn-neutral
                        px-4
                        py-2.5
                        text-sm
                      "
                    >
                      {es ? "Cancelar" : "Cancel"}
                    </button>

                    <button
                      type="button"
                      disabled={guardando}
                      onClick={guardarDoctor}
                      className="
                        mint-btn
                        mint-btn-primary
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2.5
                        text-sm
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >

                      <Save
                        size={16}
                      />

                      {
                        guardando
                          ? (es ? "Guardando..." : "Saving...")
                          : (es ? "Guardar comisión" : "Save commission")
                      }

                    </button>

                  </div>

                </div>

              )
            }

          </div>

        )

      }

      <div
        className="
          px-5
          py-4
          border-b
          border-[var(--mint-border)]
          bg-[var(--mint-bg-soft)]
        "
      >

        <p
          className="
            text-xs
            font-bold
            uppercase
            tracking-[0.12em]
            text-[var(--mint-primary)]
            mb-1
          "
        >
          {es ? "Personal clínico" : "Clinical staff"}
        </p>

        <h3
          className="
            text-base
            font-bold
            mint-text-primary
          "
        >
          {es ? "Doctores" : "Doctors"}
        </h3>

        <p
          className="
            text-sm
            mint-text-secondary
            mt-1
          "
        >
          {es ? "Doctores que atienden pacientes y reciben comisión clínica." : "Doctors who treat patients and receive a clinical commission."}
        </p>

      </div>

      <div
        className="
          overflow-x-auto
        "
      >

        <table
          className="
            w-full
            text-sm
          "
        >

          <thead
            className="
              bg-[var(--mint-bg-soft)]
              mint-text-secondary
            "
          >

            <tr>

              <th
                className="
                  text-left
                  px-5
                  py-3
                  font-semibold
                "
              >
                Doctor
              </th>

              <th
                className="
                  text-left
                  px-5
                  py-3
                  font-semibold
                "
              >
                {es ? "Especialidad" : "Specialty"}
              </th>

              <th
                className="
                  text-left
                  px-5
                  py-3
                  font-semibold
                "
              >
                WhatsApp
              </th>

              <th
                className="
                  text-center
                  px-5
                  py-3
                  font-semibold
                "
              >
                %
              </th>

              <th
                className="
                  text-center
                  px-5
                  py-3
                  font-semibold
                "
              >
                {es ? "Estado" : "Status"}
              </th>

              <th
                className="
                  text-right
                  px-5
                  py-3
                  font-semibold
                "
              >
                {es ? "Acción" : "Action"}
              </th>

            </tr>

          </thead>

          <tbody>

            {

              cargando ? (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      px-5
                      py-8
                      text-center
                      mint-text-secondary
                    "
                  >

                    {es ? "Cargando doctores..." : "Loading doctors..."}

                  </td>

                </tr>

              ) : doctoresClinica.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      px-5
                      py-8
                      text-center
                      mint-text-secondary
                    "
                  >

                    {es ? "No hay doctores registrados." : "No doctors registered."}

                  </td>

                </tr>

              ) : (

              doctoresClinica.map(
  (doctor) => (

    <Fragment
      key={
        doctor.id
      }
    >

      <tr
        className="
          border-t
          border-[var(--mint-border)]
          hover:bg-[var(--mint-bg-soft)]
          transition-colors
        "
      >

        <td
          className="
            px-5
            py-4
            font-bold
            mint-text-primary
          "
        >

          {
            doctor.nombre
          }

        </td>

        <td
          className="
            px-5
            py-4
            mint-text-secondary
          "
        >

          {
            doctor.especialidad ||
            "—"
          }

        </td>

        <td
          className="
            px-5
            py-4
            mint-text-secondary
          "
        >

          {
            doctor.telefono ||
            (es ? "Sin teléfono" : "No phone")
          }

        </td>

        <td
          className="
            px-5
            py-4
            text-center
            font-semibold
            mint-text-primary
          "
        >

          {
            doctor.porcentaje ?? 0
          }%

        </td>

        <td
          className="
            px-5
            py-4
            text-center
          "
        >

          {
            esAdmin

            ? (

          <button
            type="button"
            onClick={() =>
              cambiarEstado(
                doctor
              )
            }
            className={`
              mint-badge
              cursor-pointer

              ${
                doctor.activo
                  ? "mint-badge-success"
                  : "mint-badge-muted"
              }
            `}
          >

            {
              doctor.activo
                ? (es ? "Activo" : "Active")
                : (es ? "Inactivo" : "Inactive")
            }

          </button>

            )

            : (

              <span
                className={`
                  mint-badge

                  ${
                    doctor.activo
                      ? "mint-badge-success"
                      : "mint-badge-muted"
                  }
                `}
              >

                {
                  doctor.activo
                    ? (es ? "Activo" : "Active")
                    : (es ? "Inactivo" : "Inactive")
                }

              </span>

            )
          }

        </td>

        <td
          className="
            px-5
            py-4
            text-right
          "
        >

          <div
            className="
              inline-flex
              items-center
              justify-end
              gap-2
            "
          >

            <button
              type="button"
              onClick={() =>
                editarDoctor(
                  doctor
                )
              }
              className="
                mint-btn
                mint-btn-action-soft
                inline-flex
                items-center
                gap-2
                px-3
                py-2
                text-sm
              "
            >

              <Pencil
                size={15}
              />

              {
                esAdmin
                  ? (es ? "Editar" : "Edit")
                  : (es ? "Editar comisión" : "Edit commission")
              }

            </button>

          </div>

        </td>

      </tr>

    </Fragment>

  )
)

              )
            }

          </tbody>

        </table>

      </div>

      {
        esAdmin

        &&

        (

      <div
        className="
          border-t
          border-[var(--mint-border)]
        "
      >

        <div
          className="
            px-5
            py-4
            border-b
            border-[var(--mint-border)]
            bg-[var(--mint-bg-soft)]
          "
        >

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.12em]
              text-[var(--mint-accent)]
              mb-1
            "
          >
            {es ? "Servicios especializados" : "Specialized services"}
          </p>

          <h3
            className="
              text-base
              font-bold
              mint-text-primary
            "
          >
            {es ? "Especialistas" : "Specialists"}
          </h3>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >
            {es ? "Especialistas externos con tarifario clínico configurado." : "External specialists with configured clinical pricing."}
          </p>

        </div>

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              text-sm
            "
          >

            <thead
              className="
                bg-[var(--mint-bg-soft)]
                mint-text-secondary
              "
            >

              <tr>

                <th
                  className="
                    text-left
                    px-5
                    py-3
                    font-semibold
                  "
                >
                  {es ? "Especialista" : "Specialist"}
                </th>

                <th
                  className="
                    text-left
                    px-5
                    py-3
                    font-semibold
                  "
                >
                  {es ? "Especialidad" : "Specialty"}
                </th>

                <th
                  className="
                    text-left
                    px-5
                    py-3
                    font-semibold
                  "
                >
                  WhatsApp
                </th>

                <th
                  className="
                    text-center
                    px-5
                    py-3
                    font-semibold
                  "
                >
                  {es ? "Estado" : "Status"}
                </th>

                <th
                  className="
                    text-right
                    px-5
                    py-3
                    font-semibold
                  "
                >
                  {es ? "Acción" : "Action"}
                </th>

              </tr>

            </thead>

            <tbody>

              {

                cargando ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="
                        px-5
                        py-8
                        text-center
                        mint-text-secondary
                      "
                    >
                      {es ? "Cargando especialistas..." : "Loading specialists..."}
                    </td>

                  </tr>

                ) : especialistas.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="
                        px-5
                        py-8
                        text-center
                        mint-text-secondary
                      "
                    >
                      {es ? "No hay especialistas registrados." : "No specialists registered."}
                    </td>

                  </tr>

                ) : (

                  especialistas.map(
                    (doctor) => (

                      <Fragment
                        key={
                          doctor.id
                        }
                      >

                        <tr
                          className="
                            border-t
                            border-[var(--mint-border)]
                            hover:bg-[var(--mint-bg-soft)]
                            transition-colors
                          "
                        >

                          <td
                            className="
                              px-5
                              py-4
                              font-bold
                              mint-text-primary
                            "
                          >
                            {
                              doctor.nombre
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              mint-text-secondary
                            "
                          >
                            {
                              doctor.especialidad ||
                              "—"
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              mint-text-secondary
                            "
                          >
                            {
                              doctor.telefono ||
                              (es ? "Sin teléfono" : "No phone")
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-center
                            "
                          >

                            <button
                              type="button"
                              onClick={() =>
                                cambiarEstado(
                                  doctor
                                )
                              }
                              className={`
                                mint-badge
                                cursor-pointer

                                ${
                                  doctor.activo
                                    ? "mint-badge-success"
                                    : "mint-badge-muted"
                                }
                              `}
                            >
                              {
                                doctor.activo
                                  ? (es ? "Activo" : "Active")
                                  : (es ? "Inactivo" : "Inactive")
                              }
                            </button>

                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                            "
                          >

                            <div
                              className="
                                inline-flex
                                items-center
                                justify-end
                                gap-2
                              "
                            >

                              <button
                                type="button"
                                onClick={() => {

                                  if (
                                    doctorPreciosId ===
                                    doctor.id
                                  ) {

                                    setDoctorPreciosId(
                                      null
                                    );

                                    setPreciosEspecialista(
                                      []
                                    );

                                    cancelarFormularioPrecio();

                                    return;

                                  }

                                  setDoctorPreciosId(
                                    doctor.id
                                  );

                                  cancelarFormularioPrecio();

                                  cargarPreciosEspecialista(
                                    doctor.id
                                  );

                                }}
                                className={`
                                  mint-btn
                                  inline-flex
                                  items-center
                                  px-3
                                  py-2
                                  text-sm

                                  ${
                                    doctorPreciosId ===
                                    doctor.id
                                      ? "mint-btn-primary"
                                      : "mint-btn-secondary"
                                  }
                                `}
                              >
                                {es ? "Precios" : "Prices"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  editarDoctor(
                                    doctor
                                  )
                                }
                                className="
                                  mint-btn
                                  mint-btn-action-soft
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-3
                                  py-2
                                  text-sm
                                "
                              >

                                <Pencil
                                  size={15}
                                />

                                Editar

                              </button>

                            </div>

                          </td>

                        </tr>

                        {
                          doctorPreciosId ===
                            doctor.id && (

                            <tr>

                              <td
                                colSpan={5}
                                className="
                                  p-0
                                  bg-[var(--mint-bg-soft)]
                                "
                              >

                                <div
                                  className="
                                    m-4
                                    mint-card
                                    overflow-hidden
                                  "
                                >

                                  <div
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      gap-4
                                      px-5
                                      py-4
                                      border-b
                                      border-[var(--mint-border)]
                                    "
                                  >

                                    <div>

                                      <p
                                        className="
                                          text-xs
                                          font-bold
                                          uppercase
                                          tracking-[0.12em]
                                          text-[var(--mint-primary)]
                                          mb-1
                                        "
                                      >
                                        {es ? "Tarifario especialista" : "Specialist fee schedule"}
                                      </p>

                                      <h3
                                        className="
                                          text-lg
                                          font-bold
                                          mint-text-primary
                                        "
                                      >
                                        {es ? "Precios de " : "Prices for "}
                                        {
                                          doctor.nombre
                                        }
                                      </h3>

                                    </div>

                                    <button
                                      type="button"
                                      onClick={
                                        abrirNuevoPrecioEspecialista
                                      }
                                      className="
                                        mint-btn
                                        mint-btn-primary
                                        inline-flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        text-sm
                                      "
                                    >

                                      <Plus
                                        size={16}
                                      />

                                      {es ? "Agregar tratamiento" : "Add treatment"}

                                    </button>

                                  </div>

                                  {
                                    mostrarFormularioPrecio && (

                                      <div
                                        className="
                                          p-5
                                          border-b
                                          border-[var(--mint-border)]
                                          bg-[var(--mint-bg-soft)]
                                        "
                                      >

                                        <div
                                          className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            mb-4
                                          "
                                        >

                                          <h4
                                            className="
                                              font-bold
                                              mint-text-primary
                                            "
                                          >
                                            {
                                              precioEditandoId !== null
                                                ? (es ? "Editar precio" : "Edit price")
                                                : (es ? "Agregar tratamiento" : "Add treatment")
                                            }
                                          </h4>

                                          <button
                                            type="button"
                                            onClick={
                                              cancelarFormularioPrecio
                                            }
                                            className="
                                              mint-btn
                                              mint-btn-ghost
                                              p-2
                                            "
                                          >

                                            <X
                                              size={18}
                                            />

                                          </button>

                                        </div>

                                        <div
                                          className="
                                            grid
                                            grid-cols-1
                                            md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_auto]
                                            gap-4
                                            items-end
                                          "
                                        >

                                          <div>

                                            <label
                                              className="
                                                mint-label
                                                block
                                                mb-2
                                              "
                                            >
                                              {es ? "Tratamiento" : "Treatment"}
                                            </label>

                                            <select
                                              value={
                                                formPrecio.tratamiento_id
                                              }
                                              onChange={(e) => {

                                                const tratamientoId =
                                                  e.target.value;

                                                const tratamiento =
                                                  catalogoTratamientos.find(
                                                    (item) =>
                                                      item.id ===
                                                      Number(
                                                        tratamientoId
                                                      )
                                                  );

                                                setFormPrecio({
                                                  ...formPrecio,
                                                  tratamiento_id:
                                                    tratamientoId,
                                                  nombre_tratamiento:
                                                    tratamiento?.nombre ||
                                                    "",
                                                });

                                              }}
                                              disabled={
                                                precioEditandoId !== null &&
                                                !!formPrecio.tratamiento_id
                                              }
                                              className="
                                                mint-input
                                                w-full
                                                px-3
                                                py-2.5
                                                disabled:opacity-70
                                                disabled:cursor-not-allowed
                                              "
                                            >

                                              <option value="">
                                                {es
                                                  ? "Seleccionar tratamiento"
                                                  : "Select treatment"}
                                              </option>

                                              {
                                                catalogoTratamientos
                                                  .filter(
                                                    (tratamiento) =>
                                                      tratamiento.activo &&
                                                      (
                                                        tratamiento.doctor_id ===
                                                          null ||
                                                        tratamiento.doctor_id ===
                                                          doctorPreciosId ||
                                                        tratamiento.id ===
                                                          Number(
                                                            formPrecio.tratamiento_id
                                                          )
                                                      )
                                                  )
                                                  .map(
                                                    (tratamiento) => (

                                                      <option
                                                        key={
                                                          tratamiento.id
                                                        }
                                                        value={
                                                          tratamiento.id
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
                                                mint-label
                                                block
                                                mb-2
                                              "
                                            >
                                              {es ? "Costo" : "Cost"}
                                            </label>

                                            <input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              value={
                                                formPrecio.costo
                                              }
                                              onChange={
                                                (e) =>
                                                  setFormPrecio({
                                                    ...formPrecio,
                                                    costo:
                                                      e.target.value,
                                                  })
                                              }
                                              placeholder="0.00"
                                              className="
                                                mint-input
                                                w-full
                                                px-3
                                                py-2.5
                                              "
                                            />

                                          </div>

                                          <div
                                            className="
                                              flex
                                              flex-col
                                              gap-2
                                            "
                                          >

                                            <label
                                              className="
                                                mint-label
                                              "
                                            >
                                              {es ? "Moneda" : "Currency"}
                                            </label>

                                            <div
                                              className="
                                                inline-flex
                                                p-1
                                                rounded-xl
                                                bg-[var(--mint-bg-muted)]
                                              "
                                            >

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setFormPrecio({
                                                    ...formPrecio,
                                                    moneda: "MXN",
                                                  })
                                                }
                                                className={`
                                                  px-3
                                                  py-2
                                                  rounded-lg
                                                  text-sm
                                                  font-bold
                                                  transition

                                                  ${
                                                    formPrecio.moneda ===
                                                    "MXN"
                                                      ? `
                                                        bg-[var(--mint-bg-card)]
                                                        text-[var(--mint-primary)]
                                                        shadow-sm
                                                      `
                                                      : `
                                                        mint-text-secondary
                                                      `
                                                  }
                                                `}
                                              >
                                                MXN
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setFormPrecio({
                                                    ...formPrecio,
                                                    moneda: "USD",
                                                  })
                                                }
                                                className={`
                                                  px-3
                                                  py-2
                                                  rounded-lg
                                                  text-sm
                                                  font-bold
                                                  transition

                                                  ${
                                                    formPrecio.moneda ===
                                                    "USD"
                                                      ? `
                                                        bg-[var(--mint-bg-card)]
                                                        text-[var(--mint-accent)]
                                                        shadow-sm
                                                      `
                                                      : `
                                                        mint-text-secondary
                                                      `
                                                  }
                                                `}
                                              >
                                                USD
                                              </button>

                                            </div>

                                          </div>

                                        </div>

                                        <div
                                          className="
                                            flex
                                            justify-end
                                            gap-2
                                            mt-5
                                          "
                                        >

                                          <button
                                            type="button"
                                            onClick={
                                              cancelarFormularioPrecio
                                            }
                                            className="
                                              mint-btn
                                              mint-btn-neutral
                                              px-4
                                              py-2.5
                                              text-sm
                                            "
                                          >
                                            {es ? "Cancelar" : "Cancel"}
                                          </button>

                                          <button
                                            type="button"
                                            disabled={
                                              guardandoPrecio
                                            }
                                            onClick={
                                              guardarPrecioEspecialista
                                            }
                                            className="
                                              mint-btn
                                              mint-btn-primary
                                              inline-flex
                                              items-center
                                              gap-2
                                              px-4
                                              py-2.5
                                              text-sm
                                              disabled:opacity-50
                                              disabled:cursor-not-allowed
                                            "
                                          >

                                            <Save
                                              size={16}
                                            />

                                            {
                                              guardandoPrecio
                                                ? (es ? "Guardando..." : "Saving...")
                                                : (es ? "Guardar precio" : "Save price")
                                            }

                                          </button>

                                        </div>

                                      </div>

                                    )
                                  }

                                  <div
                                    className="
                                      px-5
                                      py-4
                                    "
                                  >

                                    {
                                      preciosEspecialista.length === 0
                                        ? (

                                          <div
                                            className="
                                              py-8
                                              text-center
                                              mint-text-secondary
                                            "
                                          >
                                            No hay precios configurados para{" "}
                                            <strong>
                                              {
                                                doctor.nombre
                                              }
                                            </strong>.
                                          </div>

                                        )
                                        : (

                                          <div
                                            className="
                                              overflow-x-auto
                                            "
                                          >

                                            <table
                                              className="
                                                w-full
                                                text-sm
                                              "
                                            >

                                              <thead
                                                className="
                                                  mint-text-secondary
                                                "
                                              >

                                                <tr>

                                                  <th
                                                    className="
                                                      text-left
                                                      py-3
                                                      pr-4
                                                      font-semibold
                                                    "
                                                  >
                                                    {es ? "Tratamiento" : "Treatment"}
                                                  </th>

                                                  <th
                                                    className="
                                                      text-right
                                                      px-4
                                                      py-3
                                                      font-semibold
                                                    "
                                                  >
                                                    {es ? "Costo" : "Cost"}
                                                  </th>

                                                  <th
                                                    className="
                                                      text-center
                                                      px-4
                                                      py-3
                                                      font-semibold
                                                    "
                                                  >
                                                    {es ? "Moneda" : "Currency"}
                                                  </th>

                                                  <th
                                                    className="
                                                      text-center
                                                      px-4
                                                      py-3
                                                      font-semibold
                                                    "
                                                  >
                                                    {es ? "Estado" : "Status"}
                                                  </th>

                                                  <th
                                                    className="
                                                      text-right
                                                      pl-4
                                                      py-3
                                                      font-semibold
                                                    "
                                                  >
                                                    {es ? "Acción" : "Action"}
                                                  </th>

                                                </tr>

                                              </thead>

                                              <tbody>

                                                {
                                                  preciosEspecialista.map(
                                                    (precio) => (

                                                      <tr
                                                        key={
                                                          precio.id
                                                        }
                                                        className="
                                                          border-t
                                                          border-[var(--mint-border)]
                                                        "
                                                      >

                                                        <td
                                                          className="
                                                            py-4
                                                            pr-4
                                                            font-semibold
                                                            mint-text-primary
                                                          "
                                                        >
                                                          {
                                                            precio.nombre_tratamiento ||
                                                            catalogoTratamientos.find(
                                                              (tratamiento: any) =>
                                                                Number(
                                                                  tratamiento.id
                                                                ) ===
                                                                Number(
                                                                  precio.tratamiento_id
                                                                )
                                                            )?.nombre ||
                                                            (es ? "Tratamiento" : "Treatment")
                                                          }
                                                        </td>

                                                        <td
                                                          className="
                                                            px-4
                                                            py-4
                                                            text-right
                                                            font-bold
                                                            mint-text-primary
                                                          "
                                                        >
                                                          ${
                                                            Number(
                                                              precio.costo || 0
                                                            ).toLocaleString(
                                                              "es-MX",
                                                              {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                              }
                                                            )
                                                          }
                                                        </td>

                                                        <td
                                                          className="
                                                            px-4
                                                            py-4
                                                            text-center
                                                          "
                                                        >

                                                          <span
                                                            className={`
                                                              mint-badge

                                                              ${
                                                                precio.moneda ===
                                                                "USD"
                                                                  ? "mint-badge-warning"
                                                                  : "mint-badge-info"
                                                              }
                                                            `}
                                                          >
                                                            {
                                                              precio.moneda
                                                            }
                                                          </span>

                                                        </td>

                                                        <td
                                                          className="
                                                            px-4
                                                            py-4
                                                            text-center
                                                          "
                                                        >

                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              cambiarEstadoPrecioEspecialista(
                                                                precio
                                                              )
                                                            }
                                                            className={`
                                                              mint-badge
                                                              cursor-pointer

                                                              ${
                                                                precio.activo
                                                                  ? "mint-badge-success"
                                                                  : "mint-badge-muted"
                                                              }
                                                            `}
                                                          >
                                                            {
                                                              precio.activo
                                                                ? (es ? "Activo" : "Active")
                                                                : (es ? "Inactivo" : "Inactive")
                                                            }
                                                          </button>

                                                        </td>

                                                        <td
                                                          className="
                                                            pl-4
                                                            py-4
                                                            text-right
                                                          "
                                                        >

                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              editarPrecioEspecialista(
                                                                precio
                                                              )
                                                            }
                                                            className="
                                                              mint-btn
                                                              mint-btn-action-soft
                                                              inline-flex
                                                              items-center
                                                              gap-2
                                                              px-3
                                                              py-2
                                                              text-sm
                                                            "
                                                          >

                                                            <Pencil
                                                              size={15}
                                                            />

                                                            Editar

                                                          </button>

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

                                  </div>

                                </div>

                              </td>

                            </tr>

                          )
                        }

                      </Fragment>

                    )
                  )

                )
              }

            </tbody>

          </table>

        </div>

      </div>

        )
      }

    </div>

  );

}