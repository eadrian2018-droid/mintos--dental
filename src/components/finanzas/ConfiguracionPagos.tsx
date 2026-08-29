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

          Configuración de Pagos

        </h2>

        <p
          className="
            mint-text-secondary
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
          mint-card
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
                            accent-[var(--mint-primary)]
                            cursor-pointer
                            disabled:cursor-not-allowed
                            disabled:opacity-50
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
                            accent-[var(--mint-primary)]
                            cursor-pointer
                            disabled:cursor-not-allowed
                            disabled:opacity-50
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
                            mint-input
                            w-28
                            px-3
                            py-2
                            disabled:opacity-50
                            disabled:cursor-not-allowed
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
                            mint-input
                            w-28
                            px-3
                            py-2
                            disabled:opacity-50
                            disabled:cursor-not-allowed
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
                                  mint-badge
                                  mint-badge-info
                                "
                              >
                                Guardando...
                              </span>
                            )

                            : pago.activo

                              ? (
                                <span
                                  className="
                                    mint-badge
                                    mint-badge-success
                                  "
                                >
                                  Activo
                                </span>
                              )

                              : (
                                <span
                                  className="
                                    mint-badge
                                    mint-badge-muted
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
          bg-[var(--mint-bg-soft)]
          border
          border-[var(--mint-border)]
          rounded-2xl
          p-6
        "
      >

        <h3
          className="
            text-lg
            font-bold
            mint-text-primary
            mb-2
          "
        >

          Cómo funciona

        </h3>

        <p
          className="
            mint-text-secondary
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