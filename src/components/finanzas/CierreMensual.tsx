import {
  useEffect,
  useState,
} from "react";

import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  LockKeyhole,
} from "lucide-react";

import {
  supabase,
} from "../../lib/supabase";

import { useLanguage } from "../../context/LanguageContext";

import { registrarBitacora }
  from "../../lib/registrarBitacora";

type CierreFinanciero = {

  id: number;

  anio: number;

  mes: number;

  cobrado_mxn: number;
  cobrado_usd: number;

  base_clinica_mxn: number;
  base_clinica_usd: number;

  comisiones_mxn: number;
  comisiones_usd: number;

  gastos_mxn: number;
  gastos_usd: number;

  utilidad_neta_mxn: number;
  utilidad_neta_usd: number;

  caja_mxn: number;
  caja_usd: number;

  banco_mxn: number;

  cuentas_por_cobrar_mxn: number;

  tratamientos_total: number;

  tratamientos_finalizados: number;

  cerrado_por?: string | null;

  fecha_cierre: string;

};

type Props = {

  cobradoMXN: number;

  cobradoUSD: number;

  totalBaseClinicaMXN: number;

  totalBaseClinicaUSD: number;

  totalComisionesDoctorMXN: number;

  totalComisionesDoctorUSD: number;

  totalGastos: number;

  totalGastosUSD: number;

  gananciaNeta: number;

  gananciaNetaUSD: number;

  cajaMXN: number;

  cajaUSD: number;

  bancoMXN: number;

  pendiente: number;

  tratamientosTotal: number;

  tratamientosFinalizados: number;

};

const MESES = [

  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",

];

export default function CierreMensual({

  cobradoMXN,

  cobradoUSD,

  totalBaseClinicaMXN,

  totalBaseClinicaUSD,

  totalComisionesDoctorMXN,

  totalComisionesDoctorUSD,

  totalGastos,

  totalGastosUSD,

  gananciaNeta,

  gananciaNetaUSD,

  cajaMXN,

  cajaUSD,

  bancoMXN,

  pendiente,

  tratamientosTotal,

  tratamientosFinalizados,

}: Props) {

  const { language } = useLanguage();
  const es = language === "es";
  const locale = es ? "es-MX" : "en-US";
  const tr = (espanol: string, english: string) => es ? espanol : english;

  const [monedaPrincipal, setMonedaPrincipal] = useState<"MXN" | "USD">("MXN");
  const [monedaSecundariaActiva, setMonedaSecundariaActiva] = useState(true);
  const mostrarMXN = monedaPrincipal === "MXN" || monedaSecundariaActiva;
  const mostrarUSD = monedaPrincipal === "USD" || monedaSecundariaActiva;
  const columnasMonedas = mostrarMXN && mostrarUSD ? 2 : 1;

  useEffect(() => {
    let activo = true;
    const cargarMonedas = async () => {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("clave, valor")
        .in("clave", ["moneda_principal", "moneda_secundaria_activa"]);
      if (error) {
        console.error("Error cargando configuración de monedas:", error);
        return;
      }
      if (!activo) return;
      const valores = Object.fromEntries(
        (data ?? []).map(fila => [fila.clave, String(fila.valor ?? "")])
      );
      setMonedaPrincipal(valores.moneda_principal === "USD" ? "USD" : "MXN");
      setMonedaSecundariaActiva(valores.moneda_secundaria_activa !== "false");
    };
    void cargarMonedas();
    return () => { activo = false; };
  }, []);

  const hoy =
    new Date();

  const mesActual =
    hoy.getMonth() + 1;

  const anioActual =
    hoy.getFullYear();

  const [
    cierres,
    setCierres,
  ] =
    useState<CierreFinanciero[]>(
      []
    );

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    cerrando,
    setCerrando,
  ] =
    useState(false);

  const cierreActual =
    cierres.find(
      (cierre) =>
        cierre.mes ===
          mesActual &&
        cierre.anio ===
          anioActual
    );

  const resumenCierre = {

    cobradoMXN:
      cierreActual
        ?.cobrado_mxn ??
      cobradoMXN,

    cobradoUSD:
      cierreActual
        ?.cobrado_usd ??
      cobradoUSD,

    baseClinicaMXN:
      cierreActual
        ?.base_clinica_mxn ??
      totalBaseClinicaMXN,

    baseClinicaUSD:
      cierreActual
        ?.base_clinica_usd ??
      totalBaseClinicaUSD,

    comisionesMXN:
      cierreActual
        ?.comisiones_mxn ??
      totalComisionesDoctorMXN,

    comisionesUSD:
      cierreActual
        ?.comisiones_usd ??
      totalComisionesDoctorUSD,

    gastosMXN:
      cierreActual
        ?.gastos_mxn ??
      totalGastos,

    gastosUSD:
      cierreActual
        ?.gastos_usd ??
      totalGastosUSD,

    utilidadMXN:
      cierreActual
        ?.utilidad_neta_mxn ??
      gananciaNeta,

    utilidadUSD:
      cierreActual
        ?.utilidad_neta_usd ??
      gananciaNetaUSD,

    cajaMXN:
      cierreActual
        ?.caja_mxn ??
      cajaMXN,

    cajaUSD:
      cierreActual
        ?.caja_usd ??
      cajaUSD,

    bancoMXN:
      cierreActual
        ?.banco_mxn ??
      bancoMXN,

    pendienteMXN:
      cierreActual
        ?.cuentas_por_cobrar_mxn ??
      pendiente,

    tratamientosTotal:
      cierreActual
        ?.tratamientos_total ??
      tratamientosTotal,

    tratamientosFinalizados:
      cierreActual
        ?.tratamientos_finalizados ??
      tratamientosFinalizados,

  };

  useEffect(
    () => {

      cargarCierres();

    },
    []
  );

  async function cargarCierres() {

    setCargando(
      true
    );

    const {
      data,
      error,
    } =
      await supabase

        .from(
          "cierres_financieros"
        )

        .select("*")

        .order(
          "anio",
          {
            ascending:
              false,
          }
        )

        .order(
          "mes",
          {
            ascending:
              false,
          }
        );

    if (error) {

      console.error(
        "Error cargando cierres:",
        error
      );

      setCargando(
        false
      );

      return;

    }

    setCierres(
      (
        data ||
        []
      ) as CierreFinanciero[]
    );

    setCargando(
      false
    );

  }

  function formatoDinero(
    valor: number,
    moneda:
      | "MXN"
      | "USD"
  ) {

    return `$${Number(
      valor || 0
    ).toLocaleString(
      locale,
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    )} ${moneda}`;

  }

  function formatoFecha(
    fecha: string
  ) {

    return new Date(
      fecha
    ).toLocaleString(
      locale,
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    );

  }

  async function cerrarMes() {

    if (
      cierreActual
    ) {

      alert(
        tr("Este mes ya fue cerrado.", "This month has already been closed.")
      );

      return;

    }

    const confirmar =
      window.confirm(
        es ? `¿Confirmas el cierre financiero de ${MESES[mesActual - 1]} ${anioActual}?\n\nUna vez guardado, este cierre conservará la fotografía financiera del mes.` : `Confirm the financial close for ${new Intl.DateTimeFormat(locale, {month:"long"}).format(new Date(anioActual,mesActual-1,1))} ${anioActual}?\n\nOnce saved, this close will preserve the monthly financial snapshot.`
      );

    if (
      !confirmar
    ) {

      return;

    }

    setCerrando(
      true
    );

    const {
      data: usuario,
    } =
      await supabase
        .auth
        .getUser();

    const usuarioId =
      usuario
        ?.user
        ?.id ||
      null;

    const {
      error,
    } =
      await supabase

        .from(
          "cierres_financieros"
        )

        .insert({

          anio:
            anioActual,

          mes:
            mesActual,

          cobrado_mxn:
            Number(
              cobradoMXN || 0
            ),

          cobrado_usd:
            Number(
              cobradoUSD || 0
            ),

          base_clinica_mxn:
            Number(
              totalBaseClinicaMXN ||
                0
            ),

          base_clinica_usd:
            Number(
              totalBaseClinicaUSD ||
                0
            ),

          comisiones_mxn:
            Number(
              totalComisionesDoctorMXN ||
                0
            ),

          comisiones_usd:
            Number(
              totalComisionesDoctorUSD ||
                0
            ),

          gastos_mxn:
            Number(
              totalGastos || 0
            ),

          gastos_usd:
            Number(
              totalGastosUSD || 0
            ),

          utilidad_neta_mxn:
            Number(
              gananciaNeta || 0
            ),

          utilidad_neta_usd:
            Number(
              gananciaNetaUSD || 0
            ),

          caja_mxn:
            Number(
              cajaMXN || 0
            ),

          caja_usd:
            Number(
              cajaUSD || 0
            ),

          banco_mxn:
            Number(
              bancoMXN || 0
            ),

          cuentas_por_cobrar_mxn:
            Number(
              pendiente || 0
            ),

          tratamientos_total:
            Number(
              tratamientosTotal ||
                0
            ),

          tratamientos_finalizados:
            Number(
              tratamientosFinalizados ||
                0
            ),

          cerrado_por:
            usuarioId,

        });

    if (
      error
    ) {

      console.error(
        "Error cerrando mes:",
        error
      );

      alert(
        tr("No se pudo realizar el cierre mensual.", "The monthly close could not be completed.")
      );

      setCerrando(
        false
      );

      return;

    }

    await registrarBitacora({
      accion: "Cerrar mes financiero",
      modulo: "Finanzas",
      detalle:
        `Período: ${MESES[mesActual - 1]} ${anioActual} | Cobrado: ${Number(cobradoMXN || 0)} MXN / ${Number(cobradoUSD || 0)} USD | Gastos: ${Number(totalGastos || 0)} MXN / ${Number(totalGastosUSD || 0)} USD | Utilidad: ${Number(gananciaNeta || 0)} MXN / ${Number(gananciaNetaUSD || 0)} USD`,
    });

    await cargarCierres();

    setCerrando(
      false
    );

    alert(
      tr("Cierre mensual guardado correctamente.", "Monthly close saved successfully.")
    );

  }

  return (

    <div
      className="
        space-y-7
      "
    >

      {/* ENCABEZADO */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-[var(--mint-border-teal)]
          bg-[linear-gradient(135deg,var(--mint-surface)_0%,var(--mint-surface-teal)_100%)]
          shadow-[0_12px_32px_rgba(15,42,65,0.06)]
        "
      >

        <div
          className="
            absolute
            left-0
            top-0
            bottom-0
            w-1
            bg-[linear-gradient(180deg,var(--mint-teal)_0%,var(--mint-teal-soft)_58%,var(--mint-gold)_100%)]
          "
        />

        <div
          className="
            px-7
            py-6
            flex
            items-start
            justify-between
            gap-6
            flex-wrap
          "
        >

          <div
            className="
              flex
              items-start
              gap-4
            "
          >

            <div
              className="
                w-11
                h-11
                shrink-0
                rounded-2xl
                bg-[var(--mint-surface-teal)]
                text-[var(--mint-teal)]
                border
                border-[var(--mint-border-teal)]
                flex
                items-center
                justify-center
                shadow-sm
              "
            >

              <CalendarCheck
                size={
                  21
                }
              />

            </div>

            <div>

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[var(--mint-teal)]
                "
              >
                {tr("Cierre financiero", "Financial close")}
              </p>

              <h2
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  mint-text-primary
                  mt-1
                "
              >
                {
                  new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(anioActual, mesActual - 1, 1))
                }{" "}
                {
                  anioActual
                }
              </h2>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  max-w-2xl
                  mt-1
                "
              >
                {tr("Guarda una fotografía definitiva del resultado financiero del mes sin modificar los movimientos originales.", "Save a final snapshot of the monthly financial results without modifying the original transactions.")}
              </p>

            </div>

          </div>

          {
            cierreActual

              ? (

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-full
                    bg-[var(--mint-success-bg)]
                    border
                    border-[var(--mint-success-border)]
                    text-[var(--mint-success)]
                    text-sm
                    font-bold
                  "
                >

                  <CheckCircle2
                    size={
                      17
                    }
                  />

                  {tr("Mes cerrado", "Month closed")}

                </div>

              )

              : (

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-full
                    bg-white
                    border
                    border-[var(--mint-border-teal)]
                    mint-text-secondary
                    text-sm
                    font-semibold
                    shadow-sm
                  "
                >

                  <Clock3
                    size={
                      17
                    }
                  />

                  {tr("Mes abierto", "Month open")}

                </div>

              )
          }

        </div>

      </section>


      {/* RESULTADO PRINCIPAL */}

      <section>

        <div
          className="
            flex
            items-end
            justify-between
            gap-4
            mb-4
            flex-wrap
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.14em]
                font-bold
                mint-text-muted
                mb-1
              "
            >
              {tr("Resumen para cierre", "Closing summary")}
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {tr("Fotografía financiera", "Financial snapshot")}
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {
                cierreActual
                  ? tr("Valores almacenados en el cierre definitivo del mes.", "Values saved in the final monthly close.")
                  : tr("Revisa la fotografía financiera completa antes de cerrar el período.", "Review the complete financial snapshot before closing the period.")
              }
            </p>

          </div>

          <span
            className="
              inline-flex
              px-3
              py-1.5
              rounded-full
              bg-[var(--mint-surface-teal)]
              border
              border-[var(--mint-border-teal)]
              text-xs
              font-bold
              text-[var(--mint-teal)]
            "
          >
            {
              cierreActual
                ? tr("Cierre guardado", "Close saved")
                : tr("Datos actuales", "Current data")
            }
          </span>

        </div>

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-[1.2fr_0.8fr]
            gap-5
          "
        >

          {/* ESTADO DE RESULTADOS */}

          <div
            className="
              overflow-hidden
              rounded-[22px]
              border
              border-[var(--mint-border)]
              bg-[var(--mint-surface)]
              shadow-[0_10px_30px_rgba(15,42,65,0.055)]
            "
          >

            <div
              style={{ gridTemplateColumns: `minmax(0,1.3fr) repeat(${columnasMonedas},minmax(135px,0.7fr))` }}
              className="
                grid
                
                items-center
                px-6
                py-4
                bg-[var(--mint-surface-teal)]
                border-b
                border-[var(--mint-border-teal)]
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
                  {tr("Estado de resultados", "Income statement")}
                </p>

              </div>

              {mostrarMXN && (
              <div
                className="
                  text-right
                  pr-5
                "
              >

                <span
                  className="
                    inline-flex
                    px-3
                    py-1
                    rounded-full
                    text-[10px]
                    font-bold
                    bg-white
                    text-[var(--mint-teal)]
                    border
                    border-[var(--mint-border-teal)]
                  "
                >
                  MXN
                </span>

              </div>
              )}

              {mostrarUSD && (
              <div
                className="
                  text-right
                  pl-5
                  border-l
                  border-[var(--mint-border-teal)]
                "
              >

                <span
                  className="
                    inline-flex
                    px-3
                    py-1
                    rounded-full
                    text-[10px]
                    font-bold
                    bg-white
                    text-[var(--mint-info)]
                    border
                    border-[var(--mint-info-border)]
                  "
                >
                  USD
                </span>

              </div>
              )}

            </div>

            <FilaCierre
              mostrarMXN={mostrarMXN}
              mostrarUSD={mostrarUSD}
              titulo={tr("Cobrado", "Collected")}
              valorMXN={
                resumenCierre.cobradoMXN
              }
              valorUSD={
                resumenCierre.cobradoUSD
              }
              formatoDinero={
                formatoDinero
              }
              tipo="success"
            />

            <FilaCierre
              mostrarMXN={mostrarMXN}
              mostrarUSD={mostrarUSD}
              titulo={tr("Base clínica", "Clinic base")}
              valorMXN={
                resumenCierre.baseClinicaMXN
              }
              valorUSD={
                resumenCierre.baseClinicaUSD
              }
              formatoDinero={
                formatoDinero
              }
            />

            <FilaCierre
              mostrarMXN={mostrarMXN}
              mostrarUSD={mostrarUSD}
              titulo={tr("Comisiones", "Commissions")}
              valorMXN={
                resumenCierre.comisionesMXN
              }
              valorUSD={
                resumenCierre.comisionesUSD
              }
              formatoDinero={
                formatoDinero
              }
            />

            <FilaCierre
              mostrarMXN={mostrarMXN}
              mostrarUSD={mostrarUSD}
              titulo={tr("Gastos", "Expenses")}
              valorMXN={
                resumenCierre.gastosMXN
              }
              valorUSD={
                resumenCierre.gastosUSD
              }
              formatoDinero={
                formatoDinero
              }
              tipo="danger"
            />

            <div
              style={{ gridTemplateColumns: `minmax(0,1.3fr) repeat(${columnasMonedas},minmax(135px,0.7fr))` }}
              className="
                grid
                grid-cols-1
                
                items-center
                gap-3
                px-6
                py-5
                bg-[linear-gradient(90deg,var(--mint-surface-teal)_0%,var(--mint-surface)_100%)]
                border-t
                border-[var(--mint-border-teal)]
              "
            >

              <div>

                <p
                  className="
                    text-base
                    font-bold
                    mint-text-primary
                  "
                >
                  {tr("Utilidad neta", "Net profit")}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-muted
                    mt-1
                  "
                >
                  {tr("Resultado final del mes", "Final monthly result")}
                </p>

              </div>

              {mostrarMXN && (
              <div
                className="
                  md:text-right
                  md:pr-5
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    text-[var(--mint-teal)]
                  "
                >
                  {
                    formatoDinero(
                      resumenCierre.utilidadMXN,
                      "MXN"
                    )
                  }
                </p>

              </div>
              )}

              {mostrarUSD && (
              <div
                className="
                  md:text-right
                  md:pl-5
                  md:border-l
                  border-[var(--mint-border-teal)]
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    text-[var(--mint-info)]
                  "
                >
                  {
                    formatoDinero(
                      resumenCierre.utilidadUSD,
                      "USD"
                    )
                  }
                </p>

              </div>
              )}

            </div>

          </div>


          {/* POSICIÓN AL CIERRE */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[22px]
              border
              border-[var(--mint-border-teal)]
              !bg-[linear-gradient(135deg,#102f4f_0%,#1b4f68_52%,#0b8f80_100%)]
              shadow-[0_14px_34px_rgba(15,42,65,0.13)]
            "
          >

            <div
              className="
                absolute
                left-0
                right-0
                top-0
                h-[3px]
                bg-[linear-gradient(90deg,var(--mint-teal-soft)_0%,var(--mint-gold)_100%)]
              "
            />

            <div
              className="
                px-6
                pt-6
                pb-4
              "
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.14em]
                  font-bold
                  text-white/60
                "
              >
                {tr("Posición al cierre", "Closing position")}
              </p>

              <h4
                className="
                  text-lg
                  font-bold
                  text-white
                  mt-1
                "
              >
                {tr("Disponibilidad y cartera", "Available funds and receivables")}
              </h4>

            </div>

            <div
              className="
                grid
                grid-cols-2
                border-t
                border-white/15
              "
            >

              {mostrarMXN && (

              <DatoPosicion
                titulo={tr("Caja MXN", "Cash MXN")}
                valor={
                  resumenCierre.cajaMXN
                }
                moneda="MXN"
                formatoDinero={
                  formatoDinero
                }
              />

              )}

              {mostrarUSD && (

              <DatoPosicion
                titulo={tr("Caja USD", "Cash USD")}
                valor={
                  resumenCierre.cajaUSD
                }
                moneda="USD"
                formatoDinero={
                  formatoDinero
                }
              />

              )}

              {mostrarMXN && (

              <DatoPosicion
                titulo={tr("Banco", "Bank")}
                valor={
                  resumenCierre.bancoMXN
                }
                moneda="MXN"
                formatoDinero={
                  formatoDinero
                }
              />

              )}

              {mostrarMXN && (

              <DatoPosicion
                titulo={tr("Por cobrar", "Receivables")}
                valor={
                  resumenCierre.pendienteMXN
                }
                moneda="MXN"
                formatoDinero={
                  formatoDinero
                }
                warning
              />

              )}

            </div>

            <div
              className="
                px-6
                py-5
                border-t
                border-white/15
                flex
                items-center
                justify-between
                gap-5
              "
            >

              <div>

                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.1em]
                    font-bold
                    text-white/50
                  "
                >
                  {tr("Tratamientos del mes", "Monthly treatments")}
                </p>

                <p
                  className="
                    text-xl
                    font-bold
                    text-white
                    mt-1
                  "
                >
                  {
                    resumenCierre.tratamientosTotal
                  }
                </p>

              </div>

              <div
                className="
                  text-right
                "
              >

                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.1em]
                    font-bold
                    text-white/50
                  "
                >
                  {tr("Finalizados", "Completed")}
                </p>

                <p
                  className="
                    text-xl
                    font-bold
                    text-[var(--mint-teal-soft)]
                    mt-1
                  "
                >
                  {
                    resumenCierre.tratamientosFinalizados
                  }
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

            {/* ACCIÓN DE CIERRE */}

      {
        !cierreActual && (

          <section
            className="
              relative
              overflow-hidden
              rounded-[22px]
              border
              border-[var(--mint-border-teal)]
              bg-[linear-gradient(135deg,var(--mint-surface)_0%,var(--mint-surface-teal)_100%)]
              shadow-[0_8px_24px_rgba(15,42,65,0.045)]
            "
          >

            <div
              className="
                px-6
                py-5
                flex
                items-center
                justify-between
                gap-6
                flex-wrap
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    shrink-0
                    rounded-xl
                    bg-white
                    border
                    border-[var(--mint-border-teal)]
                    text-[var(--mint-teal)]
                    flex
                    items-center
                    justify-center
                    shadow-sm
                  "
                >

                  <LockKeyhole
                    size={
                      18
                    }
                  />

                </div>

                <div>

                  <h3
                    className="
                      font-bold
                      mint-text-primary
                    "
                  >
                    {tr("Cerrar período", "Close period")}
                  </h3>

                  <p
                    className="
                      text-sm
                      mint-text-secondary
                      mt-1
                    "
                  >
                    {tr("Revisa los indicadores", "Review the figures")}
                    {tr("antes de guardar el", "before saving the")}
                    {tr("cierre definitivo.", "final close.")}
                  </p>

                </div>

              </div>

              <button
                type="button"
                disabled={
                  cerrando
                }
                onClick={
                  cerrarMes
                }
                className="
                  mint-btn
                  mint-btn-primary
                  inline-flex
                  items-center
                  gap-2
                "
              >

                <LockKeyhole
                  size={
                    17
                  }
                />

                {
                  cerrando
                    ? tr("Cerrando...", "Closing...")
                    : tr("Cerrar mes", "Close month")
                }

              </button>

            </div>

          </section>

        )
      }


      {/* HISTORIAL */}

      <section>

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-end
            md:justify-between
            gap-4
            mb-4
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.14em]
                font-bold
                mint-text-muted
                mb-1
              "
            >
              {tr("Archivo financiero", "Financial archive")}
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {tr("Historial de cierres", "Closing history")}
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {tr("Fotografías financieras", "Financial snapshots")}
              {tr("almacenadas por período.", "stored by period.")}
            </p>

          </div>

          <div
            className="
              inline-flex
              items-center
              self-start
              md:self-auto
              gap-2
              px-3
              py-2
              rounded-full
              bg-[var(--mint-surface-teal)]
              border
              border-[var(--mint-border-teal)]
            "
          >

            <span
              className="
                w-2
                h-2
                rounded-full
                bg-[var(--mint-teal)]
              "
            />

            <span
              className="
                text-xs
                font-bold
                text-[var(--mint-teal)]
              "
            >
              {cierres.length} {tr("cierres guardados", "saved closes")}
            </span>

          </div>

        </div>

        <div
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[var(--mint-border)]
            bg-[var(--mint-surface)]
            shadow-[0_8px_24px_rgba(15,42,65,0.045)]
          "
        >

          {
            cargando

              ? (

                <div
                  className="
                    min-h-[150px]
                    flex
                    items-center
                    justify-center
                    text-sm
                    mint-text-muted
                  "
                >
                  {tr("Cargando cierres...", "Loading closes...")}
                </div>

              )

              : cierres.length ===
                  0

                ? (

                  <div
                    className="
                      min-h-[150px]
                      flex
                      flex-col
                      items-center
                      justify-center
                      px-6
                      text-center
                      bg-[linear-gradient(135deg,var(--mint-surface)_0%,var(--mint-surface-teal)_100%)]
                    "
                  >

                    <div
                      className="
                        w-10
                        h-10
                        rounded-2xl
                        flex
                        items-center
                        justify-center
                        bg-white
                        border
                        border-[var(--mint-border-teal)]
                        shadow-sm
                        mb-3
                      "
                    >

                      <CalendarCheck
                        size={
                          18
                        }
                        className="
                          text-[var(--mint-teal)]
                        "
                      />

                    </div>

                    <p
                      className="
                        font-bold
                        mint-text-primary
                      "
                    >
                      {tr("Todavía no hay", "There are no")}
                      {tr("cierres registrados.", "recorded closes yet.")}
                    </p>

                    <p
                      className="
                        text-sm
                        mint-text-secondary
                        mt-1
                      "
                    >
                      {tr("El historial comenzará", "The history will begin")}
                      {tr("cuando se cierre el", "when the first")}
                      {tr("primer período.", "period is closed.")}
                    </p>

                  </div>

                )

                : (

                  <div
                    className="
                      divide-y
                      divide-[var(--mint-border)]
                    "
                  >

                    {
                      cierres.map(
                        (
                          cierre
                        ) => (

                          <div
                            key={
                              cierre.id
                            }
                            className="
                              grid
                              grid-cols-1
                              lg:grid-cols-[1.15fr_repeat(4,minmax(135px,0.8fr))_1fr]
                              items-center
                              gap-4
                              px-6
                              py-4
                              hover:bg-[var(--mint-surface-soft)]
                              transition-colors
                            "
                          >

                            <div>

                              <p
                                className="
                                  font-bold
                                  mint-text-primary
                                "
                              >
                                {
                                  MESES[
                                    cierre.mes -
                                      1
                                  ]
                                }{" "}
                                {
                                  cierre.anio
                                }
                              </p>

                              <p
                                className="
                                  text-[9px]
                                  uppercase
                                  tracking-[0.1em]
                                  font-bold
                                  text-[var(--mint-teal)]
                                  mt-1
                                "
                              >
                                {tr("Cierre oficial", "Official close")}
                              </p>

                            </div>

                            {mostrarMXN && (

                            <DatoHistorial
                              titulo={tr("Utilidad MXN", "Profit MXN")}
                              valor={
                                cierre.utilidad_neta_mxn
                              }
                              moneda="MXN"
                              formatoDinero={
                                formatoDinero
                              }
                              tipo={
                                cierre.utilidad_neta_mxn >= 0
                                  ? "success"
                                  : "danger"
                              }
                            />

                            )}

                            {mostrarUSD && (

                            <DatoHistorial
                              titulo={tr("Utilidad USD", "Profit USD")}
                              valor={
                                cierre.utilidad_neta_usd
                              }
                              moneda="USD"
                              formatoDinero={
                                formatoDinero
                              }
                              tipo={
                                cierre.utilidad_neta_usd >= 0
                                  ? "info"
                                  : "danger"
                              }
                            />

                            )}

                            {mostrarMXN && (

                            <DatoHistorial
                              titulo={tr("Cobrado MXN", "Collected MXN")}
                              valor={
                                cierre.cobrado_mxn
                              }
                              moneda="MXN"
                              formatoDinero={
                                formatoDinero
                              }
                              tipo="normal"
                            />

                            )}

                            {mostrarUSD && (

                            <DatoHistorial
                              titulo={tr("Cobrado USD", "Collected USD")}
                              valor={
                                cierre.cobrado_usd
                              }
                              moneda="USD"
                              formatoDinero={
                                formatoDinero
                              }
                              tipo="normal"
                            />

                            )}

                            <div
                              className="
                                lg:text-right
                              "
                            >

                              <p
                                className="
                                  text-[9px]
                                  uppercase
                                  tracking-[0.08em]
                                  font-bold
                                  mint-text-muted
                                "
                              >
                                {tr("Fecha cierre", "Closing date")}
                              </p>

                              <p
                                className="
                                  text-xs
                                  font-medium
                                  mint-text-secondary
                                  mt-1
                                "
                              >
                                {
                                  formatoFecha(
                                    cierre.fecha_cierre
                                  )
                                }
                              </p>

                            </div>

                          </div>

                        )
                      )
                    }

                  </div>

                )
          }

        </div>

      </section>

    </div>

  );

}


type FilaCierreProps = {
  mostrarMXN: boolean;
  mostrarUSD: boolean;

  titulo: string;

  valorMXN: number;

  valorUSD: number;

  formatoDinero:
    (
      valor: number,
      moneda:
        | "MXN"
        | "USD"
    ) => string;

  tipo?:
    | "normal"
    | "success"
    | "danger";

};

function FilaCierre({
  mostrarMXN,
  mostrarUSD,

  titulo,

  valorMXN,

  valorUSD,

  formatoDinero,

  tipo = "normal",

}: FilaCierreProps) {

  const claseValor =
    tipo === "success"

      ? "text-[var(--mint-success)]"

      : tipo === "danger"

        ? "text-[var(--mint-danger)]"

        : "mint-text-primary";

  return (

    <div
      style={{ gridTemplateColumns: `minmax(0,1.3fr) repeat(${Number(mostrarMXN) + Number(mostrarUSD)},minmax(135px,0.7fr))` }}
      className="
        grid
        grid-cols-1
        
        items-center
        gap-3
        px-6
        py-4
        border-b
        border-[var(--mint-border)]
        hover:bg-[var(--mint-surface-soft)]
        transition-colors
      "
    >

      <div>

        <p
          className="
            text-sm
            font-semibold
            mint-text-primary
          "
        >
          {titulo}
        </p>

      </div>

      {mostrarMXN && (
      <div
        className="
          md:text-right
          md:pr-5
        "
      >

        <p
          className={`
            text-sm
            font-bold
            ${claseValor}
          `}
        >
          {
            formatoDinero(
              valorMXN,
              "MXN"
            )
          }
        </p>

      </div>
      )}

      {mostrarUSD && (
      <div
        className="
          md:text-right
          md:pl-5
          md:border-l
          border-[var(--mint-border)]
        "
      >

        <p
          className={`
            text-sm
            font-bold
            ${claseValor}
          `}
        >
          {
            formatoDinero(
              valorUSD,
              "USD"
            )
          }
        </p>

      </div>
      )}

    </div>

  );

}


type DatoPosicionProps = {

  titulo: string;

  valor: number;

  moneda:
    | "MXN"
    | "USD";

  formatoDinero:
    (
      valor: number,
      moneda:
        | "MXN"
        | "USD"
    ) => string;

  warning?: boolean;

};

function DatoPosicion({

  titulo,

  valor,

  moneda,

  formatoDinero,

  warning = false,

}: DatoPosicionProps) {

  return (

    <div
      className="
        px-5
        py-5
        border-r
        border-b
        border-white/15
        last:border-r-0
      "
    >

      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.1em]
          font-bold
          text-white/50
        "
      >
        {titulo}
      </p>

      <p
        className={`
          text-base
          font-bold
          mt-2

          ${
            warning
              ? "text-[var(--mint-gold)]"
              : "text-white"
          }
        `}
      >
        {
          formatoDinero(
            valor,
            moneda
          )
        }
      </p>

    </div>

  );

}


type DatoHistorialProps = {

  titulo: string;

  valor: number;

  moneda:
    | "MXN"
    | "USD";

  formatoDinero:
    (
      valor: number,
      moneda:
        | "MXN"
        | "USD"
    ) => string;

  tipo:
    | "normal"
    | "success"
    | "info"
    | "danger";

};

function DatoHistorial({

  titulo,

  valor,

  moneda,

  formatoDinero,

  tipo,

}: DatoHistorialProps) {

  const claseValor =
    tipo === "success"

      ? "text-[var(--mint-success)]"

      : tipo === "info"

        ? "text-[var(--mint-info)]"

        : tipo === "danger"

          ? "text-[var(--mint-danger)]"

          : "mint-text-primary";

  return (

    <div>

      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.08em]
          font-bold
          mint-text-muted
        "
      >
        {titulo}
      </p>

      <p
        className={`
          text-sm
          font-bold
          mt-1
          whitespace-nowrap
          ${claseValor}
        `}
      >
        {
          formatoDinero(
            valor,
            moneda
          )
        }
      </p>

    </div>

  );

}