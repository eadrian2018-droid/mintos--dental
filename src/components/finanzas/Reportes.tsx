import {
  useEffect,
  useState,
} from "react";

import jsPDF from "jspdf";
import { useLanguage } from "../../context/LanguageContext";

import {
  supabase,
} from "../../lib/supabase";

import type {
  Tratamiento,
} from "../../types/Tratamiento";

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

type ReportesProps = {

  ingresos: number;

  cobradoMXN: number;
  cobradoUSD: number;

  pendiente: number;

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

  totalTarjeta: number;

  totalTransferencia: number;
  totalTransferenciaUSD: number;

  tratamientosFiltrados: Tratamiento[];

  periodo:
    | "semana"
    | "mes"
    | "anio"
    | "historico";

  lunesSemana: Date;

  sabadoSemana: Date;

};

export default function Reportes({

  ingresos,

  cobradoMXN,
  cobradoUSD,

  pendiente,

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

  totalTarjeta,

  totalTransferencia,
  totalTransferenciaUSD,

  tratamientosFiltrados,

  periodo,

  lunesSemana,

  sabadoSemana,

}: ReportesProps) {

  const { language } = useLanguage();
  const es = language === "es";
  const locale = es ? "es-MX" : "en-US";
  const t = (esText: string, enText: string) => es ? esText : enText;

  const [monedaPrincipal, setMonedaPrincipal] = useState<"MXN" | "USD">("MXN");
  const [monedaSecundariaActiva, setMonedaSecundariaActiva] = useState(true);
  const mostrarMXN = monedaPrincipal === "MXN" || monedaSecundariaActiva;
  const mostrarUSD = monedaPrincipal === "USD" || monedaSecundariaActiva;

  useEffect(() => {
    let activo = true;
    async function cargarMonedas() {
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
    }
    void cargarMonedas();
    return () => { activo = false; };
  }, []);

  const [
    cierres,
    setCierres,
  ] = useState<CierreFinanciero[]>(
    []
  );

  const [
    cargandoCierres,
    setCargandoCierres,
  ] = useState(
    true
  );

  useEffect(
    () => {

      cargarCierres();

    },
    []
  );

  async function cargarCierres() {

    setCargandoCierres(
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
            ascending: false,
          }
        )

        .order(
          "mes",
          {
            ascending: false,
          }
        );

    if (
      error
    ) {

      console.error(
        "Error cargando cierres financieros:",
        error
      );

      setCargandoCierres(
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

    setCargandoCierres(
      false
    );

  }

  const formatoFechaCierre =
    (
      fecha: string
    ) =>
      new Date(
        fecha
      ).toLocaleString(
        locale,
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );

  const formatoMonto =
    (
      valor: number
    ) =>
      Number(
        valor || 0
      ).toLocaleString(
        locale,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

  const tratamientosFinalizados =
    tratamientosFiltrados.filter(
      (tratamiento) =>
        tratamiento.estado ===
        "Finalizado"
    ).length;

  const tratamientosPendientes =
    tratamientosFiltrados.filter(
      (tratamiento) =>
        String(
          tratamiento.estado || ""
        ) !== "Finalizado"
        &&
        String(
          tratamiento.estado || ""
        ) !== "Cancelado"
    ).length;

  const tratamientosCancelados =
    tratamientosFiltrados.filter(
      (tratamiento) =>
        String(
          tratamiento.estado || ""
        ) === "Cancelado"
    ).length;

  const etiquetaPeriodo =
    periodo === "semana"

      ? `${lunesSemana.toLocaleDateString(
          locale,
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )} — ${sabadoSemana.toLocaleDateString(
          locale,
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )}`

      : periodo === "mes"

        ? new Date().toLocaleDateString(
            locale,
            {
              month: "long",
              year: "numeric",
            }
          )

        : periodo === "anio"

          ? String(
              new Date().getFullYear()
            )

          : t("Histórico completo", "Complete history");

  function generarPDF() {

    const pdf =
      new jsPDF(
        "p",
        "mm",
        "a4"
      );

    const anchoPagina =
      pdf.internal.pageSize.getWidth();

    const altoPagina =
      pdf.internal.pageSize.getHeight();

    const margen = 16;

    const anchoContenido =
      anchoPagina -
      margen * 2;

    const teal: [
      number,
      number,
      number
    ] = [
      15,
      118,
      110,
    ];

    const slate: [
      number,
      number,
      number
    ] = [
      30,
      41,
      59,
    ];

    const muted: [
      number,
      number,
      number
    ] = [
      100,
      116,
      139,
    ];

    const border: [
      number,
      number,
      number
    ] = [
      226,
      232,
      240,
    ];

    const success: [
      number,
      number,
      number
    ] = [
      5,
      150,
      105,
    ];

    const danger: [
      number,
      number,
      number
    ] = [
      225,
      29,
      72,
    ];

    const info: [
      number,
      number,
      number
    ] = [
      37,
      99,
      235,
    ];

    const warning: [
      number,
      number,
      number
    ] = [
      217,
      119,
      6,
    ];

    const formatoPDF =
      (
        valor: number,
        moneda:
          | "MXN"
          | "USD"
      ) =>
        `$${Number(
          valor || 0
        ).toLocaleString(
          locale,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} ${moneda}`;

    let y = 16;

    const nuevaPaginaSiHaceFalta =
      (
        alturaNecesaria: number
      ) => {

        if (
          y +
          alturaNecesaria >
          altoPagina - 16
        ) {

          pdf.addPage();

          y = 16;

        }

      };

    const tituloSeccion =
      (
        titulo: string
      ) => {

        nuevaPaginaSiHaceFalta(
          16
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          9
        );

        pdf.setTextColor(
          ...teal
        );

        pdf.text(
          titulo.toUpperCase(),
          margen,
          y
        );

        y += 7;

      };

    const fila =
      (
        titulo: string,
        valor: string,
        tipo:
          | "normal"
          | "positivo"
          | "negativo"
          | "info"
          | "warning" =
            "normal"
      ) => {

        nuevaPaginaSiHaceFalta(
          10
        );

        pdf.setDrawColor(
          ...border
        );

        pdf.line(
          margen,
          y + 5,
          anchoPagina - margen,
          y + 5
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          9
        );

        pdf.setTextColor(
          ...slate
        );

        pdf.text(
          titulo,
          margen + 2,
          y
        );

        if (
          tipo === "positivo"
        ) {

          pdf.setTextColor(
            ...success
          );

        }
        else if (
          tipo === "negativo"
        ) {

          pdf.setTextColor(
            ...danger
          );

        }
        else if (
          tipo === "info"
        ) {

          pdf.setTextColor(
            ...info
          );

        }
        else if (
          tipo === "warning"
        ) {

          pdf.setTextColor(
            ...warning
          );

        }
        else {

          pdf.setTextColor(
            ...slate
          );

        }

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          valor,
          anchoPagina -
          margen -
          2,
          y,
          {
            align: "right",
          }
        );

        y += 9;

      };

    pdf.setFillColor(
      ...teal
    );

    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      34,
      4,
      4,
      "F"
    );

    pdf.setTextColor(
      255,
      255,
      255
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      18
    );

    pdf.text(
      "MintOS",
      margen + 7,
      y + 10
    );

    pdf.setFontSize(
      13
    );

    pdf.text(
      t("Reporte financiero", "Financial report"),
      margen + 7,
      y + 20
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      8.5
    );

    pdf.text(
      `${t("Período", "Period")}: ${etiquetaPeriodo}`,
      margen + 7,
      y + 27
    );

    const fechaGeneracion =
      new Date()
        .toLocaleString(
          locale,
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        );

    pdf.text(
      `${t("Generado", "Generated")}: ${fechaGeneracion}`,
      anchoPagina -
      margen -
      7,
      y + 27,
      {
        align: "right",
      }
    );

    y += 44;

    tituloSeccion(
      t("Resumen de operación", "Operations summary")
    );

    const tarjetas =
      [
        {
          titulo:
            t("Tratamientos", "Treatments"),
          valor:
            tratamientosFiltrados.length,
        },
        {
          titulo:
            t("Finalizados", "Completed"),
          valor:
            tratamientosFinalizados,
        },
        {
          titulo:
            t("En proceso", "In progress"),
          valor:
            tratamientosPendientes,
        },
        {
          titulo:
            t("Cancelados", "Canceled"),
          valor:
            tratamientosCancelados,
        },
      ];

    const gap = 3;

    const anchoTarjeta =
      (
        anchoContenido -
        gap * 3
      ) / 4;

    tarjetas.forEach(
      (
        tarjeta,
        index
      ) => {

        const x =
          margen +
          index *
          (
            anchoTarjeta +
            gap
          );

        pdf.setFillColor(
          248,
          250,
          252
        );

        pdf.setDrawColor(
          ...border
        );

        pdf.roundedRect(
          x,
          y,
          anchoTarjeta,
          22,
          3,
          3,
          "FD"
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          7
        );

        pdf.setTextColor(
          ...muted
        );

        pdf.text(
          tarjeta.titulo
            .toUpperCase(),
          x + 4,
          y + 7
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          13
        );

        pdf.setTextColor(
          ...slate
        );

        pdf.text(
          String(
            tarjeta.valor
          ),
          x + 4,
          y + 16
        );

      }
    );

    y += 31;

    if (mostrarMXN) {
    tituloSeccion(
      t("Estado de resultados MXN", "Income statement MXN")
    );

    fila(
      t("Cobros recibidos", "Payments received"),
      formatoPDF(
        cobradoMXN,
        "MXN"
      ),
      "positivo"
    );

    fila(
      t("Base clínica", "Clinical base"),
      formatoPDF(
        totalBaseClinicaMXN,
        "MXN"
      )
    );

    fila(
      t("Comisiones doctores", "Doctor commissions"),
      formatoPDF(
        totalComisionesDoctorMXN,
        "MXN"
      ),
      "negativo"
    );

    fila(
      t("Gastos generales", "General expenses"),
      formatoPDF(
        totalGastos,
        "MXN"
      ),
      "negativo"
    );

    pdf.setFillColor(
      236,
      253,
      245
    );

    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      16,
      3,
      3,
      "F"
    );

    pdf.setTextColor(
      ...success
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      t("Utilidad neta MXN", "Net profit MXN"),
      margen + 5,
      y + 10
    );

    pdf.text(
      formatoPDF(
        gananciaNeta,
        "MXN"
      ),
      anchoPagina -
      margen -
      5,
      y + 10,
      {
        align: "right",
      }
    );

    y += 24;

    }

    if (mostrarUSD) {
    tituloSeccion(
      t("Estado de resultados USD", "Income statement USD")
    );

    fila(
      t("Cobros recibidos", "Payments received"),
      formatoPDF(
        cobradoUSD,
        "USD"
      ),
      "positivo"
    );

    fila(
      t("Base clínica", "Clinical base"),
      formatoPDF(
        totalBaseClinicaUSD,
        "USD"
      )
    );

    fila(
      t("Comisiones doctores", "Doctor commissions"),
      formatoPDF(
        totalComisionesDoctorUSD,
        "USD"
      ),
      "negativo"
    );

    fila(
      t("Gastos generales", "General expenses"),
      formatoPDF(
        totalGastosUSD,
        "USD"
      ),
      "negativo"
    );

    pdf.setFillColor(
      239,
      246,
      255
    );

    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      16,
      3,
      3,
      "F"
    );

    pdf.setTextColor(
      ...info
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      t("Utilidad neta USD", "Net profit USD"),
      margen + 5,
      y + 10
    );

    pdf.text(
      formatoPDF(
        gananciaNetaUSD,
        "USD"
      ),
      anchoPagina -
      margen -
      5,
      y + 10,
      {
        align: "right",
      }
    );

    y += 24;

    }

    tituloSeccion(
      t("Liquidez", "Liquidity")
    );

    if (mostrarMXN) {
    fila(
      t("Caja MXN", "Cash MXN"),
      formatoPDF(
        cajaMXN,
        "MXN"
      ),
      "positivo"
    );
    }

    if (mostrarUSD) {
    fila(
      t("Caja USD", "Cash USD"),
      formatoPDF(
        cajaUSD,
        "USD"
      ),
      "info"
    );
    }

    if (mostrarMXN) {
    fila(
      t("Tarjeta / Banco", "Card / Bank"),
      formatoPDF(
        totalTarjeta,
        "MXN"
      )
    );
    }

    if (mostrarMXN) {
    fila(
      t("Transferencias MXN", "Transfers MXN"),
      formatoPDF(
        totalTransferencia,
        "MXN"
      )
    );
    }

    if (mostrarUSD) {
    fila(
      t("Transferencias USD", "Transfers USD"),
      formatoPDF(
        totalTransferenciaUSD,
        "USD"
      ),
      "info"
    );
    }

    y += 4;

    if (mostrarMXN) {
    tituloSeccion(
      t("Cuentas por cobrar y producción", "Receivables and production")
    );

    fila(
      t("Saldo pendiente de pacientes", "Outstanding patient balances"),
      formatoPDF(
        pendiente,
        "MXN"
      ),
      "negativo"
    );

    fila(
      t("Valor generado", "Production value"),
      formatoPDF(
        ingresos,
        "MXN"
      ),
      "positivo"
    );

    }

    const totalPaginas =
      pdf.getNumberOfPages();

    for (
      let pagina = 1;
      pagina <= totalPaginas;
      pagina++
    ) {

      pdf.setPage(
        pagina
      );

      pdf.setDrawColor(
        ...border
      );

      pdf.line(
        margen,
        altoPagina - 12,
        anchoPagina - margen,
        altoPagina - 12
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        7
      );

      pdf.setTextColor(
        ...muted
      );

      pdf.text(
        t("MintOS Dental System · Reporte financiero", "MintOS Dental System · Financial report"),
        margen,
        altoPagina - 7
      );

      pdf.text(
        `${t("Página", "Page")} ${pagina} ${t("de", "of")} ${totalPaginas}`,
        anchoPagina -
        margen,
        altoPagina - 7,
        {
          align: "right",
        }
      );

    }

    const nombrePeriodo =
      periodo === "semana"
        ? "semana"
        : periodo === "mes"
          ? "mes"
          : periodo === "anio"
            ? "anio"
            : "historico";

    pdf.save(
      `MintOS_Reporte_Financiero_${nombrePeriodo}.pdf`
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
            h-full
            w-1
            bg-[linear-gradient(180deg,var(--mint-teal)_0%,var(--mint-teal-soft)_58%,var(--mint-gold)_100%)]
          "
        />

        <div
          className="
            px-7
            py-6
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-6
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.16em]
                font-bold
                text-[var(--mint-teal)]
              "
            >
              {t("Finanzas", "Finances")}
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
              {t("Reporte financiero", "Financial report")}
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
                max-w-2xl
              "
            >
              {t("Cierre financiero del período seleccionado,", "Financial close for the selected period,")}
              {t("con ingresos, costos, comisiones, gastos y", "with income, costs, commissions, expenses and")}
              {t("utilidad separados por moneda.", "profit separated by currency.")}
            </p>

          </div>

          <div
            className="
              flex
              items-center
              gap-5
              flex-wrap
            "
          >

            <div
              className="
                flex
                items-center
                gap-5
                pr-5
                border-r
                border-[var(--mint-border-teal)]
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.1em]
                    font-bold
                    mint-text-muted
                  "
                >
                  {t("Tratamientos", "Treatments")}
                </p>

                <p
                  className="
                    text-2xl
                    font-bold
                    mint-text-primary
                    mt-1
                  "
                >
                  {
                    tratamientosFiltrados.length
                  }
                </p>

              </div>

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.1em]
                    font-bold
                    mint-text-muted
                  "
                >
                  {t("Finalizados", "Completed")}
                </p>

                <p
                  className="
                    text-2xl
                    font-bold
                    text-[var(--mint-success)]
                    mt-1
                  "
                >
                  {
                    tratamientosFinalizados
                  }
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={
                generarPDF
              }
              className="
                mint-btn
                mint-btn-primary
              "
            >
              {t("Exportar PDF", "Export PDF")}
            </button>

          </div>

        </div>

      </section>


      {/* ESTADO FINANCIERO */}

      <section>

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
                uppercase
                tracking-[0.14em]
                font-bold
                mint-text-muted
                mb-1
              "
            >
              {t("Estado financiero", "Financial statement")}
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {t("Resultado del período", "Period results")}
            </h3>

          </div>

          <p
            className="
              hidden
              md:block
              text-xs
              mint-text-muted
            "
          >
            {mostrarMXN && mostrarUSD ? t("Comparativo MXN / USD", "MXN / USD comparison") : (mostrarMXN ? "MXN" : "USD")}
          </p>

        </div>

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

          {/* CABECERA */}

          <div
            className={`
              grid
              ${mostrarMXN && mostrarUSD ? "grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)]" : "grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)]"}
              items-center
              px-6
              py-4
              bg-[var(--mint-surface-teal)]
              border-b
              border-[var(--mint-border-teal)]
            `}
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
                {t("Concepto", "Description")}
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

          <FilaEstadoFinanciero
            titulo={t("Cobros recibidos", "Payments received")}
            subtitulo={t("Pagos reales registrados", "Actual recorded payments")}
            valorMXN={cobradoMXN}
            valorUSD={cobradoUSD}
            formatoMonto={formatoMonto}
            mostrarMXN={mostrarMXN}
            mostrarUSD={mostrarUSD}
            tipo="positivo"
          />

          <FilaEstadoFinanciero
            titulo={t("Base clínica", "Clinical base")}
            subtitulo={t("Resultado después de costos clínicos", "Result after clinical costs")}
            valorMXN={totalBaseClinicaMXN}
            valorUSD={totalBaseClinicaUSD}
            formatoMonto={formatoMonto}
            mostrarMXN={mostrarMXN}
            mostrarUSD={mostrarUSD}
          />

          <FilaEstadoFinanciero
            titulo={t("Comisiones doctores", "Doctor commissions")}
            subtitulo={t("Comisiones generadas por tratamientos finalizados", "Commissions generated from completed treatments")}
            valorMXN={totalComisionesDoctorMXN}
            valorUSD={totalComisionesDoctorUSD}
            formatoMonto={formatoMonto}
            mostrarMXN={mostrarMXN}
            mostrarUSD={mostrarUSD}
            tipo="negativo"
          />

          <FilaEstadoFinanciero
            titulo={t("Gastos generales", "General expenses")}
            subtitulo={t("Egresos registrados en el período", "Expenses recorded in the period")}
            valorMXN={totalGastos}
            valorUSD={totalGastosUSD}
            formatoMonto={formatoMonto}
            mostrarMXN={mostrarMXN}
            mostrarUSD={mostrarUSD}
            tipo="negativo"
          />

          <div
            className={`
              grid
              grid-cols-1
              ${mostrarMXN && mostrarUSD ? "md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)]" : "md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)]"}
              items-center
              gap-3
              px-6
              py-5
              bg-[linear-gradient(90deg,var(--mint-surface-teal)_0%,var(--mint-surface)_100%)]
              border-t
              border-[var(--mint-border-teal)]
            `}
          >

            <div>

              <p
                className="
                  text-base
                  font-bold
                  mint-text-primary
                "
              >
                {t("Utilidad neta", "Net profit")}
              </p>

              <p
                className="
                  text-xs
                  mint-text-muted
                  mt-1
                "
              >
                {t("Resultado final del período", "Final result for the period")}
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
                  text-2xl
                  font-bold

                  ${
                    gananciaNeta >= 0
                      ? "text-[var(--mint-success)]"
                      : "text-[var(--mint-danger)]"
                  }
                `}
              >
                $
                {
                  formatoMonto(
                    gananciaNeta
                  )
                }
              </p>

              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.1em]
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
                md:text-right
                md:pl-5
                md:border-l
                border-[var(--mint-border-teal)]
              "
            >

              <p
                className={`
                  text-2xl
                  font-bold

                  ${
                    gananciaNetaUSD >= 0
                      ? "text-[var(--mint-info)]"
                      : "text-[var(--mint-danger)]"
                  }
                `}
              >
                $
                {
                  formatoMonto(
                    gananciaNetaUSD
                  )
                }
              </p>

              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.1em]
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

        </div>

      </section>


      {/* TESORERÍA */}

      <section>

        <div
          className="
            mb-4
          "
        >

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
            {t("Tesorería", "Treasury")}
          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            {t("Disponibilidad financiera", "Available funds")}
          </h3>

        </div>

        <div
          className="
            relative
            overflow-hidden
            rounded-[22px]
            border
            border-[var(--mint-border-teal)]
            !bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_50%,#0b8f80_100%)]
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

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${mostrarMXN && mostrarUSD ? "xl:grid-cols-5" : mostrarMXN ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
            {mostrarMXN && (
              <DatoTesoreria titulo={t("Caja MXN", "Cash MXN")} valor={cajaMXN} moneda="MXN" formatoMonto={formatoMonto} />
            )}
            {mostrarUSD && (
              <DatoTesoreria titulo={t("Caja USD", "Cash USD")} valor={cajaUSD} moneda="USD" formatoMonto={formatoMonto} />
            )}
            {mostrarMXN && (
              <DatoTesoreria titulo={t("Tarjeta / Banco", "Card / Bank")} valor={totalTarjeta} moneda="MXN" formatoMonto={formatoMonto} />
            )}
            {mostrarMXN && (
              <DatoTesoreria titulo={t("Transferencias", "Transfers")} valor={totalTransferencia} moneda="MXN" formatoMonto={formatoMonto} />
            )}
            {mostrarUSD && (
              <DatoTesoreria titulo={t("Transferencias", "Transfers")} valor={totalTransferenciaUSD} moneda="USD" formatoMonto={formatoMonto} ultimo />
            )}
          </div>

        </div>

      </section>


      {/* OPERACIÓN + ACTIVIDAD */}

      <section
        className="
          grid
          grid-cols-1
          xl:grid-cols-[1.2fr_0.8fr]
          gap-5
        "
      >

        <div>

          <div
            className="
              mb-4
            "
          >

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
              {t("Operación", "Operations")}
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {t("Estado de tratamientos", "Treatment status")}
            </h3>

          </div>

          <div
            className="
              grid
              grid-cols-2
              lg:grid-cols-4
              gap-3
            "
          >

            <IndicadorOperacion
              titulo="Total"
              valor={
                tratamientosFiltrados.length
              }
              descripcion={t("Registrados", "Registered")}
            />

            <IndicadorOperacion
              titulo="Finalizados"
              valor={
                tratamientosFinalizados
              }
              descripcion={t("Completados", "Completed")}
              tipo="success"
            />

            <IndicadorOperacion
              titulo={t("En proceso", "In progress")}
              valor={
                tratamientosPendientes
              }
              descripcion={t("Pendientes", "Pending")}
              tipo="warning"
            />

            <IndicadorOperacion
              titulo={t("Cancelados", "Canceled")}
              valor={
                tratamientosCancelados
              }
              descripcion={t("Sin concluir", "Unfinished")}
              tipo="danger"
            />

          </div>

        </div>

        {mostrarMXN && (
        <div>

          <div
            className="
              mb-4
            "
          >

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
              {t("Actividad financiera", "Financial activity")}
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {t("Pendiente y producción", "Outstanding and production")}
            </h3>

          </div>

          <div
            className="
              rounded-[22px]
              border
              border-[var(--mint-border)]
              bg-[var(--mint-surface)]
              shadow-[0_8px_24px_rgba(15,42,65,0.045)]
              overflow-hidden
            "
          >

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
              "
            >

              <div
                className="
                  p-5
                  sm:border-r
                  border-[var(--mint-border)]
                "
              >

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.1em]
                    font-bold
                    text-[var(--mint-danger)]
                  "
                >
                  {t("Por cobrar", "Receivables")}
                </p>

                <p
                  className="
                    text-2xl
                    font-bold
                    text-[var(--mint-danger)]
                    mt-2
                  "
                >
                  $
                  {
                    formatoMonto(
                      pendiente
                    )
                  }
                </p>

                <p
                  className="
                    text-[10px]
                    uppercase
                    font-bold
                    mint-text-muted
                    mt-1
                  "
                >
                  {t("MXN pendiente", "MXN outstanding")}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-3
                  "
                >
                  {t("Saldo pendiente de pacientes.", "Outstanding patient balances.")}
                </p>

              </div>

              <div
                className="
                  p-5
                  border-t
                  sm:border-t-0
                  border-[var(--mint-border)]
                "
              >

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.1em]
                    font-bold
                    text-[var(--mint-teal)]
                  "
                >
                  {t("Producción", "Production")}
                </p>

                <p
                  className="
                    text-2xl
                    font-bold
                    mint-text-primary
                    mt-2
                  "
                >
                  $
                  {
                    formatoMonto(
                      ingresos
                    )
                  }
                </p>

                <p
                  className="
                    text-[10px]
                    uppercase
                    font-bold
                    mint-text-muted
                    mt-1
                  "
                >
                  {t("MXN generado", "MXN generated")}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-3
                  "
                >
                  {t("Valor total registrado en tratamientos.", "Total value recorded in treatments.")}
                </p>

              </div>

            </div>

          </div>

        </div>
        )}

      </section>

            {/* CIERRES OFICIALES */}

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
              {t("Cierres oficiales", "Official closes")}
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {t("Historial financiero cerrado", "Closed financial history")}
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {t("Consulta las fotografías financieras", "View the financial snapshots")}
              {t("guardadas al cerrar cada mes.", "saved at each month-end close.")}
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
              {cierres.length} {t("cierres guardados", "saved closes")}
            </span>

          </div>

        </div>

        <div
          className="
            rounded-[22px]
            border
            border-[var(--mint-border)]
            bg-[var(--mint-surface)]
            shadow-[0_8px_24px_rgba(15,42,65,0.045)]
            overflow-hidden
          "
        >

          {
            cargandoCierres

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
                  {t("Cargando cierres financieros...", "Loading financial closes...")}
                </div>

              )

              : cierres.length === 0

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

                      <span
                        className="
                          w-2.5
                          h-2.5
                          rounded-full
                          bg-[var(--mint-teal)]
                        "
                      />

                    </div>

                    <p
                      className="
                        font-bold
                        mint-text-primary
                      "
                    >
                      {t("Todavía no hay cierres mensuales.", "There are no monthly closes yet.")}
                    </p>

                    <p
                      className="
                        text-sm
                        mint-text-secondary
                        mt-1
                      "
                    >
                      {t("Los meses cerrados desde", "Months closed from")}
                      {t("Finanzas → Cierre mensual", "Finances → Monthly close")}
                      {t("aparecerán aquí.", "will appear here.")}
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
                              lg:grid-cols-[1.1fr_repeat(5,minmax(120px,0.75fr))_1fr]
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
                                  (es ? MESES : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])[
                                    cierre.mes - 1
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
                                {t("Cierre oficial", "Official close")}
                              </p>

                            </div>

                            {mostrarMXN && (
                            <DatoCierre
                              titulo={t("Cobrado MXN", "Collected MXN")}
                              valor={
                                cierre.cobrado_mxn
                              }
                              formatoMonto={
                                formatoMonto
                              }
                              tipo="success"
                            />
                            )}

                            {mostrarUSD && (
                            <DatoCierre
                              titulo={t("Cobrado USD", "Collected USD")}
                              valor={
                                cierre.cobrado_usd
                              }
                              formatoMonto={
                                formatoMonto
                              }
                              tipo="info"
                            />
                            )}

                            {mostrarMXN && (
                            <DatoCierre
                              titulo={t("Gastos MXN", "Expenses MXN")}
                              valor={
                                cierre.gastos_mxn
                              }
                              formatoMonto={
                                formatoMonto
                              }
                              tipo="danger"
                            />
                            )}

                            {mostrarMXN && (
                            <DatoCierre
                              titulo={t("Utilidad MXN", "Profit MXN")}
                              valor={
                                cierre.utilidad_neta_mxn
                              }
                              formatoMonto={
                                formatoMonto
                              }
                              tipo={
                                cierre.utilidad_neta_mxn >= 0
                                  ? "success"
                                  : "danger"
                              }
                            />
                            )}

                            {mostrarUSD && (
                            <DatoCierre
                              titulo={t("Utilidad USD", "Profit USD")}
                              valor={
                                cierre.utilidad_neta_usd
                              }
                              formatoMonto={
                                formatoMonto
                              }
                              tipo={
                                cierre.utilidad_neta_usd >= 0
                                  ? "info"
                                  : "danger"
                              }
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
                                {t("Fecha cierre", "Closing date")}
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
                                  formatoFechaCierre(
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


type FilaEstadoFinancieroProps = {

  titulo: string;

  subtitulo: string;

  valorMXN: number;

  valorUSD: number;

  formatoMonto:
    (
      valor: number
    ) => string;

  tipo?:
    | "normal"
    | "positivo"
    | "negativo";

  mostrarMXN: boolean;
  mostrarUSD: boolean;

};

function FilaEstadoFinanciero({

  titulo,

  subtitulo,

  valorMXN,

  valorUSD,

  formatoMonto,

  tipo = "normal",

  mostrarMXN,
  mostrarUSD,

}: FilaEstadoFinancieroProps) {

  const claseValor =
    tipo === "positivo"

      ? "text-[var(--mint-success)]"

      : tipo === "negativo"

        ? "text-[var(--mint-danger)]"

        : "mint-text-primary";

  return (

    <div
      className={`
        grid
        grid-cols-1
        ${mostrarMXN && mostrarUSD ? "md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)]" : "md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)]"}
        items-center
        gap-3
        px-6
        py-4
        border-b
        border-[var(--mint-border)]
        last:border-b-0
        hover:bg-[var(--mint-surface-soft)]
        transition-colors
      `}
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

        <p
          className="
            text-[11px]
            mint-text-muted
            mt-0.5
          "
        >
          {subtitulo}
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
            text-base
            font-bold
            ${claseValor}
          `}
        >
          {
            tipo === "negativo"
              ? "−"
              : ""
          }
          $
          {
            formatoMonto(
              valorMXN
            )
          }
        </p>

        <p
          className="
            md:hidden
            text-[9px]
            uppercase
            font-bold
            mint-text-muted
            mt-0.5
          "
        >
          MXN
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
            text-base
            font-bold
            ${claseValor}
          `}
        >
          {
            tipo === "negativo"
              ? "−"
              : ""
          }
          $
          {
            formatoMonto(
              valorUSD
            )
          }
        </p>

        <p
          className="
            md:hidden
            text-[9px]
            uppercase
            font-bold
            mint-text-muted
            mt-0.5
          "
        >
          USD
        </p>

      </div>
      )}

    </div>

  );

}


type DatoTesoreriaProps = {

  titulo: string;

  valor: number;

  moneda:
    | "MXN"
    | "USD";

  formatoMonto:
    (
      valor: number
    ) => string;

  ultimo?: boolean;

};

function DatoTesoreria({

  titulo,

  valor,

  moneda,

  formatoMonto,

  ultimo = false,

}: DatoTesoreriaProps) {

  return (

    <div
      className={`
        px-6
        py-5

        ${
          !ultimo

            ? `
                border-b
                sm:border-b-0
                sm:border-r
                border-white/15
              `

            : ""
        }
      `}
    >

      <p
        className="
          text-[10px]
          uppercase
          tracking-[0.1em]
          font-bold
          !text-white/85
        "
      >
        {titulo}
      </p>

      <p
        className="
          text-2xl
          font-bold
          !text-white
          mt-2
        "
      >
        $
        {
          formatoMonto(
            valor
          )
        }
      </p>

      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.1em]
          font-bold
          !text-white/75
          mt-1
        "
      >
        {moneda}
      </p>

    </div>

  );

}


type IndicadorOperacionProps = {

  titulo: string;

  valor: number;

  descripcion: string;

  tipo?:
    | "normal"
    | "success"
    | "warning"
    | "danger";

};

function IndicadorOperacion({

  titulo,

  valor,

  descripcion,

  tipo = "normal",

}: IndicadorOperacionProps) {

  const claseValor =
    tipo === "success"

      ? "text-[var(--mint-success)]"

      : tipo === "warning"

        ? "text-[var(--mint-warning)]"

        : tipo === "danger"

          ? "text-[var(--mint-danger)]"

          : "mint-text-primary";

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[18px]
        border
        border-[var(--mint-border)]
        bg-[var(--mint-surface)]
        p-5
        shadow-[0_6px_20px_rgba(15,42,65,0.04)]
      "
    >

      <div
        className={`
          absolute
          left-0
          top-0
          bottom-0
          w-[3px]

          ${
            tipo === "success"

              ? "bg-[var(--mint-success)]"

              : tipo === "warning"

                ? "bg-[var(--mint-warning)]"

                : tipo === "danger"

                  ? "bg-[var(--mint-danger)]"

                  : "bg-[var(--mint-teal)]"
          }
        `}
      />

      <p
        className="
          text-xs
          font-semibold
          mint-text-secondary
        "
      >
        {titulo}
      </p>

      <p
        className={`
          text-2xl
          font-bold
          mt-2
          ${claseValor}
        `}
      >
        {valor}
      </p>

      <p
        className="
          text-[11px]
          mint-text-muted
          mt-1
        "
      >
        {descripcion}
      </p>

    </div>

  );

}


type DatoCierreProps = {

  titulo: string;

  valor: number;

  formatoMonto:
    (
      valor: number
    ) => string;

  tipo:
    | "success"
    | "info"
    | "danger";

};

function DatoCierre({

  titulo,

  valor,

  formatoMonto,

  tipo,

}: DatoCierreProps) {

  const claseValor =
    tipo === "success"

      ? "text-[var(--mint-success)]"

      : tipo === "info"

        ? "text-[var(--mint-info)]"

        : "text-[var(--mint-danger)]";

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
        $
        {
          formatoMonto(
            valor
          )
        }
      </p>

    </div>

  );

}