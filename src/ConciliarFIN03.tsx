import { useState } from "react";
import { supabase } from "./lib/supabase";

type Resultado = {
  tratamiento_id: number;
  paciente_id: number;
  pagado_original: number;
  resta_original: number;
  conciliado_por: string;
};

export default function ConciliarFIN03() {
  const [ejecutando, setEjecutando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [completado, setCompletado] = useState(false);

  async function ejecutar() {
    if (ejecutando || completado) return;
    if (!window.confirm("¿Confirmas la conciliación única del tratamiento 116?")) return;

    setEjecutando(true);
    setResultado(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error("No hay una sesión autenticada válida.");
      }

      const { data, error } = await supabase.rpc("mintos_conciliar_residuo_fin03_116");
      if (error) throw error;

      const respuesta = data as Resultado;
      setResultado(JSON.stringify(respuesta, null, 2));
      setCompletado(true);
    } catch (error: unknown) {
      setResultado(error instanceof Error ? error.message : String(error));
    } finally {
      setEjecutando(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Conciliación FIN03 · Tratamiento 116</h1>
      <p className="mt-2 text-sm text-slate-600">
        Operación administrativa temporal. Corrige únicamente el residuo de $0.04 MXN.
        La función de Supabase valida los saldos y registra la auditoría.
      </p>
      <button
        type="button"
        disabled={ejecutando || completado}
        onClick={ejecutar}
        className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ejecutando ? "Conciliando…" : completado ? "Conciliación ejecutada" : "Ejecutar conciliación"}
      </button>
      {resultado && <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-100 p-4 text-sm">{resultado}</pre>}
    </main>
  );
}
