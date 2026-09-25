import {
  ArrowLeft,
  Download,
  FileText,
  Send,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import jsPDF from "jspdf";
import { useLanguage } from "../../context/LanguageContext";
import { supabase } from "../../lib/supabase";

import type {
  Presupuesto,
} from "../../types/Presupuesto";

type PresupuestoConPaciente =
  Presupuesto & {
    paciente_nombre?: string;
  };

type NombreCatalogo = {
  id: number;
  nombre: string;
  nombre_en: string | null;
};

type PresupuestoDetalleProps = {
  presupuesto: PresupuestoConPaciente;
  onVolver: () => void;
  onMarcarEnviado?: () => void | Promise<void>;
  puedeEnviar?: boolean;
};

export default function PresupuestoDetalle({
  presupuesto,
  onVolver,
  onMarcarEnviado,
  puedeEnviar = false,
}: PresupuestoDetalleProps) {

  const { language } = useLanguage();
  const es = language === "es";
  const documentoEnIngles =
    presupuesto.idioma === "en";

  const [
    nombresCatalogo,
    setNombresCatalogo,
  ] = useState<NombreCatalogo[]>([]);

  useEffect(() => {
    const idsCatalogo = Array.from(
      new Set(
        (presupuesto.items || [])
          .map(
            (item) =>
              item.catalogo_tratamiento_id
          )
          .filter(
            (id): id is number =>
              typeof id === "number"
          )
      )
    );

    if (idsCatalogo.length === 0) {
      setNombresCatalogo([]);
      return;
    }

    let activo = true;

    async function cargarNombresCatalogo() {
      const {
        data,
        error,
      } = await supabase
        .from("catalogo_tratamientos")
        .select("id, nombre, nombre_en")
        .in("id", idsCatalogo);

      if (error) {
        console.error(
          "Error cargando traducciones del catálogo:",
          error
        );
        return;
      }

      if (activo) {
        setNombresCatalogo(
          (data || []) as NombreCatalogo[]
        );
      }
    }

    cargarNombresCatalogo();

    return () => {
      activo = false;
    };
  }, [presupuesto.items]);

  const formatoFechaDocumento =
    (
      fecha: string
    ) =>
      new Date(
        fecha
      ).toLocaleDateString(
        documentoEnIngles
          ? "en-US"
          : "es-MX",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

  const nombreTratamientoDocumento =
    (
      item: NonNullable<Presupuesto["items"]>[number]
    ) => {
      if (!documentoEnIngles) {
        return item.tratamiento;
      }

      const tratamientoCatalogo =
        nombresCatalogo.find(
          (tratamiento) =>
            Number(tratamiento.id) ===
            Number(
              item.catalogo_tratamiento_id
            )
        );

      return (
        tratamientoCatalogo?.nombre_en?.trim() ||
        item.tratamiento
      );
    };

  const formatoMonto =
    (
      valor: number
    ) =>
      `$${Number(
        valor || 0
      ).toLocaleString(
        es ? "es-MX" : "en-US",
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
        es ? "es-MX" : "en-US",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

  function generarPDF() {

    const pdf = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const anchoPagina =
      pdf.internal.pageSize.getWidth();

    const altoPagina =
      pdf.internal.pageSize.getHeight();

    const margen = 15;
    const anchoContenido =
      anchoPagina - margen * 2;

    const tealOscuro: [number, number, number] =
      [17, 94, 89];

    const slate: [number, number, number] =
      [30, 41, 59];

    const muted: [number, number, number] =
      [100, 116, 139];

    const border: [number, number, number] =
      [226, 232, 240];

    const soft: [number, number, number] =
      [248, 250, 252];

    const tealSoft: [number, number, number] =
      [240, 253, 250];

    const formatoPDF =
      (
        valor: number
      ) =>
        `$${Number(
          valor || 0
        ).toLocaleString(
          documentoEnIngles
            ? "en-US"
            : "es-MX",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} ${presupuesto.moneda}`;

    const etiquetaDientePDF =
      (
        item: NonNullable<Presupuesto["items"]>[number]
      ) => {

        if (item.arcada === "superior") {
          return documentoEnIngles
            ? "Upper arch"
            : "Arcada superior";
        }

        if (item.arcada === "inferior") {
          return documentoEnIngles
            ? "Lower arch"
            : "Arcada inferior";
        }

        if (item.dientes?.length) {
          return item.dientes
            .slice()
            .sort((a, b) => a - b)
            .join(", ");
        }

        return item.diente || "—";
      };

    const pacienteNombre =
      presupuesto.paciente_nombre ||
      presupuesto.nombre_paciente ||
      `${documentoEnIngles ? "Patient" : "Paciente"} #${presupuesto.paciente_id}`;

    let y = 14;

    const dibujarEncabezadoPagina = () => {
      // Encabezado premium: limpio, compacto y con acento de marca.
      pdf.setFillColor(...tealOscuro);
      pdf.rect(margen, 11, 1.6, 18, "F");

      pdf.setTextColor(...tealOscuro);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      pdf.text(
        "Dra. Marlene Group",
        margen + 5,
        16
      );

      pdf.setTextColor(...slate);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.text(
        documentoEnIngles
          ? "Dr. Marlene Verdugo"
          : "Dra. Marlene Verdugo",
        margen + 5,
        21
      );

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text(
        "Cjon Juarez y 6ta No. 350, B · San Luis Río Colorado, Son. Mexico",
        margen + 5,
        25
      );

      pdf.text(
        "+52 653 208 0587 · dra.marlene.v@gmail.com · drmarlenedentalgroup.com",
        margen + 5,
        29
      );

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.text(
        documentoEnIngles
          ? "TREATMENT ESTIMATE"
          : "PRESUPUESTO DE TRATAMIENTO",
        anchoPagina - margen,
        15,
        { align: "right" }
      );

      pdf.setTextColor(...tealOscuro);
      pdf.setFontSize(16);
      pdf.text(
        `#${presupuesto.id}`,
        anchoPagina - margen,
        23,
        { align: "right" }
      );

      pdf.setDrawColor(...border);
      pdf.setLineWidth(0.25);
      pdf.line(
        margen,
        34,
        anchoPagina - margen,
        34
      );

      y = 40;
    };

    const nuevaPaginaSiHaceFalta =
      (
        alturaNecesaria: number
      ) => {

        if (
          y + alturaNecesaria >
          altoPagina - 22
        ) {
          pdf.addPage();
          dibujarEncabezadoPagina();
        }
      };

    dibujarEncabezadoPagina();

    // Información principal del presupuesto
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...border);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      21,
      2.5,
      2.5,
      "FD"
    );

    const mitad =
      margen + anchoContenido / 2;

    pdf.setDrawColor(...border);
    pdf.line(
      mitad,
      y + 4,
      mitad,
      y + 17
    );

    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.text(
      documentoEnIngles ? "PATIENT" : "PACIENTE",
      margen + 6,
      y + 6
    );

    pdf.text(
      documentoEnIngles ? "DATE" : "FECHA",
      mitad + 6,
      y + 6
    );

    pdf.setTextColor(...slate);
    pdf.setFontSize(10.5);
    pdf.text(
      pacienteNombre,
      margen + 6,
      y + 12.5
    );

    pdf.setFontSize(9);
    pdf.text(
      formatoFechaDocumento(
        presupuesto.fecha
      ),
      mitad + 6,
      y + 12.5
    );

    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.8);
    pdf.text(
      documentoEnIngles
        ? "Personalized treatment proposal"
        : "Propuesta de tratamiento personalizada",
      margen + 6,
      y + 17.5
    );

    pdf.text(
      `${documentoEnIngles ? "Currency" : "Moneda"} · ${presupuesto.moneda}`,
      mitad + 6,
      y + 17.5
    );

    y += 29;

    // Odontograma visual del presupuesto
    const dientesPresupuestados = new Set<number>();

    (presupuesto.items || []).forEach((item) => {
      if (item.arcada === "superior") {
        [
          18, 17, 16, 15, 14, 13, 12, 11,
          21, 22, 23, 24, 25, 26, 27, 28,
        ].forEach((diente) => dientesPresupuestados.add(diente));
      } else if (item.arcada === "inferior") {
        [
          48, 47, 46, 45, 44, 43, 42, 41,
          31, 32, 33, 34, 35, 36, 37, 38,
        ].forEach((diente) => dientesPresupuestados.add(diente));
      } else {
        (item.dientes || []).forEach((diente) =>
          dientesPresupuestados.add(Number(diente))
        );
      }
    });

    if (dientesPresupuestados.size > 0) {
      nuevaPaginaSiHaceFalta(55);

      pdf.setTextColor(...slate);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.text(
        documentoEnIngles
          ? "Teeth included in this estimate"
          : "Dientes incluidos en este presupuesto",
        margen,
        y
      );

      y += 5;

      const superiores = [
        18, 17, 16, 15, 14, 13, 12, 11,
        21, 22, 23, 24, 25, 26, 27, 28,
      ];

      const inferiores = [
        48, 47, 46, 45, 44, 43, 42, 41,
        31, 32, 33, 34, 35, 36, 37, 38,
      ];

      const espacio = anchoContenido / 16;
      const escala = 0.065;

      const tipoDiente = (numero: number) => {
        if ([11, 12, 21, 22, 31, 32, 41, 42].includes(numero)) {
          return "incisor";
        }
        if ([13, 23, 33, 43].includes(numero)) {
          return "canino";
        }
        if ([14, 15, 24, 25, 34, 35, 44, 45].includes(numero)) {
          return "premolar";
        }
        return "molar";
      };

      const dibujarFormaDiente = (
        numero: number,
        centroX: number,
        yBase: number,
        superior: boolean
      ) => {
        const tipo = tipoDiente(numero);
        const seleccionado = dientesPresupuestados.has(numero);

        const dimensiones: Record<string, [number, number]> = {
          incisor: [60, 155],
          canino: [62, 160],
          premolar: [72, 155],
          molar: [92, 165],
        };

        const [w, h] = dimensiones[tipo];
        const ancho = w * escala;
        const alto = h * escala;
        const x = centroX - ancho / 2;

        // Silueta basada en las mismas anatomías SVG usadas por MintOS.
        const puntos: Record<string, Array<[number, number]>> = {
          incisor: [
            [18,10],[13,13],[10,22],[10,34],[12,61],[16,70],
            [21,84],[23,124],[30,151],[37,124],[39,84],[44,70],
            [50,34],[50,22],[42,10],[30,8]
          ],
          canino: [
            [31,5],[18,22],[11,39],[11,51],[17,77],[24,88],
            [25,126],[31,157],[38,126],[39,88],[46,77],[52,51],
            [52,39],[44,22]
          ],
          premolar: [
            [20,17],[10,28],[10,40],[16,73],[25,87],[27,127],
            [36,153],[45,127],[47,87],[56,73],[62,40],[52,17],
            [36,7]
          ],
          molar: [
            [20,20],[9,31],[9,43],[15,79],[24,91],[21,128],
            [28,162],[38,128],[46,104],[54,128],[64,162],[71,128],
            [68,91],[77,79],[83,43],[72,20],[55,11],[46,17],[37,11]
          ],
        };

        const pts = puntos[tipo].map(([px, py]) => {
          const xx = x + px * escala;
          const yy = yBase + py * escala;
          return [
            xx,
            superior ? yBase + alto - (yy - yBase) : yy,
          ] as [number, number];
        });

        pdf.setDrawColor(
          ...(seleccionado ? tealOscuro : ([124, 135, 151] as [number, number, number]))
        );
        pdf.setFillColor(
          ...(seleccionado ? tealSoft : ([255, 253, 247] as [number, number, number]))
        );
        pdf.setLineWidth(seleccionado ? 0.45 : 0.25);

        const movimientos = pts.slice(1).map(([px, py], i) => [
          px - pts[i][0],
          py - pts[i][1],
        ] as [number, number]);

        pdf.lines(
          movimientos,
          pts[0][0],
          pts[0][1],
          [1, 1],
          "FD",
          true
        );

        // Línea central y cuello: conserva el aspecto anatómico del sistema.
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.18);
        pdf.line(
          centroX,
          yBase + alto * 0.18,
          centroX,
          yBase + alto * 0.72
        );

        pdf.setTextColor(...(seleccionado ? tealOscuro : muted));
        pdf.setFont("helvetica", seleccionado ? "bold" : "normal");
        pdf.setFontSize(5.7);
        pdf.text(
          String(numero),
          centroX,
          yBase + alto + 2.4,
          { align: "center" }
        );
      };

      const altoOdontograma = 42;
      const mitadOdontograma = y + altoOdontograma / 2;

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(...border);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(
        margen,
        y,
        anchoContenido,
        altoOdontograma,
        3,
        3,
        "FD"
      );

      pdf.setDrawColor(...border);
      pdf.setLineWidth(0.2);
      pdf.line(
        margen + 5,
        mitadOdontograma,
        anchoPagina - margen - 5,
        mitadOdontograma
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6);
      pdf.setTextColor(...tealOscuro);
      pdf.text(
        documentoEnIngles ? "UPPER ARCH" : "MAXILAR SUPERIOR",
        margen + 4,
        y + 4
      );

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "18 — 28",
        anchoPagina - margen - 4,
        y + 4,
        { align: "right" }
      );

      superiores.forEach((numero, index) => {
        dibujarFormaDiente(
          numero,
          margen + espacio * index + espacio / 2,
          y + 5.5,
          true
        );
      });

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...tealOscuro);
      pdf.text(
        documentoEnIngles ? "LOWER ARCH" : "MAXILAR INFERIOR",
        margen + 4,
        mitadOdontograma + 4
      );

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "48 — 38",
        anchoPagina - margen - 4,
        mitadOdontograma + 4,
        { align: "right" }
      );

      inferiores.forEach((numero, index) => {
        dibujarFormaDiente(
          numero,
          margen + espacio * index + espacio / 2,
          mitadOdontograma + 5.5,
          false
        );
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.2);
      pdf.setTextColor(...muted);
      pdf.text(
        documentoEnIngles
          ? "Highlighted teeth are included in the proposed treatment."
          : "Los dientes resaltados están incluidos en el tratamiento propuesto.",
        margen,
        y + altoOdontograma + 5
      );

      y += altoOdontograma + 11;
    }

    // Título de tratamientos
    pdf.setFillColor(...tealOscuro);
    pdf.rect(margen, y - 3.5, 1.2, 5, "F");

    pdf.setTextColor(...slate);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(
      documentoEnIngles
        ? "Treatment plan"
        : "Plan de tratamiento",
      margen + 4,
      y
    );

    y += 7;

    // Encabezado de tabla
    pdf.setFillColor(...tealOscuro);
    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      8.5,
      1.5,
      1.5,
      "F"
    );

    const xDiente = margen + 4;
    const xTratamiento = margen + 31;
    const xCantidad = anchoPagina - margen - 67;
    const xPrecio = anchoPagina - margen - 36;
    const xTotal = anchoPagina - margen - 4;

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.2);

    pdf.text(
      documentoEnIngles ? "Tooth / Arch" : "Diente / Arcada",
      xDiente,
      y + 5.8
    );

    pdf.text(
      documentoEnIngles ? "Treatment" : "Tratamiento",
      xTratamiento,
      y + 5.8
    );

    pdf.text(
      documentoEnIngles ? "Qty." : "Cant.",
      xCantidad,
      y + 5.8,
      { align: "right" }
    );

    pdf.text(
      documentoEnIngles ? "Unit price" : "Precio",
      xPrecio,
      y + 5.8,
      { align: "right" }
    );

    pdf.text(
      "Total",
      xTotal,
      y + 5.8,
      { align: "right" }
    );

    y += 12;

    (presupuesto.items || []).forEach(
      (
        item,
        index
      ) => {

        const nombreTratamiento =
          nombreTratamientoDocumento(
            item
          );

        const lineasTratamiento =
          pdf.splitTextToSize(
            nombreTratamiento,
            64
          );

        const alturaFila =
          Math.max(
            10,
            lineasTratamiento.length * 4 + 4
          );

        nuevaPaginaSiHaceFalta(
          alturaFila + 3
        );

        if (index % 2 === 1) {
          pdf.setFillColor(...soft);
          pdf.rect(
            margen,
            y - 2,
            anchoContenido,
            alturaFila,
            "F"
          );
        }

        pdf.setTextColor(...slate);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);

        pdf.text(
          etiquetaDientePDF(item),
          xDiente,
          y + 4
        );

        pdf.setFont("helvetica", "bold");
        pdf.text(
          lineasTratamiento,
          xTratamiento,
          y + 4
        );

        pdf.setFont("helvetica", "normal");

        pdf.text(
          String(item.cantidad),
          xCantidad,
          y + 4,
          { align: "right" }
        );

        pdf.text(
          formatoPDF(
            item.precio_unitario
          ),
          xPrecio,
          y + 4,
          { align: "right" }
        );

        pdf.setFont("helvetica", "bold");
        pdf.text(
          formatoPDF(
            item.total
          ),
          xTotal,
          y + 4,
          { align: "right" }
        );

        y += alturaFila;

        pdf.setDrawColor(...border);
        pdf.setLineWidth(0.2);
        pdf.line(
          margen,
          y - 2,
          anchoPagina - margen,
          y - 2
        );

        y += 1;
      }
    );

    y += 5;

    // Resumen y notas en una composición más compacta
    const anchoResumen = 82;
    const gap = 7;
    const anchoNotas =
      anchoContenido - anchoResumen - gap;

    const notasTexto =
      presupuesto.notas?.trim() || "";

    const lineasNotas =
      notasTexto
        ? pdf.splitTextToSize(
            notasTexto,
            anchoNotas - 12
          )
        : [];

    const alturaBloque =
      Math.max(
        41,
        lineasNotas.length * 4 + 18
      );

    nuevaPaginaSiHaceFalta(
      alturaBloque + 8
    );

    // Notas / observaciones
    pdf.setDrawColor(...border);
    pdf.setFillColor(...soft);
    pdf.roundedRect(
      margen,
      y,
      anchoNotas,
      alturaBloque,
      3,
      3,
      "FD"
    );

    pdf.setTextColor(...tealOscuro);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text(
      documentoEnIngles
        ? "NOTES"
        : "NOTAS",
      margen + 6,
      y + 8
    );

    pdf.setTextColor(...slate);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    if (lineasNotas.length > 0) {
      pdf.text(
        lineasNotas,
        margen + 6,
        y + 15
      );
    } else {
      pdf.setTextColor(...muted);
      pdf.text(
        documentoEnIngles
          ? "No additional notes."
          : "Sin notas adicionales.",
        margen + 6,
        y + 15
      );
    }

    // Totales
    const xResumen =
      margen + anchoNotas + gap;

    pdf.setFillColor(...tealSoft);
    pdf.roundedRect(
      xResumen,
      y,
      anchoResumen,
      alturaBloque,
      3,
      3,
      "F"
    );

    pdf.setTextColor(...tealOscuro);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text(
      documentoEnIngles
        ? "ESTIMATE SUMMARY"
        : "RESUMEN DEL PRESUPUESTO",
      xResumen + 6,
      y + 8
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...muted);

    pdf.text(
      "Subtotal",
      xResumen + 6,
      y + 17
    );

    pdf.setTextColor(...slate);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      formatoPDF(
        presupuesto.subtotal
      ),
      xResumen + anchoResumen - 6,
      y + 17,
      { align: "right" }
    );

    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      documentoEnIngles
        ? "Discount"
        : "Descuento",
      xResumen + 6,
      y + 25
    );

    pdf.setTextColor(...slate);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      presupuesto.descuento > 0
        ? `-${formatoPDF(
            presupuesto.descuento
          )}`
        : formatoPDF(0),
      xResumen + anchoResumen - 6,
      y + 25,
      { align: "right" }
    );

    pdf.setDrawColor(...border);
    pdf.line(
      xResumen + 6,
      y + 31,
      xResumen + anchoResumen - 6,
      y + 31
    );

    pdf.setTextColor(...tealOscuro);
    pdf.setFontSize(8);
    pdf.text(
      "TOTAL",
      xResumen + 6,
      y + 39
    );

    pdf.setFontSize(12.5);
    pdf.text(
      formatoPDF(
        presupuesto.total
      ),
      xResumen + anchoResumen - 6,
      y + 39,
      { align: "right" }
    );

    y += alturaBloque + 8;

    // Información importante
    nuevaPaginaSiHaceFalta(27);

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...border);
    pdf.roundedRect(
      margen,
      y,
      anchoContenido,
      22,
      2.5,
      2.5,
      "FD"
    );

    pdf.setTextColor(...tealOscuro);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text(
      documentoEnIngles
        ? "IMPORTANT INFORMATION"
        : "INFORMACIÓN IMPORTANTE",
      margen + 6,
      y + 7
    );

    const aviso =
      pdf.splitTextToSize(
        documentoEnIngles
          ? "This estimate applies to the treatments described and may be adjusted if additional needs are identified during the clinical evaluation. Please contact our team with any questions before treatment begins."
          : "Este presupuesto corresponde a los tratamientos descritos y puede ajustarse si durante la evaluación clínica se identifican necesidades adicionales. Contáctanos si tienes alguna duda antes de iniciar el tratamiento.",
        anchoContenido - 12
      );

    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.text(
      aviso,
      margen + 6,
      y + 13
    );

    // Pie de página
    const totalPaginas =
      pdf.getNumberOfPages();

    for (
      let pagina = 1;
      pagina <= totalPaginas;
      pagina++
    ) {

      pdf.setPage(pagina);

      pdf.setDrawColor(...border);
      pdf.setLineWidth(0.2);
      pdf.line(
        margen,
        altoPagina - 15,
        anchoPagina - margen,
        altoPagina - 15
      );

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);

      pdf.text(
        "Dra. Marlene Group · San Luis Río Colorado, Sonora, México",
        margen,
        altoPagina - 9
      );

      pdf.text(
        `${documentoEnIngles ? "Page" : "Página"} ${pagina} ${documentoEnIngles ? "of" : "de"} ${totalPaginas}`,
        anchoPagina - margen,
        altoPagina - 9,
        {
          align: "right",
        }
      );
    }

    const pacienteArchivo =
      pacienteNombre
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
      `${documentoEnIngles ? "treatment-estimate" : "presupuesto"}-${presupuesto.id}-${pacienteArchivo}.pdf`
    );

  }

  async function enviarPresupuesto() {

    if (!puedeEnviar) {
      return;
    }

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
                {es ? "Presupuesto" : "Estimate"} #
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
                  `${es ? "Paciente" : "Patient"} #${presupuesto.paciente_id}`
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
                  puedeEnviar ? (

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

                  ) : null
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
              {
                presupuesto.estado === "Borrador"
                  ? es ? "Borrador" : "Draft"
                  : presupuesto.estado === "Enviado"
                    ? es ? "Enviado" : "Sent"
                    : es ? "Convertido" : "Converted"
              }
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
                  {es
                    ? "Procedimientos incluidos en este presupuesto."
                    : "Procedures included in this estimate."}
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
                                  item.arcada === "superior"
                                    ? es ? "Arcada superior" : "Upper arch"
                                    : item.arcada === "inferior"
                                      ? es ? "Arcada inferior" : "Lower arch"
                                      : item.dientes?.length
                                        ? item.dientes
                                            .slice()
                                            .sort((a, b) => a - b)
                                            .join(", ")
                                        : item.diente || "—"
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
                    {es
                      ? "No hay tratamientos registrados en este presupuesto."
                      : "No treatments are registered in this estimate."}
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
                  flex
                  justify-between
                  gap-4
                  text-sm
                "
              >
                <span className="mint-text-secondary">
                  {es ? "Idioma del documento" : "Document language"}
                </span>

                <span className="font-semibold mint-text-primary">
                  {presupuesto.idioma === "en"
                    ? "English"
                    : "Español"}
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
                    Descuento
                  </span>

                  <strong
                    className="
                      text-[var(--mint-danger)]
                    "
                  >
                    -{
                      formatoMonto(
                        presupuesto.descuento ||
                        0
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
                (es
                  ? "Sin notas registradas."
                  : "No notes recorded.")
              }
            </p>

          </section>

        </div>

      </div>

    </div>

  );

}