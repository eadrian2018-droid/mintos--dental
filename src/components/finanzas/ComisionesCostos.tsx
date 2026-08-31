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

  guardarTratamientoCatalogo,

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

  function abrirNuevo() {

    limpiarFormulario();

    setMostrarFormulario(
      true
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

    setGuardando(
      true
    );

    try {

      if (
        tratamientoEditando !==
        null
      ) {

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

      } else {

        await guardarTratamientoCatalogo({

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

          activo: true,

        });

      }

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
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          "
        >

          <div>

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

              Configura el precio
              cobrado al paciente y
              el costo real del
              especialista.

            </p>

          </div>

          <button
            type="button"
            onClick={
              abrirNuevo
            }
            className="
              mint-btn
              mint-btn-primary
              px-4
              py-3
              whitespace-nowrap
            "
          >

            + Agregar especialista

          </button>

        </div>

        {
          mostrarFormulario && (

            <div
              className="
                bg-[var(--mint-bg-soft)]
                border
                border-[var(--mint-border)]
                rounded-2xl
                p-5
                mb-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  mb-5
                "
              >

                <h4
                  className="
                    text-lg
                    font-bold
                    mint-text-primary
                  "
                >

                  {
                    tratamientoEditando !==
                    null

                      ? "Editar tratamiento especialista"

                      : "Nuevo tratamiento especialista"
                  }

                </h4>

              </div>

              <div
                className="
                  grid
                  md:grid-cols-2
                  xl:grid-cols-3
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      mint-label
                    "
                  >
                    Tratamiento
                  </label>

                  <input
                    type="text"
                    value={
                      nombre
                    }
                    onChange={(e) =>
                      setNombre(
                        e.target.value
                      )
                    }
                    className="
                      mint-input
                      w-full
                    "
                    placeholder="Ej. Endodoncia"
                  />

                </div>

                <div>

                  <label
                    className="
                      mint-label
                    "
                  >
                    Categoría
                  </label>

                  <input
                    type="text"
                    value={
                      categoria
                    }
                    onChange={(e) =>
                      setCategoria(
                        e.target.value
                      )
                    }
                    className="
                      mint-input
                      w-full
                    "
                    placeholder="Ej. Endodoncia"
                  />

                </div>

                <div>

                  <label
                    className="
                      mint-label
                    "
                  >
                    Especialista
                  </label>

                  <select
                    value={
                      doctorId
                    }
                    onChange={(e) =>
                      setDoctorId(
                        e.target.value
                      )
                    }
                    className="
                      mint-input
                      w-full
                    "
                  >

                    <option value="">
                      Seleccionar especialista
                    </option>

                    {
                      doctores.map(
                        (doctor) => (

                          <option
                            key={
                              doctor.id
                            }
                            value={
                              doctor.id
                            }
                          >

                            {
                              doctor.nombre
                            }

                            {
                              doctor.especialidad
                                ? ` - ${doctor.especialidad}`
                                : ""
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
                    "
                  >
                    Precio paciente MXN
                  </label>

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
                      mint-input
                      w-full
                    "
                  />

                </div>

                <div>

                  <label
                    className="
                      mint-label
                    "
                  >
                    Precio paciente USD
                  </label>

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
                      mint-input
                      w-full
                    "
                  />

                </div>

                <div>

                  <label
                    className="
                      mint-label
                    "
                  >
                    Costo especialista MXN
                  </label>

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
                      mint-input
                      w-full
                    "
                  />

                </div>

                <div>

                  <label
                    className="
                      mint-label
                    "
                  >
                    Costo especialista USD
                  </label>

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
                      mint-input
                      w-full
                    "
                  />

                </div>

              </div>

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  mt-5
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
                    mint-btn
                    mint-btn-secondary
                    px-4
                    py-2
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
                    mint-btn
                    mint-btn-primary
                    px-4
                    py-2
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {
                    guardando
                      ? "Guardando..."
                      : "Guardar"
                  }

                </button>

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