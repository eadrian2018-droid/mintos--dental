import { useMemo, useState } from "react";

import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Printer,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";

type GarantiasCuidadosProps = {
  onBack: () => void;
};

type TipoDocumento = "garantia" | "cuidados";

type Formulario = {
  clinica: string;
  direccion: string;
  telefono: string;
  paciente: string;
  odontologo: string;
  cedula: string;
  fecha: string;
  tratamiento: string;
  fechaTratamiento: string;
  duracionGarantia: string;
  cobertura: string;
  condiciones: string;
  exclusiones: string;
  mantenimiento: string;
  cuidados: string;
  restricciones: string;
  alertas: string;
  observaciones: string;
};

const fechaLocal = () => {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formularioInicial = (): Formulario => ({
  clinica: "",
  direccion: "",
  telefono: "",
  paciente: "",
  odontologo: "",
  cedula: "",
  fecha: fechaLocal(),
  tratamiento: "",
  fechaTratamiento: fechaLocal(),
  duracionGarantia: "",
  cobertura: "",
  condiciones: "",
  exclusiones: "",
  mantenimiento: "",
  cuidados: "",
  restricciones: "",
  alertas: "",
  observaciones: "",
});

const formatoFecha = (valor: string, es: boolean) => {
  if (!valor) return "—";

  const fecha = new Date(`${valor}T12:00:00`);

  if (Number.isNaN(fecha.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat(
    es ? "es-MX" : "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(fecha);
};

const escaparHtml = (valor: string) =>
  valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function GarantiasCuidados({
  onBack,
}: GarantiasCuidadosProps) {
  const { language } = useLanguage();
  const es = language === "es";

  const [tipo, setTipo] =
    useState<TipoDocumento>("garantia");

  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);

  const [mostrarVistaPrevia, setMostrarVistaPrevia] =
    useState(false);

  const actualizar = (
    campo: keyof Formulario,
    valor: string,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const tipos = [
    {
      id: "garantia" as const,
      icon: ShieldCheck,
      titulo: es
        ? "Garantía de tratamiento"
        : "Treatment Warranty",
      descripcion: es
        ? "Documenta la cobertura, condiciones y responsabilidades relacionadas con un tratamiento."
        : "Document coverage, conditions, and responsibilities associated with a treatment.",
    },
    {
      id: "cuidados" as const,
      icon: HeartPulse,
      titulo: es
        ? "Cuidados posteriores"
        : "Post-Treatment Care",
      descripcion: es
        ? "Prepara indicaciones de recuperación, higiene, restricciones y señales de alerta."
        : "Prepare recovery, hygiene, restriction, and warning-sign instructions.",
    },
  ];

  const tipoActivo = tipos.find(
    (item) => item.id === tipo,
  );

  const documentoValido = useMemo(() => {
    const datosGenerales =
      formulario.clinica.trim().length > 0 &&
      formulario.paciente.trim().length > 0 &&
      formulario.odontologo.trim().length > 0 &&
      formulario.fecha.length > 0 &&
      formulario.tratamiento.trim().length > 0;

    if (!datosGenerales) return false;

    if (tipo === "garantia") {
      return (
        formulario.fechaTratamiento.length > 0 &&
        formulario.duracionGarantia.trim().length > 0 &&
        formulario.cobertura.trim().length > 0 &&
        formulario.condiciones.trim().length > 0
      );
    }

    return formulario.cuidados.trim().length > 0;
  }, [formulario, tipo]);

  const tituloDocumento =
    tipoActivo?.titulo ?? "";

  const seccionesDocumento = useMemo(() => {
    if (tipo === "garantia") {
      return [
        {
          titulo: es
            ? "Tratamiento realizado"
            : "Treatment Performed",
          contenido: formulario.tratamiento.trim(),
        },
        {
          titulo: es
            ? "Periodo de garantía"
            : "Warranty Period",
          contenido: formulario.duracionGarantia.trim(),
        },
        {
          titulo: es
            ? "Cobertura"
            : "Coverage",
          contenido: formulario.cobertura.trim(),
        },
        {
          titulo: es
            ? "Condiciones de la garantía"
            : "Warranty Conditions",
          contenido: formulario.condiciones.trim(),
        },
        {
          titulo: es
            ? "Exclusiones"
            : "Exclusions",
          contenido: formulario.exclusiones.trim(),
        },
        {
          titulo: es
            ? "Mantenimiento y responsabilidades del paciente"
            : "Maintenance and Patient Responsibilities",
          contenido: formulario.mantenimiento.trim(),
        },
      ];
    }

    return [
      {
        titulo: es
          ? "Tratamiento recibido"
          : "Treatment Received",
        contenido: formulario.tratamiento.trim(),
      },
      {
        titulo: es
          ? "Cuidados e indicaciones"
          : "Care Instructions",
        contenido: formulario.cuidados.trim(),
      },
      {
        titulo: es
          ? "Restricciones y recomendaciones"
          : "Restrictions and Recommendations",
        contenido: formulario.restricciones.trim(),
      },
      {
        titulo: es
          ? "Señales de alerta"
          : "Warning Signs",
        contenido: formulario.alertas.trim(),
      },
    ];
  }, [tipo, formulario, es]);

  const limpiarFormulario = () => {
    setFormulario(formularioInicial());
    setMostrarVistaPrevia(false);
  };

  const imprimirDocumento = () => {
    if (!documentoValido) return;

    const ventana = window.open(
      "",
      "_blank",
      "width=900,height=1000",
    );

    if (!ventana) {
      window.alert(
        es
          ? "No se pudo abrir la ventana de impresión. Revisa el bloqueo de ventanas emergentes."
          : "Unable to open the print window. Check your pop-up blocker.",
      );

      return;
    }

    const seccionesHtml = seccionesDocumento
      .filter((seccion) => seccion.contenido)
      .map(
        (seccion) => `
          <section class="document-section">
            <h2>${escaparHtml(seccion.titulo)}</h2>
            <div>${escaparHtml(seccion.contenido).replace(/\n/g, "<br />")}</div>
          </section>
        `,
      )
      .join("");

    const observaciones = formulario.observaciones.trim();

    const html = `<!DOCTYPE html>
<html lang="${es ? "es" : "en"}">
<head>
  <meta charset="UTF-8" />
  <title>${escaparHtml(tituloDocumento)}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 42px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 1.7;
      color: #17364b;
    }

    .header {
      border-bottom: 3px solid #0b8f80;
      padding-bottom: 20px;
    }

    .clinic {
      font-size: 23px;
      font-weight: 800;
      color: #102f4f;
    }

    .meta {
      margin-top: 4px;
      font-size: 12px;
      color: #607987;
    }

    h1 {
      margin: 32px 0;
      text-align: center;
      text-transform: uppercase;
      font-size: 19px;
      letter-spacing: 1px;
    }

    .patient {
      padding: 16px;
      border: 1px solid #dce6e8;
      border-radius: 10px;
      background: #f7faf9;
      line-height: 1.9;
    }

    .document-section {
      margin-top: 24px;
      break-inside: avoid;
    }

    .document-section h2 {
      font-size: 14px;
      color: #102f4f;
      border-bottom: 1px solid #dce6e8;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }

    .notes {
      margin-top: 25px;
      padding: 14px;
      border-left: 3px solid #0b8f80;
      background: #f3f8f7;
      white-space: pre-wrap;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      gap: 35px;
      margin-top: 90px;
      break-inside: avoid;
    }

    .signature {
      flex: 1;
      border-top: 1px solid #17364b;
      padding-top: 10px;
      text-align: center;
      line-height: 1.5;
    }

    .footer {
      margin-top: 50px;
      border-top: 1px solid #dce6e8;
      padding-top: 12px;
      font-size: 11px;
      text-align: center;
      color: #607987;
    }

    @media print {
      body {
        padding: 12mm;
      }

      @page {
        size: letter;
        margin: 12mm;
      }
    }
  </style>
</head>

<body>
  <div class="header">
    <div class="clinic">${escaparHtml(formulario.clinica)}</div>

    ${
      formulario.direccion.trim()
        ? `<div class="meta">${escaparHtml(formulario.direccion)}</div>`
        : ""
    }

    ${
      formulario.telefono.trim()
        ? `<div class="meta">${escaparHtml(formulario.telefono)}</div>`
        : ""
    }
  </div>

  <h1>${escaparHtml(tituloDocumento)}</h1>

  <div class="patient">
    <div>
      <strong>${es ? "Paciente" : "Patient"}:</strong>
      ${escaparHtml(formulario.paciente)}
    </div>

    <div>
      <strong>${es ? "Tratamiento" : "Treatment"}:</strong>
      ${escaparHtml(formulario.tratamiento)}
    </div>

    <div>
      <strong>${es ? "Fecha del documento" : "Document date"}:</strong>
      ${formatoFecha(formulario.fecha, es)}
    </div>

    <div>
      <strong>${es ? "Fecha del tratamiento" : "Treatment date"}:</strong>
      ${formatoFecha(formulario.fechaTratamiento, es)}
    </div>
  </div>

  ${seccionesHtml}

  ${
    observaciones
      ? `
        <div class="notes">
          <strong>${es ? "Observaciones adicionales" : "Additional Notes"}:</strong>
          <br />
          ${escaparHtml(observaciones)}
        </div>
      `
      : ""
  }

  <div class="signatures">
    <div class="signature">
      <strong>${escaparHtml(formulario.odontologo)}</strong>
      <br />
      ${
        formulario.cedula.trim()
          ? `${es ? "Cédula profesional" : "Professional license"}: ${escaparHtml(formulario.cedula)}<br />`
          : ""
      }
      ${es ? "Odontólogo tratante" : "Treating dentist"}
    </div>

    <div class="signature">
      <strong>${escaparHtml(formulario.paciente)}</strong>
      <br />
      ${es ? "Firma del paciente" : "Patient signature"}
    </div>
  </div>

  <div class="footer">
    ${escaparHtml(formulario.clinica)}
  </div>
</body>
</html>`;

    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
  };

  const campo = (
    etiqueta: string,
    nombre: keyof Formulario,
    opciones?: {
      type?: string;
      required?: boolean;
      placeholder?: string;
    },
  ) => (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
        {etiqueta}

        {opciones?.required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      <input
        type={opciones?.type ?? "text"}
        value={formulario[nombre]}
        onChange={(event) =>
          actualizar(nombre, event.target.value)
        }
        required={opciones?.required}
        placeholder={opciones?.placeholder}
        className="w-full min-w-0 rounded-[12px] border border-[#dce6e8] bg-white px-3.5 py-3 text-sm text-[#102f4f] outline-none transition placeholder:text-[#8299a2] focus:border-[#0b8f80] focus:ring-2 focus:ring-[#0b8f80]/15 dark:border-white/15 dark:bg-[#0a2130] dark:text-white"
      />
    </label>
  );

  const areaTexto = (
    etiqueta: string,
    nombre: keyof Formulario,
    requerido = false,
    placeholder = "",
  ) => (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
        {etiqueta}

        {requerido && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      <textarea
        rows={4}
        value={formulario[nombre]}
        onChange={(event) =>
          actualizar(nombre, event.target.value)
        }
        required={requerido}
        placeholder={placeholder}
        className="w-full resize-y rounded-[12px] border border-[#dce6e8] bg-white px-3.5 py-3 text-sm text-[#102f4f] outline-none transition placeholder:text-[#8299a2] focus:border-[#0b8f80] focus:ring-2 focus:ring-[#0b8f80]/15 dark:border-white/15 dark:bg-[#0a2130] dark:text-white"
      />
    </label>
  );

  return (
    <div className="w-full min-w-0 space-y-6 text-[#102f4f] dark:text-slate-100">
      {/* ENCABEZADO */}

      <header className="rounded-[24px] border border-[#d7e9e5] bg-gradient-to-br from-[#102f4f] via-[#123e55] to-[#0a716b] p-6 text-white shadow-[0_18px_40px_rgba(16,47,79,0.13)] dark:border-white/10 sm:p-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          <ArrowLeft size={15} />

          {es
            ? "Volver a Documentos Clínicos"
            : "Back to Clinical Documents"}
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#9af2df]">
              <Stethoscope size={14} />
              MintOS Dental System
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {es
                ? "Garantías y cuidados"
                : "Warranties & Aftercare"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
              {es
                ? "Genera documentos de garantía, recomendaciones de mantenimiento e indicaciones posteriores al tratamiento."
                : "Create warranty documents, maintenance recommendations, and post-treatment instructions."}
            </p>
          </div>

          <span className="rounded-full border border-[#7de5d0]/30 bg-[#7de5d0]/10 px-3 py-1.5 text-xs font-semibold text-[#a6f4e4]">
            {es
              ? "Generador de documentos"
              : "Document generator"}
          </span>
        </div>
      </header>

      {/* TIPO DE DOCUMENTO */}

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
            <FileText size={21} />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
              {es
                ? "Seleccionar documento"
                : "Select Document"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Elige el documento que deseas preparar."
                : "Choose the document you want to prepare."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tipos.map((item) => {
            const Icon = item.icon;
            const activo = tipo === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTipo(item.id);
                  setMostrarVistaPrevia(false);
                }}
                aria-pressed={activo}
                className={`relative flex min-h-40 flex-col items-start overflow-hidden rounded-[19px] border p-5 text-left transition hover:-translate-y-0.5 ${
                  activo
                    ? "border-[#74bdb1] bg-[#edf8f5] dark:border-[#45b5a5] dark:bg-[#16443f]"
                    : "border-[#e0e8ed] bg-[#fcfdfd] hover:border-[#9ccfc5] dark:border-white/10 dark:bg-[#142f40]"
                }`}
              >
                <span className="absolute inset-x-0 top-0 h-[3px] bg-[#0b9a88]" />

                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[13px] border border-[#d2e9e4] bg-[#eaf6f2] text-[#087e73] dark:border-[#62dfc8]/15 dark:bg-[#0b8f80]/20 dark:text-[#8be9d7]">
                  <Icon size={21} />
                </span>

                <span className="text-sm font-bold text-[#123b50] dark:text-white">
                  {item.titulo}
                </span>

                <span className="mt-2 text-xs leading-relaxed text-[#607987] dark:text-slate-400">
                  {item.descripcion}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* FORMULARIO */}

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
            <ClipboardCheck size={21} />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
              {es
                ? "Información del documento"
                : "Document Information"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Completa los datos necesarios para generar el documento."
                : "Complete the required information to generate the document."}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* CONSULTORIO */}

          <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
            <h3 className="mb-4 text-sm font-bold text-[#123b50] dark:text-white">
              {es ? "Consultorio" : "Dental Office"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {campo(
                es
                  ? "Nombre del consultorio"
                  : "Dental office name",
                "clinica",
                { required: true },
              )}

              {campo(
                es ? "Teléfono" : "Phone",
                "telefono",
                { type: "tel" },
              )}

              <div className="md:col-span-2">
                {campo(
                  es ? "Dirección" : "Address",
                  "direccion",
                )}
              </div>
            </div>
          </div>

          {/* PACIENTE */}

          <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
            <h3 className="mb-4 text-sm font-bold text-[#123b50] dark:text-white">
              {es
                ? "Paciente y odontólogo"
                : "Patient and Dentist"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {campo(
                es ? "Paciente" : "Patient",
                "paciente",
                { required: true },
              )}

              {campo(
                es
                  ? "Odontólogo tratante"
                  : "Treating dentist",
                "odontologo",
                { required: true },
              )}

              {campo(
                es
                  ? "Cédula profesional"
                  : "Professional license",
                "cedula",
              )}

              {campo(
                es
                  ? "Fecha del documento"
                  : "Document date",
                "fecha",
                {
                  type: "date",
                  required: true,
                },
              )}

              {campo(
                es
                  ? "Tratamiento realizado"
                  : "Treatment performed",
                "tratamiento",
                { required: true },
              )}

              {campo(
                es
                  ? "Fecha del tratamiento"
                  : "Treatment date",
                "fechaTratamiento",
                {
                  type: "date",
                  required: tipo === "garantia",
                },
              )}
            </div>
          </div>

          {/* GARANTÍA */}

          {tipo === "garantia" && (
            <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck
                  size={20}
                  className="text-[#0b8f80]"
                />

                <h3 className="text-sm font-bold text-[#123b50] dark:text-white">
                  {es
                    ? "Condiciones de garantía"
                    : "Warranty Conditions"}
                </h3>
              </div>

              <div className="space-y-4">
                {campo(
                  es
                    ? "Periodo de garantía"
                    : "Warranty period",
                  "duracionGarantia",
                  {
                    required: true,
                    placeholder: es
                      ? "Ej. 12 meses"
                      : "E.g. 12 months",
                  },
                )}

                {areaTexto(
                  es
                    ? "Cobertura de la garantía"
                    : "Warranty coverage",
                  "cobertura",
                  true,
                )}

                {areaTexto(
                  es
                    ? "Condiciones para conservar la garantía"
                    : "Conditions to maintain warranty",
                  "condiciones",
                  true,
                )}

                {areaTexto(
                  es
                    ? "Exclusiones de cobertura"
                    : "Coverage exclusions",
                  "exclusiones",
                )}

                {areaTexto(
                  es
                    ? "Mantenimiento y responsabilidades del paciente"
                    : "Maintenance and patient responsibilities",
                  "mantenimiento",
                )}
              </div>
            </div>
          )}

          {/* CUIDADOS */}

          {tipo === "cuidados" && (
            <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
              <div className="mb-5 flex items-center gap-3">
                <HeartPulse
                  size={20}
                  className="text-[#0b8f80]"
                />

                <h3 className="text-sm font-bold text-[#123b50] dark:text-white">
                  {es
                    ? "Indicaciones posteriores al tratamiento"
                    : "Post-Treatment Instructions"}
                </h3>
              </div>

              <div className="space-y-4">
                {areaTexto(
                  es
                    ? "Cuidados e indicaciones"
                    : "Care instructions",
                  "cuidados",
                  true,
                )}

                {areaTexto(
                  es
                    ? "Restricciones y recomendaciones"
                    : "Restrictions and recommendations",
                  "restricciones",
                )}

                {areaTexto(
                  es
                    ? "Señales de alerta"
                    : "Warning signs",
                  "alertas",
                )}
              </div>
            </div>
          )}

          {/* OBSERVACIONES */}

          <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
            {areaTexto(
              es
                ? "Observaciones adicionales (opcional)"
                : "Additional notes (optional)",
              "observaciones",
            )}
          </div>
        </div>

        {/* ACCIONES */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={limpiarFormulario}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#dce6e8] bg-white px-4 py-3 text-xs font-bold text-[#456773] transition hover:bg-[#eef8f5] dark:border-white/15 dark:bg-[#142f40] dark:text-slate-200"
          >
            <RotateCcw size={16} />

            {es ? "Limpiar formulario" : "Clear Form"}
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!documentoValido}
              onClick={() =>
                setMostrarVistaPrevia(true)
              }
              className="inline-flex items-center gap-2 rounded-[12px] border border-[#0b8f80] bg-[#eef8f5] px-5 py-3 text-xs font-bold text-[#087e73] transition hover:bg-[#d9f1e9] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0b8f80]/15 dark:text-[#a5eddf]"
            >
              <FileText size={16} />

              {es ? "Vista previa" : "Preview"}
            </button>

            <button
              type="button"
              disabled={!documentoValido}
              onClick={imprimirDocumento}
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#0b8f80] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#08796e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer size={16} />

              {es
                ? "Imprimir / Guardar PDF"
                : "Print / Save PDF"}
            </button>
          </div>
        </div>
      </section>

      {/* VISTA PREVIA */}

      {mostrarVistaPrevia && (
        <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
              {es
                ? "Vista previa del documento"
                : "Document Preview"}
            </h2>

            <button
              type="button"
              onClick={() =>
                setMostrarVistaPrevia(false)
              }
              className="rounded-lg border border-[#dce6e8] px-3 py-2 text-xs font-semibold text-[#456773] dark:border-white/15 dark:text-slate-200"
            >
              {es
                ? "Cerrar vista previa"
                : "Close Preview"}
            </button>
          </div>

          <div className="mx-auto max-w-3xl rounded-[18px] border border-[#dce6e8] bg-white p-6 text-[#17364b] shadow-sm sm:p-10">
            <div className="border-b-[3px] border-[#0b8f80] pb-5">
              <h3 className="text-xl font-extrabold text-[#102f4f]">
                {formulario.clinica}
              </h3>

              {formulario.direccion && (
                <p className="mt-1 text-xs text-[#607987]">
                  {formulario.direccion}
                </p>
              )}

              {formulario.telefono && (
                <p className="mt-1 text-xs text-[#607987]">
                  {formulario.telefono}
                </p>
              )}
            </div>

            <h3 className="my-8 text-center text-lg font-extrabold uppercase tracking-wide text-[#102f4f]">
              {tituloDocumento}
            </h3>

            <div className="rounded-xl border border-[#dce6e8] bg-[#f7faf9] p-4 text-xs leading-7">
              <p>
                <strong>{es ? "Paciente" : "Patient"}:</strong>{" "}
                {formulario.paciente}
              </p>

              <p>
                <strong>{es ? "Tratamiento" : "Treatment"}:</strong>{" "}
                {formulario.tratamiento}
              </p>

              <p>
                <strong>
                  {es ? "Fecha del documento" : "Document date"}:
                </strong>{" "}
                {formatoFecha(formulario.fecha, es)}
              </p>

              <p>
                <strong>
                  {es ? "Fecha del tratamiento" : "Treatment date"}:
                </strong>{" "}
                {formatoFecha(formulario.fechaTratamiento, es)}
              </p>
            </div>

            <div className="mt-7 space-y-6">
              {seccionesDocumento
                .filter((seccion) => seccion.contenido)
                .map((seccion) => (
                  <div key={seccion.titulo}>
                    <h4 className="mb-2 border-b border-[#dce6e8] pb-2 text-sm font-extrabold text-[#102f4f]">
                      {seccion.titulo}
                    </h4>

                    <p className="whitespace-pre-line text-xs leading-7 text-[#315b63]">
                      {seccion.contenido}
                    </p>
                  </div>
                ))}
            </div>

            {formulario.observaciones.trim() && (
              <div className="mt-7 rounded-xl border-l-[3px] border-[#0b8f80] bg-[#f3f8f7] p-4">
                <p className="text-xs font-bold">
                  {es
                    ? "Observaciones adicionales"
                    : "Additional Notes"}
                </p>

                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed">
                  {formulario.observaciones}
                </p>
              </div>
            )}

            <div className="mt-24 grid gap-8 sm:grid-cols-2">
              <div className="border-t border-[#17364b] pt-3 text-center">
                <p className="text-sm font-bold">
                  {formulario.odontologo}
                </p>

                {formulario.cedula && (
                  <p className="mt-1 text-xs">
                    {es
                      ? "Cédula profesional"
                      : "Professional license"}
                    : {formulario.cedula}
                  </p>
                )}

                <p className="mt-1 text-xs text-[#607987]">
                  {es
                    ? "Odontólogo tratante"
                    : "Treating dentist"}
                </p>
              </div>

              <div className="border-t border-[#17364b] pt-3 text-center">
                <p className="text-sm font-bold">
                  {formulario.paciente}
                </p>

                <p className="mt-1 text-xs text-[#607987]">
                  {es
                    ? "Firma del paciente"
                    : "Patient signature"}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}