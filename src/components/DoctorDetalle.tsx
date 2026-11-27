import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";
import { calcularComisionNeta } from "../lib/comisionNeta";

import type {
  Doctor,
} from "../types/Doctor";

import type {
  Paciente,
} from "../types/Paciente";

import type {
  Tratamiento,
} from "../types/Tratamiento";

type PagoDoctorDetalle = {
  doctor_id?: number | null;

  id?: number;

  fecha?: string;

  tratamiento_id?: number;

  moneda?: string;

  monto_original?: number;
  monto_mxn?: number;
  monto_aplicado_moneda_tratamiento?: number | null;
  es_cargo_adicional?: boolean | null;
  cargo_adicional_id?: number | null;
  tipo_cambio?: number | null;

  comision_banco?: number;

  comision_doctor_porcentaje?: number | null;

  comision_doctor_pagada?: boolean;

  comision_doctor_fecha_pago?: string | null;

  comision_doctor_metodo_pago?: string | null;

  comision_doctor_pago_moneda?: string | null;

  comision_doctor_pago_monto?: number;

};

type DoctorDetalleProps = {

  doctor: Doctor | null;

  pacientes: Paciente[];

  tratamientos: Tratamiento[];

  pagos?: PagoDoctorDetalle[];

  onClose: () => void;
  puedeLiquidar?: boolean;
  onLiquidacion?: () => Promise<void>;

};

export default function DoctorDetalle({

  doctor,

  pacientes,

  tratamientos,

  pagos = [],
  puedeLiquidar = false,
  onLiquidacion,

}: DoctorDetalleProps) {

  const { language } = useLanguage();
  const es = language === "es";
  const locale = es ? "es-MX" : "en-US";
  const t = (espanol: string, ingles: string) => es ? espanol : ingles;

  const bloqueo = useRef(false);
  const [ocupado, setOcupado] = useState(false);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [fechaPago, setFechaPago] = useState("");
  const [metodo, setMetodo] = useState("Efectivo");
  const [monedaPago, setMonedaPago] = useState<"MXN" | "USD">("MXN");
  const [tipoCambio, setTipoCambio] = useState<number | null>(null);
  const [aviso, setAviso] = useState("");
  const [confirmados, setConfirmados] = useState<Record<number, PagoDoctorDetalle>>({});
  const [semanaSeleccionada, setSemanaSeleccionada] = useState("actual");
  const [monedaPrincipal, setMonedaPrincipal] = useState<"MXN" | "USD">("MXN");
  const [monedaSecundariaActiva, setMonedaSecundariaActiva] = useState(true);

  useEffect(() => {
    let activo = true;
    const cargarMonedas = async () => {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("clave, valor")
        .in("clave", ["moneda_principal", "moneda_secundaria_activa", "tipo_cambio"]);
      if (error) {
        console.error("Error consultando monedas financieras:", error);
        return;
      }
      if (!activo) return;
      const valores = Object.fromEntries(
        (data ?? []).map(fila => [fila.clave, String(fila.valor ?? "")])
      );
      const tc = Number(valores.tipo_cambio);
      setTipoCambio(Number.isFinite(tc) && tc > 0 ? tc : null);
      setMonedaPrincipal(valores.moneda_principal === "USD" ? "USD" : "MXN");
      setMonedaSecundariaActiva(valores.moneda_secundaria_activa !== "false");
    };
    void cargarMonedas();
    return () => { activo = false; };
  }, []);

  const mostrarMXN = monedaPrincipal === "MXN" || monedaSecundariaActiva;
  const mostrarUSD = monedaPrincipal === "USD" || monedaSecundariaActiva;

  if (!doctor) {
    return null;
  }

  const formatoMonto =
    (
      monto: number
    ) =>
      monto.toLocaleString(
        locale,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

  const formatoFecha =
    (
      fecha: string
    ) => {

      if (!fecha) {

        return "—";

      }

      const fechaLocal =
        new Date(
          `${fecha}T12:00:00`
        );

      if (
        Number.isNaN(
          fechaLocal.getTime()
        )
      ) {

        return fecha;

      }

      return fechaLocal
        .toLocaleDateString(
          locale,
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

    };

  const formatoFechaHora =
    (
      fecha?: string | null
    ) => {

      if (!fecha) {
        return "—";
      }

      const fechaReal =
        new Date(fecha);

      if (
        Number.isNaN(
          fechaReal.getTime()
        )
      ) {
        return fecha;
      }

      return fechaReal
        .toLocaleString(
          locale,
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

    };

  // Semanas calendario de lunes a domingo, en la zona horaria de la clínica.
  const fechaClinica = (fecha?: string): string | null => {
    if (!fecha) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
    const instante = new Date(fecha);
    if (!Number.isFinite(instante.getTime())) return null;
    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Hermosillo", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(instante);
    const parte = (tipo: string) => partes.find(p => p.type === tipo)?.value;
    return `${parte("year")}-${parte("month")}-${parte("day")}`;
  };
  const sumarDias = (fecha: string, dias: number) => {
    const dia = new Date(`${fecha}T00:00:00Z`);
    dia.setUTCDate(dia.getUTCDate() + dias);
    return dia.toISOString().slice(0, 10);
  };
  const lunesDe = (fecha: string) => sumarDias(fecha, -((new Date(`${fecha}T00:00:00Z`).getUTCDay() + 6) % 7));
  const lunesActual = lunesDe(fechaClinica(new Date().toISOString())!);
  const lunesAnterior = sumarDias(lunesActual, -7);
  const pagosDoctor = pagos.map(pago => ({ ...pago, ...(confirmados[Number(pago.id)] ?? {}) })).filter(pago => pago.doctor_id != null && Number(pago.doctor_id) === Number(doctor.id));
  const semanas = new Set<string>([lunesActual, lunesAnterior]);
  for (const pago of pagosDoctor) {
    const fecha = fechaClinica(pago.fecha);
    if (fecha) semanas.add(lunesDe(fecha));
  }
  const inicio = semanaSeleccionada === "actual" ? lunesActual : semanaSeleccionada === "anterior" ? lunesAnterior : semanaSeleccionada;
  const fin = inicio === "todas" ? null : sumarDias(inicio, 7);
  const pagosPeriodo = pagosDoctor.filter(pago => {
    if (fin === null) return true;
    const fecha = fechaClinica(pago.fecha);
    return fecha !== null && fecha >= inicio && fecha < fin;
  });
  const idsPeriodo = new Set(pagosPeriodo.map(pago => Number(pago.tratamiento_id)));
  const etiquetaSemana = (lunes: string) => {
    const formato = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    return `${formato.format(new Date(`${lunes}T00:00:00Z`))} – ${formato.format(new Date(`${sumarDias(lunes, 6)}T00:00:00Z`))}`;
  };

  const tratamientosDoctor =
    tratamientos.filter(
      (tratamiento) =>
        (fin === null || idsPeriodo.has(Number(tratamiento.id))) &&
        (Number(tratamiento.doctor_id) === Number(doctor.id) ||
         pagos.some(pago =>
           pago.doctor_id != null &&
           Number(pago.doctor_id) === Number(doctor.id) &&
           Number(pago.tratamiento_id) === Number(tratamiento.id)
         ))
    );

  const desglose = (pago: PagoDoctorDetalle, tratamiento: Tratamiento & { tipo_cambio?: number | null }) => {
    if (calcularComisionNeta(pago, tratamiento, Number(doctor.porcentaje || 0)) === null) return null;
    const tc = pago.moneda === "USD" ? Number(pago.tipo_cambio) : 1;
    const adicional = pago.es_cargo_adicional === true;
    const proporcion = adicional ? 0 : Math.min(Number(pago.monto_aplicado_moneda_tratamiento) / Number(tratamiento.total_original), 1);
    const costo = (monto: number, moneda: string | null | undefined) => monto * (moneda === "USD" ? Number(tratamiento.tipo_cambio) : 1) * proporcion / tc;
    const laboratorio = adicional ? 0 : costo(Number(tratamiento.laboratorio ?? 0), tratamiento.moneda_laboratorio);
    const especialista = adicional ? 0 : costo(Number(tratamiento.especialista ?? 0), tratamiento.moneda_especialista);
    const banco = Number(pago.comision_banco ?? 0) / tc;
    return { laboratorio, especialista, banco, base: Math.max(0, Number(pago.monto_mxn) / tc - laboratorio - especialista - banco) };
  };

   const detalleTratamientos =
    tratamientosDoctor.map(
      (tratamiento) => {

        const porcentaje =
          Number(
            doctor.porcentaje || 0
          );

        const tratamientoFinalizado =
          tratamiento.estado ===
          "Finalizado";

        const elegible = ["Finalizado", "En proceso", "Pendiente"].includes(tratamiento.estado ?? "");
        const pagosTratamiento =
          pagosPeriodo.filter(
            (pago) =>
              Number(pago.tratamiento_id) === Number(tratamiento.id) &&
              pago.doctor_id != null &&
              Number(pago.doctor_id) === Number(doctor.id)
          );

        const pagadoMXN =
          pagosTratamiento
            .filter(
              (pago) =>
                pago.moneda === "MXN"
            )
            .reduce(
              (
                total,
                pago
              ) =>
                total +
                Number(
                  pago.monto_original || 0
                ),
              0
            );

        const pagadoUSD =
          pagosTratamiento
            .filter(
              (pago) =>
                pago.moneda === "USD"
            )
            .reduce(
              (
                total,
                pago
              ) =>
                total +
                Number(
                  pago.monto_original || 0
                ),
              0
            );

        const base = (pago: PagoDoctorDetalle) => desglose(pago, tratamiento)?.base ?? 0;
        const baseClinicaMXN = elegible ? pagosTratamiento.filter(p => p.moneda === "MXN").reduce((a,p) => a + base(p),0) : 0;
        const baseClinicaUSD = elegible ? pagosTratamiento.filter(p => p.moneda === "USD").reduce((a,p) => a + base(p),0) : 0;
        const comisionMXN = elegible ? pagosTratamiento.filter(p => p.moneda === "MXN" && !p.comision_doctor_pagada).reduce((a,p) => a + (calcularComisionNeta(p, tratamiento, porcentaje) ?? 0),0) : 0;
        const comisionUSD = elegible ? pagosTratamiento.filter(p => p.moneda === "USD" && !p.comision_doctor_pagada).reduce((a,p) => a + (calcularComisionNeta(p, tratamiento, porcentaje) ?? 0),0) : 0;

        const paciente =
          pacientes.find(
            (pacienteActual) =>
              pacienteActual.id ===
              tratamiento.paciente_id
          );

        return {

          tratamiento,

          paciente,

          pagadoMXN,

          pagadoUSD,

          baseClinicaMXN,

          baseClinicaUSD,

          comisionMXN,

          comisionUSD,

          tratamientoFinalizado,

        };

      }
    );

  /*
  |--------------------------------------------------------------------------
  | TOTALES POR MONEDA
  |--------------------------------------------------------------------------
  */

  const totalPagadoMXN =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.pagadoMXN,
      0
    );

  const totalPagadoUSD =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.pagadoUSD,
      0
    );

  const totalBaseClinicaMXN =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.baseClinicaMXN,
      0
    );

  const totalBaseClinicaUSD =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.baseClinicaUSD,
      0
    );

  const totalComisionMXN =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.comisionMXN,
      0
    );

  const totalComisionUSD =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.comisionUSD,
      0
    );

  const totalTratamientosFinalizados =
    detalleTratamientos.filter(
      (detalle) =>
        detalle.tratamientoFinalizado
    ).length;

  /*
  |--------------------------------------------------------------------------
  | HISTORIAL REAL DE COMISIONES
  |--------------------------------------------------------------------------
  |
  | Cada cobro real genera una comisión cuando el tratamiento está Finalizado.
  | Conservamos MXN y USD separados.
  |
  */

  const movimientosComision =
    pagosPeriodo
      .map(
        (pago) => {

          const tratamiento =
            tratamientosDoctor.find(
              (item) =>
                Number(item.id) ===
                Number(
                  pago.tratamiento_id
                )
            );

          if (
            pago.doctor_id == null ||
            Number(pago.doctor_id) !== Number(doctor.id) ||
            !tratamiento ||
            !["Finalizado", "En proceso", "Pendiente"].includes(tratamiento.estado ?? "")
          ) {
            return null;
          }

          const paciente =
            pacientes.find(
              (item) =>
                Number(item.id) ===
                Number(
                  tratamiento.paciente_id
                )
            );

         const porcentaje =
  pago.comision_doctor_porcentaje !==
    null &&
  pago.comision_doctor_porcentaje !==
    undefined
    ? Number(
        pago.comision_doctor_porcentaje
      )
    : Number(
        doctor.porcentaje || 0
      );

const montoCobro = Number(pago.monto_original || 0);
const calculada = calcularComisionNeta(pago, tratamiento, porcentaje);
const comisionGenerada = pago.comision_doctor_pagada && pago.comision_doctor_pago_moneda === pago.moneda
  ? Number(pago.comision_doctor_pago_monto || 0)
  : (calculada ?? 0);

          const moneda =
            pago.moneda === "USD"
              ? "USD"
              : "MXN";

          const pagada =
            pago.comision_doctor_pagada ===
            true;

          const montoPagado =
            pagada
              ? Number(
                  pago.comision_doctor_pago_monto ??
                  comisionGenerada
                )
              : 0;

          return {
            pago,
            tratamiento,
            paciente,
            moneda,
            montoCobro,
            comisionGenerada,
            pagada,
            montoPagado,
            calculada,
            desglose: desglose(pago, tratamiento),
          };

        }
      )
      .filter(
        (
          movimiento
        ): movimiento is NonNullable<
          typeof movimiento
        > =>
          movimiento !== null
      )
      .sort(
        (a, b) => {

          const fechaA =
            new Date(
              a.pago.fecha || 0
            ).getTime();

          const fechaB =
            new Date(
              b.pago.fecha || 0
            ).getTime();

          return fechaB - fechaA;

        }
      );

  const comisionPagadaMXN =
    movimientosComision
      .filter(
        (movimiento) =>
          movimiento.pagada
          &&
          (movimiento.pago.comision_doctor_pago_moneda || movimiento.moneda) ===
            "MXN"
      )
      .reduce(
        (
          total,
          movimiento
        ) =>
          total +
          movimiento.montoPagado,
        0
      );

  const comisionPagadaUSD =
    movimientosComision
      .filter(
        (movimiento) =>
          movimiento.pagada
          &&
          (movimiento.pago.comision_doctor_pago_moneda || movimiento.moneda) ===
            "USD"
      )
      .reduce(
        (
          total,
          movimiento
        ) =>
          total +
          movimiento.montoPagado,
        0
      );

  const comisionPendienteMXN =
    Math.max(
      totalComisionMXN,
      0
    );

  const comisionPendienteUSD =
    Math.max(
      totalComisionUSD,
      0
    );

  const importeLiquidacion = (monto: number | null, origen: string): number | null => {
    if (monto == null || !Number.isFinite(monto) || monto <= 0) return null;
    if (origen === monedaPago) return monto;
    if (tipoCambio == null) return null;
    const convertido = monedaPago === "MXN" ? monto * tipoCambio : monto / tipoCambio;
    const resultado = Math.round((convertido + Number.EPSILON) * 100) / 100;
    return Number.isFinite(resultado) && resultado > 0 ? resultado : null;
  };

  const liquidar = async () => {
    const movimiento = movimientosComision.find(m => m.pago.id === seleccion);
    if (bloqueo.current || !puedeLiquidar || !onLiquidacion || !movimiento || movimiento.pagada || movimiento.calculada == null || movimiento.calculada <= 0 || !fechaPago || fechaPago > fechaClinica(new Date().toISOString())! || (monedaPago === "USD" && metodo === "Transferencia")) return;
    const importe = importeLiquidacion(movimiento.calculada, movimiento.moneda);
    if (importe == null) return;
    bloqueo.current = true;
    setOcupado(true);
    setAviso("");
    try {
      const { error } = await supabase.rpc("mintos_liquidar_comision_doctor_v3", {
        p_doctor_id: doctor.id, p_moneda: monedaPago,
        p_monto: importe, p_metodo_pago: metodo,
        p_clave_idempotencia: crypto.randomUUID(), p_fecha_pago: fechaPago,
        p_pago_id: movimiento.pago.id,
      });
      if (error) throw error;
      setConfirmados(prev => ({ ...prev, [Number(movimiento.pago.id)]: {
        comision_doctor_pagada: true, comision_doctor_pago_monto: importe,
        comision_doctor_pago_moneda: monedaPago, comision_doctor_metodo_pago: metodo,
        comision_doctor_fecha_pago: fechaPago,
      }}));
      setSeleccion(null);
      setAviso(t("Comisión liquidada.", "Commission paid."));
    } catch (error) {
      console.error(error);
      setAviso(t("No se confirmó la liquidación. Verifica el estado antes de reintentar.", "Settlement not confirmed. Check status before retrying."));
      setSeleccion(null);
    } finally {
      try { await onLiquidacion(); } catch (error) {
        console.error(error);
        setAviso(t("No se pudieron actualizar los datos. Cierra y vuelve a cargar Finanzas antes de continuar.", "Could not refresh data. Close and reload Finances before continuing."));
      }
      bloqueo.current = false;
      setOcupado(false);
    }
  };

  return (

    <div
      className="
        mt-6
        space-y-6
      "
    >

      {/* =========================
          ENCABEZADO
      ========================== */}

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-6
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                flex
                items-center
                justify-center
                bg-[var(--mint-primary-soft)]
                text-[var(--mint-primary)]
                border
                border-[var(--mint-border-primary)]
                text-xl
                font-bold
                shrink-0
              "
            >

              {
                doctor.nombre
                  ?.trim()
                  .charAt(0)
                  .toUpperCase()
              }

            </div>

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-1
                "
              >

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    bg-[var(--mint-primary-soft)]
                    text-[var(--mint-primary)]
                    border
                    border-[var(--mint-border-primary)]
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                  "
                >

                  {t("Detalle de comisión", "Commission details")}

                </span>

              </div>

              <h3
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  mint-text-primary
                "
              >

                {doctor.nombre}

              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  mint-text-secondary
                "
              >

                Desglose de tratamientos,
                base clínica y comisión del doctor.

              </p>

            </div>

          </div>

          <div className="flex w-full min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center lg:w-auto lg:justify-end">
            <div className="flex w-full min-w-0 flex-col gap-1 rounded-xl bg-[#087f78] px-4 py-3 text-white shadow-sm sm:w-auto">
        <label htmlFor="doctor-detalle-semana" className="text-xs font-bold uppercase tracking-wide text-white">
          {t("Período", "Period")}
        </label>
        <select id="doctor-detalle-semana" value={semanaSeleccionada}
          onChange={event => setSemanaSeleccionada(event.target.value)}
          className="min-h-11 w-full max-w-full rounded-lg border border-white/40 bg-white px-3 py-2 text-sm font-semibold text-[#164e55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto">
          <option value="actual">{t("Semana actual", "Current week")} · {etiquetaSemana(lunesActual)}</option>
          <option value="anterior">{t("Semana anterior", "Last week")} · {etiquetaSemana(lunesAnterior)}</option>
          {[...semanas].sort().reverse().filter(semana => semana !== lunesActual && semana !== lunesAnterior).map(semana => (
            <option key={semana} value={semana}>{etiquetaSemana(semana)}</option>
          ))}
          <option value="todas">{t("Todas las semanas", "All weeks")}</option>
        </select>
        <p className="text-xs text-white/90">{t("Por fecha de cobro; estado de liquidación actual.", "By collection date; current settlement status.")}</p>
      </div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-3
                rounded-xl
                bg-[var(--mint-bg-soft)]
                border
                border-[var(--mint-border)]
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    font-bold
                    mint-text-muted
                  "
                >

                  {t("Comisión", "Commission")}

                </p>

                <p
                  className="
                    text-lg
                    font-bold
                    text-[var(--mint-accent)]
                  "
                >

                  {
                    Number(
                      doctor.porcentaje || 0
                    )
                  }
                  %

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          KPIS
      ========================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              h-1
              bg-[var(--mint-primary)]
            "
          />

          <div
            className="
              p-5
            "
          >

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.1em]
                font-bold
                mint-text-muted
              "
            >

              {t("Tratamientos", "Treatments")}

            </p>

            <h3
              className="
                text-3xl
                font-bold
                mt-2
                text-[var(--mint-primary)]
              "
            >

              {
                tratamientosDoctor.length
              }

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {fin === null ? t("Vinculados al doctor", "Assigned to this doctor") : t("Con cobros en el período", "With payments in the period")}

            </p>

          </div>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              h-1
              bg-[var(--mint-info)]
            "
          />

          <div
            className="
              p-5
            "
          >

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.1em]
                font-bold
                mint-text-muted
              "
            >

              {t("Total cobrado", "Total collected")}

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-info)]
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-1
                "
              >

                {mostrarMXN && (
<span>
                  $
                  {
                    formatoMonto(
                      totalPagadoMXN
                    )
                  }
                  {" "}
                  MXN
                </span>
)}

                {mostrarUSD && (
<span>
                  $
                  {
                    formatoMonto(
                      totalPagadoUSD
                    )
                  }
                  {" "}
                  USD
                </span>
)}

              </div>

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {t("Pagos reales registrados", "Actual payments recorded")}

            </p>

          </div>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              h-1
              bg-[var(--mint-accent)]
            "
          />

          <div
            className="
              p-5
            "
          >

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.1em]
                font-bold
                mint-text-muted
              "
            >

              {t("Base clínica", "Clinic base")}

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-accent)]
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-1
                "
              >

                {mostrarMXN && (
<span>
                  $
                  {
                    formatoMonto(
                      totalBaseClinicaMXN
                    )
                  }
                  {" "}
                  MXN
                </span>
)}

                {mostrarUSD && (
<span>
                  $
                  {
                    formatoMonto(
                      totalBaseClinicaUSD
                    )
                  }
                  {" "}
                  USD
                </span>
)}

              </div>

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {t("Cobros menos costos proporcionales y banco", "Collections less proportional costs and bank fees")}

            </p>

          </div>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              h-1
              bg-[var(--mint-success)]
            "
          />

          <div
            className="
              p-5
            "
          >

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.1em]
                font-bold
                mint-text-muted
              "
            >

              {t("Comisión doctor", "Doctor commission")}

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-success)]
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-1
                "
              >

                {mostrarMXN && (
<span>
                  $
                  {
                    formatoMonto(
                      totalComisionMXN
                    )
                  }
                  {" "}
                  MXN
                </span>
)}

                {mostrarUSD && (
<span>
                  $
                  {
                    formatoMonto(
                      totalComisionUSD
                    )
                  }
                  {" "}
                  USD
                </span>
)}

              </div>

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {t("Comisión pendiente", "Outstanding commission")}

            </p>

          </div>

        </div>

      </div>

      {/* =========================
          DESGLOSE DE BASE CLÍNICA
      ========================== */}

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-[var(--mint-border)]
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.12em]
                font-bold
                text-[var(--mint-primary)]
                mb-1
              "
            >

              {t("Movimientos clínicos", "Clinical activity")}

            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >

              {t("Detalle de tratamientos", "Treatment details")}

            </h3>

          </div>

          <div
            className="
              inline-flex
              items-center
              px-3
              py-2
              rounded-lg
              bg-[var(--mint-bg-soft)]
              text-xs
              font-semibold
              mint-text-secondary
            "
          >

            {
              tratamientosDoctor.length
            }
            {" "}
            {
              tratamientosDoctor.length ===
              1

                ? t("tratamiento", "treatment")

                : t("tratamientos", "treatments")
            }

          </div>

        </div>

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
                    p-4
                    text-left
                  "
                >

                  {t("Fecha tratamiento", "Treatment date")}

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {t("Paciente", "Patient")}

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {t("Tratamiento", "Treatment")}

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  {t("Pagado", "Paid")}

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  {t("Base clínica", "Clinic base")}

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  {t("Comisión", "Commission")}

                </th>

              </tr>

            </thead>

            <tbody>

              {

                detalleTratamientos.length ===
                0

                  ? (

                    <tr>

                      <td
                        colSpan={6}
                        className="
                          px-6
                          py-12
                          text-center
                          mint-text-muted
                        "
                      >

                        {t("No hay tratamientos para este doctor en el período seleccionado.", "No treatments for this doctor in the selected period.")}

                      </td>

                    </tr>

                  )

                  : detalleTratamientos.map(
                    ({
                      tratamiento,
                      paciente,
                      pagadoMXN,
                      pagadoUSD,
                      baseClinicaMXN,
                      baseClinicaUSD,
                      comisionMXN,
                      comisionUSD,
                    }) => (

                      <tr
                        key={
                          tratamiento.id
                        }
                        className="
                          mint-table-row
                        "
                      >

                        <td
                          className="
                            p-4
                            whitespace-nowrap
                            mint-text-secondary
                          "
                        >

                          {
                            formatoFecha(
                              tratamiento.fecha
                            )
                          }

                        </td>

                        <td
                          className="
                            p-4
                          "
                        >

                          <p
                            className="
                              font-semibold
                              mint-text-primary
                            "
                          >

                            {
                              paciente?.nombre ||
                              t("Sin paciente", "No patient")
                            }

                          </p>

                        </td>

                        <td
                          className="
                            p-4
                            mint-text-secondary
                          "
                        >

                          {
                            tratamiento.tratamiento
                          }

                        </td>

                        <td
                          className="
                            p-4
                            text-right
                            whitespace-nowrap
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              items-end
                              gap-1
                            "
                          >

                            {mostrarMXN && (
<span
                              className="
                                font-semibold
                                mint-text-primary
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  pagadoMXN
                                )
                              }
                              {" "}
                              MXN
                            </span>
)}

                            {mostrarUSD && (
<span
                              className="
                                text-xs
                                mint-text-muted
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  pagadoUSD
                                )
                              }
                              {" "}
                              USD
                            </span>
)}

                          </div>

                        </td>

                        <td
                          className="
                            p-4
                            text-right
                            whitespace-nowrap
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              items-end
                              gap-1
                            "
                          >

                            {mostrarMXN && (
<span
                              className="
                                font-bold
                                text-[var(--mint-info)]
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  baseClinicaMXN
                                )
                              }
                              {" "}
                              MXN
                            </span>
)}

                            {mostrarUSD && (
<span
                              className="
                                text-xs
                                mint-text-muted
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  baseClinicaUSD
                                )
                              }
                              {" "}
                              USD
                            </span>
)}

                          </div>

                        </td>

                        <td
                          className="
                            p-4
                            text-right
                            whitespace-nowrap
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              items-end
                              gap-1
                            "
                          >

                            {mostrarMXN && (
<span
                              className="
                                font-bold
                                text-[var(--mint-success)]
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  comisionMXN
                                )
                              }
                              {" "}
                              MXN
                            </span>
)}

                            {mostrarUSD && (
<span
                              className="
                                text-xs
                                mint-text-muted
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  comisionUSD
                                )
                              }
                              {" "}
                              USD
                            </span>
)}

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

      {/* =========================
          HISTORIAL DE COMISIONES
      ========================== */}

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-[var(--mint-border)]
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-4
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.12em]
                font-bold
                text-[var(--mint-primary)]
                mb-1
              "
            >
              {t("Historial financiero", "Financial history")}
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {t("Comisiones por cobro", "Commissions per payment")}
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {t("Cada cobro real genera su comisión proporcional.", "Each actual payment generates its proportional commission.")}
            </p>

          </div>

          <div
            className="
              grid
              grid-cols-2
              lg:grid-cols-4
              gap-2
            "
          >

            {mostrarMXN && (
<div
              className="
                rounded-xl
                border
                border-[var(--mint-danger-border)]
                bg-[var(--mint-danger-bg)]
                px-3
                py-2
              "
            >
              <p className="text-[10px] uppercase font-bold text-[var(--mint-danger)]">
                {t("Pendiente MXN", "Pending MXN")}
              </p>
              <p className="font-bold text-[var(--mint-danger)]">
                $
                {
                  formatoMonto(
                    comisionPendienteMXN
                  )
                }
              </p>
            </div>
)}

            {mostrarMXN && (
<div
              className="
                rounded-xl
                border
                border-[var(--mint-success-border)]
                bg-[var(--mint-success-bg)]
                px-3
                py-2
              "
            >
              <p className="text-[10px] uppercase font-bold text-[var(--mint-success)]">
                {t("Pagado MXN", "Paid MXN")}
              </p>
              <p className="font-bold text-[var(--mint-success)]">
                $
                {
                  formatoMonto(
                    comisionPagadaMXN
                  )
                }
              </p>
            </div>
)}

            {mostrarUSD && (
<div
              className="
                rounded-xl
                border
                border-[var(--mint-warning-border)]
                bg-[var(--mint-warning-bg)]
                px-3
                py-2
              "
            >
              <p className="text-[10px] uppercase font-bold text-[var(--mint-warning)]">
                {t("Pendiente USD", "Pending USD")}
              </p>
              <p className="font-bold text-[var(--mint-warning)]">
                $
                {
                  formatoMonto(
                    comisionPendienteUSD
                  )
                }
              </p>
            </div>
)}

            {mostrarUSD && (
<div
              className="
                rounded-xl
                border
                border-[var(--mint-border-primary)]
                bg-[var(--mint-primary-soft)]
                px-3
                py-2
              "
            >
              <p className="text-[10px] uppercase font-bold text-[var(--mint-primary)]">
                {t("Pagado USD", "Paid USD")}
              </p>
              <p className="font-bold text-[var(--mint-primary)]">
                $
                {
                  formatoMonto(
                    comisionPagadaUSD
                  )
                }
              </p>
            </div>
)}

          </div>

        </div>

        {aviso && <p role="status" className="p-4 mint-text-primary">{aviso}</p>}
        <div className="overflow-x-auto">

          <table className="mint-table w-full text-sm">

            <thead className="mint-table-head">
              <tr>

                <th className="p-4 text-left">
                  {t("Fecha cobro", "Payment date")}
                </th>

                <th className="p-4 text-left">
                  {t("Paciente", "Patient")}
                </th>

                <th className="p-4 text-left">
                  {t("Tratamiento", "Treatment")}
                </th>

                <th className="p-4 text-right">
                  {t("Cobro", "Payment")}
                </th>

                <th className="p-4 text-right">
                  {t("Comisión", "Commission")}
                </th>

                <th className="p-4 text-center">
                  {t("Estado", "Status")}
                </th>

                <th className="p-4 text-left">
                  {t("Pago comisión", "Commission payment")}
                </th>

              </tr>
            </thead>

            <tbody>

              {
                movimientosComision.length ===
                0

                  ? (

                    <tr>
                      <td
                        colSpan={7}
                        className="
                          px-6
                          py-12
                          text-center
                          mint-text-muted
                        "
                      >
                        No hay comisiones generadas
                        para este doctor en el período seleccionado.
                      </td>
                    </tr>

                  )

                  : movimientosComision.map(
                      (
                        movimiento
                      ) => (

                        <tr
                          key={
                            movimiento.pago.id
                            ??
                            `${movimiento.tratamiento.id}-${movimiento.pago.fecha}`
                          }
                          className="mint-table-row"
                        >

                          <td
                            className="
                              p-4
                              whitespace-nowrap
                              mint-text-secondary
                            "
                          >
                            {
                              formatoFechaHora(
                                movimiento.pago.fecha
                              )
                            }
                          </td>

                          <td className="p-4">
                            <p className="font-semibold mint-text-primary">
                              {
                                movimiento.paciente?.nombre ||
                                "Sin paciente"
                              }
                            </p>
                          </td>

                          <td className="p-4">
                            <p className="font-semibold mint-text-primary">
                              {
                                movimiento.tratamiento.tratamiento ||
                                "Tratamiento"
                              }
                            </p>
                          </td>

                          <td
                            className="
                              p-4
                              text-right
                              whitespace-nowrap
                            "
                          >
                            <span className="font-semibold mint-text-primary">
                              $
                              {
                                formatoMonto(
                                  movimiento.montoCobro
                                )
                              }
                              {" "}
                              {
                                movimiento.moneda
                              }
                            </span>
                          </td>

                          <td
                            className="
                              p-4
                              text-right
                              whitespace-nowrap
                            "
                          >
                            <span className="font-bold text-[var(--mint-accent)]">
                              $
                              {
                                movimiento.pagada && movimiento.pago.comision_doctor_pago_moneda !== movimiento.moneda
                                  ? "—"
                                  : formatoMonto(movimiento.comisionGenerada)
                              }
                              {" "}
                              {
                                movimiento.moneda
                              }
                            </span>
                            {movimiento.calculada === null && !movimiento.pagada && <p className="text-xs text-[var(--mint-danger)]">{t("Datos incompletos", "Incomplete data")}</p>}
                            {movimiento.desglose && !movimiento.pagada && <div className="text-xs mint-text-muted mt-1">
                              {([[t("Banco", "Bank"), movimiento.desglose.banco], [t("Laboratorio", "Lab"), movimiento.desglose.laboratorio], [t("Especialista", "Specialist"), movimiento.desglose.especialista], [t("Base neta", "Net base"), movimiento.desglose.base]] as const).map(([label, monto]) => <p key={label}>{label}: ${formatoMonto(monto)} {movimiento.moneda}</p>)}
                            </div>}
                          </td>

                          <td className="p-4 text-center">
                            <input type="checkbox" className="h-5 w-5 accent-[#087f78]" aria-label={t("Liquidar comisión", "Pay commission")}
                              checked={movimiento.pagada || seleccion === movimiento.pago.id}
                              disabled={movimiento.pagada || !puedeLiquidar || !onLiquidacion || ocupado || !movimiento.pago.id || movimiento.calculada == null || movimiento.calculada <= 0}
                              onChange={event => { setSeleccion(event.target.checked ? movimiento.pago.id! : null); setFechaPago(fechaClinica(new Date().toISOString())!); setMetodo("Efectivo"); setMonedaPago(movimiento.moneda === "USD" ? "USD" : "MXN"); }} />
                            <div className="mt-1">

                            {
                              movimiento.pagada

                                ? (
                                  <span
                                    className="
                                      inline-flex
                                      px-3
                                      py-1
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      bg-[var(--mint-success-bg)]
                                      text-[var(--mint-success)]
                                      border
                                      border-[var(--mint-success-border)]
                                    "
                                  >
                                    {t("Pagado", "Paid")}
                                  </span>
                                )

                                : (
                                  <span
                                    className="
                                      inline-flex
                                      px-3
                                      py-1
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      bg-[var(--mint-danger-bg)]
                                      text-[var(--mint-danger)]
                                      border
                                      border-[var(--mint-danger-border)]
                                    "
                                  >
                                    {t("Pendiente", "Pending")}
                                  </span>
                                )
                            }

                          </div>
                          </td>

                          <td className="p-4">
                            {seleccion === movimiento.pago.id && !movimiento.pagada && (
                              <div className="grid gap-2 min-w-40 mb-2">
                                <label>{t("Fecha de pago", "Payment date")}<input type="date" className="mint-input w-full" value={fechaPago} max={fechaClinica(new Date().toISOString())!} disabled={ocupado} onChange={e => setFechaPago(e.target.value)} /></label>
                                <label>{t("Moneda de pago", "Payment currency")}
                                  <select className="mint-input w-full" value={monedaPago} disabled={ocupado} onChange={e => { const moneda = e.target.value === "USD" ? "USD" : "MXN"; setMonedaPago(moneda); if (moneda === "USD") setMetodo("Efectivo"); }}>
                                    <option value="MXN">MXN</option>
                                    <option value="USD">USD</option>
                                  </select>
                                </label>
                                <select aria-label={t("Método de pago", "Payment method")} className="mint-input" value={metodo} disabled={ocupado} onChange={e => setMetodo(e.target.value)}>
                                  <option value="Efectivo">{t("Efectivo", "Cash")}</option>
                                  {monedaPago === "MXN" && <option value="Transferencia">{t("Transferencia", "Transfer")}</option>}
                                </select>
                                {monedaPago !== movimiento.moneda && <p className="text-xs mint-text-muted">{tipoCambio == null ? t("Tipo de cambio no disponible", "Exchange rate unavailable") : `1 USD = ${tipoCambio} MXN`}</p>}
                                <button type="button" className="rounded-lg bg-[#087f78] px-3 py-2 text-white font-semibold disabled:opacity-50" disabled={ocupado || !fechaPago || importeLiquidacion(movimiento.calculada, movimiento.moneda) == null} onClick={() => void liquidar()}>{ocupado ? t("Registrando…", "Saving…") : t("Confirmar pago", "Confirm payment")} · ${formatoMonto(importeLiquidacion(movimiento.calculada, movimiento.moneda) ?? 0)} {monedaPago}</button>
                              </div>
                            )}
                            {
                              movimiento.pagada

                                ? (

                                  <div>
                                    <p className="font-semibold mint-text-primary">
                                      {
                                        movimiento.pago
                                          .comision_doctor_metodo_pago ||
                                        "Registrado"
                                      }
                                    </p>

                                    <p className="text-xs mint-text-muted mt-1">
                                      $
                                      {
                                        formatoMonto(
                                          movimiento.montoPagado
                                        )
                                      }
                                      {" "}
                                      {
                                        movimiento.pago
                                          .comision_doctor_pago_moneda ||
                                        movimiento.moneda
                                      }
                                    </p>

                                    <p className="text-xs mint-text-muted mt-1">
                                      {
                                        formatoFechaHora(
                                          movimiento.pago
                                            .comision_doctor_fecha_pago
                                        )
                                      }
                                    </p>
                                  </div>

                                )

                                : (

                                  <span className="text-xs mint-text-muted">
                                    {t("Sin liquidar", "Unpaid")}
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

      {/* =========================
          RESUMEN DEL CÁLCULO
      ========================== */}

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-[var(--mint-border)]
          "
        >

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.12em]
              font-bold
              text-[var(--mint-primary)]
              mb-1
            "
          >

            {t("Cálculo", "Calculation")}

          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >

            {t("Resumen de comisión", "Commission summary")}

          </h3>

        </div>

        <div
          className="
            p-6
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-4
              gap-4
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-4
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >

                {t("Total cobrado", "Total collected")}

              </p>

              <div className="mt-2 flex flex-col gap-1 text-xl font-bold mint-text-primary">


                {mostrarMXN && (


                  <span className="block whitespace-nowrap">${formatoMonto(totalPagadoMXN)} MXN</span>


                )}


                {mostrarUSD && (


                  <span className="block whitespace-nowrap">${formatoMonto(totalPagadoUSD)} USD</span>


                )}


              </div>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-4
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >

                {t("Tratamientos finalizados", "Completed treatments")}

              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-[var(--mint-danger)]
                "
              >

                {
                  totalTratamientosFinalizados
                }

              </p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-4
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >

                {t("Base clínica", "Clinic base")}

              </p>

              <div className="mt-2 flex flex-col gap-1 text-xl font-bold text-[var(--mint-info)]">


                {mostrarMXN && (


                  <span className="block whitespace-nowrap">${formatoMonto(totalBaseClinicaMXN)} MXN</span>


                )}


                {mostrarUSD && (


                  <span className="block whitespace-nowrap">${formatoMonto(totalBaseClinicaUSD)} USD</span>


                )}


              </div>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-success-border)]
                bg-[var(--mint-success-bg)]
                p-4
              "
            >

              <p
                className="
                  text-xs
                  text-[var(--mint-success)]
                "
              >

                Comisión
                {" "}
                {
                  Number(
                    doctor.porcentaje || 0
                  )
                }
                %

              </p>

              <div className="mt-2 flex flex-col gap-1 text-xl font-bold text-[var(--mint-success)]">


                {mostrarMXN && (


                  <span className="block whitespace-nowrap">${formatoMonto(totalComisionMXN)} MXN</span>


                )}


                {mostrarUSD && (


                  <span className="block whitespace-nowrap">${formatoMonto(totalComisionUSD)} USD</span>


                )}


              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}
