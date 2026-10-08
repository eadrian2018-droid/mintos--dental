import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext";
import type { Paciente } from "../../types/Paciente";
import type { Tratamiento } from "../../types/Tratamiento";

type ResumenProps = {
  ingresos: number;

  cobrado: number;
  cobradoMXN: number;
  cobradoUSD: number;

  pendiente: number;
  gananciaNeta: number;
  gananciaNetaUSD: number;

  totalGastos: number;
  totalGastosUSD: number;


  totalBaseClinicaMXN: number;
  totalBaseClinicaUSD: number;

  totalComisionesDoctorMXN: number;
  totalComisionesDoctorUSD: number;

  cajaMXN: number;
  cajaUSD: number;

  totalTarjeta: number;
  totalComisionBanco: number;

  totalTransferencia: number;
  totalTransferenciaUSD: number;

  pacientes: Paciente[];

  tratamientosFiltrados: Tratamiento[];
};

export default function Resumen({
  ingresos,

  cobrado,
  cobradoMXN,
  cobradoUSD,

  pendiente,
  gananciaNeta,
  gananciaNetaUSD,

  totalGastos,
  totalGastosUSD,

  totalBaseClinicaMXN,
  totalBaseClinicaUSD,

  totalComisionesDoctorMXN,
  totalComisionesDoctorUSD,

  cajaMXN,
  cajaUSD,

  totalTarjeta,
  totalComisionBanco,

  totalTransferencia,
  totalTransferenciaUSD,

  pacientes,

  tratamientosFiltrados,
}: ResumenProps) {

  const { language } = useLanguage();
  const es = language === "es";

  const [monedaPrincipal, setMonedaPrincipal] = useState<"MXN" | "USD">("MXN");
  const [monedaSecundariaActiva, setMonedaSecundariaActiva] = useState(true);

  const mostrarMXN =
    monedaPrincipal === "MXN" || monedaSecundariaActiva;

  const mostrarUSD =
    monedaPrincipal === "USD" || monedaSecundariaActiva;

  useEffect(() => {
    async function cargarConfiguracionMoneda() {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("clave, valor")
        .in("clave", [
          "moneda_principal",
          "moneda_secundaria_activa",
        ]);

      if (error) {
        console.error("Error cargando configuración de moneda:", error);
        return;
      }

      const valores = Object.fromEntries(
        (data ?? []).map((fila) => [
          fila.clave,
          String(fila.valor ?? ""),
        ])
      );

      setMonedaPrincipal(
        valores.moneda_principal === "USD" ? "USD" : "MXN"
      );
      setMonedaSecundariaActiva(
        valores.moneda_secundaria_activa !== "false"
      );
    }

    cargarConfiguracionMoneda();
  }, []);

  const formatoMoneda = (
    valor: number
  ) =>
    Number(
      valor || 0
    ).toLocaleString(
      es ? "es-MX" : "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <>

      {/* CORTE DE CAJA */}

      <section
        className="
          mb-8
        "
      >

        <div
          className="
            mb-4
          "
        >

          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.14em]
              mint-text-muted
              mb-1
            "
          >
            {es ? "Liquidez" : "Liquidity"}
          </p>

          <h2
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            {es ? "Corte de caja" : "Cash position"}
          </h2>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
            "
          >

            {mostrarMXN && (
              <>
            {/* CAJA MXN */}

            <div
              className="
                p-5
                border-b
                md:border-r
                xl:border-b-0
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Caja MXN" : "MXN cash"}
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[var(--mint-success)]
                "
              >
                ${formatoMoneda(
                  cajaMXN
                )}
              </p>

              <span
                className="
                  inline-flex
                  mt-3
                  px-2
                  py-1
                  rounded-md
                  bg-[var(--mint-success-bg)]
                  text-[var(--mint-success)]
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                "
              >
                {es ? "Efectivo MXN" : "MXN CASH"}
              </span>

            </div>

              </>
            )}

            {mostrarUSD && (
              <>
            {/* CAJA USD */}

            <div
              className="
                p-5
                border-b
                xl:border-b-0
                xl:border-r
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Caja USD" : "USD cash"}
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[var(--mint-info)]
                "
              >
                ${formatoMoneda(
                  cajaUSD
                )}
              </p>

              <span
                className="
                  inline-flex
                  mt-3
                  px-2
                  py-1
                  rounded-md
                  bg-[var(--mint-info-bg)]
                  text-[var(--mint-info)]
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                "
              >
                {es ? "Efectivo USD" : "USD CASH"}
              </span>

            </div>

              </>
            )}

            {mostrarMXN && (
              <>
            {/* TARJETAS */}

            <div
              className="
                p-5
                border-b
                md:border-b-0
                md:border-r
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Tarjetas" : "Cards"}
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  mint-text-primary
                "
              >
                ${formatoMoneda(
                  totalTarjeta
                )}
              </p>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.08em]
                  font-bold
                  mint-text-muted
                  mt-1
                "
              >
                {es ? "MXN neto" : "NET MXN"}
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                {es ? "Depósito después de comisión" : "Deposit after bank fee"}
              </p>

            </div>

              </>
            )}

            {/* TRANSFERENCIAS */}

            <div
              className="
                p-5
              "
            >

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mb-3
                "
              >
                {es ? "Transferencias" : "Transfers"}
              </p>

              <div
                className="
                  flex
                  items-end
                  gap-4
                  flex-wrap
                "
              >

  {mostrarMXN && (
              <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      mint-text-primary
                    "
                  >
                    ${formatoMoneda(
                      totalTransferencia
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    MXN
                  </p>

                </div>
              )}

  {mostrarUSD && (
              <div
                  className="
                    border-l
                    border-[var(--mint-border)]
                    pl-4
                  "
                >

                  <p
                    className="
                      text-lg
                      font-bold
                      text-[var(--mint-info)]
                    "
                  >
                    ${formatoMoneda(
                      totalTransferenciaUSD
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    USD
                  </p>

                </div>
              )}

              </div>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                {es ? "Transferencias recibidas" : "Transfers received"}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* INDICADORES PRINCIPALES */}

      <section
        className="
          mb-8
        "
      >

        <div
          className="
            flex
            items-end
            justify-between
            gap-4
            mb-4
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                mint-text-muted
                mb-1
              "
            >
              {es ? "Rendimiento" : "Performance"}
            </p>

            <h2
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {es ? "Panorama financiero" : "Financial overview"}
            </h2>

          </div>

          <p
            className="
              hidden
              md:block
              text-xs
              mint-text-muted
            "
          >
            {es ? "Resultados del período seleccionado" : "Results for the selected period"}
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-4
          "
        >

          {mostrarMXN && (
            <>
          {/* INGRESOS */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[170px]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[3px]
                bg-[var(--mint-primary)]
              "
            />

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  {es ? "Producción" : "Production"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "Valor de tratamientos generados" : "Value of treatments generated"}
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-primary-soft)]
                  text-[var(--mint-primary)]
                  font-bold
                  text-sm
                "
              >
                $
              </div>

            </div>

            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  mint-text-primary
                "
              >
                ${formatoMoneda(
                  ingresos
                )}
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                  font-semibold
                "
              >
                MXN
              </p>

            </div>

          </div>

            </>
          )}

          {/* COBRADO */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[170px]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[3px]
                bg-[var(--mint-success)]
              "
            />

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  {es ? "Cobrado" : "Collected"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "Pagos realmente recibidos" : "Payments actually received"}
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-success-bg)]
                  text-[var(--mint-success)]
                  font-bold
                  text-sm
                "
              >
                ✓
              </div>

            </div>

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >

{mostrarMXN && (
              <div>

                <p
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-[var(--mint-success)]
                  "
                >
                  ${formatoMoneda(
                    cobradoMXN
                  )}
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                    mt-1
                  "
                >
                  MXN
                </p>

              </div>
              )}

{mostrarUSD && (
              <div
                className="
                  border-l
                  border-[var(--mint-border)]
                  pl-3
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-[var(--mint-info)]
                  "
                >
                  ${formatoMoneda(
                    cobradoUSD
                  )}
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                    mt-1
                  "
                >
                  USD
                </p>

              </div>
              )}

            </div>

          </div>

          {mostrarMXN && (
            <>
          {/* PENDIENTE */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[170px]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[3px]
                bg-[var(--mint-danger)]
              "
            />

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  {es ? "Pendiente" : "Outstanding"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "Saldo por cobrar" : "Balance to collect"}
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-danger-bg)]
                  text-[var(--mint-danger)]
                  font-bold
                  text-sm
                "
              >
                !
              </div>

            </div>

            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[var(--mint-danger)]
                "
              >
                ${formatoMoneda(
                  pendiente
                )}
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                  font-semibold
                "
              >
                MXN
              </p>

            </div>

          </div>

            </>
          )}

          {/* GANANCIA NETA */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[170px]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[3px]
                bg-[var(--mint-accent)]
              "
            />

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  {es ? "Ganancia neta" : "Net profit"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "Resultado estimado" : "Estimated result"}
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-bg-soft)]
                  mint-text-accent
                  font-bold
                  text-sm
                "
              >
                ↗
              </div>

            </div>

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >

{mostrarMXN && (
              <div>

                <p
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    mint-text-primary
                  "
                >
                  ${formatoMoneda(
                    gananciaNeta
                  )}
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                    mt-1
                  "
                >
                  MXN
                </p>

              </div>
              )}

{mostrarUSD && (
              <div
                className="
                  border-l
                  border-[var(--mint-border)]
                  pl-3
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-[var(--mint-info)]
                  "
                >
                  ${formatoMoneda(
                    gananciaNetaUSD
                  )}
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                    mt-1
                  "
                >
                  USD
                </p>

              </div>
              )}

            </div>

          </div>

        </div>

      </section>

            {/* INDICADORES OPERATIVOS */}

      <section
        className="
          mb-8
        "
      >

        <div
          className="
            mb-4
          "
        >

          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.14em]
              mint-text-muted
              mb-1
            "
          >
            {es ? "Operación" : "Operations"}
          </p>

          <h2
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            {es ? "Indicadores operativos" : "Operational indicators"}
          </h2>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className={`
              grid
              grid-cols-1
              sm:grid-cols-2
              ${mostrarMXN ? "xl:grid-cols-4" : "xl:grid-cols-3"}
            `}
          >

            {mostrarMXN && (
              <>
            {/* COMISIONES BANCARIAS */}

            <div
              className="
                p-5
                border-b
                sm:border-r
                xl:border-b-0
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Comisiones bancarias" : "Bank fees"}
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[var(--mint-warning)]
                "
              >
                ${formatoMoneda(
                  totalComisionBanco
                )}
              </p>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.08em]
                  font-bold
                  mint-text-muted
                  mt-1
                "
              >
                MXN
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                {es ? "Comisiones por pagos con tarjeta" : "Fees from card payments"}
              </p>

            </div>

              </>
            )}

            {/* GASTOS */}

            <div
              className="
                p-5
                border-b
                xl:border-b-0
                xl:border-r
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-3
                "
              >
                {es ? "Gastos" : "Expenses"}
              </p>

              <div
                className="
                  flex
                  items-end
                  gap-4
                  flex-wrap
                "
              >

  {mostrarMXN && (
              <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-danger)]
                    "
                  >
                    ${formatoMoneda(
                      totalGastos
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    MXN
                  </p>

                </div>
              )}

  {mostrarUSD && (
              <div
                  className="
                    border-l
                    border-[var(--mint-border)]
                    pl-4
                  "
                >

                  <p
                    className="
                      text-lg
                      font-bold
                      text-[var(--mint-info)]
                    "
                  >
                    ${formatoMoneda(
                      totalGastosUSD
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    USD
                  </p>

                </div>
              )}

              </div>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                {es ? "Egresos registrados" : "Recorded expenses"}
              </p>

            </div>

            {/* BASE CLÍNICA */}

            <div
              className="
                p-5
                border-b
                sm:border-b-0
                sm:border-r
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-3
                "
              >
                {es ? "Base clínica" : "Clinic base"}
              </p>

              <div
                className="
                  flex
                  items-end
                  gap-4
                  flex-wrap
                "
              >

  {mostrarMXN && (
              <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-info)]
                    "
                  >
                    ${formatoMoneda(
                      totalBaseClinicaMXN
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    MXN
                  </p>

                </div>
              )}

  {mostrarUSD && (
              <div
                  className="
                    border-l
                    border-[var(--mint-border)]
                    pl-4
                  "
                >

                  <p
                    className="
                      text-lg
                      font-bold
                      text-[var(--mint-accent)]
                    "
                  >
                    ${formatoMoneda(
                      totalBaseClinicaUSD
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    USD
                  </p>

                </div>
              )}

              </div>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                {es ? "Después de costos clínicos" : "After clinical costs"}
              </p>

            </div>

            {/* COMISIONES */}

            <div
              className="
                p-5
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-3
                "
              >
                {es ? "Comisiones doctores" : "Doctor commissions"}
              </p>

              <div
                className="
                  flex
                  items-end
                  gap-4
                  flex-wrap
                "
              >

  {mostrarMXN && (
              <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-warning)]
                    "
                  >
                    ${formatoMoneda(
                      totalComisionesDoctorMXN
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    MXN
                  </p>

                </div>
              )}

  {mostrarUSD && (
              <div
                  className="
                    border-l
                    border-[var(--mint-border)]
                    pl-4
                  "
                >

                  <p
                    className="
                      text-lg
                      font-bold
                      text-[var(--mint-info)]
                    "
                  >
                    ${formatoMoneda(
                      totalComisionesDoctorUSD
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    USD
                  </p>

                </div>
              )}

              </div>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                {es ? "Comisiones de tratamientos finalizados" : "Commissions from completed treatments"}
              </p>

            </div>

          </div>

        </div>

      </section>


            {mostrarMXN && (
        <>
      {/* MOVIMIENTOS */}

      <section>

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
              items-center
              justify-between
              gap-4
            "
          >

            <div>

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  mint-text-muted
                  mb-1
                "
              >
                {es ? "Actividad" : "Activity"}
              </p>

              <h2
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                "
              >
                {es ? "Tratamientos del período" : "Treatments for the period"}
              </h2>

            </div>

            <div
              className="
                hidden
                md:flex
                items-center
                px-3
                py-1.5
                rounded-lg
                bg-[var(--mint-bg-soft)]
                border
                border-[var(--mint-border)]
                text-xs
                font-medium
                mint-text-secondary
              "
            >
              {
                tratamientosFiltrados
                  .length
              }{" "}
              {es ? "registros" : "records"}
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
                      px-5
                      py-3
                      text-left
                    "
                  >
                    {es ? "Fecha" : "Date"}
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-left
                    "
                  >
                    {es ? "Paciente" : "Patient"}
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-left
                    "
                  >
                    {es ? "Tratamiento" : "Treatment"}
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                    "
                  >
                    Total
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                    "
                  >
                    {es ? "Pagado" : "Paid"}
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                    "
                  >
                    {es ? "Pendiente" : "Outstanding"}
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  tratamientosFiltrados.map(
                    (item) => {

                      const paciente =
                        pacientes.find(
                          (p) =>
                            p.id ===
                            item.paciente_id
                        );

                      return (

                        <tr
                          key={item.id}
                          className="
                            mint-table-row
                          "
                        >

                          <td
                            className="
                              px-5
                              py-4
                              whitespace-nowrap
                              mint-text-secondary
                            "
                          >
                            {item.fecha}
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              font-semibold
                              mint-text-primary
                            "
                          >
                            {
                              paciente?.nombre ||
                              "-"
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              mint-text-secondary
                            "
                          >
                            {
                              item.tratamiento
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              font-medium
                              mint-text-primary
                            "
                          >
                            $
                            {
                              formatoMoneda(
                                Number(
                                  item.total ||
                                  0
                                )
                              )
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              text-[var(--mint-success)]
                              font-semibold
                            "
                          >
                            $
                            {
                              formatoMoneda(
                                Number(
                                  item.pago ||
                                  0
                                )
                              )
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              text-[var(--mint-danger)]
                              font-semibold
                            "
                          >
                            $
                            {
                              formatoMoneda(
                                Number(
                                  item.resta ||
                                  0
                                )
                              )
                            }
                          </td>

                        </tr>

                      );

                    }
                  )
                }

                <tr
                  className="
                    bg-[var(--mint-bg-soft)]
                    font-bold
                    border-t-2
                    border-[var(--mint-border-strong)]
                    mint-text-primary
                  "
                >

                  <td
                    className="
                      px-5
                      py-4
                    "
                    colSpan={3}
                  >
                    {es ? "TOTAL TRATAMIENTOS" : "TOTAL TREATMENTS"}
                  </td>

                  <td
                    className="
                      px-5
                      py-4
                      text-right
                    "
                  >
                    $
                    {
                      formatoMoneda(
                        ingresos
                      )
                    }
                  </td>

                  <td
                    className="
                      px-5
                      py-4
                      text-right
                      text-[var(--mint-success)]
                    "
                  >
                    $
                    {
                      formatoMoneda(
                        cobrado
                      )
                    }
                  </td>

                  <td
                    className="
                      px-5
                      py-4
                      text-right
                      text-[var(--mint-danger)]
                    "
                  >
                    $
                    {
                      formatoMoneda(
                        pendiente
                      )
                    }
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>
        </>
      )}

    </>
  );

}