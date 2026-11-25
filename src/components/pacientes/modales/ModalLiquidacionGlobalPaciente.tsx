import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { obtenerFechaLocalMintOS, validarFechaEfectivaMintOS } from "../../../services/cargosAdicionales.service";

type Moneda = "MXN" | "USD";
type Detalle = {
  tipo?: "tratamiento" | "cargo_adicional";
  cargo_id?: number;
  tratamiento_id: number;
  tratamiento: string;
  moneda_precio: Moneda;
  saldo_original: number;
  monto_cobro: number;
};
const claveDetalle = (item: Detalle) => item.tipo === "cargo_adicional" ? `cargo:${item.cargo_id}` : `tratamiento:${item.tratamiento_id}`;

type Cotizacion = {
  paciente_id: number;
  moneda_cobro: Moneda;
  tipo_cambio_confirmado: number | null;
  cantidad: number;
  total_cobro: number;
  detalle: Detalle[];
};
type Resultado = {
  solicitud_id: string;
  paciente_id: number;
  cantidad_tratamientos: number;
  cantidad_cargos_adicionales?: number;
  cantidad_conceptos?: number;
  total_recibido: number;
  moneda_cobro: Moneda;
  pagos: Array<{ tratamiento_id: number; pago_id: number; saldo_original: number }>;
};

type Props = {
  abierto: boolean;
  pacienteId: number | null;
  pacienteNombre: string;
  es: boolean;
  onCerrar: () => void;
  onLiquidacionConfirmada: () => Promise<void>;
};

const dinero = (valor: number, moneda: Moneda) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: moneda }).format(valor);

// Los errores de Supabase/PostgREST son objetos planos, no instancias de Error.
// String(error) los convierte en "[object Object]" y oculta la causa real.
const mensajeError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const campos = ["message", "details", "hint", "code"]
      .map((clave) => e[clave])
      .filter((valor): valor is string => typeof valor === "string" && valor.trim().length > 0);
    if (campos.length) return [...new Set(campos)].join(" · ");
  }
  return "Error desconocido. Revisa la consola del navegador.";
};

export default function ModalLiquidacionGlobalPaciente({
  abierto, pacienteId, pacienteNombre, es, onCerrar, onLiquidacionConfirmada,
}: Props) {
  const [fechaCobro, setFechaCobro] = useState(obtenerFechaLocalMintOS);
  const fechaValida = validarFechaEfectivaMintOS(fechaCobro);
  const [moneda, setMoneda] = useState<Moneda>("MXN");
  const [modo, setModo] = useState<"liquidar" | "abonar">("liquidar");
  const [abonos, setAbonos] = useState<Record<string, string>>({});
  const [pagosParciales, setPagosParciales] = useState<Array<{ tratamiento: string; monto: number }>>([]);
  const [metodo, setMetodo] = useState("");
  const [metodos, setMetodos] = useState<string[]>([]);
  const [tipoCambio, setTipoCambio] = useState(0);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [configLista, setConfigLista] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [revisionNecesaria, setRevisionNecesaria] = useState(false);
  const intentoRef = useRef<{ id: string; payload: string } | null>(null);
  const enCursoRef = useRef(false);
  // La carga de configuración y las cotizaciones son operaciones independientes.
  // No deben invalidarse entre sí al cambiar el tipo de cambio.
  const secuenciaConfigRef = useRef(0);
  const secuenciaCotizacionRef = useRef(0);

  // Reiniciar únicamente al cambiar de paciente o al abrir una operación nueva.
  useEffect(() => {
    if (!abierto) return;
    setConfigLista(false);
    setFechaCobro(obtenerFechaLocalMintOS());
    setMoneda("MXN");
    setModo("liquidar");
    setAbonos({});
    setPagosParciales([]);
    setMetodo("");
    setCotizacion(null);
    setError("");
    setResultado(null);
    setRevisionNecesaria(false);
    intentoRef.current = null;
    const secuencia = ++secuenciaConfigRef.current;
    void (async () => {
      const [config, cambio] = await Promise.all([
        supabase.from("configuracion_pagos").select("metodo").eq("activo", true),
        supabase.from("configuracion_finanzas").select("valor").eq("clave", "tipo_cambio").maybeSingle(),
      ]);
      if (secuencia !== secuenciaConfigRef.current) return;
      if (config.error || cambio.error) {
        setError(es ? "No fue posible cargar la configuración financiera." : "Unable to load payment settings.");
        return;
      }
      const disponibles = Array.from(new Set((config.data ?? []).map((fila) => String(fila.metodo)).filter(Boolean)));
      setMetodos(disponibles);
      setMetodo(disponibles[0] ?? "");
      setTipoCambio(Number(cambio.data?.valor ?? 0));
      setConfigLista(true);
    })();
    return () => { ++secuenciaConfigRef.current; };
  }, [abierto, pacienteId, es]);

  const cotizacionVigente = !!cotizacion && cotizacion.moneda_cobro === moneda &&
    cotizacion.tipo_cambio_confirmado === (tipoCambio > 0 ? tipoCambio : null);

  // Cotizar automáticamente al abrir y al modificar moneda o tipo de cambio.
  // El identificador de secuencia descarta respuestas obsoletas de solicitudes anteriores.
  useEffect(() => {
    if (!abierto || !configLista || !pacienteId || revisionNecesaria || intentoRef.current || enCursoRef.current) return;
    const secuencia = ++secuenciaCotizacionRef.current;
    const monedaActual = moneda;
    const cambioActual = tipoCambio > 0 ? tipoCambio : null;
    setCotizacion(null);
    setAbonos({});
    setError("");
    setCargando(true);
    const temporizador = window.setTimeout(() => {
      void (async () => {
        try {
          const { data, error: errorRpc } = await supabase.rpc("mintos_preparar_liquidacion_global_v1", {
            p_paciente_id: pacienteId,
            p_moneda: monedaActual,
            p_tipo_cambio_confirmado: cambioActual,
          });
          if (secuencia !== secuenciaCotizacionRef.current) return;
          if (errorRpc) throw errorRpc;
          const cot = data as Cotizacion;
          if (!cot || !Array.isArray(cot.detalle) || !Number.isFinite(Number(cot.total_cobro)) ||
            cot.cantidad !== cot.detalle.length || cot.paciente_id !== pacienteId ||
            cot.moneda_cobro !== monedaActual || cot.tipo_cambio_confirmado !== cambioActual ||
            cot.detalle.some((i) => (i.tipo !== undefined && i.tipo !== "tratamiento" && i.tipo !== "cargo_adicional") ||
              (i.tipo === "cargo_adicional" && (!Number.isSafeInteger(i.cargo_id) || Number(i.cargo_id) <= 0))) ||
            new Set(cot.detalle.map(claveDetalle)).size !== cot.detalle.length) {
            throw new Error(es ? "La cotización recibida no es válida." : "The quote received is invalid.");
          }
          setCotizacion(cot);
        } catch (e) {
          if (secuencia === secuenciaCotizacionRef.current) setError(mensajeError(e));
        } finally {
          if (secuencia === secuenciaCotizacionRef.current) setCargando(false);
        }
      })();
    }, 250);
    return () => {
      window.clearTimeout(temporizador);
      ++secuenciaCotizacionRef.current;
    };
  }, [abierto, configLista, pacienteId, moneda, tipoCambio, es, revisionNecesaria]);

  const abonosElegidos = (cotizacion?.detalle ?? []).flatMap((item) => {
    const raw = abonos[claveDetalle(item)]?.trim() ?? "";
    if (!raw) return [];
    const monto = Number(raw);
    return [{ item, monto }];
  });
  const totalAbonos = Math.round(abonosElegidos.reduce((sum, x) => sum + (Number.isFinite(x.monto) ? x.monto : 0), 0) * 100) / 100;
  const abonosValidos = abonosElegidos.length > 0 && abonosElegidos.every(({ item, monto }) =>
    Number.isFinite(monto) && monto > 0 && monto <= Number(item.monto_cobro) + 0.00001 &&
    Math.abs(Math.round(monto * 100) - monto * 100) < 0.000001
  );

  async function registrarAbonos() {
    if (!pacienteId || !cotizacion || !cotizacionVigente || !metodo || !fechaValida ||
      !abonosValidos || cobrando || enCursoRef.current || revisionNecesaria) return;
    enCursoRef.current = true;
    setCobrando(true);
    setError("");
    const confirmados: Array<{ tratamiento: string; monto: number }> = [];
    try {
      // Cada cobro usa la RPC FIN01/FIN02 existente. No se hacen escrituras directas.
      // Los pagos son individuales: si falla uno, los anteriores pueden estar confirmados.
      for (const { item, monto } of abonosElegidos) {
        const solicitudId = crypto.randomUUID();
        const { data, error: errorRpc } = item.tipo === "cargo_adicional"
          ? await supabase.rpc("mintos_cobrar_cargo_adicional_v2", {
              p_fecha_cobro: fechaCobro,
              p_solicitud_id: solicitudId, p_cargo_id: item.cargo_id, p_monto: monto,
              p_moneda: moneda, p_metodo_pago: metodo,
              p_tipo_cambio_confirmado: moneda === "USD" || item.moneda_precio === "USD" ? cotizacion.tipo_cambio_confirmado : null,
            })
          : await supabase.rpc("mintos_registrar_cobro_v3", {
          p_fecha_cobro: fechaCobro,
              p_solicitud_id: solicitudId,
          p_tratamiento_id: item.tratamiento_id,
          p_paciente_id: pacienteId,
          p_modo: "cobro",
          p_monto: monto,
          p_moneda: moneda,
          p_metodo_pago: metodo,
          p_tipo_descuento: "monto",
          p_valor_descuento: 0,
          p_laboratorio: null,
          p_especialista: null,
          p_tipo_cambio_confirmado: moneda === "USD" || item.moneda_precio === "USD"
            ? cotizacion.tipo_cambio_confirmado : null,
        });
        if (errorRpc) throw errorRpc;
        const r = data as { solicitud_id?: string; pago_id?: number; tratamiento_id?: number; cargo_id?: number; monto_recibido?: number };
        if (r?.solicitud_id !== solicitudId || !r.pago_id ||
          (item.tipo === "cargo_adicional" ? Number(r.cargo_id) !== item.cargo_id : Number(r.tratamiento_id) !== item.tratamiento_id) ||
          !Number.isFinite(Number(r.monto_recibido)) ||
          Math.abs(Number(r.monto_recibido) - monto) > 0.005) {
          throw new Error(es
            ? "La confirmación del cobro requiere revisión. No repitas la operación."
            : "Payment confirmation requires review. Do not repeat the transaction.");
        }
        confirmados.push({ tratamiento: item.tratamiento || `#${item.tratamiento_id}`, monto });
        setPagosParciales([...confirmados]);
      }
      setRevisionNecesaria(true);
      try {
        await onLiquidacionConfirmada();
      } catch (e) {
        console.error("Abonos confirmados; error al actualizar la vista:", e);
        setError(es ? "Abonos confirmados. Recarga el expediente para actualizar la vista." :
          "Payments confirmed. Reload the patient record to refresh the view.");
      }
    } catch (e) {
      // Fallo ambiguo: no repetir automáticamente, ya que el servidor pudo hacer COMMIT.
      setRevisionNecesaria(true);
      setError((es ? "Detén los cobros y revisa el historial antes de reintentar. " :
        "Stop and review payment history before retrying. ") +
        (mensajeError(e)));
      if (confirmados.length) {
        try { await onLiquidacionConfirmada(); } catch (refreshError) {
          console.error("Error al actualizar abonos parciales:", refreshError);
        }
      }
    } finally {
      enCursoRef.current = false;
      setCobrando(false);
    }
  }

  async function liquidar() {
    if (!pacienteId || !cotizacion || !cotizacionVigente || !metodo || !fechaValida || cobrando || enCursoRef.current || revisionNecesaria) return;
    if (cotizacion.cantidad < 1) return;
    const payload = JSON.stringify({ pacienteId, metodo, moneda, fechaCobro, tipoCambio: cotizacion.tipo_cambio_confirmado, detalle: cotizacion.detalle });
    if (intentoRef.current && intentoRef.current.payload !== payload) {
      setError(es ? "Los datos cambiaron. Vuelve a preparar la cotización." : "Details changed. Prepare a new quote.");
      return;
    }
    if (!intentoRef.current) intentoRef.current = { id: crypto.randomUUID(), payload };
    const solicitudId = intentoRef.current.id;
    enCursoRef.current = true;
    setCobrando(true);
    setError("");
    try {
      const { data, error: errorRpc } = await supabase.rpc("mintos_liquidar_todo_v2", {
        p_fecha_cobro: fechaCobro,
              p_solicitud_id: solicitudId,
        p_paciente_id: pacienteId,
        p_metodo_pago: metodo,
        p_moneda: moneda,
        p_tipo_cambio_confirmado: cotizacion.tipo_cambio_confirmado,
        p_detalle: cotizacion.detalle,
      });
      if (errorRpc) throw errorRpc;
      const confirmado = data as Resultado;
      if (!confirmado || confirmado.solicitud_id !== solicitudId || confirmado.paciente_id !== pacienteId ||
        confirmado.moneda_cobro !== moneda || confirmado.cantidad_tratamientos !== cotizacion.detalle.filter((i) => i.tipo !== "cargo_adicional").length ||
        (confirmado.cantidad_cargos_adicionales ?? 0) !== cotizacion.detalle.filter((i) => i.tipo === "cargo_adicional").length ||
        (confirmado.cantidad_conceptos ?? confirmado.cantidad_tratamientos) !== cotizacion.cantidad ||
        !Array.isArray(confirmado.pagos) || confirmado.pagos.length !== cotizacion.cantidad ||
        Math.abs(Number(confirmado.total_recibido) - Number(cotizacion.total_cobro)) > 0.005 ||
        confirmado.pagos.some((p) => Number(p.saldo_original) !== 0)) {
        setRevisionNecesaria(true);
        setError(es
          ? "La operación pudo haberse registrado, pero la confirmación requiere revisión. No intentes otro cobro."
          : "The transaction may have been recorded, but its confirmation requires review. Do not create another payment.");
        return;
      }
      setResultado(confirmado);
      setRevisionNecesaria(true);
      try {
        await onLiquidacionConfirmada();
      } catch (recargaError) {
        console.error("Liquidación confirmada; error al actualizar la vista:", recargaError);
        setError(es ? "Cobro confirmado. No se pudo actualizar la vista; recarga el expediente." : "Payment confirmed. Unable to refresh the view; reload the patient record.");
      }
    } catch (e) {
      // Conservar el UUID para reintentos idénticos: una pérdida de conexión puede ocurrir después del COMMIT.
      setError(mensajeError(e));
    } finally {
      enCursoRef.current = false;
      setCobrando(false);
    }
  }

  if (!abierto) return null;
  const ocupado = cargando || cobrando;
  // La cotización en curso no debe bloquear cambios: el efecto invalida respuestas obsoletas.
  // Bloquear únicamente durante el cobro o cuando existe un intento pendiente de conciliación.
  const bloquearEdicion = cobrando || revisionNecesaria || !!intentoRef.current;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={es ? "Liquidar todo" : "Settle all balances"}>
      <div className="flex max-h-[min(90dvh,780px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
          <div><h2 className="text-2xl font-bold tracking-tight text-slate-900">{es ? "Liquidar todo" : "Settle all balances"}</h2>
            <p className="mt-1 text-sm text-slate-500">{pacienteNombre}</p></div>
          <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50" onClick={onCerrar} disabled={ocupado} aria-label={es ? "Cerrar" : "Close"}>✕</button>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-white px-5 py-6 sm:px-7">
          <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
            {(["liquidar", "abonar"] as const).map((opcion) => (
              <button key={opcion} type="button" disabled={bloquearEdicion}
                onClick={() => { setModo(opcion); setAbonos({}); setError(""); }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${modo === opcion ? "bg-white text-teal-800 shadow" : "text-slate-600"} disabled:opacity-50`}>
                {opcion === "liquidar" ? (es ? "Liquidar todo" : "Settle all") : (es ? "Abonar por concepto" : "Pay by item")}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500">{modo === "liquidar"
            ? (es ? "Se cobrarán todos los saldos pendientes." : "All outstanding balances will be paid.")
            : (es ? "Escribe el abono de cada concepto. Solo se cobrarán los importes capturados. Los cobros se registran individualmente."
              : "Enter an amount per item. Only entered amounts will be charged. Payments are recorded individually.")}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium text-slate-900">{es ? "Fecha del cobro" : "Payment date"}
              <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white text-slate-900 p-2" type="date" required max={obtenerFechaLocalMintOS()} value={fechaCobro} disabled={bloquearEdicion} onChange={(e) => setFechaCobro(e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-900">{es ? "Moneda" : "Currency"}
              <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white text-slate-900 p-2" value={moneda} disabled={bloquearEdicion} onChange={(e) => { setMoneda(e.target.value as Moneda); setCotizacion(null); }}>
                <option value="MXN">MXN</option><option value="USD">USD</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-900">{es ? "Método de pago" : "Payment method"}
              <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white text-slate-900 p-2" value={metodo} disabled={bloquearEdicion} onChange={(e) => setMetodo(e.target.value)}>
                {metodos.length === 0 && <option value="">{es ? "Sin métodos disponibles" : "No methods available"}</option>}
                {metodos.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-900">{es ? "Tipo de cambio (MXN/USD)" : "Exchange rate (MXN/USD)"}
              <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white text-slate-900 p-2" type="number" min="0.000001" max="1000000" step="0.0001" value={tipoCambio || ""} disabled={bloquearEdicion} onChange={(e) => { setTipoCambio(Number(e.target.value)); setCotizacion(null); }} />
            </label>
          </div>
          {cargando && <p role="status" className="text-sm text-slate-500">{es ? "Consultando saldos pendientes..." : "Checking outstanding balances..."}</p>}
          {cotizacion && cotizacionVigente && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 p-3 text-sm font-semibold text-slate-900">{es ? "Detalle de liquidación" : "Settlement details"} · {cotizacion.cantidad}</div>
              <div className="max-h-64 overflow-auto">
                {cotizacion.detalle.map((item) => (
                  <div key={claveDetalle(item)} className="flex items-start justify-between gap-3 border-b border-slate-200 p-3 text-sm last:border-b-0">
                    <div className="min-w-0"><p className="font-medium text-slate-900">{item.tratamiento || `#${item.tratamiento_id}`}</p>
                      <p className="text-xs text-slate-500">{item.tipo === "cargo_adicional" ? `${es ? "Cargo adicional" : "Additional charge"} #${item.cargo_id}` : `#${item.tratamiento_id}`} · {es ? "Saldo" : "Balance"}: {dinero(Number(item.saldo_original), item.moneda_precio)}</p></div>
                    {modo === "liquidar" ? (
                      <span className="shrink-0 font-semibold text-slate-900">{dinero(Number(item.monto_cobro), moneda)}</span>
                    ) : (
                      <label className="shrink-0 text-right text-xs text-slate-600">
                        {es ? "Máximo" : "Maximum"}: {dinero(Number(item.monto_cobro), moneda)}
                        <input type="number" min="0" max={Number(item.monto_cobro)} step="0.01"
                          inputMode="decimal" placeholder="0.00"
                          className="mt-1 block w-36 rounded-lg border border-slate-300 bg-white p-2 text-right text-sm text-slate-900"
                          disabled={bloquearEdicion}
                          value={abonos[claveDetalle(item)] ?? ""}
                          onChange={(e) => setAbonos((prev) => ({ ...prev, [claveDetalle(item)]: e.target.value }))} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-3 bg-slate-50 p-4 font-bold text-slate-900">
                <span>{es ? "Total a cobrar" : "Total due"}</span><span>{dinero(modo === "liquidar" ? Number(cotizacion.total_cobro) : totalAbonos, moneda)}</span>
              </div>
            </div>
          )}
          {pagosParciales.length > 0 && <p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
            {es ? "Abonos confirmados:" : "Confirmed payments:"} {pagosParciales.map((p) => `${p.tratamiento}: ${dinero(p.monto, moneda)}`).join(" · ")}
          </p>}
          {modo === "abonar" && abonosElegidos.length > 0 && !abonosValidos &&
            <p role="alert" className="text-sm text-red-600">{es
              ? "Revisa los importes: deben ser positivos, tener máximo dos decimales y no exceder el saldo."
              : "Check amounts: they must be positive, have at most two decimals, and not exceed the balance."}</p>}
          {error && <p role="alert" className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
          {resultado && <p role="status" className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 p-3 text-sm text-emerald-700">
            {es ? `Liquidación confirmada: ${resultado.cantidad_tratamientos} tratamientos, ${resultado.cantidad_cargos_adicionales ?? 0} cargos adicionales, ${dinero(Number(resultado.total_recibido), moneda)}.` :
              `Settlement confirmed: ${resultado.cantidad_tratamientos} treatments, ${resultado.cantidad_cargos_adicionales ?? 0} additional charges, ${dinero(Number(resultado.total_recibido), moneda)}.`}
          </p>}
        </div>
        <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
          <button type="button" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50" disabled={ocupado} onClick={onCerrar}>{es ? "Cerrar" : "Close"}</button>
          {!resultado && cotizacionVigente && !!cotizacion?.cantidad && !revisionNecesaria &&
            <button type="button" className="rounded-xl bg-teal-700 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50" disabled={ocupado || !metodo || !fechaValida || (modo === "abonar" && !abonosValidos)}
              onClick={() => void (modo === "liquidar" ? liquidar() : registrarAbonos())}>
              {cobrando ? (es ? "Procesando..." : "Processing...") : modo === "liquidar"
                ? (es ? "Confirmar liquidación" : "Confirm settlement")
                : (es ? "Registrar abonos" : "Record payments")}
            </button>}
        </footer>
      </div>
    </div>
  );
}
