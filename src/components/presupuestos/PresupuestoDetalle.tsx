import {
  ArrowLeft,
  Download,
  FileText,
  Send,
  CheckCircle2,
} from "lucide-react";

import jsPDF from "jspdf";

import type {
  Presupuesto,
} from "../../types/Presupuesto";

type PresupuestoConPaciente =
  Presupuesto & {
    paciente_nombre?: string;
  };

type PresupuestoDetalleProps = {
  presupuesto: PresupuestoConPaciente;
  onVolver: () => void;
  onMarcarEnviado?: () => void | Promise<void>;
  onConvertirTratamiento?: () => void | Promise<void>;
  convirtiendo?: boolean;
};

export default function PresupuestoDetalle({
  presupuesto,
  onVolver,
  onMarcarEnviado,
  onConvertirTratamiento,
  convirtiendo = false,
}: PresupuestoDetalleProps) {

  const formatoMonto =
    (
      valor: number
    ) =>
      `$${Number(
        valor || 0
      ).toLocaleString(
        "es-MX",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )} ${presupuesto.moneda}`;

  const formatoFecha =
    (
      fecha: string
    ) =>
      new Date(
        fecha
      ).toLocaleDateString(
        "es-MX",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

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
      anchoPagina - margen * 2;

    const teal: [
      number,
      number,
      number
    ] = [
      15,
      118,
      110,
    ];

    const tealOscuro: [
      number,
      number,
      number
    ] = [
      10,
      79,
      74,
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

    const soft: [
      number,
      number,
      number
    ] = [
      248,
      250,
      252,
    ];

    const tealSoft: [
      number,
      number,
      number
    ] = [
      240,
      253,
      250,
    ];

    const formatoPDF =
      (
        valor: number
      ) =>
        `$${Number(
          valor || 0
        ).toLocaleString(
          "es-MX",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} ${presupuesto.moneda}`;

    let y = 16;

    const nuevaPaginaSiHaceFalta =
      (
        alturaNecesaria: number
      ) => {

        if (
          y +
          alturaNecesaria >
          altoPagina - 22
        ) {

          pdf.addPage();
          y = 20;

        }

      };

    // Encabezado premium de la clínica
    pdf.setFillColor(
      ...tealOscuro
    );

    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      42,
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
      "Dra. Marlene Group",
      margen + 7,
      y + 11
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      8.5
    );

    pdf.text(
      "Modern Dental Care in Mexico",
      margen + 7,
      y + 17
    );

    pdf.setFontSize(
      7.8
    );

    pdf.text(
      "San Luis Río Colorado, Sonora, México",
      margen + 7,
      y + 25
    );

    pdf.text(
      "+52 653 208 0587  ·  dra.marlene.v@gmail.com",
      margen + 7,
      y + 31
    );

    const bloqueDerechoX =
      anchoPagina - margen - 7;

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      8
    );

    pdf.text(
      "PRESUPUESTO",
      bloqueDerechoX,
      y + 10,
      {
        align: "right",
      }
    );

    pdf.setFontSize(
      17
    );

    pdf.text(
      `#${presupuesto.id}`,
      bloqueDerechoX,
      y + 18,
      {
        align: "right",
      }
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7.8
    );

    pdf.text(
      `Fecha: ${formatoFecha(
        presupuesto.fecha
      )}`,
      bloqueDerechoX,
      y + 27,
      {
        align: "right",
      }
    );

    pdf.text(
      `Moneda: ${presupuesto.moneda}`,
      bloqueDerechoX,
      y + 33,
      {
        align: "right",
      }
    );

    y += 51;

    // Información del paciente
    pdf.setFillColor(
      ...tealSoft
    );

    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      24,
      3,
      3,
      "F"
    );

    pdf.setTextColor(
      ...teal
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      7.5
    );

    pdf.text(
      "PACIENTE",
      margen + 6,
      y + 7
    );

    pdf.setTextColor(
      ...slate
    );

    pdf.setFontSize(
      12
    );

    pdf.text(
      presupuesto.paciente_nombre ||
        `Paciente #${presupuesto.paciente_id}`,
      margen + 6,
      y + 14
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      8
    );

    pdf.setTextColor(
      ...muted
    );

    pdf.text(
      "Propuesta personalizada de tratamiento dental",
      margen + 6,
      y + 20
    );

    y += 34;

    // Tratamientos
    pdf.setTextColor(
      ...teal
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      9
    );

    pdf.text(
      "DETALLE DEL TRATAMIENTO",
      margen,
      y
    );

    y += 6;

    pdf.setFillColor(
      ...slate
    );

    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      10,
      2,
      2,
      "F"
    );

    const xDiente = margen + 4;
    const xTratamiento = margen + 25;
    const xCantidad = anchoPagina - margen - 64;
    const xPrecio = anchoPagina - margen - 35;
    const xTotal = anchoPagina - margen - 4;

    pdf.setTextColor(
      255,
      255,
      255
    );

    pdf.setFontSize(
      7.8
    );

    pdf.text(
      "Diente",
      xDiente,
      y + 6.5
    );

    pdf.text(
      "Tratamiento",
      xTratamiento,
      y + 6.5
    );

    pdf.text(
      "Cant.",
      xCantidad,
      y + 6.5,
      {
        align: "right",
      }
    );

    pdf.text(
      "Precio",
      xPrecio,
      y + 6.5,
      {
        align: "right",
      }
    );

    pdf.text(
      "Total",
      xTotal,
      y + 6.5,
      {
        align: "right",
      }
    );

    y += 14;

    (presupuesto.items || []).forEach(
      (
        item,
        index
      ) => {

        const lineasTratamiento =
          pdf.splitTextToSize(
            item.tratamiento,
            67
          );

        const alturaFila =
          Math.max(
            10,
            lineasTratamiento.length *
              4.4 +
              4
          );

        nuevaPaginaSiHaceFalta(
          alturaFila + 5
        );

        if (
          index % 2 === 1
        ) {

          pdf.setFillColor(
            ...soft
          );

          pdf.rect(
            margen,
            y - 2,
            anchoContenido,
            alturaFila,
            "F"
          );

        }

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          8.4
        );

        pdf.setTextColor(
          ...slate
        );

        pdf.text(
          item.diente || "—",
          xDiente,
          y + 4
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          lineasTratamiento,
          xTratamiento,
          y + 4
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.text(
          String(
            item.cantidad
          ),
          xCantidad,
          y + 4,
          {
            align: "right",
          }
        );

        pdf.text(
          formatoPDF(
            item.precio_unitario
          ),
          xPrecio,
          y + 4,
          {
            align: "right",
          }
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          formatoPDF(
            item.total
          ),
          xTotal,
          y + 4,
          {
            align: "right",
          }
        );

        y += alturaFila;

        pdf.setDrawColor(
          ...border
        );

        pdf.line(
          margen,
          y - 2,
          anchoPagina - margen,
          y - 2
        );

        y += 2;

      }
    );

    nuevaPaginaSiHaceFalta(
      56
    );

    y += 7;

    // Resumen de inversión
    const xResumen =
      anchoPagina -
      margen -
      82;

    const anchoResumen = 82;

    pdf.setFillColor(
      ...tealSoft
    );

    pdf.roundedRect(
      xResumen,
      y,
      anchoResumen,
      35,
      3,
      3,
      "F"
    );

    pdf.setTextColor(
      ...tealOscuro
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      7.5
    );

    pdf.text(
      "RESUMEN",
      xResumen + 6,
      y + 7
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      8.5
    );

    pdf.setTextColor(
      ...muted
    );

    pdf.text(
      "Subtotal",
      xResumen + 6,
      y + 15
    );

    pdf.setTextColor(
      ...slate
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.text(
      formatoPDF(
        presupuesto.subtotal
      ),
      xResumen +
        anchoResumen -
        6,
      y + 15,
      {
        align: "right",
      }
    );

    pdf.setDrawColor(
      ...border
    );

    pdf.line(
      xResumen + 6,
      y + 21,
      xResumen +
        anchoResumen -
        6,
      y + 21
    );

    pdf.setTextColor(
      ...tealOscuro
    );

    pdf.setFontSize(
      11
    );

    pdf.text(
      "TOTAL",
      xResumen + 6,
      y + 30
    );

    pdf.text(
      formatoPDF(
        presupuesto.total
      ),
      xResumen +
        anchoResumen -
        6,
      y + 30,
      {
        align: "right",
      }
    );

    y += 45;

    // Notas del presupuesto
    if (
      presupuesto.notas
    ) {

      const lineasNotas =
        pdf.splitTextToSize(
          presupuesto.notas,
          anchoContenido - 12
        );

      const alturaNotas =
        Math.max(
          24,
          lineasNotas.length *
            4.3 +
            15
        );

      nuevaPaginaSiHaceFalta(
        alturaNotas + 8
      );

      pdf.setFillColor(
        ...soft
      );

      pdf.roundedRect(
        margen,
        y,
        anchoContenido,
        alturaNotas,
        3,
        3,
        "F"
      );

      pdf.setTextColor(
        ...teal
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(
        8
      );

      pdf.text(
        "NOTAS Y OBSERVACIONES",
        margen + 6,
        y + 8
      );

      pdf.setTextColor(
        ...slate
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        8.5
      );

      pdf.text(
        lineasNotas,
        margen + 6,
        y + 15
      );

      y += alturaNotas + 9;

    }

    // Aviso profesional
    nuevaPaginaSiHaceFalta(
      32
    );

    pdf.setDrawColor(
      ...teal
    );

    pdf.setLineWidth(
      0.7
    );

    pdf.line(
      margen,
      y,
      margen,
      y + 20
    );

    pdf.setTextColor(
      ...slate
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      8
    );

    pdf.text(
      "Información importante",
      margen + 5,
      y + 5
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setTextColor(
      ...muted
    );

    pdf.setFontSize(
      7.8
    );

    const aviso =
      pdf.splitTextToSize(
        "Este presupuesto corresponde a los tratamientos descritos y puede ajustarse si durante la evaluación clínica se identifican necesidades adicionales. Nuestro equipo está disponible para resolver cualquier duda antes de iniciar su tratamiento.",
        anchoContenido - 8
      );

    pdf.text(
      aviso,
      margen + 5,
      y + 11
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

      pdf.setLineWidth(
        0.2
      );

      pdf.line(
        margen,
        altoPagina - 16,
        anchoPagina - margen,
        altoPagina - 16
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        7.2
      );

      pdf.setTextColor(
        ...muted
      );

      pdf.text(
        "Dra. Marlene Group · San Luis Río Colorado, Sonora, México",
        margen,
        altoPagina - 10
      );

      pdf.text(
        "+52 653 208 0587 · dra.marlene.v@gmail.com",
        margen,
        altoPagina - 6
      );

      pdf.text(
        `Página ${pagina} de ${totalPaginas}`,
        anchoPagina - margen,
        altoPagina - 8,
        {
          align: "right",
        }
      );

    }

    const pacienteArchivo =
      (
        presupuesto.paciente_nombre ||
        `paciente-${presupuesto.paciente_id}`
      )
        .trim()
        .replace(
          /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        );

    pdf.save(
      `presupuesto-${presupuesto.id}-${pacienteArchivo}.pdf`
    );

  }

  async function enviarPresupuesto() {

    generarPDF();

    if (
      presupuesto.estado ===
        "Borrador" &&
      onMarcarEnviado
    ) {

      await onMarcarEnviado();

    }

  }

  const estadoClasses =
    () => {

      if (
        presupuesto.estado ===
        "Convertido"
      ) {

        return `
          bg-[var(--mint-success-bg)]
          text-[var(--mint-success)]
          border
          border-[var(--mint-success-border)]
        `;

      }

      if (
        presupuesto.estado ===
        "Enviado"
      ) {

        return `
          bg-[var(--mint-info-bg)]
          text-[var(--mint-info)]
          border
          border-[var(--mint-info-border)]
        `;

      }

      return `
        bg-[var(--mint-warning-bg)]
        text-[var(--mint-warning)]
        border
        border-[var(--mint-warning-border)]
      `;

    };

  return (

    <div
      className="
        space-y-6
      "
    >

      <section
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
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
              items-start
              gap-4
            "
          >

            <button
              type="button"
              onClick={
                onVolver
              }
              className="
                w-10
                h-10
                rounded-xl
                border
                border-[var(--mint-border)]
                flex
                items-center
                justify-center
                mint-text-secondary
                hover:bg-[var(--mint-bg-soft)]
                transition
                shrink-0
              "
            >
              <ArrowLeft
                size={18}
              />
            </button>

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
                Presupuesto
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
                Presupuesto #
                {presupuesto.id}
              </h2>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                {
                  presupuesto.paciente_nombre ||
                  `Paciente #${presupuesto.paciente_id}`
                }
              </p>

            </div>

          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >

            {
              presupuesto.estado ===
              "Borrador"

                ? (

                  <button
                    type="button"
                    onClick={
                      enviarPresupuesto
                    }
                    className="
                      mint-btn
                      mint-btn-primary
                      inline-flex
                      items-center
                      gap-2
                    "
                  >
                    <Send
                      size={16}
                    />

                    Enviar presupuesto
                  </button>

                )

                : (

                  <button
                    type="button"
                    onClick={
                      generarPDF
                    }
                    className="
                      mint-btn
                      inline-flex
                      items-center
                      gap-2
                    "
                  >
                    <Download
                      size={16}
                    />

                    Descargar PDF
                  </button>

                )
            }

            {
              presupuesto.estado ===
                "Enviado" &&
              onConvertirTratamiento

                ? (

                  <button
                    type="button"
                    onClick={
                      onConvertirTratamiento
                    }
                    disabled={
                      convirtiendo
                    }
                    className="
                      mint-btn
                      mint-btn-primary
                      inline-flex
                      items-center
                      gap-2
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                  >
                    <CheckCircle2
                      size={16}
                    />

                    {
                      convirtiendo
                        ? "Convirtiendo..."
                        : "Convertir a tratamiento"
                    }
                  </button>

                )

                : null
            }

            <span
              className={`
                inline-flex
                px-3
                py-1.5
                rounded-xl
                text-xs
                font-bold
                ${estadoClasses()}
              `}
            >
              {presupuesto.estado}
            </span>

          </div>

        </div>

      </section>


      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-[1fr_320px]
          gap-6
        "
      >

        <section
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

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-[var(--mint-primary-soft)]
                  flex
                  items-center
                  justify-center
                "
              >

                <FileText
                  size={18}
                  className="
                    text-[var(--mint-primary)]
                  "
                />

              </div>

              <div>

                <h3
                  className="
                    text-lg
                    font-bold
                    mint-text-primary
                  "
                >
                  Tratamientos
                </h3>

                <p
                  className="
                    text-sm
                    mint-text-secondary
                    mt-0.5
                  "
                >
                  Procedimientos incluidos
                  en este presupuesto.
                </p>

              </div>

            </div>

          </div>

          {
            presupuesto.items &&
            presupuesto.items.length > 0

              ? (

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
                        bg-[var(--mint-bg-soft)]
                      "
                    >

                      <tr>

                        <th
                          className="
                            text-left
                            px-5
                            py-3
                            text-xs
                            font-bold
                            mint-text-muted
                          "
                        >
                          Diente
                        </th>

                        <th
                          className="
                            text-left
                            px-5
                            py-3
                            text-xs
                            font-bold
                            mint-text-muted
                          "
                        >
                          Tratamiento
                        </th>

                        <th
                          className="
                            text-center
                            px-5
                            py-3
                            text-xs
                            font-bold
                            mint-text-muted
                          "
                        >
                          Cant.
                        </th>

                        <th
                          className="
                            text-right
                            px-5
                            py-3
                            text-xs
                            font-bold
                            mint-text-muted
                          "
                        >
                          Precio
                        </th>

                        <th
                          className="
                            text-right
                            px-5
                            py-3
                            text-xs
                            font-bold
                            mint-text-muted
                          "
                        >
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {
                        presupuesto.items.map(
                          (
                            item
                          ) => (

                            <tr
                              key={
                                item.id
                              }
                              className="
                                border-t
                                border-[var(--mint-border)]
                              "
                            >

                              <td
                                className="
                                  px-5
                                  py-4
                                  mint-text-secondary
                                "
                              >
                                {
                                  item.diente ||
                                  "—"
                                }
                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                "
                              >

                                <p
                                  className="
                                    font-semibold
                                    mint-text-primary
                                  "
                                >
                                  {
                                    item.tratamiento
                                  }
                                </p>

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-center
                                  mint-text-secondary
                                "
                              >
                                {
                                  item.cantidad
                                }
                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-right
                                  whitespace-nowrap
                                  mint-text-secondary
                                "
                              >
                                {
                                  formatoMonto(
                                    item.precio_unitario
                                  )
                                }
                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-right
                                  whitespace-nowrap
                                  font-bold
                                  mint-text-primary
                                "
                              >
                                {
                                  formatoMonto(
                                    item.total
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

              : (

                <div
                  className="
                    px-6
                    py-12
                    text-center
                  "
                >

                  <p
                    className="
                      text-sm
                      mint-text-muted
                    "
                  >
                    No hay tratamientos
                    registrados en este presupuesto.
                  </p>

                </div>

              )
          }

        </section>


        <div
          className="
            space-y-6
          "
        >

          <section
            className="
              mint-card
              p-5
            "
          >

            <h3
              className="
                text-sm
                font-bold
                mint-text-primary
                mb-4
              "
            >
              Resumen
            </h3>

            <div
              className="
                space-y-4
              "
            >

              <div
                className="
                  flex
                  justify-between
                  gap-4
                  text-sm
                "
              >

                <span
                  className="
                    mint-text-secondary
                  "
                >
                  Fecha
                </span>

                <span
                  className="
                    font-semibold
                    mint-text-primary
                    text-right
                  "
                >
                  {
                    formatoFecha(
                      presupuesto.fecha
                    )
                  }
                </span>

              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-4
                  text-sm
                "
              >

                <span
                  className="
                    mint-text-secondary
                  "
                >
                  Moneda
                </span>

                <span
                  className="
                    font-semibold
                    mint-text-primary
                  "
                >
                  {
                    presupuesto.moneda
                  }
                </span>

              </div>

              <div
                className="
                  pt-4
                  border-t
                  border-[var(--mint-border)]
                  space-y-3
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    gap-4
                    text-sm
                  "
                >
                  <span
                    className="
                      mint-text-secondary
                    "
                  >
                    Subtotal
                  </span>

                  <strong
                    className="
                      mint-text-primary
                    "
                  >
                    {
                      formatoMonto(
                        presupuesto.subtotal
                      )
                    }
                  </strong>
                </div>


              </div>

              <div
                className="
                  pt-4
                  border-t
                  border-[var(--mint-border)]
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.12em]
                    font-bold
                    mint-text-muted
                  "
                >
                  Total
                </p>

                <p
                  className="
                    text-2xl
                    font-bold
                    text-[var(--mint-primary)]
                    mt-1
                  "
                >
                  {
                    formatoMonto(
                      presupuesto.total
                    )
                  }
                </p>

              </div>

            </div>

          </section>


          <section
            className="
              mint-card
              p-5
            "
          >

            <h3
              className="
                text-sm
                font-bold
                mint-text-primary
              "
            >
              Notas
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-3
                leading-relaxed
                whitespace-pre-wrap
              "
            >
              {
                presupuesto.notas ||
                "Sin notas registradas."
              }
            </p>

          </section>

        </div>

      </div>

    </div>

  );

}