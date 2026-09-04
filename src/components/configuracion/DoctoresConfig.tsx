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

type Doctor = {
  id: number;
  nombre: string;
  especialidad: string | null;
  porcentaje: number | null;
  telefono: string | null;
  activo: boolean;
};

type FormDoctor = {
  nombre: string;
  especialidad: string;
  porcentaje: string;
  telefono: string;
  activo: boolean;
};

type TratamientoCatalogo = {
  id: number;
  nombre: string;
  activo: boolean;
};

type PrecioEspecialista = {
  id: number;
  doctor_id: number;
  tratamiento_id: number;
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
  costo: string;
  moneda: "MXN" | "USD";
};

const formularioInicial: FormDoctor = {
  nombre: "",
  especialidad: "",
  porcentaje: "",
  telefono: "",
  activo: true,
};

const formularioPrecioInicial:
  FormPrecioEspecialista = {
    tratamiento_id: "",
    costo: "",
    moneda: "MXN",
  };

export default function DoctoresConfig() {

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
        activo
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
      activo
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

    const nombre =
      form.nombre.trim();

    if (!nombre) {

      alert(
        "Escribe el nombre del doctor."
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
        "El porcentaje no es válido."
      );

      return;

    }

    if (
      porcentaje < 0 ||
      porcentaje > 100
    ) {

      alert(
        "El porcentaje debe estar entre 0 y 100."
      );

      return;

    }

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

    };

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
          "No se pudo actualizar el doctor."
        );

        setGuardando(false);

        return;

      }

    } else {

      const {
        error,
      } = await supabase

        .from("doctores")

        .insert([
          datosDoctor,
        ]);

      if (error) {

        console.error(
          "Error creando doctor:",
          error
        );

        alert(
          "No se pudo crear el doctor."
        );

        setGuardando(false);

        return;

      }

    }

    await cargarDoctores();

    cancelarFormulario();

    setGuardando(false);

  }

  async function cambiarEstado(
    doctor: Doctor
  ) {

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
        "No se pudo cambiar el estado."
      );

      return;

    }

    cargarDoctores();

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
        String(
          precio.tratamiento_id
        ),
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

    if (
      !formPrecio.tratamiento_id
    ) {

      alert(
        "Selecciona un tratamiento."
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
        "Ingresa un costo válido."
      );

      return;

    }

    setGuardandoPrecio(
      true
    );

    const datosPrecio = {

      doctor_id:
        doctorPreciosId,

      tratamiento_id:
        Number(
          formPrecio.tratamiento_id
        ),

      costo,

      moneda:
        formPrecio.moneda,

      activo:
        true,

      updated_at:
        new Date().toISOString(),

    };

    if (
      precioEditandoId !== null
    ) {

      const {
        error,
      } = await supabase

        .from(
          "especialista_tratamientos"
        )

        .update(
          datosPrecio
        )

        .eq(
          "id",
          precioEditandoId
        );

      if (error) {

        console.error(
          "Error actualizando precio del especialista:",
          error
        );

        alert(
          "No se pudo actualizar el precio."
        );

        setGuardandoPrecio(
          false
        );

        return;

      }

    } else {

      const {
        error,
      } = await supabase

        .from(
          "especialista_tratamientos"
        )

        .insert([
          datosPrecio,
        ]);

      if (error) {

        console.error(
          "Error guardando precio del especialista:",
          error
        );

        if (
          error.code ===
          "23505"
        ) {

          alert(
            "Este especialista ya tiene un precio configurado para ese tratamiento."
          );

        } else {

          alert(
            "No se pudo guardar el precio."
          );

        }

        setGuardandoPrecio(
          false
        );

        return;

      }

    }

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
        "No se pudo cambiar el estado del precio."
      );

      return;

    }

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

            Doctores

          </h2>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >

            Administra doctores,
            especialidades,
            porcentajes y WhatsApp.

          </p>

        </div>

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

          Nuevo Doctor

        </button>

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
                  doctorEditando !== null

                    ? "Editar Doctor"

                    : "Nuevo Doctor"
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

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-4
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

                  Nombre

                </label>

                <input
                  type="text"
                  value={
                    form.nombre
                  }
                  onChange={
                    (e) =>
                      setForm({
                        ...form,
                        nombre:
                          e.target.value,
                      })
                  }
                  placeholder="
                    Dr. Nombre
                  "
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

                  Especialidad

                </label>

                <input
                  type="text"
                  value={
                    form.especialidad
                  }
                  onChange={
                    (e) =>
                      setForm({
                        ...form,
                        especialidad:
                          e.target.value,
                      })
                  }
                  placeholder="
                    General
                  "
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

                  Porcentaje %

                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    form.porcentaje
                  }
                  onChange={
                    (e) =>
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
                  value={
                    form.telefono
                  }
                  onChange={
                    (e) =>
                      setForm({
                        ...form,
                        telefono:
                          e.target.value,
                      })
                  }
                  placeholder="
                    526531234567
                  "
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
                  checked={
                    form.activo
                  }
                  onChange={
                    (e) =>
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

                Doctor activo

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

                  Cancelar

                </button>

                <button
                  type="button"
                  disabled={
                    guardando
                  }
                  onClick={
                    guardarDoctor
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

                    guardando

                      ? "Guardando..."

                      : "Guardar"

                  }

                </button>

              </div>

            </div>

          </div>

        )

      }

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
                Especialidad
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
                Estado
              </th>

              <th
                className="
                  text-right
                  px-5
                  py-3
                  font-semibold
                "
              >
                Acción
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

                    Cargando doctores...

                  </td>

                </tr>

              ) : doctores.length === 0 ? (

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

                    No hay doctores registrados.

                  </td>

                </tr>

              ) : (

              doctores.map(
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
            "Sin teléfono"
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
                ? "Activo"
                : "Inactivo"
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

              Precios

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
              colSpan={6}
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
                      Tarifario especialista
                    </p>

                    <h3
                      className="
                        text-lg
                        font-bold
                        mint-text-primary
                      "
                    >
                      Precios de{" "}
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

                    Agregar tratamiento

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
                              ? "Editar precio"
                              : "Agregar tratamiento"
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
                            Tratamiento
                          </label>

                          <select
                            value={
                              formPrecio.tratamiento_id
                            }
                            onChange={
                              (e) =>
                                setFormPrecio({
                                  ...formPrecio,
                                  tratamiento_id:
                                    e.target.value,
                                })
                            }
                            disabled={
                              precioEditandoId !== null
                            }
                            className="
                              mint-input
                              w-full
                              px-3
                              py-2.5
                              disabled:opacity-60
                              disabled:cursor-not-allowed
                            "
                          >

                            <option
                              value=""
                            >
                              Selecciona tratamiento
                            </option>

                            {
                              catalogoTratamientos.map(
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
                            Costo
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
                            Moneda
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
                          Cancelar
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
                              ? "Guardando..."
                              : "Guardar precio"
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
                                  Tratamiento
                                </th>

                                <th
                                  className="
                                    text-right
                                    px-4
                                    py-3
                                    font-semibold
                                  "
                                >
                                  Costo
                                </th>

                                <th
                                  className="
                                    text-center
                                    px-4
                                    py-3
                                    font-semibold
                                  "
                                >
                                  Moneda
                                </th>

                                <th
                                  className="
                                    text-center
                                    px-4
                                    py-3
                                    font-semibold
                                  "
                                >
                                  Estado
                                </th>

                                <th
                                  className="
                                    text-right
                                    pl-4
                                    py-3
                                    font-semibold
                                  "
                                >
                                  Acción
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
  catalogoTratamientos.find(
    (tratamiento: any) =>
      Number(tratamiento.id) ===
      Number(precio.tratamiento_id)
  )?.nombre ||
  "Tratamiento"
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
                                              ? "Activo"
                                              : "Inactivo"
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

  );

}