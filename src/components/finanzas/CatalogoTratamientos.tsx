import { useState } from "react";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  TratamientoCatalogo,
  TipoTratamiento,
} from "../../types/TratamientoCatalogo";

type CatalogoTratamientosProps = {

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

  cambiarEstadoTratamientoCatalogo:
    (
      id: number,
      activo: boolean
    ) => Promise<void>;

};

export default function CatalogoTratamientos({

  doctores,

  catalogoTratamientos,

  guardarTratamientoCatalogo,

  actualizarTratamientoCatalogo,

  cambiarEstadoTratamientoCatalogo,

}: CatalogoTratamientosProps) {

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    categoria,
    setCategoria,
  ] = useState("");

  const [
    tipo,
    setTipo,
  ] = useState<TipoTratamiento>(
    "clinica"
  );

  const [
    precioMXN,
    setPrecioMXN,
  ] = useState("");

  const [
    precioUSD,
    setPrecioUSD,
  ] = useState("");

  const [
    costoEspecialistaMXN,
    setCostoEspecialistaMXN,
  ] = useState("");

  const [
    costoEspecialistaUSD,
    setCostoEspecialistaUSD,
  ] = useState("");

  const [
    doctorId,
    setDoctorId,
  ] = useState("");

  const [
    tratamientoEditandoId,
    setTratamientoEditandoId,
  ] = useState<number | null>(
    null
  );

  function limpiarFormulario() {

    setNombre("");

    setCategoria("");

    setTipo(
      "clinica"
    );

    setPrecioMXN("");

    setPrecioUSD("");

    setCostoEspecialistaMXN("");

    setCostoEspecialistaUSD("");

    setDoctorId("");

    setTratamientoEditandoId(
      null
    );

  }

  async function guardar() {

    if (!nombre.trim()) {

      window.alert(
        "Ingresa el nombre del tratamiento."
      );

      return;

    }

    const datosTratamiento = {

      nombre:
        nombre.trim(),

      categoria:
        categoria.trim(),

      tipo,

      precio_mxn:
        Number(
          precioMXN || 0
        ),

      precio_usd:
        Number(
          precioUSD || 0
        ),

      costo_especialista_mxn:
        tipo === "especialista"
          ? Number(
              costoEspecialistaMXN || 0
            )
          : 0,

      costo_especialista_usd:
        tipo === "especialista"
          ? Number(
              costoEspecialistaUSD || 0
            )
          : 0,

      doctor_id:
        tipo === "especialista"
          && doctorId

          ? Number(
              doctorId
            )

          : null,

      activo: true,

    };

    if (
      tratamientoEditandoId !==
      null
    ) {

      const tratamientoActual =
        catalogoTratamientos.find(
          (tratamiento) =>
            tratamiento.id ===
            tratamientoEditandoId
        );

      await actualizarTratamientoCatalogo(

        tratamientoEditandoId,

        {
          ...datosTratamiento,

          activo:
            tratamientoActual
              ?.activo ?? true,
        }

      );

    } else {

      await guardarTratamientoCatalogo(
        datosTratamiento
      );

    }

    limpiarFormulario();

  }

  function editarTratamiento(
    tratamiento:
      TratamientoCatalogo
  ) {

    setTratamientoEditandoId(
      tratamiento.id
    );

    setNombre(
      tratamiento.nombre
    );

    setCategoria(
      tratamiento.categoria
    );

    setTipo(
      tratamiento.tipo
    );

    setPrecioMXN(
      String(
        tratamiento.precio_mxn ?? 0
      )
    );

    setPrecioUSD(
      String(
        tratamiento.precio_usd ?? 0
      )
    );

    setCostoEspecialistaMXN(
      String(
        tratamiento
          .costo_especialista_mxn ??
        0
      )
    );

    setCostoEspecialistaUSD(
      String(
        tratamiento
          .costo_especialista_usd ??
        0
      )
    );

    setDoctorId(
      tratamiento.doctor_id
        ? String(
            tratamiento.doctor_id
          )
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
        "
      >

        <h2
          className="
            text-2xl
            font-bold
          "
        >

          Catálogo de Tratamientos

        </h2>

        <p
          className="
            text-slate-500
            mt-1
          "
        >

          Configura precios de clínica
          y costos de especialistas

        </p>

      </div>

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            gap-4
            mb-6
          "
        >

          <h3
            className="
              text-xl
              font-bold
            "
          >

            {
              tratamientoEditandoId !==
              null

                ? "Editar Tratamiento"

                : "Nuevo Tratamiento"
            }

          </h3>

          {
            tratamientoEditandoId !==
            null

            &&

            <button
              type="button"
              onClick={
                limpiarFormulario
              }
              className="
                bg-slate-200
                hover:bg-slate-300
                text-slate-700
                px-4
                py-2
                rounded-xl
              "
            >

              Cancelar edición

            </button>
          }

        </div>

        <div
          className="
            grid
            md:grid-cols-2
            gap-4
          "
        >

          <input
            type="text"
            placeholder="Nombre del tratamiento"
            value={nombre}
            onChange={(e) =>
              setNombre(
                e.target.value
              )
            }
            className="
              border
              rounded-xl
              p-3
            "
          />

          <input
            type="text"
            placeholder="Categoría"
            value={categoria}
            onChange={(e) =>
              setCategoria(
                e.target.value
              )
            }
            className="
              border
              rounded-xl
              p-3
            "
          />

          <select
            value={tipo}
            onChange={(e) => {

        const nuevoTipo =
  e.target.value as TipoTratamiento;

              setTipo(
                nuevoTipo
              );

              if (
                nuevoTipo ===
                "clinica"
              ) {

                setCostoEspecialistaMXN(
                  ""
                );

                setCostoEspecialistaUSD(
                  ""
                );

                setDoctorId(
                  ""
                );

              }

            }}
            className="
              border
              rounded-xl
              p-3
            "
          >

            <option value="clinica">

              Clínica

            </option>

            <option value="especialista">

              Especialista

            </option>

          </select>

          <input
            type="number"
            placeholder="Precio MXN"
            value={precioMXN}
            onChange={(e) =>
              setPrecioMXN(
                e.target.value
              )
            }
            className="
              border
              rounded-xl
              p-3
            "
          />

          <input
            type="number"
            placeholder="Precio USD"
            value={precioUSD}
            onChange={(e) =>
              setPrecioUSD(
                e.target.value
              )
            }
            className="
              border
              rounded-xl
              p-3
            "
          />

          {
            tipo ===
            "especialista"

            &&

            <>

              <input
                type="number"
                placeholder="Costo especialista MXN"
                value={
                  costoEspecialistaMXN
                }
                onChange={(e) =>
                  setCostoEspecialistaMXN(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                "
              />

              <input
                type="number"
                placeholder="Costo especialista USD"
                value={
                  costoEspecialistaUSD
                }
                onChange={(e) =>
                  setCostoEspecialistaUSD(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                "
              />

              <select
                value={doctorId}
                onChange={(e) =>
                  setDoctorId(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                  md:col-span-2
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

                        {doctor.nombre}

                      </option>

                    )
                  )
                }

              </select>

            </>
          }

          <button
            onClick={
              guardar
            }
            className="
              bg-teal-600
              hover:bg-teal-700
              text-white
              px-4
              py-3
              rounded-xl
              md:col-span-2
            "
          >

            {
              tratamientoEditandoId !==
              null

                ? "Guardar cambios"

                : "Guardar tratamiento"
            }

          </button>

        </div>

      </div>

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
            mb-6
          "
        >

          Tratamientos Configurados

        </h3>

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

            <thead>

              <tr
                className="
                  border-b
                  border-slate-200
                "
              >

                <th className="p-3 text-left">

                  Tratamiento

                </th>

                <th className="p-3 text-left">

                  Categoría

                </th>

                <th className="p-3 text-left">

                  Tipo

                </th>

                <th className="p-3 text-left">

                  Precio MXN

                </th>

                <th className="p-3 text-left">

                  Precio USD

                </th>

                <th className="p-3 text-left">

                  Costo Especialista MXN

                </th>

                <th className="p-3 text-left">

                  Costo Especialista USD

                </th>

                <th className="p-3 text-left">

                  Estado

                </th>

                <th className="p-3 text-left">

                  Acción

                </th>

              </tr>

            </thead>

            <tbody>

              {
                catalogoTratamientos.map(
                  (tratamiento) => (

                    <tr
                      key={
                        tratamiento.id
                      }
                      className="
                        border-b
                        border-slate-100
                      "
                    >

                      <td className="p-3">

                        {
                          tratamiento.nombre
                        }

                      </td>

                      <td className="p-3">

                        {
                          tratamiento.categoria
                        }

                      </td>

                      <td className="p-3">

                        {
                          tratamiento.tipo ===
                          "clinica"

                            ? "Clínica"

                            : "Especialista"
                        }

                      </td>

                      <td className="p-3">

                        $

                        {
                          Number(
                            tratamiento
                              .precio_mxn ||
                            0
                          ).toLocaleString()
                        }

                      </td>

                      <td className="p-3">

                        $

                        {
                          Number(
                            tratamiento
                              .precio_usd ||
                            0
                          ).toLocaleString()
                        }

                      </td>

                      <td className="p-3">

                        {
                          tratamiento.tipo ===
                          "especialista"

                            ? `$${Number(
                                tratamiento
                                  .costo_especialista_mxn ||
                                0
                              ).toLocaleString()}`

                            : "-"
                        }

                      </td>

                      <td className="p-3">

                        {
                          tratamiento.tipo ===
                          "especialista"

                            ? `$${Number(
                                tratamiento
                                  .costo_especialista_usd ||
                                0
                              ).toLocaleString()}`

                            : "-"
                        }

                      </td>

                      <td className="p-3">

                        <span
                          className={`
                            inline-flex
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-semibold

                            ${
                              tratamiento.activo

                                ? "bg-green-100 text-green-700"

                                : "bg-slate-200 text-slate-600"
                            }
                          `}
                        >

                          {
                            tratamiento.activo
                              ? "Activo"
                              : "Inactivo"
                          }

                        </span>

                      </td>

                      <td className="p-3">

                        <div
                          className="
                            flex
                            gap-2
                            flex-wrap
                          "
                        >

                          <button
                            onClick={() =>
                              editarTratamiento(
                                tratamiento
                              )
                            }
                            className="
                              bg-blue-500
                              hover:bg-blue-600
                              text-white
                              px-3
                              py-1
                              rounded-lg
                            "
                          >

                            Editar

                          </button>

                          <button
                            onClick={() =>
                              cambiarEstadoTratamientoCatalogo(
                                tratamiento.id,
                                !tratamiento.activo
                              )
                            }
                            className="
                              bg-slate-700
                              hover:bg-slate-800
                              text-white
                              px-3
                              py-1
                              rounded-lg
                            "
                          >

                            {
                              tratamiento.activo
                                ? "Desactivar"
                                : "Activar"
                            }

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

    </div>

  );

}