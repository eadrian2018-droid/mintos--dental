import {
  useEffect,
  useState,
} from "react";

import jsPDF from "jspdf";

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
        "es-MX",
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
        "es-MX",
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
          "es-MX",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )} — ${sabadoSemana.toLocaleDateString(
          "es-MX",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )}`

      : periodo === "mes"

        ? new Date().toLocaleDateString(
            "es-MX",
            {
              month: "long",
              year: "numeric",
            }
          )

        : periodo === "anio"

          ? String(
              new Date().getFullYear()
            )

          : "Histórico completo";

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
          "es-MX",
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
      "Reporte financiero",
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
      `Período: ${etiquetaPeriodo}`,
      margen + 7,
      y + 27
    );

    const fechaGeneracion =
      new Date()
        .toLocaleString(
          "es-MX",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        );

    pdf.text(
      `Generado: ${fechaGeneracion}`,
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
      "Resumen de operación"
    );

    const tarjetas =
      [
        {
          titulo:
            "Tratamientos",
          valor:
            tratamientosFiltrados.length,
        },
        {
          titulo:
            "Finalizados",
          valor:
            tratamientosFinalizados,
        },
        {
          titulo:
            "En proceso",
          valor:
            tratamientosPendientes,
        },
        {
          titulo:
            "Cancelados",
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

    tituloSeccion(
      "Estado de resultados MXN"
    );

    fila(
      "Cobros recibidos",
      formatoPDF(
        cobradoMXN,
        "MXN"
      ),
      "positivo"
    );

    fila(
      "Base clínica",
      formatoPDF(
        totalBaseClinicaMXN,
        "MXN"
      )
    );

    fila(
      "Comisiones doctores",
      formatoPDF(
        totalComisionesDoctorMXN,
        "MXN"
      ),
      "negativo"
    );

    fila(
      "Gastos generales",
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
      "Utilidad neta MXN",
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

    tituloSeccion(
      "Estado de resultados USD"
    );

    fila(
      "Cobros recibidos",
      formatoPDF(
        cobradoUSD,
        "USD"
      ),
      "positivo"
    );

    fila(
      "Base clínica",
      formatoPDF(
        totalBaseClinicaUSD,
        "USD"
      )
    );

    fila(
      "Comisiones doctores",
      formatoPDF(
        totalComisionesDoctorUSD,
        "USD"
      ),
      "negativo"
    );

    fila(
      "Gastos generales",
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
      "Utilidad neta USD",
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

    tituloSeccion(
      "Liquidez"
    );

    fila(
      "Caja MXN",
      formatoPDF(
        cajaMXN,
        "MXN"
      ),
      "positivo"
    );

    fila(
      "Caja USD",
      formatoPDF(
        cajaUSD,
        "USD"
      ),
      "info"
    );

    fila(
      "Tarjeta / Banco",
      formatoPDF(
        totalTarjeta,
        "MXN"
      )
    );

    fila(
      "Transferencias MXN",
      formatoPDF(
        totalTransferencia,
        "MXN"
      )
    );

    fila(
      "Transferencias USD",
      formatoPDF(
        totalTransferenciaUSD,
        "USD"
      ),
      "info"
    );

    y += 4;

    tituloSeccion(
      "Cuentas por cobrar y producción"
    );

    fila(
      "Saldo pendiente de pacientes",
      formatoPDF(
        pendiente,
        "MXN"
      ),
      "negativo"
    );

    fila(
      "Valor generado",
      formatoPDF(
        ingresos,
        "MXN"
      ),
      "positivo"
    );

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
        "MintOS Dental System · Reporte financiero",
        margen,
        altoPagina - 7
      );

      pdf.text(
        `Página ${pagina} de ${totalPaginas}`,
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
              Finanzas
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
              Reporte financiero
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
                max-w-2xl
              "
            >
              Cierre financiero del período seleccionado,
              con ingresos, costos, comisiones, gastos y
              utilidad separados por moneda.
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
                  Tratamientos
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
                  Finalizados
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
              Exportar PDF
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
              Estado financiero
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Resultado del período
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
            Comparativo MXN / USD
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
            className="
              grid
              grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)]
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
                Concepto
              </p>

            </div>

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

          </div>

          <FilaEstadoFinanciero
            titulo="Cobros recibidos"
            subtitulo="Pagos reales registrados"
            valorMXN={cobradoMXN}
            valorUSD={cobradoUSD}
            formatoMonto={formatoMonto}
            tipo="positivo"
          />

          <FilaEstadoFinanciero
            titulo="Base clínica"
            subtitulo="Resultado después de costos clínicos"
            valorMXN={totalBaseClinicaMXN}
            valorUSD={totalBaseClinicaUSD}
            formatoMonto={formatoMonto}
          />

          <FilaEstadoFinanciero
            titulo="Comisiones doctores"
            subtitulo="Comisiones generadas por tratamientos finalizados"
            valorMXN={totalComisionesDoctorMXN}
            valorUSD={totalComisionesDoctorUSD}
            formatoMonto={formatoMonto}
            tipo="negativo"
          />

          <FilaEstadoFinanciero
            titulo="Gastos generales"
            subtitulo="Egresos registrados en el período"
            valorMXN={totalGastos}
            valorUSD={totalGastosUSD}
            formatoMonto={formatoMonto}
            tipo="negativo"
          />

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)]
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
                Utilidad neta
              </p>

              <p
                className="
                  text-xs
                  mint-text-muted
                  mt-1
                "
              >
                Resultado final del período
              </p>

            </div>

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
            Tesorería
          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            Disponibilidad financiera
          </h3>

        </div>

        <div
          className="
            relative
            overflow-hidden
            rounded-[22px]
            border
            border-[var(--mint-border-teal)]
            bg-[linear-gradient(120deg,var(--mint-navy)_0%,var(--mint-navy-soft)_50%,var(--mint-teal)_100%)]
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
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-5
            "
          >

            <DatoTesoreria
              titulo="Caja MXN"
              valor={cajaMXN}
              moneda="MXN"
              formatoMonto={formatoMonto}
            />

            <DatoTesoreria
              titulo="Caja USD"
              valor={cajaUSD}
              moneda="USD"
              formatoMonto={formatoMonto}
            />

            <DatoTesoreria
              titulo="Tarjeta / Banco"
              valor={totalTarjeta}
              moneda="MXN"
              formatoMonto={formatoMonto}
            />

            <DatoTesoreria
              titulo="Transferencias"
              valor={totalTransferencia}
              moneda="MXN"
              formatoMonto={formatoMonto}
            />

            <DatoTesoreria
              titulo="Transferencias"
              valor={totalTransferenciaUSD}
              moneda="USD"
              formatoMonto={formatoMonto}
              ultimo
            />

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
              Operación
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Estado de tratamientos
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
              descripcion="Registrados"
            />

            <IndicadorOperacion
              titulo="Finalizados"
              valor={
                tratamientosFinalizados
              }
              descripcion="Completados"
              tipo="success"
            />

            <IndicadorOperacion
              titulo="En proceso"
              valor={
                tratamientosPendientes
              }
              descripcion="Pendientes"
              tipo="warning"
            />

            <IndicadorOperacion
              titulo="Cancelados"
              valor={
                tratamientosCancelados
              }
              descripcion="Sin concluir"
              tipo="danger"
            />

          </div>

        </div>

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
              Actividad financiera
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Pendiente y producción
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
                  Por cobrar
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
                  MXN pendiente
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-3
                  "
                >
                  Saldo pendiente de pacientes.
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
                  Producción
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
                  MXN generado
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-3
                  "
                >
                  Valor total registrado en tratamientos.
                </p>

              </div>

            </div>

          </div>

        </div>

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
              Cierres oficiales
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Historial financiero cerrado
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Consulta las fotografías financieras
              guardadas al cerrar cada mes.
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
              {cierres.length} cierres guardados
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
                  Cargando cierres financieros...
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
                      Todavía no hay cierres mensuales.
                    </p>

                    <p
                      className="
                        text-sm
                        mint-text-secondary
                        mt-1
                      "
                    >
                      Los meses cerrados desde
                      Finanzas → Cierre mensual
                      aparecerán aquí.
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
                                  MESES[
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
                                Cierre oficial
                              </p>

                            </div>

                            <DatoCierre
                              titulo="Cobrado MXN"
                              valor={
                                cierre.cobrado_mxn
                              }
                              formatoMonto={
                                formatoMonto
                              }
                              tipo="success"
                            />

                            <DatoCierre
                              titulo="Cobrado USD"
                              valor={
                                cierre.cobrado_usd
                              }
                              formatoMonto={
                                formatoMonto
                              }
                              tipo="info"
                            />

                            <DatoCierre
                              titulo="Gastos MXN"
                              valor={
                                cierre.gastos_mxn
                              }
                              formatoMonto={
                                formatoMonto
                              }
                              tipo="danger"
                            />

                            <DatoCierre
                              titulo="Utilidad MXN"
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

                            <DatoCierre
                              titulo="Utilidad USD"
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
                                Fecha cierre
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

};

function FilaEstadoFinanciero({

  titulo,

  subtitulo,

  valorMXN,

  valorUSD,

  formatoMonto,

  tipo = "normal",

}: FilaEstadoFinancieroProps) {

  const claseValor =
    tipo === "positivo"

      ? "text-[var(--mint-success)]"

      : tipo === "negativo"

        ? "text-[var(--mint-danger)]"

        : "mint-text-primary";

  return (

    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)]
        items-center
        gap-3
        px-6
        py-4
        border-b
        border-[var(--mint-border)]
        last:border-b-0
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
          text-white/60
        "
      >
        {titulo}
      </p>

      <p
        className="
          text-2xl
          font-bold
          text-white
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
          text-white/50
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