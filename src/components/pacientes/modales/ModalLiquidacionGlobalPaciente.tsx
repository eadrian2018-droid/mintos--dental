import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Moneda = "MXN" | "USD";
type Detalle = {
  tratamiento_id: number;
  tratamiento: string;
  moneda_precio: Moneda;
  saldo_original: number;
  monto_cobro: number;
};
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

export default function ModalLiquidacionGlobalPaciente({
  abierto, pacienteId, pacienteNombre, es, onCerrar, onLiquidacionConfirmada,
}: Props) {
  const [moneda, setMoneda] = useState<Moneda>("MXN");
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
  const secuenciaRef = useRef(0);

  // Reiniciar únicamente al cambiar de paciente o al abrir una operación nueva.
  useEffect(() => {
    if (!abierto) return;
    setConfigLista(false);
    setMoneda("MXN");
    setMetodo("");
    setCotizacion(null);
    setError("");
    setResultado(null);
    setRevisionNecesaria(false);
    intentoRef.current = null;
    const secuencia = ++secuenciaRef.current;
    void (async () => {
      const [config, cambio] = await Promise.all([
        supabase.from("configuracion_pagos").select("metodo").eq("activo", true),
        supabase.from("configuracion_finanzas").select("valor").eq("clave", "tipo_cambio").maybeSingle(),
      ]);
      if (secuencia !== secuenciaRef.current) return;
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
    return () => { ++secuenciaRef.current; };
  }, [abierto, pacienteId, es]);

  const cotizacionVigente = !!cotizacion && cotizacion.moneda_cobro === moneda &&
    cotizacion.tipo_cambio_confirmado === (tipoCambio > 0 ? tipoCambio : null);

  // Cotizar automáticamente al abrir y al modificar moneda o tipo de cambio.
  // El identificador de secuencia descarta respuestas obsoletas de solicitudes anteriores.
  useEffect(() => {
    if (!abierto || !configLista || !pacienteId || revisionNecesaria || intentoRef.current || enCursoRef.current) return;
    const secuencia = ++secuenciaRef.current;
    const monedaActual = moneda;
    const cambioActual = tipoCambio > 0 ? tipoCambio : null;
    setCotizacion(null);
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
          if (secuencia !== secuenciaRef.current) return;
          if (errorRpc) throw errorRpc;
          const cot = data as Cotizacion;
          if (!cot || !Array.isArray(cot.detalle) || !Number.isFinite(Number(cot.total_cobro)) ||
            cot.cantidad !== cot.detalle.length || cot.paciente_id !== pacienteId ||
            cot.moneda_cobro !== monedaActual || cot.tipo_cambio_confirmado !== cambioActual) {
            throw new Error(es ? "La cotización recibida no es válida." : "The quote received is invalid.");
          }
          setCotizacion(cot);
        } catch (e) {
          if (secuencia === secuenciaRef.current) setError(e instanceof Error ? e.message : String(e));
        } finally {
          if (secuencia === secuenciaRef.current) setCargando(false);
        }
      })();
    }, 250);
    return () => {
      window.clearTimeout(temporizador);
      ++secuenciaRef.current;
    };
  }, [abierto, configLista, pacienteId, moneda, tipoCambio, es, revisionNecesaria]);

  async function liquidar() {
    if (!pacienteId || !cotizacion || !cotizacionVigente || !metodo || cobrando || enCursoRef.current || revisionNecesaria) return;
    if (cotizacion.cantidad < 1) return;
    const payload = JSON.stringify({ pacienteId, metodo, moneda, tipoCambio: cotizacion.tipo_cambio_confirmado, detalle: cotizacion.detalle });
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
      const { data, error: errorRpc } = await supabase.rpc("mintos_liquidar_todo_v1", {
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
        confirmado.moneda_cobro !== moneda || confirmado.cantidad_tratamientos !== cotizacion.cantidad ||
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
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      enCursoRef.current = false;
      setCobrando(false);
    }
  }

  if (!abierto) return null;
  const ocupado = cargando || cobrando;
  const bloquearEdicion = ocupado || revisionNecesaria || !!intentoRef.current;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={es ? "Liquidar todo" : "Settle all balances"}>
      <div className="flex max-h-[min(90dvh,780px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
          <div><h2 className="text-2xl font-bold tracking-tight text-slate-900">{es ? "Liquidar todo" : "Settle all balances"}</h2>
            <p className="mt-1 text-sm text-slate-500">{pacienteNombre}</p></div>
          <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50" onClick={onCerrar} disabled={ocupado} aria-label={es ? "Cerrar" : "Close"}>✕</button>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-white px-5 py-6 sm:px-7">
          <p className="text-sm text-slate-500">{es
            ? "Se cobrarán todos los tratamientos con saldo pendiente. No se permiten pagos parciales en esta operación."
            : "Every outstanding treatment will be paid in full. Partial payments are not available in this operation."}</p>
          <div className="grid gap-3 sm:grid-cols-3">
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
                  <div key={item.tratamiento_id} className="flex items-start justify-between gap-3 border-b border-slate-200 p-3 text-sm last:border-b-0">
                    <div className="min-w-0"><p className="font-medium text-slate-900">{item.tratamiento || `#${item.tratamiento_id}`}</p>
                      <p className="text-xs text-slate-500">#{item.tratamiento_id} · {es ? "Saldo" : "Balance"}: {dinero(Number(item.saldo_original), item.moneda_precio)}</p></div>
                    <span className="shrink-0 font-semibold text-slate-900">{dinero(Number(item.monto_cobro), moneda)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-3 bg-slate-50 p-4 font-bold text-slate-900">
                <span>{es ? "Total a cobrar" : "Total due"}</span><span>{dinero(Number(cotizacion.total_cobro), moneda)}</span>
              </div>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
          {resultado && <p role="status" className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 p-3 text-sm text-emerald-700">
            {es ? `Liquidación confirmada: ${resultado.cantidad_tratamientos} tratamientos, ${dinero(Number(resultado.total_recibido), moneda)}.` :
              `Settlement confirmed: ${resultado.cantidad_tratamientos} treatments, ${dinero(Number(resultado.total_recibido), moneda)}.`}
          </p>}
        </div>
        <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
          <button type="button" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50" disabled={ocupado} onClick={onCerrar}>{es ? "Cerrar" : "Close"}</button>
          {!resultado && cotizacionVigente && !!cotizacion?.cantidad && !revisionNecesaria &&
            <button type="button" className="rounded-xl bg-teal-700 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50" disabled={ocupado || !metodo} onClick={() => void liquidar()}>
              {cobrando ? (es ? "Procesando..." : "Processing...") : (es ? "Confirmar liquidación" : "Confirm settlement")}
            </button>}
        </footer>
      </div>
    </div>
  );
}
