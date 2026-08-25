import { useState } from "react";

import type {
  ConfiguracionPago,
} from "../../types/ConfiguracionPago";

type ConfiguracionPagosProps = {

  configuracionPagos:
    ConfiguracionPago[];

  actualizarConfiguracionPago:
    (
      id: number,
      cambios:
        Partial<
          Omit<
            ConfiguracionPago,
            "id"
          >
        >
    ) => Promise<void>;

};

export default function ConfiguracionPagos({

  configuracionPagos,

  actualizarConfiguracionPago,

}: ConfiguracionPagosProps) {

  const [
    guardandoId,
    setGuardandoId,
  ] = useState<number | null>(
    null
  );

  async function actualizar(
    pago: ConfiguracionPago,
    cambios:
      Partial<
        Omit<
          ConfiguracionPago,
          "id"
        >
      >
  ) {

    try {

      setGuardandoId(
        pago.id
      );

      await actualizarConfiguracionPago(
        pago.id,
        cambios
      );

    } finally {

      setGuardandoId(
        null
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

          Configuración de Pagos

        </h2>

        <p
          className="
            text-slate-500
            mt-2
          "
        >

          Configura los métodos de
          pago y las comisiones que
          aplican a cada uno.

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

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Método
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Activo
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Aplica comisión
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Comisión %
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  IVA comisión %
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Estado
                </th>

              </tr>

            </thead>

            <tbody>

              {
                configuracionPagos.map(
                  (pago) => (

                    <tr
                      key={
                        pago.id
                      }
                      className="
                        border-b
                        border-slate-100
                      "
                    >

                      <td
                        className="
                          p-3
                          font-semibold
                        "
                      >

                        {
                          pago.metodo
                        }

                      </td>

                      <td
                        className="
                          p-3
                        "
                      >

                        <input
                          type="checkbox"
                          checked={
                            pago.activo
                          }
                          disabled={
                            guardandoId ===
                            pago.id
                          }
                          onChange={(e) =>
                            actualizar(
                              pago,
                              {
                                activo:
                                  e.target
                                    .checked,
                              }
                            )
                          }
                          className="
                            h-5
                            w-5
                            accent-teal-600
                          "
                        />

                      </td>

                      <td
                        className="
                          p-3
                        "
                      >

                        <input
                          type="checkbox"
                          checked={
                            pago
                              .aplica_comision
                          }
                          disabled={
                            guardandoId ===
                            pago.id
                          }
                          onChange={(e) =>
                            actualizar(
                              pago,
                              {
                                aplica_comision:
                                  e.target
                                    .checked,
                              }
                            )
                          }
                          className="
                            h-5
                            w-5
                            accent-teal-600
                          "
                        />

                      </td>

                      <td
                        className="
                          p-3
                        "
                      >

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={
                            pago
                              .comision_porcentaje
                          }
                          disabled={
                            !pago
                              .aplica_comision
                            ||
                            guardandoId ===
                              pago.id
                          }
                          onBlur={(e) =>
                            actualizar(
                              pago,
                              {
                                comision_porcentaje:
                                  Number(
                                    e.target
                                      .value
                                  ),
                              }
                            )
                          }
                          className="
                            w-28
                            border
                            rounded-xl
                            px-3
                            py-2
                            disabled:bg-slate-100
                            disabled:text-slate-400
                          "
                        />

                      </td>

                      <td
                        className="
                          p-3
                        "
                      >

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={
                            pago
                              .iva_comision_porcentaje
                          }
                          disabled={
                            !pago
                              .aplica_comision
                            ||
                            guardandoId ===
                              pago.id
                          }
                          onBlur={(e) =>
                            actualizar(
                              pago,
                              {
                                iva_comision_porcentaje:
                                  Number(
                                    e.target
                                      .value
                                  ),
                              }
                            )
                          }
                          className="
                            w-28
                            border
                            rounded-xl
                            px-3
                            py-2
                            disabled:bg-slate-100
                            disabled:text-slate-400
                          "
                        />

                      </td>

                      <td
                        className="
                          p-3
                        "
                      >

                        {
                          guardandoId ===
                          pago.id

                            ? (
                              <span
                                className="
                                  text-slate-500
                                "
                              >
                                Guardando...
                              </span>
                            )

                            : pago.activo

                              ? (
                                <span
                                  className="
                                    bg-green-100
                                    text-green-700
                                    px-3
                                    py-1
                                    rounded-full
                                    font-semibold
                                  "
                                >
                                  Activo
                                </span>
                              )

                              : (
                                <span
                                  className="
                                    bg-slate-100
                                    text-slate-500
                                    px-3
                                    py-1
                                    rounded-full
                                    font-semibold
                                  "
                                >
                                  Inactivo
                                </span>
                              )
                        }

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
          bg-slate-50
          border
          border-slate-200
          rounded-2xl
          p-6
        "
      >

        <h3
          className="
            text-lg
            font-bold
            mb-2
          "
        >

          Cómo funciona

        </h3>

        <p
          className="
            text-slate-600
            leading-7
          "
        >

          Los métodos sin comisión
          no generan ningún cargo
          adicional. Cuando un método
          tiene comisión activa,
          Mint OS podrá utilizar el
          porcentaje configurado y
          su IVA para calcular
          automáticamente el costo
          bancario del cobro.

        </p>

      </div>

    </div>

  );

}