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

    /*
    |--------------------------------------------------------------------------
    | ENCABEZADO
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | RESUMEN DE OPERACIÓN
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | ESTADO DE RESULTADOS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | LIQUIDEZ
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | CUENTAS POR COBRAR Y PRODUCCIÓN
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | PIE
    |--------------------------------------------------------------------------
    */

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
        space-y-6
      "
    >

      {/* ENCABEZADO */}

      <section
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
                tracking-[0.14em]
                font-bold
                mint-text-brand
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
              gap-3
              flex-wrap
            "
          >

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

            <div
              className="
                px-4
                py-3
                rounded-xl
                bg-[var(--mint-primary-soft)]
                border
                border-[var(--mint-border-primary)]
              "
            >

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
                  text-xl
                  font-bold
                  text-[var(--mint-primary)]
                  mt-1
                "
              >
                {
                  tratamientosFiltrados.length
                }
              </p>

            </div>

            <div
              className="
                px-4
                py-3
                rounded-xl
                bg-[var(--mint-success-bg)]
                border
                border-[var(--mint-success-border)]
              "
            >

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
                  text-xl
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

        </div>

      </section>


      {/* RESULTADO GENERAL */}

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

        </div>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-4
          "
        >

          {/* MXN */}

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
                    uppercase
                    tracking-[0.12em]
                    font-bold
                    mint-text-muted
                  "
                >
                  Moneda nacional
                </p>

                <h4
                  className="
                    text-xl
                    font-bold
                    mint-text-primary
                    mt-1
                  "
                >
                  Estado de resultados MXN
                </h4>

              </div>

              <span
                className="
                  inline-flex
                  px-3
                  py-1.5
                  rounded-lg
                  text-xs
                  font-bold
                  bg-[var(--mint-primary-soft)]
                  text-[var(--mint-primary)]
                  border
                  border-[var(--mint-border-primary)]
                "
              >
                MXN
              </span>

            </div>

            <div
              className="
                p-6
                space-y-1
              "
            >

              <FilaReporte
                titulo="Cobros recibidos"
                subtitulo="Pagos reales registrados"
                valor={cobradoMXN}
                moneda="MXN"
                formatoMonto={formatoMonto}
                tipo="positivo"
              />

              <FilaReporte
                titulo="Base clínica"
                subtitulo="Resultado después de costos clínicos"
                valor={totalBaseClinicaMXN}
                moneda="MXN"
                formatoMonto={formatoMonto}
              />

              <FilaReporte
                titulo="Comisiones doctores"
                subtitulo="Comisiones generadas por tratamientos finalizados"
                valor={totalComisionesDoctorMXN}
                moneda="MXN"
                formatoMonto={formatoMonto}
                tipo="negativo"
              />

              <FilaReporte
                titulo="Gastos generales"
                subtitulo="Egresos registrados en el período"
                valor={totalGastos}
                moneda="MXN"
                formatoMonto={formatoMonto}
                tipo="negativo"
              />

              <div
                className="
                  pt-4
                  mt-4
                  border-t-2
                  border-[var(--mint-border-strong)]
                "
              >

                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm
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
                      text-right
                    "
                  >

                    <p
                      className={`
                        text-2xl
                        font-bold

                        ${
                          gananciaNeta >= 0

                            ? `
                                text-[var(--mint-success)]
                              `

                            : `
                                text-[var(--mint-danger)]
                              `
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

                </div>

              </div>

            </div>

          </div>


          {/* USD */}

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
                    uppercase
                    tracking-[0.12em]
                    font-bold
                    mint-text-muted
                  "
                >
                  Moneda extranjera
                </p>

                <h4
                  className="
                    text-xl
                    font-bold
                    mint-text-primary
                    mt-1
                  "
                >
                  Estado de resultados USD
                </h4>

              </div>

              <span
                className="
                  inline-flex
                  px-3
                  py-1.5
                  rounded-lg
                  text-xs
                  font-bold
                  bg-[var(--mint-info-bg)]
                  text-[var(--mint-info)]
                  border
                  border-[var(--mint-info-border)]
                "
              >
                USD
              </span>

            </div>

            <div
              className="
                p-6
                space-y-1
              "
            >

              <FilaReporte
                titulo="Cobros recibidos"
                subtitulo="Pagos reales recibidos en dólares"
                valor={cobradoUSD}
                moneda="USD"
                formatoMonto={formatoMonto}
                tipo="positivo"
              />

              <FilaReporte
                titulo="Base clínica"
                subtitulo="Resultado después de costos clínicos USD"
                valor={totalBaseClinicaUSD}
                moneda="USD"
                formatoMonto={formatoMonto}
              />

              <FilaReporte
                titulo="Comisiones doctores"
                subtitulo="Comisiones generadas en USD"
                valor={totalComisionesDoctorUSD}
                moneda="USD"
                formatoMonto={formatoMonto}
                tipo="negativo"
              />

              <FilaReporte
                titulo="Gastos generales"
                subtitulo="Egresos registrados directamente en USD"
                valor={totalGastosUSD}
                moneda="USD"
                formatoMonto={formatoMonto}
                tipo="negativo"
              />

              <div
                className="
                  pt-4
                  mt-4
                  border-t-2
                  border-[var(--mint-border-strong)]
                "
              >

                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm
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
                      Resultado real conservado en USD
                    </p>

                  </div>

                  <div
                    className="
                      text-right
                    "
                  >

                    <p
                      className={`
                        text-2xl
                        font-bold

                        ${
                          gananciaNetaUSD >= 0

                            ? `
                                text-[var(--mint-success)]
                              `

                            : `
                                text-[var(--mint-danger)]
                              `
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

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* LIQUIDEZ */}

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
            Liquidez
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
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-4
          "
        >

          <TarjetaLiquidez
            titulo="Caja MXN"
            valor={cajaMXN}
            moneda="MXN"
            descripcion="Efectivo disponible"
            formatoMonto={formatoMonto}
            tipo="success"
          />

          <TarjetaLiquidez
            titulo="Caja USD"
            valor={cajaUSD}
            moneda="USD"
            descripcion="Efectivo en dólares"
            formatoMonto={formatoMonto}
            tipo="info"
          />

          <TarjetaLiquidez
            titulo="Tarjeta / Banco"
            valor={totalTarjeta}
            moneda="MXN"
            descripcion="Neto recibido por tarjeta"
            formatoMonto={formatoMonto}
            tipo="neutral"
          />

          <div
            className="
              mint-card
              p-5
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-[0.08em]
                font-bold
                mint-text-muted
              "
            >
              Transferencias
            </p>

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xl
                    font-bold
                    mint-text-primary
                  "
                >
                  $
                  {
                    formatoMonto(
                      totalTransferencia
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
                  MXN
                </p>

              </div>

              <div
                className="
                  pl-3
                  border-l
                  border-[var(--mint-border)]
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    text-[var(--mint-info)]
                  "
                >
                  $
                  {
                    formatoMonto(
                      totalTransferenciaUSD
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
                  USD
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* OPERACIÓN */}

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
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-4
            "
          >

            <EstadoTratamiento
              titulo="Total"
              valor={
                tratamientosFiltrados.length
              }
              descripcion="Registrados"
            />

            <EstadoTratamiento
              titulo="Finalizados"
              valor={
                tratamientosFinalizados
              }
              descripcion="Completados"
              tipo="success"
            />

            <EstadoTratamiento
              titulo="En proceso"
              valor={
                tratamientosPendientes
              }
              descripcion="Pendientes de finalizar"
              tipo="warning"
            />

            <EstadoTratamiento
              titulo="Cancelados"
              valor={
                tratamientosCancelados
              }
              descripcion="Sin concluir"
              tipo="danger"
              ultimo
            />

          </div>

        </div>

      </section>


      {/* CUENTAS POR COBRAR */}

      <section>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              p-6
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
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
                "
              >
                Cuentas por cobrar
              </p>

              <h3
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                  mt-1
                "
              >
                Saldo pendiente de pacientes
              </h3>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                Tratamientos registrados que aún
                conservan saldo pendiente.
              </p>

            </div>

            <div
              className="
                md:text-right
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  text-[var(--mint-danger)]
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
                  tracking-[0.1em]
                  font-bold
                  mint-text-muted
                  mt-1
                "
              >
                MXN pendiente
              </p>

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
                max-w-2xl
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
              px-3
              py-2
              rounded-xl
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
            "
          >

            <span
              className="
                text-xs
                font-bold
                text-[var(--mint-primary)]
              "
            >
              {cierres.length} cierres guardados
            </span>

          </div>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          {
            cargandoCierres

              ? (

                <div
                  className="
                    p-8
                    text-center
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
                      p-8
                      text-center
                    "
                  >

                    <p
                      className="
                        font-semibold
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
                      overflow-x-auto
                    "
                  >

                    <table
                      className="
                        w-full
                        text-sm
                      "
                    >

                      <thead
                        className="
                          mint-bg-soft
                        "
                      >

                        <tr>

                          <th
                            className="
                              text-left
                              px-6
                              py-3
                              text-xs
                              font-bold
                              mint-text-muted
                            "
                          >
                            Período
                          </th>

                          <th
                            className="
                              text-right
                              px-6
                              py-3
                              text-xs
                              font-bold
                              mint-text-muted
                            "
                          >
                            Cobrado MXN
                          </th>

                          <th
                            className="
                              text-right
                              px-6
                              py-3
                              text-xs
                              font-bold
                              mint-text-muted
                            "
                          >
                            Cobrado USD
                          </th>

                          <th
                            className="
                              text-right
                              px-6
                              py-3
                              text-xs
                              font-bold
                              mint-text-muted
                            "
                          >
                            Gastos MXN
                          </th>

                          <th
                            className="
                              text-right
                              px-6
                              py-3
                              text-xs
                              font-bold
                              mint-text-muted
                            "
                          >
                            Utilidad MXN
                          </th>

                          <th
                            className="
                              text-right
                              px-6
                              py-3
                              text-xs
                              font-bold
                              mint-text-muted
                            "
                          >
                            Utilidad USD
                          </th>

                          <th
                            className="
                              text-left
                              px-6
                              py-3
                              text-xs
                              font-bold
                              mint-text-muted
                            "
                          >
                            Fecha cierre
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {
                          cierres.map(
                            (
                              cierre
                            ) => (

                              <tr
                                key={
                                  cierre.id
                                }
                                className="
                                  border-t
                                  border-[var(--mint-border)]
                                  hover:bg-[var(--mint-bg-soft)]
                                  transition-colors
                                "
                              >

                                <td
                                  className="
                                    px-6
                                    py-4
                                  "
                                >

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
                                      text-[10px]
                                      uppercase
                                      tracking-[0.08em]
                                      font-bold
                                      text-[var(--mint-primary)]
                                      mt-1
                                    "
                                  >
                                    Cierre oficial
                                  </p>

                                </td>

                                <td
                                  className="
                                    px-6
                                    py-4
                                    text-right
                                    font-semibold
                                    text-[var(--mint-success)]
                                    whitespace-nowrap
                                  "
                                >
                                  $
                                  {
                                    formatoMonto(
                                      cierre.cobrado_mxn
                                    )
                                  }
                                </td>

                                <td
                                  className="
                                    px-6
                                    py-4
                                    text-right
                                    font-semibold
                                    text-[var(--mint-info)]
                                    whitespace-nowrap
                                  "
                                >
                                  $
                                  {
                                    formatoMonto(
                                      cierre.cobrado_usd
                                    )
                                  }
                                </td>

                                <td
                                  className="
                                    px-6
                                    py-4
                                    text-right
                                    font-semibold
                                    text-[var(--mint-danger)]
                                    whitespace-nowrap
                                  "
                                >
                                  $
                                  {
                                    formatoMonto(
                                      cierre.gastos_mxn
                                    )
                                  }
                                </td>

                                <td
                                  className={`
                                    px-6
                                    py-4
                                    text-right
                                    font-bold
                                    whitespace-nowrap

                                    ${
                                      cierre.utilidad_neta_mxn >= 0

                                        ? `
                                            text-[var(--mint-success)]
                                          `

                                        : `
                                            text-[var(--mint-danger)]
                                          `
                                    }
                                  `}
                                >
                                  $
                                  {
                                    formatoMonto(
                                      cierre.utilidad_neta_mxn
                                    )
                                  }
                                </td>

                                <td
                                  className={`
                                    px-6
                                    py-4
                                    text-right
                                    font-bold
                                    whitespace-nowrap

                                    ${
                                      cierre.utilidad_neta_usd >= 0

                                        ? `
                                            text-[var(--mint-info)]
                                          `

                                        : `
                                            text-[var(--mint-danger)]
                                          `
                                    }
                                  `}
                                >
                                  $
                                  {
                                    formatoMonto(
                                      cierre.utilidad_neta_usd
                                    )
                                  }
                                </td>

                                <td
                                  className="
                                    px-6
                                    py-4
                                    mint-text-secondary
                                    whitespace-nowrap
                                  "
                                >
                                  {
                                    formatoFechaCierre(
                                      cierre.fecha_cierre
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

                )
          }

        </div>

      </section>


      {/* REFERENCIA DE PRODUCCIÓN */}

      <section>

        <div
          className="
            mint-card
            p-6
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
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
                "
              >
                Producción clínica
              </p>

              <h3
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                  mt-1
                "
              >
                Valor generado
              </h3>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                Referencia del valor total registrado
                en tratamientos durante el período.
              </p>

            </div>

            <div
              className="
                md:text-right
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  text-[var(--mint-primary)]
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
                  tracking-[0.1em]
                  font-bold
                  mint-text-muted
                  mt-1
                "
              >
                MXN
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>

  );

}


type FilaReporteProps = {

  titulo: string;
  subtitulo: string;

  valor: number;

  moneda:
    | "MXN"
    | "USD";

  formatoMonto:
    (
      valor: number
    ) => string;

  tipo?:
    | "normal"
    | "positivo"
    | "negativo";

};

function FilaReporte({

  titulo,
  subtitulo,

  valor,

  moneda,

  formatoMonto,

  tipo = "normal",

}: FilaReporteProps) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        py-3.5
        border-b
        border-[var(--mint-border)]
        last:border-b-0
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
          text-right
          shrink-0
        "
      >

        <p
          className={`
            text-base
            font-bold

            ${
              tipo ===
              "positivo"

                ? `
                    text-[var(--mint-success)]
                  `

                : tipo ===
                  "negativo"

                  ? `
                      text-[var(--mint-danger)]
                    `

                  : `
                      mint-text-primary
                    `
            }
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
              valor
            )
          }
        </p>

        <p
          className="
            text-[9px]
            uppercase
            font-bold
            mint-text-muted
            mt-0.5
          "
        >
          {moneda}
        </p>

      </div>

    </div>

  );

}


type TarjetaLiquidezProps = {

  titulo: string;

  valor: number;

  moneda:
    | "MXN"
    | "USD";

  descripcion: string;

  formatoMonto:
    (
      valor: number
    ) => string;

  tipo:
    | "success"
    | "info"
    | "neutral";

};

function TarjetaLiquidez({

  titulo,

  valor,

  moneda,

  descripcion,

  formatoMonto,

  tipo,

}: TarjetaLiquidezProps) {

  return (

    <div
      className="
        mint-card
        p-5
      "
    >

      <p
        className="
          text-xs
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
          text-2xl
          font-bold
          mt-3

          ${
            tipo ===
            "success"

              ? `
                  text-[var(--mint-success)]
                `

              : tipo ===
                "info"

                ? `
                    text-[var(--mint-info)]
                  `

                : `
                    mint-text-primary
                  `
          }
        `}
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
          text-[10px]
          uppercase
          tracking-[0.08em]
          font-bold
          mint-text-muted
          mt-1
        "
      >
        {moneda}
      </p>

      <p
        className="
          text-[11px]
          mint-text-secondary
          mt-3
        "
      >
        {descripcion}
      </p>

    </div>

  );

}


type EstadoTratamientoProps = {

  titulo: string;

  valor: number;

  descripcion: string;

  tipo?:
    | "normal"
    | "success"
    | "warning"
    | "danger";

  ultimo?: boolean;

};

function EstadoTratamiento({

  titulo,

  valor,

  descripcion,

  tipo = "normal",

  ultimo = false,

}: EstadoTratamientoProps) {

  return (

    <div
      className={`
        p-5

        ${
          !ultimo

            ? `
                border-b
                md:border-b-0
                md:border-r
                border-[var(--mint-border)]
              `

            : ""
        }
      `}
    >

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

          ${
            tipo ===
            "success"

              ? `
                  text-[var(--mint-success)]
                `

              : tipo ===
                "warning"

                ? `
                    text-[var(--mint-warning)]
                  `

                : tipo ===
                  "danger"

                  ? `
                      text-[var(--mint-danger)]
                    `

                  : `
                      mint-text-primary
                    `
          }
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