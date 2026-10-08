import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

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

  const {

    lunesSemana,

    sabadoSemana,

    tratamientosFiltrados,

    gastosFiltrados,

  } = usePeriodo({

    periodo,

    tratamientos,

    gastos,

  });

  const pagosFiltrados =
    pagos.filter(
      (pago: any) => {

        if (
          periodo ===
          "historico"
        ) {

          return true;

        }

        const fechaPago =
          new Date(
            pago.fecha
          );

        if (
          Number.isNaN(
            fechaPago.getTime()
          )
        ) {

          return false;

        }

        if (
          periodo ===
          "semana"
        ) {

          const inicio =
            new Date(
              lunesSemana
            );

          inicio.setHours(
            0,
            0,
            0,
            0
          );

          const fin =
            new Date(
              sabadoSemana
            );

          fin.setHours(
            23,
            59,
            59,
            999
          );

          return (
            fechaPago >= inicio &&
            fechaPago <= fin
          );

        }

        const hoy =
          new Date();

        if (
          periodo ===
          "mes"
        ) {

          return (
            fechaPago.getFullYear() ===
              hoy.getFullYear()
            &&
            fechaPago.getMonth() ===
              hoy.getMonth()
          );

        }

        if (
          periodo ===
          "anio"
        ) {

          return (
            fechaPago.getFullYear() ===
            hoy.getFullYear()
          );

        }

        return true;

      }
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
                          sabadoSemana
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
              pagosFiltrados
            }

            setDoctorDetalle={
              setDoctorDetalle
            }

            setMostrarDetalleDoctor={
              setMostrarDetalleDoctor
            }

          />
        }

        {
          doctorDetalle

          &&

          <DoctorDetalle

            doctor={
              doctorDetalle
            }

            pacientes={
              pacientes
            }

            tratamientos={
              tratamientos
            }

            pagos={
              pagosFiltrados
            }

            onClose={() =>
              setDoctorDetalle(
                null
              )
            }

          />
        }

     {
  seccionActiva ===
  "resumen"

  &&

  puedeVerResumen

  &&

  <Resumen

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
}

{
  seccionActiva ===
  "reportes"

  &&

  puedeVerReportes

  &&

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
      lunesSemana
    }

    sabadoSemana={
      sabadoSemana
    }

  />
}

{
  seccionActiva ===
  "cierre"

  &&

  puedeVerCierre

  &&

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
}

      </div>

    </div>

  );

}