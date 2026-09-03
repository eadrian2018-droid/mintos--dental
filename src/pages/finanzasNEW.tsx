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

import DoctorDetalle
  from "../components/DoctorDetalle";

import usePeriodo
  from "../hooks/usePeriodo";

import useIndicadores
  from "../hooks/useIndicadores";

import useFinanzas
  from "../hooks/useFinanzas";

import type {
  Doctor,
} from "../types/Doctor";

type SeccionFinanzas =
  | "resumen"
  | "cobros"
  | "gastos"
  | "comisiones";

type PeriodoFinanzas =
  | "semana"
  | "mes"
  | "anio"
  | "historico";

export default function Finanzas() {

  const location =
    useLocation();

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

    if (
      seccion === "cobros" ||
      seccion === "gastos" ||
      seccion === "comisiones"
    ) {

      setSeccionActiva(
        seccion
      );

      return;

    }

    setSeccionActiva(
      "resumen"
    );

  }, [
    location.search,
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

    totalBaseClinica,

    totalComisionesDoctor,

    gananciaNeta,

        gananciaNetaUSD,

    totalTarjeta,

    totalTransferencia,

    totalTransferenciaUSD,

    cajaMXN,

    cajaUSD,

    gastosPorCategoria,

  } = useIndicadores({

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
          "resumen"

          ? (

            <div
              className="
                mb-8
                mint-card
                overflow-hidden
              "
            >

              <div
                className="
                  px-6
                  py-6
                  border-b
                  border-[var(--mint-border)]
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
                        bg-[var(--mint-primary-soft)]
                        text-[var(--mint-primary)]
                        px-3
                        py-1
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                      "
                    >

                      Finanzas

                    </span>

                  </div>

                  <h1
                    className="
                      text-3xl
                      font-bold
                      tracking-tight
                      mint-text-primary
                    "
                  >

                    Resumen financiero

                  </h1>

                  <p
                    className="
                      mt-2
                      text-sm
                      mint-text-secondary
                    "
                  >

                    Visión general del rendimiento
                    financiero de la clínica.

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
                    border-[var(--mint-border)]
                    bg-[var(--mint-bg-soft)]
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
                              bg-[var(--mint-bg-card)]
                              text-[var(--mint-primary)]
                              shadow-sm
                              ring-1
                              ring-[var(--mint-border)]
                            `

                          : `
                              mint-text-secondary
                              hover:text-[var(--mint-text-primary)]
                            `
                      }
                    `}
                  >

                    Semana

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
                              bg-[var(--mint-bg-card)]
                              text-[var(--mint-primary)]
                              shadow-sm
                              ring-1
                              ring-[var(--mint-border)]
                            `

                          : `
                              mint-text-secondary
                              hover:text-[var(--mint-text-primary)]
                            `
                      }
                    `}
                  >

                    Mes

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
                              bg-[var(--mint-bg-card)]
                              text-[var(--mint-primary)]
                              shadow-sm
                              ring-1
                              ring-[var(--mint-border)]
                            `

                          : `
                              mint-text-secondary
                              hover:text-[var(--mint-text-primary)]
                            `
                      }
                    `}
                  >

                    Año

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
                              bg-[var(--mint-bg-card)]
                              text-[var(--mint-primary)]
                              shadow-sm
                              ring-1
                              ring-[var(--mint-border)]
                            `

                          : `
                              mint-text-secondary
                              hover:text-[var(--mint-text-primary)]
                            `
                      }
                    `}
                  >

                    Histórico

                  </button>

                </div>

              </div>

              <div
                className="
                  px-6
                  py-4
                  bg-[var(--mint-bg-soft)]
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

                    Período seleccionado

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
                              "es-MX",
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
                              "es-MX",
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

                      <>Mes actual</>
                    }

                    {
                      periodo ===
                      "anio"

                      &&

                      <>Año actual</>
                    }

                    {
                      periodo ===
                      "historico"

                      &&

                      <>Todos los registros</>
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

                  Datos financieros de MintOS

                </div>

              </div>

            </div>

          )

          : (

            <div
              className="
                mb-8
              "
            >

              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  mint-text-primary
                "
              >

                {
                  seccionActiva ===
                  "cobros"

                    ? "Cobros"

                    : seccionActiva ===
                      "gastos"

                      ? "Gastos"

                      : "Comisiones"
                }

              </h1>

            </div>

          )
        }

        {
          seccionActiva ===
          "cobros"

          &&

          <Cobros />
        }

        {
          seccionActiva ===
          "gastos"

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

          <Comisiones

            doctores={
              doctores
            }

            tratamientos={
              tratamientos
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

            totalBaseClinica={
              totalBaseClinica
            }

            totalComisionesDoctor={
              totalComisionesDoctor
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

            pacientes={
              pacientes
            }

            tratamientosFiltrados={
              tratamientosFiltrados
            }

          />
        }

      </div>

    </div>

  );

}