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

    <div className="space-y-5">

      <section
        className="
          overflow-hidden
          rounded-[22px]
          border
          border-[var(--mint-border)]
          bg-white
          shadow-[0_10px_30px_rgba(15,42,65,0.06)]
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
            border-b
            border-[var(--mint-border-teal)]
            bg-[linear-gradient(90deg,#eaf8f5_0%,#f8fbfa_72%,#ffffff_100%)]
            px-6
            py-5
          "
        >
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--mint-teal)]">
              Configuración financiera
            </p>

            <h2 className="mt-1 text-xl font-bold text-[var(--mint-navy)]">
              Métodos de pago
            </h2>

            <p className="mt-1 text-sm text-[var(--mint-text-secondary)]">
              Activa los métodos disponibles y configura sus comisiones bancarias.
            </p>
          </div>

          <div
            className="
              rounded-xl
              border
              border-[var(--mint-border-teal)]
              bg-white
              px-4
              py-2
              text-xs
              font-bold
              text-[var(--mint-teal)]
              shadow-sm
            "
          >
            {configuracionPagos.filter((pago) => pago.activo).length} activos
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="mint-table w-full text-sm">

            <thead className="mint-table-head">
              <tr>
                <th className="p-3 text-left">Método</th>
                <th className="p-3 text-center">Disponible</th>
                <th className="p-3 text-center">Comisión</th>
                <th className="p-3 text-left">Comisión %</th>
                <th className="p-3 text-left">IVA comisión %</th>
                <th className="p-3 text-left">Estado</th>
              </tr>
            </thead>

            <tbody>
              {configuracionPagos.map((pago) => (

                <tr
                  key={pago.id}
                  className="mint-table-row"
                >

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-[var(--mint-border-teal)]
                          bg-[var(--mint-surface-teal)]
                          text-sm
                          font-extrabold
                          text-[var(--mint-teal)]
                        "
                      >
                        {pago.metodo?.trim().charAt(0).toUpperCase() || "P"}
                      </div>

                      <span className="font-bold text-[var(--mint-navy)]">
                        {pago.metodo}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={pago.activo}
                        disabled={guardandoId === pago.id}
                        onChange={(e) =>
                          actualizar(
                            pago,
                            {
                              activo:
                                e.target.checked,
                            }
                          )
                        }
                        className="peer sr-only"
                      />

                      <span
                        className="
                          h-6
                          w-11
                          rounded-full
                          bg-slate-200
                          transition
                          peer-checked:bg-[var(--mint-teal)]
                          peer-disabled:cursor-not-allowed
                          peer-disabled:opacity-50
                          after:absolute
                          after:left-[3px]
                          after:top-[3px]
                          after:h-[18px]
                          after:w-[18px]
                          after:rounded-full
                          after:bg-white
                          after:shadow-sm
                          after:transition
                          after:content-['']
                          peer-checked:after:translate-x-5
                        "
                      />
                    </label>
                  </td>

                  <td className="p-3 text-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={pago.aplica_comision}
                        disabled={guardandoId === pago.id}
                        onChange={(e) =>
                          actualizar(
                            pago,
                            {
                              aplica_comision:
                                e.target.checked,
                            }
                          )
                        }
                        className="peer sr-only"
                      />

                      <span
                        className="
                          h-6
                          w-11
                          rounded-full
                          bg-slate-200
                          transition
                          peer-checked:bg-[var(--mint-teal)]
                          peer-disabled:cursor-not-allowed
                          peer-disabled:opacity-50
                          after:absolute
                          after:left-[3px]
                          after:top-[3px]
                          after:h-[18px]
                          after:w-[18px]
                          after:rounded-full
                          after:bg-white
                          after:shadow-sm
                          after:transition
                          after:content-['']
                          peer-checked:after:translate-x-5
                        "
                      />
                    </label>
                  </td>

                  <td className="p-3">
                    <div className="relative w-28">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={pago.comision_porcentaje}
                        disabled={
                          !pago.aplica_comision ||
                          guardandoId === pago.id
                        }
                        onBlur={(e) =>
                          actualizar(
                            pago,
                            {
                              comision_porcentaje:
                                Number(e.target.value),
                            }
                          )
                        }
                        className="
                          mint-input
                          w-full
                          py-2
                          pl-3
                          pr-8
                          font-semibold
                          disabled:cursor-not-allowed
                          disabled:opacity-45
                        "
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--mint-text-muted)]">
                        %
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="relative w-28">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={pago.iva_comision_porcentaje}
                        disabled={
                          !pago.aplica_comision ||
                          guardandoId === pago.id
                        }
                        onBlur={(e) =>
                          actualizar(
                            pago,
                            {
                              iva_comision_porcentaje:
                                Number(e.target.value),
                            }
                          )
                        }
                        className="
                          mint-input
                          w-full
                          py-2
                          pl-3
                          pr-8
                          font-semibold
                          disabled:cursor-not-allowed
                          disabled:opacity-45
                        "
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--mint-text-muted)]">
                        %
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    {guardandoId === pago.id ? (
                      <span className="mint-badge mint-badge-info">
                        Guardando...
                      </span>
                    ) : pago.activo ? (
                      <span className="mint-badge mint-badge-success">
                        Activo
                      </span>
                    ) : (
                      <span className="mint-badge mint-badge-muted">
                        Inactivo
                      </span>
                    )}
                  </td>

                </tr>

              ))}
            </tbody>

          </table>
        </div>
      </section>

      <section
        className="
          rounded-[20px]
          border
          border-[var(--mint-border-teal)]
          bg-[var(--mint-surface-teal)]
          px-5
          py-4
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              mt-0.5
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white
              font-bold
              text-[var(--mint-teal)]
              shadow-sm
            "
          >
            i
          </div>

          <div>
            <h3 className="font-bold text-[var(--mint-navy)]">
              Cómo funciona
            </h3>

            <p className="mt-1 max-w-4xl text-sm leading-6 text-[var(--mint-text-secondary)]">
              Los métodos sin comisión no generan ningún cargo adicional.
              Cuando un método tiene comisión activa, MintOS utiliza el
              porcentaje configurado y su IVA para calcular automáticamente
              el costo bancario del cobro.
            </p>
          </div>
        </div>
      </section>

    </div>

  );

}
