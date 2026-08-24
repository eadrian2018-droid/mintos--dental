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

  async function guardar() {

    await guardarTratamientoCatalogo({

      nombre,

      categoria,

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
        Number(
          costoEspecialistaMXN || 0
        ),

      costo_especialista_usd:
        Number(
          costoEspecialistaUSD || 0
        ),

      doctor_id:
        tipo === "especialista"
          && doctorId

          ? Number(
              doctorId
            )

          : null,

      activo: true,

    });

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

        <h3
          className="
            text-xl
            font-bold
            mb-6
          "
        >

          Nuevo Tratamiento

        </h3>

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
  setTipo(
    e.target.value as TipoTratamiento
  );
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
            tipo === "especialista"

            &&

            <>

              <input
                type="number"
                placeholder="Costo especialista MXN"
                value={costoEspecialistaMXN}
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
                value={costoEspecialistaUSD}
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
                        key={doctor.id}
                        value={doctor.id}
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
            onClick={guardar}
            className="
              bg-teal-600
              text-white
              px-4
              py-3
              rounded-xl
              md:col-span-2
            "
          >

            Guardar tratamiento

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
                      key={tratamiento.id}
                      className="
                        border-b
                        border-slate-100
                      "
                    >

                      <td className="p-3">

                        {tratamiento.nombre}

                      </td>

                      <td className="p-3">

                        {tratamiento.categoria}

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
                          tratamiento
                            .precio_mxn
                            .toLocaleString()
                        }

                      </td>

                      <td className="p-3">

                        $

                        {
                          tratamiento
                            .precio_usd
                            .toLocaleString()
                        }

                      </td>

                      <td className="p-3">

                        $

                        {
                          tratamiento
                            .costo_especialista_mxn
                            .toLocaleString()
                        }

                      </td>

                      <td className="p-3">

                        $

                        {
                          tratamiento
                            .costo_especialista_usd
                            .toLocaleString()
                        }

                      </td>

                      <td className="p-3">

                        {
                          tratamiento.activo
                            ? "Activo"
                            : "Inactivo"
                        }

                      </td>

                      <td className="p-3">

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

