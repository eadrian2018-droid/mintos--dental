import { useEffect, useRef, useState } from "react";
import {
  consultarCargosAdicionales,
  registrarCargoAdicional,
  cobrarCargoAdicional,
  type CargoAdicional,
  type EstadoCargo,
  type MonedaCargo,
} from "../../../services/cargosAdicionales.service";

type Props = {
  pacienteId: number;
  tratamientoId: number;
  es: boolean;
  puedeRegistrar: boolean;
  onCargoRegistrado: () => void;
};

export default function CargosAdicionalesPaciente({
  pacienteId,
  tratamientoId,
  es,
  puedeRegistrar,
  onCargoRegistrado,
}: Props) {
  const [cargos, setCargos] = useState<CargoAdicional[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] =
    useState<MonedaCargo>("MXN");

  useEffect(() => {
    setMostrarFormulario(false);
    setConcepto("");
    setMonto("");
    setMoneda("MXN");
  }, [pacienteId, tratamientoId]);

  useEffect(() => {
    let vigente = true;

    setCargando(true);
    setError(false);
    setCargos([]);

    consultarCargosAdicionales(pacienteId)
      .then((resultado) => {
        if (!vigente) return;

        setCargos(
          resultado.filter(
            (cargo) =>
              cargo.tratamiento_id === tratamientoId
          )
        );
      })
      .catch(() => {
        if (vigente) setError(true);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [pacienteId, tratamientoId, revision]);

  const [guardando, setGuardando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState(false);
  const bloqueo = useRef(false);
  const solicitud = useRef<{ id: string; clave: string } | null>(null);
  const montoValido = /^\d+(\.\d{1,2})?$/.test(monto) &&
    Number(monto) > 0 && Number(monto) <= 999999999999.99;
  const formularioValido = concepto.trim().length >= 3 &&
    concepto.trim().length <= 250 && montoValido;

  async function guardarCargo() {
    if (bloqueo.current || !puedeRegistrar || !formularioValido || cargando || error) return;
    bloqueo.current = true;
    setGuardando(true);
    setErrorRegistro(false);
    try {
      const clave = JSON.stringify([pacienteId, tratamientoId, concepto.trim(), Number(monto), moneda]);
      if (!solicitud.current || solicitud.current.clave !== clave) {
        solicitud.current = { id: crypto.randomUUID(), clave };
      }
      await registrarCargoAdicional({
        solicitudId: solicitud.current.id,
        pacienteId,
        tratamientoId,
        concepto: concepto.trim(),
        monto: Number(monto),
        moneda,
      });
      solicitud.current = null;
      cerrarFormulario();
      setRevision(actual => actual + 1);
      onCargoRegistrado();
    } catch {
      setErrorRegistro(true);
    } finally {
      bloqueo.current = false;
      setGuardando(false);
    }
  }

  const [cargoCobro, setCargoCobro] = useState<CargoAdicional | null>(null);
  const [importeCobro, setImporteCobro] = useState("");
  const [monedaCobro, setMonedaCobro] = useState<MonedaCargo>("MXN");
  const [metodoCobro, setMetodoCobro] = useState("");
  const [fxCobro, setFxCobro] = useState("");
  const [errorCobro, setErrorCobro] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const solicitudCobro = useRef<string | null>(null);
  const requiereFx = monedaCobro === "USD" || cargoCobro?.moneda === "USD";
  const fx = Number(fxCobro);
  const fxValido = !requiereFx || (Number.isFinite(fx) && fx > 0 && fx <= 1000000);
  const maxCobro = cargoCobro && fxValido
    ? Number((cargoCobro.moneda === monedaCobro ? cargoCobro.saldo_pendiente
      : monedaCobro === "USD" ? cargoCobro.saldo_pendiente / fx
      : cargoCobro.saldo_pendiente * fx).toFixed(2)) : 0;
  const cobroValido = /^\d+(\.\d{1,2})?$/.test(importeCobro) && Number(importeCobro) > 0 &&
    Number(importeCobro) <= Math.min(maxCobro, 999999999999.99) && fxValido &&
    ["Efectivo", "Tarjeta", "Transferencia", "Cheque"].includes(metodoCobro);

  function abrirCobroCargo(cargo: CargoAdicional) {
    if (bloqueo.current || solicitudCobro.current) return;
    setCargoCobro(cargo);
    setImporteCobro(cargo.saldo_pendiente.toFixed(2));
    setMonedaCobro(cargo.moneda);
    setMetodoCobro("");
    setFxCobro("");
    setErrorCobro(false);
  }

  async function guardarCobroCargo() {
    if (!cargoCobro || !puedeRegistrar || !cobroValido || bloqueo.current || cargando || error ||
      cargoCobro.paciente_id !== pacienteId || cargoCobro.tratamiento_id !== tratamientoId) return;
    bloqueo.current = true;
    setCobrando(true);
    setErrorCobro(false);
    try {
      solicitudCobro.current ??= crypto.randomUUID();
      const resultado = await cobrarCargoAdicional({
        solicitudId: solicitudCobro.current,
        cargoId: cargoCobro.cargo_id,
        monto: Number(importeCobro),
        moneda: monedaCobro,
        metodoPago: metodoCobro,
        tipoCambioConfirmado: requiereFx ? fx : null,
      });
      if (Number(resultado?.cargo_id) !== cargoCobro.cargo_id ||
          !Number.isSafeInteger(Number(resultado?.pago_id)) || Number(resultado?.pago_id) <= 0) {
        throw new Error("Invalid payment response");
      }
      solicitudCobro.current = null;
      setCargoCobro(null);
      setRevision(actual => actual + 1);
      onCargoRegistrado();
    } catch {
      setErrorCobro(true);
    } finally {
      bloqueo.current = false;
      setCobrando(false);
    }
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setConcepto("");
    setMonto("");
    setMoneda("MXN");
  }

  function formatoMoneda(
    monto: number,
    moneda: MonedaCargo
  ) {
    return new Intl.NumberFormat(
      es ? "es-MX" : "en-US",
      {
        style: "currency",
        currency: moneda,
        currencyDisplay: "code",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(monto);
  }

  function textoEstado(estado: EstadoCargo) {
    const estados = {
      Pendiente: es ? "Pendiente" : "Pending",
      Parcial: es ? "Pago parcial" : "Partially paid",
      Pagado: es ? "Pagado" : "Paid",
      Cancelado: es ? "Cancelado" : "Cancelled",
    };

    return estados[estado] ?? estado;
  }

  function estiloEstado(estado: EstadoCargo) {
    switch (estado) {
      case "Pagado":
        return "bg-emerald-100 text-emerald-700";
      case "Parcial":
        return "bg-blue-100 text-blue-700";
      case "Cancelado":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-amber-100 text-amber-700";
    }
  }

  const pendientesMXN = cargos
    .filter(
      (cargo) =>
        cargo.moneda === "MXN" &&
        cargo.estado !== "Cancelado"
    )
    .reduce(
      (total, cargo) => total + cargo.saldo_pendiente,
      0
    );

  const pendientesUSD = cargos
    .filter(
      (cargo) =>
        cargo.moneda === "USD" &&
        cargo.estado !== "Cancelado"
    )
    .reduce(
      (total, cargo) => total + cargo.saldo_pendiente,
      0
    );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            {es
              ? "Cargos adicionales"
              : "Additional charges"}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {es
              ? "Independientes del precio original del tratamiento."
              : "Separate from the original treatment price."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={cargando || cobrando || !!cargoCobro}
            onClick={() =>
              setRevision((actual) => actual + 1)
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {es ? "Actualizar" : "Refresh"}
          </button>

          {puedeRegistrar && !mostrarFormulario && !cargoCobro && (
            <button
              type="button"
              disabled={cargando || error}
              onClick={() => setMostrarFormulario(true)}
              className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
            >
              {es
                ? "+ Agregar cargo adicional"
                : "+ Add additional charge"}
            </button>
          )}
        </div>
      </div>

      {puedeRegistrar && mostrarFormulario && (
        <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
          <h4 className="text-sm font-semibold text-slate-800">
            {es
              ? "Nuevo cargo adicional"
              : "New additional charge"}
          </h4>

          <fieldset disabled={guardando} className="mt-4 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">
                {es ? "Concepto" : "Description"}
              </span>

              <input
                type="text"
                value={concepto}
                maxLength={250}
                onChange={(event) =>
                  setConcepto(event.target.value)
                }
                placeholder={
                  es
                    ? "Descripción del cargo adicional"
                    : "Additional charge description"
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-teal-500"
              />

              <span className="mt-1 block text-right text-xs text-slate-400">
                {concepto.length}/250
              </span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  {es ? "Importe" : "Amount"}
                </span>

                <input
                  type="number"
                  min="0.01"
                  max="999999999999.99"
                  step="0.01"
                  inputMode="decimal"
                  value={monto}
                  onChange={(event) =>
                    setMonto(event.target.value)
                  }
                  placeholder="0.00"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-teal-500"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  {es ? "Moneda" : "Currency"}
                </span>

                <select
                  value={moneda}
                  onChange={(event) => {
                    const valor = event.target.value;

                    if (valor === "MXN" || valor === "USD") {
                      setMoneda(valor);
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-teal-500"
                >
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            </div>

            <div className="rounded-xl border border-teal-100 bg-white p-3">
              <p className="text-xs text-slate-600">
                {es
                  ? "Este cargo no modifica el precio original del tratamiento."
                  : "This charge does not modify the original treatment price."}
              </p>

              {Number.isFinite(Number(monto)) &&
                Number(monto) > 0 && (
                  <p className="mt-2 text-lg font-semibold text-teal-700">
                    {formatoMoneda(Number(monto), moneda)}
                  </p>
                )}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={cerrarFormulario}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {es ? "Cancelar" : "Cancel"}
              </button>

              <button
                type="button"
                disabled={!formularioValido || guardando || cargando || error}
                onClick={() => void guardarCargo()}
                className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {guardando ? (es ? "Guardando..." : "Saving...") : (es ? "Guardar cargo" : "Save charge")}
              </button>
            </div>

            {errorRegistro && <p role="alert" className="text-sm text-red-700">
              {es ? "No se confirmó el registro. Reintenta sin cambiar los datos para evitar duplicados." : "Registration was not confirmed. Retry without changing the details to avoid duplicates."}
            </p>}
          </fieldset>
        </div>
      )}

      {cargando ? (
        <div
          role="status"
          className="py-6 text-center text-sm text-slate-500"
        >
          {es
            ? "Cargando cargos..."
            : "Loading charges..."}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {es
            ? "No fue posible consultar los cargos adicionales."
            : "Unable to retrieve additional charges."}
        </div>
      ) : cargos.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
          {es
            ? "No hay cargos adicionales registrados."
            : "No additional charges registered."}
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {cargos.map((cargo) => (
              <div
                key={cargo.cargo_id}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="min-w-0 break-words text-sm font-semibold text-slate-800">
                    {cargo.concepto}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${estiloEstado(
                      cargo.estado
                    )}`}
                  >
                    {textoEstado(cargo.estado)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      {es ? "Importe" : "Amount"}
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {formatoMoneda(
                        cargo.total_cargo,
                        cargo.moneda
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      {es ? "Pagado" : "Paid"}
                    </p>

                    <p className="text-sm font-semibold text-emerald-600">
                      {formatoMoneda(
                        cargo.total_pagado,
                        cargo.moneda
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      {es ? "Pendiente" : "Balance"}
                    </p>

                    <p className="text-sm font-semibold text-amber-600">
                      {formatoMoneda(
                        cargo.saldo_pendiente,
                        cargo.moneda
                      )}
                    </p>
                  </div>
                </div>
                {puedeRegistrar && !mostrarFormulario && !cargoCobro &&
                  (cargo.estado === "Pendiente" || cargo.estado === "Parcial") && cargo.saldo_pendiente > 0 && (
                  <button type="button" onClick={() => abrirCobroCargo(cargo)}
                    className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white">
                    {es ? "Cobrar cargo" : "Record charge payment"}
                  </button>
                )}
                {cargoCobro?.cargo_id === cargo.cargo_id && (
                  <div className="mt-4 space-y-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3">
                    <h4 className="text-sm font-semibold">{es ? "Cobro del cargo adicional" : "Additional charge payment"}</h4>
                    <fieldset disabled={cobrando || errorCobro} className="grid gap-3 sm:grid-cols-2">
                      <label className="text-xs">{es ? "Moneda" : "Currency"}
                        <select className="mint-input mt-1 w-full p-2" value={monedaCobro} onChange={e => { setMonedaCobro(e.target.value as MonedaCargo); setImporteCobro(""); }}>
                          <option>MXN</option><option>USD</option>
                        </select>
                      </label>
                      <label className="text-xs">{es ? "Método de pago" : "Payment method"}
                        <select className="mint-input mt-1 w-full p-2" value={metodoCobro} onChange={e => setMetodoCobro(e.target.value)}>
                          <option value="">{es ? "Seleccionar" : "Select"}</option>
                          <option value="Efectivo">{es ? "Efectivo" : "Cash"}</option>
                          <option value="Tarjeta">{es ? "Tarjeta" : "Card"}</option>
                          <option value="Transferencia">{es ? "Transferencia" : "Bank transfer"}</option>
                          <option value="Cheque">{es ? "Cheque" : "Check"}</option>
                        </select>
                      </label>
                      {requiereFx && <label className="text-xs">{es ? "Tipo de cambio confirmado (MXN/USD)" : "Confirmed exchange rate (MXN/USD)"}
                        <input className="mint-input mt-1 w-full p-2" type="number" min="0.000001" max="1000000" step="any" value={fxCobro} onChange={e => setFxCobro(e.target.value)} />
                      </label>}
                      <label className="text-xs">{es ? "Importe del abono" : "Payment amount"}
                        <input className="mint-input mt-1 w-full p-2" type="number" min="0.01" step="0.01" max={maxCobro} value={importeCobro} onChange={e => setImporteCobro(e.target.value)} />
                      </label>
                      <button type="button" disabled={!fxValido || maxCobro <= 0} onClick={() => setImporteCobro(maxCobro.toFixed(2))} className="text-xs font-semibold text-teal-700">{es ? "Pagar saldo completo" : "Pay full balance"}</button>
                    </fieldset>
                    <p className="text-xs text-slate-600">{es ? "Máximo a cobrar" : "Maximum payment"}: {formatoMoneda(maxCobro, monedaCobro)}</p>
                    {errorCobro && <p role="alert" className="text-xs text-red-700">{es ? "Cobro no confirmado. Reintenta con los mismos datos. No cierres el modal sin verificar el movimiento." : "Payment not confirmed. Retry with the same details. Do not close the modal without checking the transaction."}</p>}
                    <div className="flex justify-end gap-2">
                      <button type="button" disabled={cobrando || errorCobro} onClick={() => setCargoCobro(null)} className="mint-btn mint-btn-neutral">{es ? "Cancelar" : "Cancel"}</button>
                      <button type="button" disabled={!puedeRegistrar || !cobroValido || cobrando || cargando || error} onClick={() => void guardarCobroCargo()} className="mint-btn mint-btn-primary disabled:opacity-50">{cobrando ? (es ? "Procesando..." : "Processing...") : errorCobro ? (es ? "Reintentar" : "Retry") : (es ? "Confirmar cobro" : "Confirm payment")}</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(pendientesMXN > 0 || pendientesUSD > 0) && (
            <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-xs font-medium text-slate-300">
                {es
                  ? "Saldo de cargos adicionales"
                  : "Additional charges balance"}
              </p>

              {pendientesMXN > 0 && (
                <p className="mt-1 text-lg font-semibold">
                  {formatoMoneda(pendientesMXN, "MXN")}
                </p>
              )}

              {pendientesUSD > 0 && (
                <p className="mt-1 text-lg font-semibold">
                  {formatoMoneda(pendientesUSD, "USD")}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}