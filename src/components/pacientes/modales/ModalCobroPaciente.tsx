import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

type NuevoCobro = {
  metodo_pago: string;
  moneda: string;
  monto: string;
  laboratorio: string;
  especialista: string;
  comision_banco: string;
};

type Props = {
  mostrarModalCobro: boolean;
  es: boolean;
  tratamientoCobro: any;
  nuevoCobro: NuevoCobro;
  setNuevoCobro: Dispatch<SetStateAction<NuevoCobro>>;
  tipoCambioCobro: number;
  puedeAplicarDescuentos: boolean;
  tipoDescuentoCobro: "monto" | "porcentaje";
  setTipoDescuentoCobro: Dispatch<SetStateAction<"monto" | "porcentaje">>;
  valorDescuentoCobro: string;
  setValorDescuentoCobro: Dispatch<SetStateAction<string>>;
  monedaPrecioCobro: string;
  totalOriginalCobro: number;
  pendienteOriginalCobro: number;
  descuentoOriginalCobro: number;
  totalOriginalDespuesDescuentoCobro: number;
  comisionBancoActual: number;
  comisionBaseActual: number;
  porcentajeComisionActual: number;
  porcentajeIvaComisionActual: number;
  ivaComisionActual: number;
  netoCobroActual: number;
  setMostrarModalCobro: Dispatch<SetStateAction<boolean>>;
  setTratamientoCobro: Dispatch<SetStateAction<any>>;
  registrarCobro: (modo: "cobro" | "descuento") => Promise<void>;
  saldoMonetarioMXN: (tratamiento: any) => number;
};

export default function ModalCobroPaciente({
  mostrarModalCobro,
  es,
  tratamientoCobro,
  nuevoCobro,
  setNuevoCobro,
  tipoCambioCobro,
  puedeAplicarDescuentos,
  tipoDescuentoCobro,
  setTipoDescuentoCobro,
  valorDescuentoCobro,
  setValorDescuentoCobro,
  monedaPrecioCobro,
  totalOriginalCobro,
  pendienteOriginalCobro,
  descuentoOriginalCobro,
  totalOriginalDespuesDescuentoCobro,
  comisionBancoActual,
  comisionBaseActual,
  porcentajeComisionActual,
  porcentajeIvaComisionActual,
  ivaComisionActual,
  netoCobroActual,
  setMostrarModalCobro,
  setTratamientoCobro,
  registrarCobro,
  saldoMonetarioMXN,
}: Props) {
  // Mantener el monto que el usuario ingresó (o el saldo inicial) como referencia.
  // Las conversiones siempre parten de este valor, nunca del monto ya redondeado.
  const montoReferenciaCobroRef = useRef<{ moneda: "MXN" | "USD"; monto: string } | null>(null);

  useEffect(() => {
    if (!mostrarModalCobro) {
      montoReferenciaCobroRef.current = null;
    }
  }, [mostrarModalCobro]);

  function cambiarMonedaCobro(nuevaMoneda: string) {
    if (nuevaMoneda === nuevoCobro.moneda) return;
    if (nuevaMoneda !== "MXN" && nuevaMoneda !== "USD") return;
    if (nuevoCobro.moneda !== "MXN" && nuevoCobro.moneda !== "USD") return;

    if (!Number.isFinite(tipoCambioCobro) || tipoCambioCobro <= 0) {
      window.alert(
        es
          ? "Configura un tipo de cambio válido antes de cambiar la moneda."
          : "Set a valid exchange rate before changing currency."
      );
      return;
    }

    const referencia = montoReferenciaCobroRef.current ?? {
      moneda: nuevoCobro.moneda,
      monto: nuevoCobro.monto,
    };
    const montoReferencia = Number(referencia.monto);

    if (
      referencia.monto.trim() !== "" &&
      (!Number.isFinite(montoReferencia) || montoReferencia < 0)
    ) {
      window.alert(
        es ? "Ingresa un monto válido." : "Enter a valid amount."
      );
      return;
    }

    const montoConvertido = referencia.monto.trim() === ""
      ? ""
      : referencia.moneda === nuevaMoneda
        ? referencia.monto
        : (referencia.moneda === "MXN"
            ? montoReferencia / tipoCambioCobro
            : montoReferencia * tipoCambioCobro
          ).toFixed(2);

    montoReferenciaCobroRef.current = referencia;
    setNuevoCobro((actual) => ({
      ...actual,
      moneda: nuevaMoneda,
      monto: montoConvertido,
    }));
  }

  return (
    <>
{
  mostrarModalCobro && (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-[rgba(15,42,65,0.62)]
        backdrop-blur-[3px]
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-xl
          overflow-hidden
          rounded-[24px]
          border
          border-white/20
          bg-[var(--mint-surface)]
          shadow-[0_28px_80px_rgba(15,42,65,0.30)]
          [&>*:not(h2)]:mx-6
        "
      >
        <h2
          className="
            text-xl
            font-bold
            text-white
            px-6
            py-5
            mb-0
           bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)]
            border-b-[3px]
            border-[var(--mint-teal-soft)]
          "
        >
          {es ? "Registrar cobro" : "Record payment"}
        </h2>

        <p
          className="
            text-sm
            mint-text-secondary
            mb-5
          "
        >
          {
            tratamientoCobro
              ?.tratamiento
          }
        </p>

        <div
          className="
            grid
            gap-4
          "
        >

          <div>
            <label
              className="
                block
                text-sm
                font-semibold
                mint-text-primary
                mb-2
              "
            >
              {es ? "Método de pago" : "Payment method"}
            </label>

            <select
              value={
                nuevoCobro
                  .metodo_pago
              }
              onChange={(e) =>
                setNuevoCobro({
                  ...nuevoCobro,
                  metodo_pago:
                    e.target.value,
                })
              }
              className="
                mint-input
                w-full
                p-3
              "
            >
              <option value="">
                {es ? "Seleccionar método" : "Select method"}
              </option>

              <option value="Efectivo">
                {es ? "Efectivo" : "Cash"}
              </option>

              <option value="Tarjeta">
                {es ? "Tarjeta" : "Card"}
              </option>

              <option value="Transferencia">
                {es ? "Transferencia" : "Bank transfer"}
              </option>

              <option value="Cheque">
                Cheque
              </option>
            </select>
          </div>

          <div>
            <label
              className="
                block
                text-sm
                font-semibold
                mint-text-primary
                mb-2
              "
            >
              {es ? "Moneda" : "Currency"}
            </label>

            <select
              value={
                nuevoCobro.moneda
              }
              onChange={(e) => cambiarMonedaCobro(e.target.value)}
              className="
                mint-input
                w-full
                p-3
              "
            >
              <option value="MXN">
                MXN
              </option>

              <option value="USD">
                USD
              </option>
            </select>
          </div>

          {
  nuevoCobro.moneda === "USD" &&
  tipoCambioCobro > 0 && (

    <div
      className="
        bg-[var(--mint-primary-soft)]
        border
        border-[var(--mint-border-primary)]
        rounded-xl
        p-3
      "
    >

      <p
        className="
          text-sm
          font-semibold
          mint-text-brand
        "
      >
        {es ? "Tipo de cambio:" : "Exchange rate:"}
        {" "}
        1 USD = ${tipoCambioCobro.toFixed(2)} MXN
      </p>

      <p
  className="
    text-sm
    font-bold
    mint-text-primary
    mt-1
  "
>
  Equivalente:
  {" "}
  $
  {(
    Number(
      nuevoCobro.monto || 0
    ) *
    tipoCambioCobro
  ).toLocaleString(
    "es-MX",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}
  {" "}
  MXN
</p>

    </div>

  )
}

          <div>
            <label
              className="
                block
                text-sm
                font-semibold
                mint-text-primary
                mb-2
              "
            >
              {es ? "Monto del cobro" : "Payment amount"}
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                nuevoCobro.monto
              }
              onChange={(e) => {
                // Si el usuario edita el monto, esa cantidad pasa a ser
                // la nueva referencia para conversiones posteriores.
                const montoIngresado = e.target.value;
                if (nuevoCobro.moneda === "MXN" || nuevoCobro.moneda === "USD") {
                  montoReferenciaCobroRef.current = {
                    moneda: nuevoCobro.moneda,
                    monto: montoIngresado,
                  };
                }
                setNuevoCobro((actual) => ({
                  ...actual,
                  monto: montoIngresado,
                }));
              }}
              className="
                mint-input
                w-full
                p-3
              "
              placeholder="0.00"
            />
          </div>

          {
            puedeAplicarDescuentos && (
          <div
            className="
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
              rounded-2xl
              p-4
              space-y-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    mint-text-primary
                  "
                >
                  {es ? "Descuento" : "Discount"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "No se registra como pago." : "It is not recorded as a payment."}
                </p>
              </div>

              <div
                className="
                  inline-flex
                  rounded-xl
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg-card)]
                  p-1
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setTipoDescuentoCobro(
                      "monto"
                    )
                  }
                  className={`
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-bold
                    transition
                    ${
                      tipoDescuentoCobro ===
                      "monto"
                        ? "bg-[var(--mint-primary)] text-white"
                        : "mint-text-secondary"
                    }
                  `}
                >
                  {monedaPrecioCobro}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTipoDescuentoCobro(
                      "porcentaje"
                    )
                  }
                  className={`
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-bold
                    transition
                    ${
                      tipoDescuentoCobro ===
                      "porcentaje"
                        ? "bg-[var(--mint-primary)] text-white"
                        : "mint-text-secondary"
                    }
                  `}
                >
                  %
                </button>
              </div>
            </div>

            <input
              type="number"
              min="0"
              max={
                tipoDescuentoCobro ===
                "porcentaje"
                  ? 100
                  : pendienteOriginalCobro
              }
              step="0.01"
              value={
                valorDescuentoCobro
              }
              onChange={(e) =>
                setValorDescuentoCobro(
                  e.target.value
                )
              }
              className="
                mint-input
                w-full
                p-3
              "
              placeholder="0.00"
            />

            <div
              className="
                flex
                justify-between
                gap-4
                text-sm
              "
            >
              <span
                className="
                  mint-text-secondary
                "
              >
                {es ? "Descuento aplicado" : "Discount applied"}
              </span>

              <strong
                className="
                  text-[var(--mint-danger)]
                "
              >
                -$
                {descuentoOriginalCobro.toLocaleString(
                  "es-MX",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
                {" "}
                {monedaPrecioCobro}
              </strong>
            </div>

            <button
              type="button"
              onClick={() =>
                registrarCobro(
                  "descuento"
                )
              }
              disabled={
                descuentoOriginalCobro <= 0
              }
              className="
                mint-btn
                mint-btn-primary
                w-full
                px-4
                py-2.5
                text-sm
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {es ? "Aplicar descuento" : "Apply discount"}
            </button>
          </div>
            )
          }

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-3
            "
          >

            <div>
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Laboratorio" : "Laboratory"} ({tratamientoCobro?.moneda_laboratorio || "MXN"})
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  nuevoCobro
                    .laboratorio
                }
                onChange={(e) => setNuevoCobro({ ...nuevoCobro, laboratorio: e.target.value })}
                disabled={tratamientoCobro?.estado === "Finalizado"}
                className="
                  mint-input
                  w-full
                  p-3
                "
              />
            </div>

            <div>
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Especialista" : "Specialist"}
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  nuevoCobro
                    .especialista
                }
                readOnly
                className="
                  mint-input
                  w-full
                  p-3
                "
              />
            </div>

          <div>

  <label
    className="
      block
      text-xs
      font-semibold
      mint-text-secondary
      mb-2
    "
  >
    {es ? "Comisión banco" : "Bank fee"}
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    value={
      comisionBancoActual.toFixed(2)
    }
    readOnly
    className="
      mint-input
      w-full
      p-3
    "
  />

  {
    porcentajeComisionActual > 0 && (
      <div
        className="
          mt-2
          text-xs
          mint-text-secondary
          space-y-1
        "
      >

        <div>
          Comisión {porcentajeComisionActual}%:{" "}
          ${comisionBaseActual.toFixed(2)}
        </div>

        <div>
          IVA {porcentajeIvaComisionActual}%:{" "}
          ${ivaComisionActual.toFixed(2)}
        </div>

        <div
          className="
            font-semibold
            mint-text-primary
          "
        >
          Neto clínica:{" "}
          ${netoCobroActual.toFixed(2)}
        </div>

      </div>
    )
  }

</div>

          </div>

          <div
            className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-4
            "
          >
            <div
              className="
                flex
                justify-between
                text-sm
                mb-2
              "
            >
              <span
                className="
                  mint-text-secondary
                "
              >
                {es ? "Total actual" : "Current total"}
              </span>

              <strong
                className="
                  mint-text-primary
                "
              >
                $
                {totalOriginalCobro.toLocaleString(
                  "es-MX",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
                {" "}
                {monedaPrecioCobro}
              </strong>
            </div>

            {
              descuentoOriginalCobro > 0 && (
                <>
                  <div
                    className="
                      flex
                      justify-between
                      text-sm
                      mb-2
                    "
                  >
                    <span
                      className="
                        mint-text-secondary
                      "
                    >
                      {es ? "Descuento nuevo" : "New discount"}
                    </span>

                    <strong
                      className="
                        text-[var(--mint-danger)]
                      "
                    >
                      -$
                      {descuentoOriginalCobro.toLocaleString(
                        "es-MX",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                      {" "}
                      {monedaPrecioCobro}
                    </strong>
                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      text-sm
                      mb-2
                    "
                  >
                    <span
                      className="
                        mint-text-secondary
                      "
                    >
                      {es ? "Total a cobrar" : "Amount to charge"}
                    </span>

                    <strong
                      className="
                        mint-text-brand
                      "
                    >
                      $
                      {totalOriginalDespuesDescuentoCobro.toLocaleString(
                        "es-MX",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                      {" "}
                      {monedaPrecioCobro}
                    </strong>
                  </div>
                </>
              )
            }

            <div
              className="
                hidden
              "
            >
              <span>
                {es ? "Total tratamiento" : "Treatment total"}
              </span>

              <strong
                className="
                  mint-text-primary
                "
              >
                $
                {
                  Number(
                    tratamientoCobro
                      ?.moneda_precio ===
                    "USD"
                      ? tratamientoCobro
                          ?.total_original ??
                        tratamientoCobro
                          ?.total ??
                        0
                      : tratamientoCobro
                          ?.total || 0
                  ).toLocaleString()
                }
                {" "}
                {
                  tratamientoCobro
                    ?.moneda_precio ||
                  "MXN"
                }
              </strong>
            </div>

            <div
              className="
                flex
                justify-between
                text-sm
                mb-2
              "
            >
              <span
                className="
                  mint-text-secondary
                "
              >
                {es ? "Pagado" : "Paid"}
              </span>

              <strong
                className="
                  text-[var(--mint-success)]
                "
              >
                $
                {
                  Number(
                    tratamientoCobro
                      ?.moneda_precio ===
                    "USD"
                      ? tratamientoCobro
                          ?.pagado_original ??
                        tratamientoCobro
                          ?.pagado ??
                        0
                      : tratamientoCobro
                          ?.pagado || 0
                  ).toLocaleString()
                }
                {" "}
                {
                  tratamientoCobro
                    ?.moneda_precio ||
                  "MXN"
                }
              </strong>
            </div>

       <div className="flex justify-between items-start text-sm">
         <span className="mint-text-secondary">
           {es ? "Pendiente" : "Pending"}
         </span>
         {(() => {
           const monedaTratamiento = tratamientoCobro?.moneda_precio || "MXN";
           const pendienteOriginal = Math.max(0, Number(
             monedaTratamiento === "USD"
               ? (tratamientoCobro?.resta_original ?? 0)
               : saldoMonetarioMXN(tratamientoCobro)
           ));
           const monedaSeleccionada = nuevoCobro.moneda;
           const requiereConversion = monedaSeleccionada !== monedaTratamiento;
           const cambioValido = Number.isFinite(tipoCambioCobro) && tipoCambioCobro > 0;
           const pendienteMostrado = !requiereConversion || !cambioValido
             ? pendienteOriginal
             : monedaTratamiento === "MXN"
               ? pendienteOriginal / tipoCambioCobro
               : pendienteOriginal * tipoCambioCobro;
           const monedaMostrada = requiereConversion && !cambioValido
             ? monedaTratamiento
             : monedaSeleccionada;
           const formato = (valor: number) => valor.toLocaleString("es-MX", {
             minimumFractionDigits: 2,
             maximumFractionDigits: 2,
           });
           return (
             <div className="text-right">
               <strong className="block text-[var(--mint-danger)]">
                 ${formato(pendienteMostrado)} {monedaMostrada}
               </strong>
               {requiereConversion && cambioValido && (
                 <span className="block text-xs font-semibold mint-text-secondary mt-1">
                   {es ? "Saldo original" : "Original balance"}: ${formato(pendienteOriginal)} {monedaTratamiento}
                 </span>
               )}
               {requiereConversion && !cambioValido && (
                 <span className="block text-xs font-semibold text-[var(--mint-danger)] mt-1">
                   {es ? "Configura un tipo de cambio válido" : "Set a valid exchange rate"}
                 </span>
               )}
             </div>
           );
         })()}
       </div>
          </div>

        </div>

        <div
          className="
            flex
            justify-end
            gap-3
            mt-6
          "
        >

          <button
            type="button"
            onClick={() => {

              setMostrarModalCobro(
                false
              );

              setTratamientoCobro(
                null
              );

              setTipoDescuentoCobro(
                "monto"
              );

              setValorDescuentoCobro(
                ""
              );

            }}
            className="
              mint-btn
              mint-btn-neutral
              px-4
              py-2
              text-sm
            "
          >
            {es ? "Cancelar" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={() =>
              registrarCobro(
                "cobro"
              )
            }
            className="
              mint-btn
              mint-btn-primary
              px-4
              py-2
              text-sm
            "
          >
            {es ? "Registrar cobro" : "Record payment"}
          </button>

        </div>

      </div>
    </div>
  )
}

    </>
  );
}
