import {
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

const formularioInicial: FormDoctor = {
  nombre: "",
  especialidad: "",
  porcentaje: "",
  telefono: "",
  activo: true,
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
    form,
    setForm,
  ] = useState<FormDoctor>(
    formularioInicial
  );

  useEffect(() => {

    cargarDoctores();

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

                    <tr
                      key={
                        doctor.id
                      }
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

  );

}