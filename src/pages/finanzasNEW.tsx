import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import { createPortal } from "react-dom";

import Gastos
  from "../components/finanzas/Gastos";

import Resumen
  from "../components/finanzas/Resumen";

import Cobros
  from "../components/finanzas/Cobros";

import Comisiones
  from "../components/finanzas/Comisiones";

import Reportes
  from "../components/finanzas/Reportes";

import CierreMensual
  from "../components/finanzas/CierreMensual";

import DoctorDetalle
  from "../components/DoctorDetalle";

import usePeriodo
  from "../hooks/usePeriodo";

import useIndicadores
  from "../hooks/useIndicadores";

import useFinanzas
  from "../hooks/useFinanzas";

import { useAuth }
  from "../context/AuthContext";

import { useLanguage }
  from "../context/LanguageContext";

import type {
  Doctor,
} from "../types/Doctor";

type SeccionFinanzas =
  | "resumen"
  | "cobros"
  | "gastos"
  | "comisiones"
  | "reportes"
  | "cierre";

type PeriodoFinanzas =
  | "semana"
  | "semana_pasada"
  | "mes"
  | "anio"
  | "historico";

export default function Finanzas() {

  const location =
    useLocation();

  const {
    perfil,
    permisos,
  } = useAuth();

  const { language } = useLanguage();
  const es = language === "es";

  const esAdmin =
    perfil?.rol === "admin";

  const puedeVerResumen =
    esAdmin ||
    permisos?.ver_resumen_financiero === true;

  const puedeVerCobros =
    esAdmin ||
    permisos?.registrar_cobros === true ||
    permisos?.anular_cobros === true;

  const puedeVerGastos =
    esAdmin ||
    permisos?.registrar_gastos === true ||
    permisos?.anular_gastos === true;

  const puedeVerComisiones =
    esAdmin ||
    permisos?.ver_comisiones === true;

  const puedeVerReportes =
    esAdmin ||
    permisos?.ver_utilidades === true;

  const puedeVerCierre =
    esAdmin;

  const finanzas =
    useFinanzas();

  const [
    seccionActiva,
    setSeccionActiva,
  ] = useState<SeccionFinanzas>(
    "resumen"
  );

  useEffect(() => {

    const parametros =
      new URLSearchParams(
        location.search
      );

    const seccion =
      parametros.get(
        "seccion"
      );

    if (seccion === "cobros" && puedeVerCobros) {
      setSeccionActiva("cobros");
      return;
    }

    if (seccion === "gastos" && puedeVerGastos) {
      setSeccionActiva("gastos");
      return;
    }

    if (seccion === "comisiones" && puedeVerComisiones) {
      setSeccionActiva("comisiones");
      return;
    }

    if (seccion === "reportes" && puedeVerReportes) {
      setSeccionActiva("reportes");
      return;
    }

    if (seccion === "cierre" && puedeVerCierre) {
      setSeccionActiva("cierre");
      return;
    }

    if (puedeVerResumen) {
      setSeccionActiva("resumen");
      return;
    }

    if (puedeVerCobros) {
      setSeccionActiva("cobros");
      return;
    }

    if (puedeVerGastos) {
      setSeccionActiva("gastos");
      return;
    }

    if (puedeVerComisiones) {
      setSeccionActiva("comisiones");
      return;
    }

    if (puedeVerReportes) {
      setSeccionActiva("reportes");
      return;
    }

    if (puedeVerCierre) {
      setSeccionActiva("cierre");
    }

  }, [
    location.search,
    puedeVerResumen,
    puedeVerCobros,
    puedeVerGastos,
    puedeVerComisiones,
    puedeVerReportes,
    puedeVerCierre,
  ]);

  const [
    periodo,
    setPeriodo,
  ] = useState<PeriodoFinanzas>(
    "semana"
  );

  const {

    tratamientos,

    pacientes,

    gastos,

    pagos,

    doctores,

    fechaGasto,
    setFechaGasto,

    conceptoGasto,
    setConceptoGasto,

    categoriaGasto,
    setCategoriaGasto,

    montoGasto,
    setMontoGasto,

    monedaGasto,
    setMonedaGasto,

    metodoPagoGasto,
    setMetodoPagoGasto,

    notasGasto,
    setNotasGasto,

    guardarGasto,

    eliminarGasto,

  } = finanzas;

  const [
    doctorDetalle,
    setDoctorDetalle,
  ] = useState<Doctor | null>(
    null
  );

  const [
    _mostrarDetalleDoctor,
    setMostrarDetalleDoctor,
  ] = useState(
    false
  );

  // Cierra el detalle al cambiar de sección o de ruta.
  useEffect(() => {
    setDoctorDetalle(null);
    setMostrarDetalleDoctor(false);
  }, [location.pathname, location.search]);

  // El modal mantiene su propio desplazamiento y permite cerrar con Escape.
  useEffect(() => {
    if (!doctorDetalle) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDoctorDetalle(null);
        setMostrarDetalleDoctor(false);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [doctorDetalle]);

  const cerrarDetalleDoctor = () => {
    setDoctorDetalle(null);
    setMostrarDetalleDoctor(false);
  };

  const {

    lunesSemana,

    domingoSemana,

    fechaDentroPeriodo,

    lunesSemanaPasada,

    domingoSemanaPasada,

    tratamientosFiltrados,

    gastosFiltrados,

  } = usePeriodo({

    // El cierre mensual siempre utiliza el mes actual.
    periodo: seccionActiva === "cierre" ? "mes" : periodo,

    tratamientos,

    gastos,

  });

  const cargosDelPeriodo = finanzas.cargosAdicionales.filter((cargo) =>
    fechaDentroPeriodo(cargo.creado_at)
  );

  const resumenCargos = (["MXN", "USD"] as const).map((moneda) => ({
    moneda,
    ...cargosDelPeriodo.filter((cargo) => cargo.moneda === moneda).reduce(
      (total, cargo) => ({
        produccion: total.produccion + Math.round(cargo.total_cargo * 100),
        pagado: total.pagado + Math.round(cargo.total_pagado * 100),
        pendiente: total.pendiente + Math.round(cargo.saldo_pendiente * 100),
      }), { produccion: 0, pagado: 0, pendiente: 0 }
    ),
  }));

  const mostrarResumenCargos =
    (seccionActiva === "resumen" && puedeVerResumen) ||
    (seccionActiva === "reportes" && puedeVerReportes);

  const seccionCargosAdicionales = (
    mostrarResumenCargos && (
          <section className="mb-6 rounded-2xl border border-[var(--mint-border-teal)] bg-[var(--mint-surface)] p-5">
            <h2 className="text-lg font-bold mint-text-primary">
              {es ? "Cargos adicionales del período" : "Additional charges for the period"}
            </h2>
            <p className="mb-4 text-sm mint-text-muted">
              {es ? "Por fecha de registro, con saldo actual. Importes separados de la producción original; los cobros reales ya incluyen estos pagos." : "By creation date, with current balances. Separate from original treatment production; actual collections already include these payments."}
            </p>
            {finanzas.estadoCargosAdicionales === "listo" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {resumenCargos.map((item) => (
                  <div key={item.moneda} className="rounded-xl border border-[var(--mint-border-teal)] p-4">
                    <h3 className="mb-3 font-bold mint-text-primary">{item.moneda}</h3>
                    {([
                      [es ? "Producción" : "Production", item.produccion],
                      [es ? "Pagado aplicado" : "Applied payments", item.pagado],
                      [es ? "Pendiente" : "Outstanding", item.pendiente],
                    ] as const).map(([label, monto]) => (
                      <div key={label} className="flex flex-wrap justify-between gap-2 py-1 text-sm mint-text-primary">
                        <span>{label}</span>
                        <strong>{new Intl.NumberFormat(es ? "es-MX" : "en-US", { style: "currency", currency: item.moneda, currencyDisplay: "code" }).format(monto / 100)}</strong>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p role="status" className="text-sm mint-text-muted">
                {finanzas.estadoCargosAdicionales === "error"
                  ? (es ? "No se pudieron consultar los cargos adicionales. Sus saldos no están disponibles." : "Additional charges could not be loaded. Their balances are unavailable.")
                  : (es ? "Consultando cargos adicionales…" : "Loading additional charges…")}
              </p>
            )}
          </section>
        )
  );

  const pagosFiltrados = pagos.filter((pago) =>
    fechaDentroPeriodo(pago.fecha)
  );

  const pagosComisionesDelPeriodo = pagos.filter((pago) =>
    fechaDentroPeriodo(
      (pago as { comision_doctor_fecha_pago?: string | null }).comision_doctor_fecha_pago
    )
  );

  const pagosEspecialistasDelPeriodo = tratamientos.filter((tratamiento) =>
    fechaDentroPeriodo(
      (tratamiento as { especialista_fecha_pago?: string | null }).especialista_fecha_pago
    )
  );

  const liquidacionesEspecialistasDelPeriodo =
    finanzas.liquidacionesEspecialistas.filter((liquidacion) =>
      fechaDentroPeriodo(liquidacion.fecha_pago)
    );

  const liquidacionesListas =
    finanzas.estadoLiquidacionesEspecialistas === "listo";

  const avisoLiquidaciones = (
    <p role="status" className="rounded-xl border border-[var(--mint-border-teal)] p-4 text-sm mint-text-primary">
      {finanzas.estadoLiquidacionesEspecialistas === "error"
        ? (es ? "No se pudieron consultar las liquidaciones. Los indicadores financieros no están disponibles." : "Specialist payments could not be loaded. Financial indicators are unavailable.")
        : (es ? "Consultando liquidaciones de especialistas…" : "Loading specialist payments…")}
    </p>
  );

  const {

    ingresos,

    cobrado,

    pendiente,

    cobradoMXN,

    cobradoUSD,

    totalGastos,

    totalGastosUSD,

    totalBaseClinicaMXN,

    totalBaseClinicaUSD,

    totalComisionesDoctorMXN,

    totalComisionesDoctorUSD,

    gananciaNeta,

    gananciaNetaUSD,

    totalTarjeta,

    totalComisionBanco,

    totalTransferencia,

    totalTransferenciaUSD,

    cajaMXN,

    cajaUSD,

    gastosPorCategoria,

  } = useIndicadores({

    tratamientos,

    tratamientosFiltrados,

    gastosFiltrados,

    doctores,

    pagosFiltrados,
    pagosComisionesDelPeriodo,
    pagosEspecialistasDelPeriodo,
    liquidacionesEspecialistasDelPeriodo,

  });

  return (

    <div
      className="
        w-full
      "
    >

      <div
        className="
          w-full
          min-w-0
        "
      >

        {
          seccionActiva ===
          "resumen" ||
          seccionActiva ===
          "reportes"

          ? (

            <div
              className="
                mb-8
                rounded-[24px]
                overflow-hidden
                border
                border-[var(--mint-border-teal)]
                shadow-[var(--mint-shadow-md)]
                bg-[var(--mint-surface)]
              "
            >

              <div
                className="
                  px-6
                  py-6
                  border-b
                  border-white/15
                  bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)]
                  flex
                  flex-col
                  xl:flex-row
                  xl:items-center
                  xl:justify-between
                  gap-6
                "
              >

                <div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      mb-2
                    "
                  >

                    <span
                      className="
                        inline-flex
                        items-center
                        rounded-full
                        bg-white/12
                        text-white
                        px-3
                        py-1
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                      "
                    >

                      {es ? "Finanzas" : "Finances"}

                    </span>

                  </div>

                  <h1
                    className="
                      text-3xl
                      font-bold
                      tracking-tight
                      text-white
                    "
                  >

                    {
                      seccionActiva ===
                      "reportes"
                        ? (es ? "Reportes" : "Reports")
                        : (es ? "Resumen financiero" : "Financial summary")
                    }

                  </h1>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-white/75
                    "
                  >

                    {
                      seccionActiva ===
                      "reportes"
                        ? (es
                            ? "Cierre financiero del período seleccionado."
                            : "Financial close for the selected period.")
                        : (es
                            ? "Visión general del rendimiento financiero de la clínica."
                            : "Overview of the clinic’s financial performance.")
                    }

                  </p>

                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    self-start
                    xl:self-center
                    rounded-xl
                    border
                    border-white/20
                    bg-white/10
                    backdrop-blur-sm
                    p-1
                    shadow-sm
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      setPeriodo(
                        "semana"
                      )
                    }
                    className={`
                      px-4
                      py-2
                      rounded-lg
                      text-sm
                      font-semibold
                      transition-all

                      ${
                        periodo ===
                        "semana"

                          ? `
                              bg-white
                              text-[var(--mint-navy)]
                              shadow-sm
                              ring-1
                              ring-white/40
                            `

                          : `
                              text-white/75
                              hover:text-white
                              hover:bg-white/10
                            `
                      }
                    `}
                  >

                    {es ? "Semana" : "Week"}

                  </button>

                  <button
                    type="button"
                    onClick={() => setPeriodo("semana_pasada")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      periodo === "semana_pasada"
                        ? "bg-white text-[var(--mint-navy)] shadow-sm ring-1 ring-white/40"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {es ? "Semana pasada" : "Last week"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPeriodo(
                        "mes"
                      )
                    }
                    className={`
                      px-4
                      py-2
                      rounded-lg
                      text-sm
                      font-semibold
                      transition-all

                      ${
                        periodo ===
                        "mes"

                          ? `
                              bg-white
                              text-[var(--mint-navy)]
                              shadow-sm
                              ring-1
                              ring-white/40
                            `

                          : `
                              text-white/75
                              hover:text-white
                              hover:bg-white/10
                            `
                      }
                    `}
                  >

                    {es ? "Mes" : "Month"}

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPeriodo(
                        "anio"
                      )
                    }
                    className={`
                      px-4
                      py-2
                      rounded-lg
                      text-sm
                      font-semibold
                      transition-all

                      ${
                        periodo ===
                        "anio"

                          ? `
                              bg-white
                              text-[var(--mint-navy)]
                              shadow-sm
                              ring-1
                              ring-white/40
                            `

                          : `
                              text-white/75
                              hover:text-white
                              hover:bg-white/10
                            `
                      }
                    `}
                  >

                    {es ? "Año" : "Year"}

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPeriodo(
                        "historico"
                      )
                    }
                    className={`
                      px-4
                      py-2
                      rounded-lg
                      text-sm
                      font-semibold
                      transition-all

                      ${
                        periodo ===
                        "historico"

                          ? `
                              bg-white
                              text-[var(--mint-navy)]
                              shadow-sm
                              ring-1
                              ring-white/40
                            `

                          : `
                              text-white/75
                              hover:text-white
                              hover:bg-white/10
                            `
                      }
                    `}
                  >

                    {es ? "Histórico" : "History"}

                  </button>

                </div>

              </div>

              <div
                className="
                  px-6
                  py-4
                  bg-[var(--mint-surface-teal)]
                  flex
                  items-center
                  justify-between
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
                      mint-text-muted
                      mb-1
                    "
                  >

                    {es ? "Período seleccionado" : "Selected period"}

                  </p>

                  <p
                    className="
                      text-sm
                      font-semibold
                      mint-text-primary
                    "
                  >

                    {
                      periodo ===
                      "semana"

                      &&

                      <>

                        {
                          lunesSemana
                            .toLocaleDateString(
                              es ? "es-MX" : "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                        }

                        {" — "}

                        {
                          domingoSemana
                            .toLocaleDateString(
                              es ? "es-MX" : "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                        }

                      </>
                    }

                    {periodo === "semana_pasada" && (
                      <>
                        {lunesSemanaPasada.toLocaleDateString(es ? "es-MX" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                        {" — "}
                        {domingoSemanaPasada.toLocaleDateString(es ? "es-MX" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </>
                    )}

                    {
                      periodo ===
                      "mes"

                      &&

                      <>{es ? "Mes actual" : "Current month"}</>
                    }

                    {
                      periodo ===
                      "anio"

                      &&

                      <>{es ? "Año actual" : "Current year"}</>
                    }

                    {
                      periodo ===
                      "historico"

                      &&

                      <>{es ? "Todos los registros" : "All records"}</>
                    }

                  </p>

                </div>

                <div
                  className="
                    hidden
                    md:flex
                    items-center
                    gap-2
                    text-xs
                    mint-text-muted
                  "
                >

                  {es ? "Datos financieros de MintOS" : "MintOS financial data"}

                </div>

              </div>

            </div>

          )

          : (

            <div
              className="
                mb-8
                rounded-[24px]
                overflow-hidden
                border
                border-[var(--mint-border-teal)]
                shadow-[var(--mint-shadow-md)]
                bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)]
                px-6
                py-6
              "
            >

              <div
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-white/12
                  text-white
                  px-3
                  py-1
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  mb-3
                "
              >
                {es ? "Finanzas" : "Finances"}
              </div>

              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >

                {
                  seccionActiva ===
                  "cobros"

                    ? (es ? "Cobros" : "Collections")

                    : seccionActiva ===
                      "gastos"

                      ? (es ? "Gastos" : "Expenses")

                      : seccionActiva ===
                        "comisiones"

                        ? (es ? "Comisiones" : "Commissions")

                        : seccionActiva ===
                          "cierre"

                          ? (es ? "Cierre mensual" : "Monthly close")

                          : (es ? "Reportes" : "Reports")
                }

              </h1>

            </div>

          )
        }

        {seccionActiva === "reportes" && seccionCargosAdicionales}

        {
          seccionActiva ===
          "cobros"

          &&

          puedeVerCobros

          &&

          <Cobros />
        }

        {
          seccionActiva ===
          "gastos"

          &&

          puedeVerGastos

          &&

          <Gastos

            total={
              totalGastos
            }

            cantidad={
              gastos.length
            }

            fechaGasto={
              fechaGasto
            }

            setFechaGasto={
              setFechaGasto
            }

            conceptoGasto={
              conceptoGasto
            }

            setConceptoGasto={
              setConceptoGasto
            }

            categoriaGasto={
              categoriaGasto
            }

            setCategoriaGasto={
              setCategoriaGasto
            }

            montoGasto={
              montoGasto
            }

            setMontoGasto={
              setMontoGasto
            }

            monedaGasto={
              monedaGasto
            }

            setMonedaGasto={
              setMonedaGasto
            }

            metodoPagoGasto={
              metodoPagoGasto
            }

            setMetodoPagoGasto={
              setMetodoPagoGasto
            }

            notasGasto={
              notasGasto
            }

            setNotasGasto={
              setNotasGasto
            }

            guardarGasto={
              guardarGasto
            }

            gastosFiltrados={
              gastos
            }

            eliminarGasto={
              eliminarGasto
            }

            gastosPorCategoria={
              gastosPorCategoria
            }

          />
        }

        {
          seccionActiva ===
          "comisiones"

          &&

          puedeVerComisiones

          &&

          <Comisiones

            doctores={
              doctores
            }

            tratamientos={
              tratamientos
            }

            pagos={
              pagos
            }

            setDoctorDetalle={
              setDoctorDetalle
            }

            setMostrarDetalleDoctor={
              setMostrarDetalleDoctor
            }

          />
        }

        {doctorDetalle && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#081d30]/75 p-3 backdrop-blur-[3px] sm:p-6"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) cerrarDetalleDoctor();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label={es ? "Detalle de comisión del doctor" : "Doctor commission details"}
              className="flex max-h-[94dvh] w-full max-w-[1440px] flex-col overflow-hidden rounded-[24px] border border-white/20 bg-[var(--mint-surface)] shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 bg-[linear-gradient(120deg,#163d58_0%,#1d6374_55%,#188b80_100%)] px-5 py-4 text-white sm:px-7">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                    {es ? "Finanzas / Comisiones" : "Finances / Commissions"}
                  </p>
                  <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">
                    {doctorDetalle.nombre}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={cerrarDetalleDoctor}
                  aria-label={es ? "Cerrar detalle" : "Close details"}
                  className="shrink-0 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {es ? "Cerrar ✕" : "Close ✕"}
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6">
                <DoctorDetalle
                  doctor={doctorDetalle}
                  pacientes={pacientes}
                  tratamientos={tratamientos}
                  pagos={pagos}
                  onClose={cerrarDetalleDoctor}
                  puedeLiquidar={esAdmin}
                  onLiquidacion={finanzas.cargarPagos}
                />
              </div>
            </section>
          </div>,
          document.body
        )}

     {
  seccionActiva ===
  "resumen"

  &&

  puedeVerResumen

  &&

  (liquidacionesListas ? (
  <Resumen

    seccionCargosAdicionales={seccionCargosAdicionales}

    ingresos={
      ingresos
    }

    cobrado={
      cobrado
    }

    cobradoMXN={
      cobradoMXN
    }

    cobradoUSD={
      cobradoUSD
    }

    pendiente={
      pendiente
    }

    gananciaNeta={
      gananciaNeta
    }

    gananciaNetaUSD={
      gananciaNetaUSD
    }

    totalGastos={
      totalGastos
    }

    totalGastosUSD={
      totalGastosUSD
    }

    totalBaseClinicaMXN={
      totalBaseClinicaMXN
    }

    totalBaseClinicaUSD={
      totalBaseClinicaUSD
    }

    totalComisionesDoctorMXN={
      totalComisionesDoctorMXN
    }

    totalComisionesDoctorUSD={
      totalComisionesDoctorUSD
    }

    cajaMXN={
      cajaMXN
    }

    cajaUSD={
      cajaUSD
    }

    totalTarjeta={
      totalTarjeta
    }

    totalComisionBanco={
      totalComisionBanco
    }

    totalTransferencia={
      totalTransferencia
    }

    totalTransferenciaUSD={
      totalTransferenciaUSD
    }

    pacientes={
      pacientes
    }

    tratamientosFiltrados={
      tratamientosFiltrados
    }

  />
  ) : avisoLiquidaciones)
}

{
  seccionActiva ===
  "reportes"

  &&

  puedeVerReportes

  &&

  (liquidacionesListas ? (
  <Reportes

    ingresos={
      ingresos
    }

    cobradoMXN={
      cobradoMXN
    }

    cobradoUSD={
      cobradoUSD
    }

    pendiente={
      pendiente
    }

    totalBaseClinicaMXN={
      totalBaseClinicaMXN
    }

    totalBaseClinicaUSD={
      totalBaseClinicaUSD
    }

    totalComisionesDoctorMXN={
      totalComisionesDoctorMXN
    }

    totalComisionesDoctorUSD={
      totalComisionesDoctorUSD
    }

    totalGastos={
      totalGastos
    }

    totalGastosUSD={
      totalGastosUSD
    }

    gananciaNeta={
      gananciaNeta
    }

    gananciaNetaUSD={
      gananciaNetaUSD
    }

    cajaMXN={
      cajaMXN
    }

    cajaUSD={
      cajaUSD
    }

    totalTarjeta={
      totalTarjeta
    }

    totalTransferencia={
      totalTransferencia
    }

    totalTransferenciaUSD={
      totalTransferenciaUSD
    }

    tratamientosFiltrados={
      tratamientosFiltrados
    }

    periodo={
      periodo
    }

    lunesSemana={
      periodo === "semana_pasada" ? lunesSemanaPasada : lunesSemana
    }

    sabadoSemana={
      periodo === "semana_pasada" ? domingoSemanaPasada : domingoSemana
    }

  />
  ) : avisoLiquidaciones)
}

{
  seccionActiva ===
  "cierre"

  &&

  puedeVerCierre

  &&

  (liquidacionesListas ? (
  <CierreMensual

    cobradoMXN={
      cobradoMXN
    }

    cobradoUSD={
      cobradoUSD
    }

    totalBaseClinicaMXN={
      totalBaseClinicaMXN
    }

    totalBaseClinicaUSD={
      totalBaseClinicaUSD
    }

    totalComisionesDoctorMXN={
      totalComisionesDoctorMXN
    }

    totalComisionesDoctorUSD={
      totalComisionesDoctorUSD
    }

    totalGastos={
      totalGastos
    }

    totalGastosUSD={
      totalGastosUSD
    }

    gananciaNeta={
      gananciaNeta
    }

    gananciaNetaUSD={
      gananciaNetaUSD
    }

    cajaMXN={
      cajaMXN
    }

    cajaUSD={
      cajaUSD
    }

    bancoMXN={
      totalTarjeta
    }

    pendiente={
      pendiente
    }

    tratamientosTotal={
      tratamientosFiltrados.length
    }

    tratamientosFinalizados={
      tratamientosFiltrados.filter(
        (tratamiento) =>
          String(
            tratamiento.estado ||
              ""
          ) === "Finalizado"
      ).length
    }

  />
  ) : avisoLiquidaciones)
}

      </div>

    </div>

  );

}