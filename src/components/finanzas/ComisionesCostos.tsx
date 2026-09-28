import {
  useState,
} from "react";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  TratamientoCatalogo,
} from "../../types/TratamientoCatalogo";

type ComisionesCostosProps = {

  doctores: Doctor[];

  catalogoTratamientos:
    TratamientoCatalogo[];

  guardarTratamientoCatalogo:
    (
      tratamiento:
        Omit<
          TratamientoCatalogo,
          "id"
        >
    ) => Promise<void>;

  actualizarTratamientoCatalogo:
    (
      id: number,
      cambios:
        Partial<
          Omit<
            TratamientoCatalogo,
            "id"
          >
        >
    ) => Promise<void>;

};

export default function ComisionesCostos({

  doctores,

  catalogoTratamientos,

  actualizarTratamientoCatalogo,

}: ComisionesCostosProps) {

  const tratamientosEspecialistas =
    catalogoTratamientos.filter(
      (tratamiento) =>
        tratamiento.tipo ===
        "especialista"
    );

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    tratamientoEditando,
    setTratamientoEditando,
  ] = useState<number | null>(
    null
  );

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    categoria,
    setCategoria,
  ] = useState("");

  const [
    doctorId,
    setDoctorId,
  ] = useState("");

  const [
    precioMXN,
    setPrecioMXN,
  ] = useState("");

  const [
    precioUSD,
    setPrecioUSD,
  ] = useState("");

  const [
    costoMXN,
    setCostoMXN,
  ] = useState("");

  const [
    costoUSD,
    setCostoUSD,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  function limpiarFormulario() {

    setNombre("");

    setCategoria("");

    setDoctorId("");

    setPrecioMXN("");

    setPrecioUSD("");

    setCostoMXN("");

    setCostoUSD("");

    setTratamientoEditando(
      null
    );

  }

  function cancelarFormulario() {

    limpiarFormulario();

    setMostrarFormulario(
      false
    );

  }

  function iniciarEdicion(
    tratamiento:
      TratamientoCatalogo
  ) {

    setTratamientoEditando(
      tratamiento.id
    );

    setNombre(
      tratamiento.nombre || ""
    );

    setCategoria(
      tratamiento.categoria || ""
    );

    setDoctorId(
      tratamiento.doctor_id
        ? String(
            tratamiento.doctor_id
          )
        : ""
    );

    setPrecioMXN(
      String(
        tratamiento.precio_mxn
        || 0
      )
    );

    setPrecioUSD(
      String(
        tratamiento.precio_usd
        || 0
      )
    );

    setCostoMXN(
      String(
        tratamiento
          .costo_especialista_mxn
        || 0
      )
    );

    setCostoUSD(
      String(
        tratamiento
          .costo_especialista_usd
        || 0
      )
    );

    setMostrarFormulario(
      true
    );

  }

  async function guardar() {

    if (!nombre.trim()) {

      alert(
        "Ingresa el nombre del tratamiento."
      );

      return;

    }

    if (!categoria.trim()) {

      alert(
        "Ingresa la categoría."
      );

      return;

    }

    if (!doctorId) {

      alert(
        "Selecciona un especialista."
      );

      return;

    }

    const valorPrecioMXN =
      Number(
        precioMXN || 0
      );

    const valorPrecioUSD =
      Number(
        precioUSD || 0
      );

    const valorCostoMXN =
      Number(
        costoMXN || 0
      );

    const valorCostoUSD =
      Number(
        costoUSD || 0
      );

    if (
      valorPrecioMXN < 0 ||
      valorPrecioUSD < 0 ||
      valorCostoMXN < 0 ||
      valorCostoUSD < 0
    ) {

      alert(
        "Los precios y costos no pueden ser negativos."
      );

      return;

    }

    if (
      tratamientoEditando ===
      null
    ) {

      return;

    }

    setGuardando(
      true
    );

    try {

      await actualizarTratamientoCatalogo(

        tratamientoEditando,

        {

          nombre:
            nombre.trim(),

          categoria:
            categoria.trim(),

          tipo:
            "especialista",

          precio_mxn:
            valorPrecioMXN,

          precio_usd:
            valorPrecioUSD,

          costo_especialista_mxn:
            valorCostoMXN,

          costo_especialista_usd:
            valorCostoUSD,

          doctor_id:
            Number(
              doctorId
            ),

        }

      );

      cancelarFormulario();

    } catch (error) {

      console.error(
        "Error guardando tratamiento de especialista:",
        error
      );

      alert(
        "No se pudo guardar el tratamiento de especialista."
      );

    } finally {

      setGuardando(
        false
      );

    }

  }

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          mint-card
          p-6
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            mint-text-primary
          "
        >

          Comisiones y Costos

        </h2>

        <p
          className="
            mint-text-secondary
            mt-2
          "
        >

          Resumen de comisiones
          de doctores y costos
          configurados para
          especialistas.

        </p>

      </div>

      <div
        className="
          grid
          md:grid-cols-2
          gap-6
        "
      >

        <div
          className="
            mint-card-primary
            p-6
          "
        >

          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >

            Doctores configurados

          </p>

          <h3
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-primary)]
            "
          >

            {doctores.length}

          </h3>

        </div>

        <div
          className="
            mint-card-accent
            p-6
          "
        >

          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >

            Tratamientos de especialista

          </p>

          <h3
            className="
              text-3xl
              font-bold
              mt-2
              mint-text-accent
            "
          >

            {
              tratamientosEspecialistas
                .length
            }

          </h3>

        </div>

      </div>

      <div
        className="
          mint-card
          p-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
            mint-text-primary
            mb-2
          "
        >

          Comisión por Doctor

        </h3>

        <p
          className="
            mint-text-secondary
            mb-6
          "
        >

          Este porcentaje se utiliza
          para calcular la comisión
          correspondiente al doctor.

        </p>

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              mint-table
              w-full
              text-sm
            "
          >

            <thead
              className="
                mint-table-head
              "
            >

              <tr>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Doctor
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Especialidad
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Comisión
                </th>

              </tr>

            </thead>

            <tbody>

              {
                doctores.map(
                  (doctor) => (

                    <tr
                      key={
                        doctor.id
                      }
                      className="
                        mint-table-row
                      "
                    >

                      <td
                        className="
                          p-3
                          font-semibold
                          mint-text-primary
                        "
                      >

                        {doctor.nombre}

                      </td>

                      <td
                        className="
                          p-3
                          mint-text-secondary
                        "
                      >

                        {
                          doctor.especialidad
                        }

                      </td>

                      <td
                        className="
                          p-3
                        "
                      >

                        <span
                          className="
                            mint-badge
                            mint-badge-accent
                          "
                        >

                          {
                            doctor.porcentaje
                          }%

                        </span>

                      </td>

                    </tr>

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
          p-6
        "
      >

        <div
          className="
            mb-6
          "
        >

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
              mb-2
            "
          >

            Costos de Especialistas

          </h3>

          <p
            className="
              mint-text-secondary
            "
          >

            Consulta y ajusta los
            precios cobrados al
            paciente y los costos
            configurados para cada
            especialista.

          </p>

        </div>

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              mint-table
              w-full
              text-sm
            "
          >

            <thead
              className="
                mint-table-head
              "
            >

              <tr>

                <th className="p-3 text-left">
                  Tratamiento
                </th>

                <th className="p-3 text-left">
                  Categoría
                </th>

                <th className="p-3 text-left">
                  Especialista
                </th>

                <th className="p-3 text-left">
                  Precio MXN
                </th>

                <th className="p-3 text-left">
                  Precio USD
                </th>

                <th className="p-3 text-left">
                  Costo MXN
                </th>

                <th className="p-3 text-left">
                  Costo USD
                </th>

                <th className="p-3 text-right">
                  Acción
                </th>

              </tr>

            </thead>

            <tbody>

              {
                tratamientosEspecialistas
                  .map(
                    (
                      tratamiento
                    ) => {

                      const doctor =
                        doctores.find(
                          (item) =>
                            item.id ===
                            tratamiento
                              .doctor_id
                        );

                      return (

                        <tr
                          key={
                            tratamiento.id
                          }
                          className="
                            mint-table-row
                          "
                        >

                          <td
                            className="
                              p-3
                              font-semibold
                              mint-text-primary
                            "
                          >

                            {
                              tratamiento.nombre
                            }

                          </td>

                          <td
                            className="
                              p-3
                            "
                          >

                            <span
                              className="
                                mint-badge
                                mint-badge-muted
                              "
                            >

                              {
                                tratamiento.categoria
                              }

                            </span>

                          </td>

                          <td
                            className="
                              p-3
                              mint-text-secondary
                            "
                          >

                            {
                              doctor?.nombre ||
                              "Sin asignar"
                            }

                          </td>

                          <td
                            className="
                              p-3
                              font-semibold
                              mint-text-primary
                            "
                          >

                            $
                            {
                              Number(
                                tratamiento
                                  .precio_mxn
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>

                          <td
                            className="
                              p-3
                              font-semibold
                              mint-text-primary
                            "
                          >

                            $
                            {
                              Number(
                                tratamiento
                                  .precio_usd
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>

                          <td
                            className="
                              p-3
                              font-semibold
                              text-[var(--mint-danger)]
                            "
                          >

                            $
                            {
                              Number(
                                tratamiento
                                  .costo_especialista_mxn
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>

                          <td
                            className="
                              p-3
                              font-semibold
                              text-[var(--mint-danger)]
                            "
                          >

                            $
                            {
                              Number(
                                tratamiento
                                  .costo_especialista_usd
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>

                          <td
                            className="
                              p-3
                              text-right
                            "
                          >

                            <button
                              type="button"
                              onClick={() =>
                                iniciarEdicion(
                                  tratamiento
                                )
                              }
                              className="
                                mint-btn
                                mint-btn-action
                                px-3
                                py-2
                              "
                            >

                              Editar

                            </button>

                          </td>

                        </tr>

                      );

                    }
                  )
              }

              {
                tratamientosEspecialistas
                  .length === 0

                &&

                <tr>

                  <td
                    colSpan={8}
                    className="
                      p-8
                      text-center
                      mint-text-muted
                    "
                  >

                    No hay tratamientos
                    de especialista
                    configurados.

                  </td>

                </tr>
              }

            </tbody>

          </table>

        </div>

      </div>

      {
        mostrarFormulario &&
        tratamientoEditando !== null && (

          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-slate-950/55
              backdrop-blur-[2px]
              p-4
            "
            onMouseDown={(e) => {

              if (
                e.target ===
                e.currentTarget
              ) {

                cancelarFormulario();

              }

            }}
          >

            <div
              className="
                w-full
                max-w-2xl
                max-h-[90vh]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-2xl
                dark:border-slate-700
                dark:bg-slate-900
              "
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  border-b
                  border-slate-200
                  px-6
                  py-5
                  dark:border-slate-700
                "
              >

                <div>

                  <p
                    className="
                      mb-1
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-teal-700
                      dark:text-teal-400
                    "
                  >
                    Tratamiento configurado
                  </p>

                  <h4
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                      dark:text-slate-100
                    "
                  >
                    Editar costos de especialista
                  </h4>

                </div>

                <button
                  type="button"
                  onClick={
                    cancelarFormulario
                  }
                  disabled={
                    guardando
                  }
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-lg
                    font-medium
                    text-slate-500
                    transition
                    hover:bg-slate-100
                    hover:text-slate-900
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-300
                    dark:hover:bg-slate-700
                    dark:hover:text-white
                  "
                  aria-label="Cerrar"
                >
                  ×
                </button>

              </div>

              <div
                className="
                  max-h-[calc(90vh-145px)]
                  overflow-y-auto
                  px-6
                  py-5
                "
              >

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-2
                  "
                >

                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Tratamiento
                    </label>

                    <div
                      className="
                        flex
                        min-h-11
                        items-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-3.5
                        text-sm
                        font-semibold
                        text-slate-900
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-100
                      "
                    >
                      {nombre}
                    </div>

                  </div>

                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Categoría
                    </label>

                    <div
                      className="
                        flex
                        min-h-11
                        items-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-3.5
                        text-sm
                        font-semibold
                        text-slate-900
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-100
                      "
                    >
                      {categoria}
                    </div>

                  </div>

                </div>

                <div className="mt-6">

                  <p
                    className="
                      mb-3
                      text-sm
                      font-bold
                      text-slate-900
                      dark:text-slate-100
                    "
                  >
                    Clínica
                  </p>

                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      md:grid-cols-2
                    "
                  >

                    <div>

                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Precio paciente MXN
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-sm
                            font-semibold
                            text-slate-400
                          "
                        >
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            precioMXN
                          }
                          onChange={(e) =>
                            setPrecioMXN(
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            pl-8
                            pr-3
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            focus:border-teal-500
                            focus:ring-2
                            focus:ring-teal-500/10
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-100
                          "
                        />

                      </div>

                    </div>

                    <div>

                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Precio paciente USD
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-sm
                            font-semibold
                            text-slate-400
                          "
                        >
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            precioUSD
                          }
                          onChange={(e) =>
                            setPrecioUSD(
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            pl-8
                            pr-3
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            focus:border-teal-500
                            focus:ring-2
                            focus:ring-teal-500/10
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-100
                          "
                        />

                      </div>

                    </div>

                  </div>

                </div>

                <div
                  className="
                    my-6
                    border-t
                    border-slate-200
                    dark:border-slate-700
                  "
                />

                <div>

                  <div className="mb-3">

                    <p
                      className="
                        text-sm
                        font-bold
                        text-slate-900
                        dark:text-slate-100
                      "
                    >
                      Especialista
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-medium
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {
                        doctores.find(
                          (doctor) =>
                            doctor.id ===
                            Number(doctorId)
                        )?.nombre ||
                        "Sin especialista"
                      }
                    </p>

                  </div>

                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      md:grid-cols-2
                    "
                  >

                    <div>

                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Costo especialista MXN
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-sm
                            font-semibold
                            text-slate-400
                          "
                        >
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            costoMXN
                          }
                          onChange={(e) =>
                            setCostoMXN(
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            pl-8
                            pr-3
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            focus:border-teal-500
                            focus:ring-2
                            focus:ring-teal-500/10
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-100
                          "
                        />

                      </div>

                    </div>

                    <div>

                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Costo especialista USD
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-sm
                            font-semibold
                            text-slate-400
                          "
                        >
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            costoUSD
                          }
                          onChange={(e) =>
                            setCostoUSD(
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            pl-8
                            pr-3
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            focus:border-teal-500
                            focus:ring-2
                            focus:ring-teal-500/10
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-100
                          "
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  border-t
                  border-slate-200
                  bg-slate-50
                  px-6
                  py-4
                  dark:border-slate-700
                  dark:bg-slate-800/70
                "
              >

                <button
                  type="button"
                  onClick={
                    cancelarFormulario
                  }
                  disabled={
                    guardando
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-slate-600
                    dark:bg-slate-800
                    dark:text-slate-200
                    dark:hover:bg-slate-700
                  "
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={
                    guardar
                  }
                  disabled={
                    guardando
                  }
                  className="
                    rounded-xl
                    bg-teal-600
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-teal-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {
                    guardando
                      ? "Guardando..."
                      : "Guardar cambios"
                  }
                </button>

              </div>

            </div>

          </div>

        )
      }

      <div
        className="
          bg-[var(--mint-bg-soft)]
          border
          border-[var(--mint-border)]
          rounded-2xl
          p-6
        "
      >

        <h3
          className="
            font-bold
            text-lg
            mint-text-primary
            mb-3
          "
        >

          Regla de cálculo

        </h3>

        <p
          className="
            mint-text-secondary
            leading-7
          "
        >

          La base de la clínica se
          calcula tomando el monto
          pagado y descontando los
          costos asociados al
          tratamiento, como
          laboratorio, especialista
          y comisión bancaria.

          {" "}

          Después se calcula la
          comisión correspondiente
          al doctor sobre esa base.

        </p>

      </div>

    </div>

  );

}