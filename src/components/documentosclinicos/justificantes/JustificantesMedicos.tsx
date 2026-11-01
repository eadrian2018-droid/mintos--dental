import { useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Printer,
  RotateCcw,
  Stethoscope,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";

type JustificantesMedicosProps = {
  onBack: () => void;
};

type TipoDocumento =
  | "asistencia"
  | "reposo"
  | "tratamiento";

type Formulario = {
  clinica: string;
  direccion: string;
  telefono: string;
  paciente: string;
  odontologo: string;
  cedula: string;
  fechaAtencion: string;
  horaEntrada: string;
  horaSalida: string;
  diasReposo: string;
  fechaInicioReposo: string;
  descripcion: string;
  observaciones: string;
};

const fechaLocal = () => {
  const ahora = new Date();

  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formularioInicial = (): Formulario => ({
  clinica: "",
  direccion: "",
  telefono: "",
  paciente: "",
  odontologo: "",
  cedula: "",
  fechaAtencion: fechaLocal(),
  horaEntrada: "",
  horaSalida: "",
  diasReposo: "1",
  fechaInicioReposo: fechaLocal(),
  descripcion: "",
  observaciones: "",
});

const formatoFecha = (valor: string, es: boolean) => {
  if (!valor) return "—";

  const fecha = new Date(`${valor}T12:00:00`);

  if (Number.isNaN(fecha.getTime())) return valor;

  return new Intl.DateTimeFormat(
    es ? "es-MX" : "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(fecha);
};

const sumarDias = (fecha: string, dias: number) => {
  if (!fecha || !Number.isFinite(dias) || dias < 1) {
    return "";
  }

  const resultado = new Date(`${fecha}T12:00:00`);

  if (Number.isNaN(resultado.getTime())) return "";

  resultado.setDate(resultado.getDate() + dias - 1);

  const year = resultado.getFullYear();
  const month = String(resultado.getMonth() + 1).padStart(2, "0");
  const day = String(resultado.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const escaparHtml = (valor: string) =>
  valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function JustificantesMedicos({
  onBack,
}: JustificantesMedicosProps) {
  const { language } = useLanguage();
  const es = language === "es";

  const [tipo, setTipo] =
    useState<TipoDocumento>("asistencia");

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
      id: "asistencia" as const,
      icon: CalendarDays,
      titulo: es
        ? "Constancia de asistencia"
        : "Attendance Certificate",
      descripcion: es
        ? "Acredita la asistencia del paciente al consultorio."
        : "Confirms the patient's attendance at the dental office.",
    },
    {
      id: "reposo" as const,
      icon: ClipboardCheck,
      titulo: es
        ? "Justificante de reposo"
        : "Rest Recommendation",
      descripcion: es
        ? "Documenta un periodo de reposo recomendado."
        : "Documents a recommended rest period.",
    },
    {
      id: "tratamiento" as const,
      icon: FileCheck2,
      titulo: es
        ? "Constancia de tratamiento"
        : "Treatment Certificate",
      descripcion: es
        ? "Confirma que el paciente recibió atención odontológica."
        : "Confirms that the patient received dental care.",
    },
  ];

  const tipoActivo = tipos.find(
    (item) => item.id === tipo,
  );

  const diasReposo = Number(formulario.diasReposo);

  const fechaFinReposo = useMemo(
    () =>
      sumarDias(
        formulario.fechaInicioReposo,
        diasReposo,
      ),
    [formulario.fechaInicioReposo, diasReposo],
  );

  const documentoValido =
    formulario.paciente.trim().length > 0 &&
    formulario.odontologo.trim().length > 0 &&
    formulario.clinica.trim().length > 0 &&
    formulario.fechaAtencion.length > 0 &&
    (tipo !== "reposo" ||
      (Number.isInteger(diasReposo) &&
        diasReposo >= 1 &&
        diasReposo <= 365 &&
        formulario.fechaInicioReposo.length > 0));

  const tituloDocumento = tipoActivo?.titulo ?? "";

  const contenidoDocumento = () => {
    const paciente = formulario.paciente.trim();

    if (tipo === "asistencia") {
      return es
        ? `Por medio de la presente se hace constar que ${paciente} acudió a consulta odontológica el día ${formatoFecha(formulario.fechaAtencion, es)}${formulario.horaEntrada ? `, con hora de ingreso a las ${formulario.horaEntrada}` : ""}${formulario.horaSalida ? ` y hora de salida a las ${formulario.horaSalida}` : ""}.\n\nSe extiende la presente constancia a solicitud de la persona interesada para los fines que estime convenientes.`
        : `This is to certify that ${paciente} attended a dental appointment on ${formatoFecha(formulario.fechaAtencion, es)}${formulario.horaEntrada ? `, arriving at ${formulario.horaEntrada}` : ""}${formulario.horaSalida ? ` and departing at ${formulario.horaSalida}` : ""}.\n\nThis certificate is issued at the patient's request for appropriate purposes.`;
    }

    if (tipo === "reposo") {
      return es
        ? `Por medio de la presente se hace constar que ${paciente} recibió atención odontológica el día ${formatoFecha(formulario.fechaAtencion, es)}.\n\nCon base en la valoración clínica realizada, se recomienda un periodo de reposo de ${diasReposo} ${diasReposo === 1 ? "día" : "días"}, comprendido del ${formatoFecha(formulario.fechaInicioReposo, es)} al ${formatoFecha(fechaFinReposo, es)}.\n\nEsta recomendación se emite bajo criterio del profesional tratante y no constituye por sí misma una incapacidad laboral oficial.`
        : `This is to certify that ${paciente} received dental care on ${formatoFecha(formulario.fechaAtencion, es)}.\n\nBased on the clinical evaluation, a rest period of ${diasReposo} ${diasReposo === 1 ? "day" : "days"} is recommended, from ${formatoFecha(formulario.fechaInicioReposo, es)} through ${formatoFecha(fechaFinReposo, es)}.\n\nThis recommendation is issued at the treating professional's discretion and does not, by itself, constitute an official work disability certificate.`;
    }

    return es
      ? `Por medio de la presente se hace constar que ${paciente} recibió atención odontológica el día ${formatoFecha(formulario.fechaAtencion, es)} en ${formulario.clinica.trim()}.\n\n${formulario.descripcion.trim() ? `Atención realizada: ${formulario.descripcion.trim()}.\n\n` : ""}Se expide la presente constancia a solicitud de la persona interesada.`
      : `This is to certify that ${paciente} received dental care on ${formatoFecha(formulario.fechaAtencion, es)} at ${formulario.clinica.trim()}.\n\n${formulario.descripcion.trim() ? `Care provided: ${formulario.descripcion.trim()}.\n\n` : ""}This certificate is issued at the patient's request.`;
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

    const contenido = escaparHtml(
      contenidoDocumento(),
    ).replace(/\n/g, "<br />");

    const observaciones = formulario.observaciones.trim();

    const html = `<!DOCTYPE html>
<html lang="${es ? "es" : "en"}">
<head>
  <meta charset="UTF-8" />
  <title>${escaparHtml(tituloDocumento)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #17364b;
      margin: 0;
      padding: 45px;
      font-size: 14px;
      line-height: 1.7;
    }
    .header {
      border-bottom: 3px solid #0b8f80;
      padding-bottom: 18px;
      margin-bottom: 38px;
    }
    .clinic {
      font-size: 23px;
      font-weight: 800;
      color: #102f4f;
    }
    .meta {
      font-size: 12px;
      color: #5c7582;
      margin-top: 5px;
    }
    h1 {
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 18px;
      margin: 35px 0;
    }
    .date {
      text-align: right;
      color: #5c7582;
      margin-bottom: 35px;
    }
    .body {
      min-height: 240px;
      text-align: justify;
    }
    .notes {
      margin-top: 28px;
      padding: 14px;
      background: #f3f8f7;
      border-left: 3px solid #0b8f80;
      white-space: pre-wrap;
    }
    .signature {
      margin: 95px auto 0;
      width: 290px;
      text-align: center;
      border-top: 1px solid #17364b;
      padding-top: 10px;
      line-height: 1.5;
    }
    .footer {
      margin-top: 60px;
      border-top: 1px solid #d9e7e8;
      padding-top: 15px;
      font-size: 11px;
      text-align: center;
      color: #68818a;
    }
    @media print {
      body { padding: 12mm; }
      @page { size: letter; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic">${escaparHtml(formulario.clinica)}</div>
    ${formulario.direccion ? `<div class="meta">${escaparHtml(formulario.direccion)}</div>` : ""}
    ${formulario.telefono ? `<div class="meta">${escaparHtml(formulario.telefono)}</div>` : ""}
  </div>

  <div class="date">${formatoFecha(formulario.fechaAtencion, es)}</div>

  <h1>${escaparHtml(tituloDocumento)}</h1>

  <div class="body">${contenido}</div>

  ${
    observaciones
      ? `<div class="notes"><strong>${es ? "Observaciones:" : "Notes:"}</strong><br />${escaparHtml(observaciones)}</div>`
      : ""
  }

  <div class="signature">
    <strong>${escaparHtml(formulario.odontologo)}</strong><br />
    ${formulario.cedula ? `${es ? "Cédula profesional" : "Professional license"}: ${escaparHtml(formulario.cedula)}<br />` : ""}
    ${es ? "Odontólogo tratante" : "Treating dentist"}
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
      placeholder?: string;
      required?: boolean;
      min?: string;
      max?: string;
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
        placeholder={opciones?.placeholder}
        required={opciones?.required}
        min={opciones?.min}
        max={opciones?.max}
        className="w-full min-w-0 rounded-[12px] border border-[#dce6e8] bg-white px-3.5 py-3 text-sm text-[#102f4f] outline-none transition placeholder:text-[#8299a2] focus:border-[#0b9a88] focus:ring-2 focus:ring-[#0b9a88]/15 dark:border-white/15 dark:bg-[#0a2130] dark:text-white"
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
                ? "Justificantes médicos"
                : "Medical Certificates"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
              {es
                ? "Genera constancias de atención odontológica y recomendaciones de reposo."
                : "Create dental attendance certificates and rest recommendations."}
            </p>
          </div>

          <span className="rounded-full border border-[#7de5d0]/30 bg-[#7de5d0]/10 px-3 py-1.5 text-xs font-semibold text-[#a6f4e4]">
            {es
              ? "Generador de documentos"
              : "Document generator"}
          </span>
        </div>
      </header>

      {/* TIPOS DE DOCUMENTO */}

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
            <FileText size={21} />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
              {es
                ? "Tipo de justificante"
                : "Certificate type"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Selecciona el documento que deseas preparar."
                : "Select the document you want to prepare."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
                ? "Datos del documento"
                : "Document details"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Completa la información que aparecerá en el justificante."
                : "Enter the information that will appear on the certificate."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* CONSULTORIO */}

          <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
            <h3 className="mb-4 text-sm font-bold text-[#123b50] dark:text-white">
              {es
                ? "Información del consultorio"
                : "Dental office information"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {campo(
                es ? "Nombre del consultorio" : "Dental office name",
                "clinica",
                { required: true },
              )}

              {campo(
                es ? "Teléfono" : "Phone number",
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
                : "Patient and dentist"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {campo(
                es ? "Nombre del paciente" : "Patient name",
                "paciente",
                { required: true },
              )}

              {campo(
                es ? "Odontólogo tratante" : "Treating dentist",
                "odontologo",
                { required: true },
              )}

              {campo(
                es
                  ? "Cédula profesional"
                  : "Professional license number",
                "cedula",
              )}

              {campo(
                es ? "Fecha de atención" : "Appointment date",
                "fechaAtencion",
                {
                  type: "date",
                  required: true,
                },
              )}
            </div>
          </div>

          {/* DATOS ESPECÍFICOS */}

          <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
            <h3 className="mb-4 text-sm font-bold text-[#123b50] dark:text-white">
              {es
                ? "Información específica"
                : "Specific information"}
            </h3>

            {tipo === "asistencia" && (
              <div className="grid gap-4 md:grid-cols-2">
                {campo(
                  es ? "Hora de entrada" : "Arrival time",
                  "horaEntrada",
                  { type: "time" },
                )}

                {campo(
                  es ? "Hora de salida" : "Departure time",
                  "horaSalida",
                  { type: "time" },
                )}
              </div>
            )}

            {tipo === "reposo" && (
              <div className="grid gap-4 md:grid-cols-2">
                {campo(
                  es
                    ? "Inicio del reposo"
                    : "Rest start date",
                  "fechaInicioReposo",
                  {
                    type: "date",
                    required: true,
                  },
                )}

                {campo(
                  es
                    ? "Días de reposo recomendados"
                    : "Recommended rest days",
                  "diasReposo",
                  {
                    type: "number",
                    min: "1",
                    max: "365",
                    required: true,
                  },
                )}

                <div className="md:col-span-2 rounded-[12px] border border-[#d1e9e3] bg-[#eef8f5] px-4 py-3 text-xs text-[#315b63] dark:border-[#75dbc8]/20 dark:bg-[#2a8479]/10 dark:text-slate-200">
                  {es
                    ? "Último día de reposo:"
                    : "Last day of rest:"}{" "}
                  <strong>
                    {formatoFecha(fechaFinReposo, es)}
                  </strong>
                </div>
              </div>
            )}

            {tipo === "tratamiento" && (
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
                  {es
                    ? "Descripción de la atención (opcional)"
                    : "Description of care (optional)"}
                </span>

                <textarea
                  rows={3}
                  value={formulario.descripcion}
                  onChange={(event) =>
                    actualizar(
                      "descripcion",
                      event.target.value,
                    )
                  }
                  placeholder={
                    es
                      ? "Describe brevemente la atención realizada..."
                      : "Briefly describe the care provided..."
                  }
                  className="w-full resize-y rounded-[12px] border border-[#dce6e8] bg-white px-3.5 py-3 text-sm text-[#102f4f] outline-none focus:border-[#0b9a88] focus:ring-2 focus:ring-[#0b9a88]/15 dark:border-white/15 dark:bg-[#0a2130] dark:text-white"
                />
              </label>
            )}

            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
                {es
                  ? "Observaciones adicionales (opcional)"
                  : "Additional notes (optional)"}
              </span>

              <textarea
                rows={3}
                value={formulario.observaciones}
                onChange={(event) =>
                  actualizar(
                    "observaciones",
                    event.target.value,
                  )
                }
                placeholder={
                  es
                    ? "Información adicional que deba incluirse..."
                    : "Additional information to include..."
                }
                className="w-full resize-y rounded-[12px] border border-[#dce6e8] bg-white px-3.5 py-3 text-sm text-[#102f4f] outline-none focus:border-[#0b9a88] focus:ring-2 focus:ring-[#0b9a88]/15 dark:border-white/15 dark:bg-[#0a2130] dark:text-white"
              />
            </label>
          </div>
        </div>

        {/* ACCIONES */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setFormulario(formularioInicial());
              setMostrarVistaPrevia(false);
            }}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#dce6e8] bg-white px-4 py-3 text-xs font-bold text-[#456773] transition hover:bg-[#eef8f5] dark:border-white/15 dark:bg-[#142f40] dark:text-slate-200"
          >
            <RotateCcw size={16} />

            {es ? "Limpiar formulario" : "Clear form"}
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
                : "Document preview"}
            </h2>

            <button
              type="button"
              onClick={() =>
                setMostrarVistaPrevia(false)
              }
              className="rounded-lg border border-[#dce6e8] px-3 py-2 text-xs font-semibold text-[#456773] dark:border-white/15 dark:text-slate-200"
            >
              {es ? "Cerrar vista previa" : "Close preview"}
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

            <p className="mt-8 text-right text-xs text-[#607987]">
              {formatoFecha(
                formulario.fechaAtencion,
                es,
              )}
            </p>

            <h3 className="my-9 text-center text-lg font-extrabold uppercase tracking-wide text-[#102f4f]">
              {tituloDocumento}
            </h3>

            <p className="min-h-48 whitespace-pre-line text-sm leading-8 text-[#315b63]">
              {contenidoDocumento()}
            </p>

            {formulario.observaciones.trim() && (
              <div className="mt-8 rounded-xl border-l-[3px] border-[#0b8f80] bg-[#f3f8f7] p-4">
                <p className="text-xs font-bold">
                  {es ? "Observaciones" : "Notes"}
                </p>

                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed">
                  {formulario.observaciones}
                </p>
              </div>
            )}

            <div className="mx-auto mt-24 max-w-72 border-t border-[#17364b] pt-3 text-center">
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
          </div>
        </section>
      )}
    </div>
  );
}