import { useMemo, useState } from "react";

import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Plus,
  Printer,
  RotateCcw,
  Stethoscope,
  Trash2,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";

type RecetasMedicasProps = {
  onBack: () => void;
};

type Medicamento = {
  id: string;
  nombre: string;
  presentacion: string;
  dosis: string;
  via: string;
  frecuencia: string;
  duracion: string;
  cantidad: string;
};

type Formulario = {
  clinica: string;
  direccion: string;
  telefono: string;
  paciente: string;
  edad: string;
  odontologo: string;
  cedula: string;
  fecha: string;
  diagnostico: string;
  indicaciones: string;
};

const MAX_MEDICAMENTOS = 10;

const fechaLocal = () => {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const crearMedicamento = (): Medicamento => ({
  id: crypto.randomUUID(),
  nombre: "",
  presentacion: "",
  dosis: "",
  via: "",
  frecuencia: "",
  duracion: "",
  cantidad: "",
});

const formularioInicial = (): Formulario => ({
  clinica: "",
  direccion: "",
  telefono: "",
  paciente: "",
  edad: "",
  odontologo: "",
  cedula: "",
  fecha: fechaLocal(),
  diagnostico: "",
  indicaciones: "",
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

const escaparHtml = (valor: string) =>
  valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function RecetasMedicas({
  onBack,
}: RecetasMedicasProps) {
  const { language } = useLanguage();
  const es = language === "es";

  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(
    () => [crearMedicamento()],
  );

  const [mostrarVistaPrevia, setMostrarVistaPrevia] =
    useState(false);

  const actualizarFormulario = (
    campo: keyof Formulario,
    valor: string,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const actualizarMedicamento = (
    id: string,
    campo: keyof Omit<Medicamento, "id">,
    valor: string,
  ) => {
    setMedicamentos((actuales) =>
      actuales.map((medicamento) =>
        medicamento.id === id
          ? {
              ...medicamento,
              [campo]: valor,
            }
          : medicamento,
      ),
    );
  };

  const agregarMedicamento = () => {
    setMedicamentos((actuales) => {
      if (actuales.length >= MAX_MEDICAMENTOS) {
        return actuales;
      }

      return [...actuales, crearMedicamento()];
    });
  };

  const eliminarMedicamento = (id: string) => {
    setMedicamentos((actuales) => {
      if (actuales.length === 1) {
        return [crearMedicamento()];
      }

      return actuales.filter(
        (medicamento) => medicamento.id !== id,
      );
    });
  };

  const medicamentosValidos = useMemo(
    () =>
      medicamentos.every(
        (medicamento) =>
          medicamento.nombre.trim() &&
          medicamento.dosis.trim() &&
          medicamento.via.trim() &&
          medicamento.frecuencia.trim() &&
          medicamento.duracion.trim() &&
          medicamento.cantidad.trim(),
      ),
    [medicamentos],
  );

  const recetaValida =
    formulario.clinica.trim().length > 0 &&
    formulario.paciente.trim().length > 0 &&
    formulario.odontologo.trim().length > 0 &&
    formulario.cedula.trim().length > 0 &&
    formulario.fecha.length > 0 &&
    medicamentosValidos;

  const limpiarFormulario = () => {
    setFormulario(formularioInicial());
    setMedicamentos([crearMedicamento()]);
    setMostrarVistaPrevia(false);
  };

  const imprimirReceta = () => {
    if (!recetaValida) return;

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

    const filasMedicamentos = medicamentos
      .map(
        (medicamento, index) => `
          <div class="medication">
            <div class="medication-title">
              ${index + 1}. ${escaparHtml(medicamento.nombre)}
            </div>

            ${
              medicamento.presentacion.trim()
                ? `<div><strong>${es ? "Presentación" : "Form"}:</strong> ${escaparHtml(medicamento.presentacion)}</div>`
                : ""
            }

            <div><strong>${es ? "Dosis" : "Dose"}:</strong> ${escaparHtml(medicamento.dosis)}</div>
            <div><strong>${es ? "Vía" : "Route"}:</strong> ${escaparHtml(medicamento.via)}</div>
            <div><strong>${es ? "Frecuencia" : "Frequency"}:</strong> ${escaparHtml(medicamento.frecuencia)}</div>
            <div><strong>${es ? "Duración" : "Duration"}:</strong> ${escaparHtml(medicamento.duracion)}</div>
            <div><strong>${es ? "Cantidad" : "Quantity"}:</strong> ${escaparHtml(medicamento.cantidad)}</div>
          </div>
        `,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="${es ? "es" : "en"}">
<head>
  <meta charset="UTF-8" />

  <title>${es ? "Receta médica" : "Medical Prescription"}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 42px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #17364b;
    }

    .header {
      padding-bottom: 20px;
      border-bottom: 3px solid #0b8f80;
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

    .document-title {
      margin: 28px 0;
      text-align: center;
      font-size: 19px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .patient {
      padding: 16px;
      border: 1px solid #dce6e8;
      border-radius: 10px;
      background: #f7faf9;
    }

    .section-title {
      margin: 28px 0 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid #dce6e8;
      font-size: 14px;
      font-weight: 800;
      color: #102f4f;
    }

    .medication {
      margin-bottom: 14px;
      padding: 14px;
      border: 1px solid #e0e8ed;
      border-radius: 10px;
      break-inside: avoid;
    }

    .medication-title {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 800;
      color: #087e73;
    }

    .notes {
      margin-top: 20px;
      padding: 14px;
      border-left: 3px solid #0b8f80;
      background: #f3f8f7;
      white-space: pre-wrap;
    }

    .signature {
      width: 290px;
      margin: 80px auto 0;
      padding-top: 10px;
      border-top: 1px solid #17364b;
      text-align: center;
      line-height: 1.5;
      break-inside: avoid;
    }

    .footer {
      margin-top: 50px;
      padding-top: 12px;
      border-top: 1px solid #dce6e8;
      text-align: center;
      font-size: 11px;
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
    <div class="clinic">
      ${escaparHtml(formulario.clinica)}
    </div>

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

  <div class="document-title">
    ${es ? "Receta médica odontológica" : "Dental Prescription"}
  </div>

  <div class="patient">
    <div>
      <strong>${es ? "Paciente" : "Patient"}:</strong>
      ${escaparHtml(formulario.paciente)}
    </div>

    ${
      formulario.edad.trim()
        ? `<div><strong>${es ? "Edad" : "Age"}:</strong> ${escaparHtml(formulario.edad)}</div>`
        : ""
    }

    <div>
      <strong>${es ? "Fecha" : "Date"}:</strong>
      ${formatoFecha(formulario.fecha, es)}
    </div>

    ${
      formulario.diagnostico.trim()
        ? `<div><strong>${es ? "Diagnóstico" : "Diagnosis"}:</strong> ${escaparHtml(formulario.diagnostico)}</div>`
        : ""
    }
  </div>

  <div class="section-title">
    ${es ? "Prescripción" : "Prescription"}
  </div>

  ${filasMedicamentos}

  ${
    formulario.indicaciones.trim()
      ? `
        <div class="notes">
          <strong>${es ? "Indicaciones generales" : "General instructions"}:</strong>
          <br />
          ${escaparHtml(formulario.indicaciones)}
        </div>
      `
      : ""
  }

  <div class="signature">
    <strong>${escaparHtml(formulario.odontologo)}</strong>
    <br />
    ${es ? "Cédula profesional" : "Professional license"}:
    ${escaparHtml(formulario.cedula)}
    <br />
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
          actualizarFormulario(nombre, event.target.value)
        }
        required={opciones?.required}
        placeholder={opciones?.placeholder}
        className="w-full min-w-0 rounded-[12px] border border-[#dce6e8] bg-white px-3.5 py-3 text-sm text-[#102f4f] outline-none transition placeholder:text-[#8299a2] focus:border-[#0b9a88] focus:ring-2 focus:ring-[#0b9a88]/15 dark:border-white/15 dark:bg-[#0a2130] dark:text-white"
      />
    </label>
  );

  const campoMedicamento = (
    medicamento: Medicamento,
    etiqueta: string,
    nombre: keyof Omit<Medicamento, "id">,
    requerido = false,
  ) => (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
        {etiqueta}

        {requerido && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      <input
        type="text"
        value={medicamento[nombre]}
        onChange={(event) =>
          actualizarMedicamento(
            medicamento.id,
            nombre,
            event.target.value,
          )
        }
        required={requerido}
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
              {es ? "Recetas médicas" : "Medical Prescriptions"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
              {es
                ? "Prepara recetas odontológicas con medicamentos e indicaciones personalizadas."
                : "Prepare dental prescriptions with medications and personalized instructions."}
            </p>
          </div>

          <span className="rounded-full border border-[#7de5d0]/30 bg-[#7de5d0]/10 px-3 py-1.5 text-xs font-semibold text-[#a6f4e4]">
            {es ? "Generador de recetas" : "Prescription generator"}
          </span>
        </div>
      </header>

      {/* DATOS GENERALES */}

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
            <ClipboardList size={21} />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
              {es ? "Datos de la receta" : "Prescription details"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Completa la información del paciente y del profesional tratante."
                : "Enter the patient and treating professional information."}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
            <h3 className="mb-4 text-sm font-bold text-[#123b50] dark:text-white">
              {es ? "Consultorio" : "Dental office"}
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

          <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]">
            <h3 className="mb-4 text-sm font-bold text-[#123b50] dark:text-white">
              {es ? "Paciente y odontólogo" : "Patient and dentist"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {campo(
                es ? "Nombre del paciente" : "Patient name",
                "paciente",
                { required: true },
              )}

              {campo(
                es ? "Edad" : "Age",
                "edad",
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
                { required: true },
              )}

              {campo(
                es ? "Fecha" : "Date",
                "fecha",
                {
                  type: "date",
                  required: true,
                },
              )}

              {campo(
                es ? "Diagnóstico (opcional)" : "Diagnosis (optional)",
                "diagnostico",
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MEDICAMENTOS */}

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
              <Stethoscope size={21} />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
                {es ? "Medicamentos" : "Medications"}
              </h2>

              <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
                {es
                  ? "Registra únicamente medicamentos indicados por el profesional."
                  : "Enter only medications prescribed by the professional."}
              </p>
            </div>
          </div>

          <span className="rounded-full border border-[#d1e9e3] bg-[#eef8f5] px-3 py-1.5 text-xs font-bold text-[#087e73] dark:border-[#75dbc8]/20 dark:bg-[#2a8479]/20 dark:text-[#a5eddf]">
            {medicamentos.length} / {MAX_MEDICAMENTOS}
          </span>
        </div>

        <div className="space-y-4">
          {medicamentos.map((medicamento, index) => (
            <div
              key={medicamento.id}
              className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 dark:border-white/10 dark:bg-[#142f40]"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#123b50] dark:text-white">
                  {es ? "Medicamento" : "Medication"} {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    eliminarMedicamento(medicamento.id)
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300"
                >
                  <Trash2 size={14} />

                  {es ? "Eliminar" : "Remove"}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {campoMedicamento(
                  medicamento,
                  es ? "Nombre del medicamento" : "Medication name",
                  "nombre",
                  true,
                )}

                {campoMedicamento(
                  medicamento,
                  es ? "Presentación" : "Form / strength",
                  "presentacion",
                )}

                {campoMedicamento(
                  medicamento,
                  es ? "Dosis" : "Dose",
                  "dosis",
                  true,
                )}

                {campoMedicamento(
                  medicamento,
                  es ? "Vía de administración" : "Route",
                  "via",
                  true,
                )}

                {campoMedicamento(
                  medicamento,
                  es ? "Frecuencia" : "Frequency",
                  "frecuencia",
                  true,
                )}

                {campoMedicamento(
                  medicamento,
                  es ? "Duración" : "Duration",
                  "duracion",
                  true,
                )}

                {campoMedicamento(
                  medicamento,
                  es ? "Cantidad a dispensar" : "Quantity to dispense",
                  "cantidad",
                  true,
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={medicamentos.length >= MAX_MEDICAMENTOS}
          onClick={agregarMedicamento}
          className="mt-5 inline-flex items-center gap-2 rounded-[12px] border border-[#0b8f80] bg-[#eef8f5] px-4 py-3 text-xs font-bold text-[#087e73] transition hover:bg-[#d9f1e9] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0b8f80]/15 dark:text-[#a5eddf]"
        >
          <Plus size={16} />

          {es ? "Agregar medicamento" : "Add medication"}
        </button>
      </section>

      {/* INDICACIONES */}

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <h2 className="mb-4 text-base font-extrabold text-[#102f4f] dark:text-white">
          {es ? "Indicaciones generales" : "General instructions"}
        </h2>

        <textarea
          rows={4}
          value={formulario.indicaciones}
          onChange={(event) =>
            actualizarFormulario(
              "indicaciones",
              event.target.value,
            )
          }
          placeholder={
            es
              ? "Indicaciones adicionales para el paciente..."
              : "Additional instructions for the patient..."
          }
          className="w-full resize-y rounded-[12px] border border-[#dce6e8] bg-white px-4 py-3 text-sm text-[#102f4f] outline-none focus:border-[#0b9a88] focus:ring-2 focus:ring-[#0b9a88]/15 dark:border-white/15 dark:bg-[#0a2130] dark:text-white"
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={limpiarFormulario}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#dce6e8] bg-white px-4 py-3 text-xs font-bold text-[#456773] transition hover:bg-[#eef8f5] dark:border-white/15 dark:bg-[#142f40] dark:text-slate-200"
          >
            <RotateCcw size={16} />

            {es ? "Limpiar formulario" : "Clear form"}
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!recetaValida}
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
              disabled={!recetaValida}
              onClick={imprimirReceta}
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
              {es ? "Vista previa de receta" : "Prescription preview"}
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

            <h3 className="my-8 text-center text-lg font-extrabold uppercase tracking-wide text-[#102f4f]">
              {es
                ? "Receta médica odontológica"
                : "Dental Prescription"}
            </h3>

            <div className="rounded-xl border border-[#dce6e8] bg-[#f7faf9] p-4 text-xs leading-7">
              <p>
                <strong>{es ? "Paciente" : "Patient"}:</strong>{" "}
                {formulario.paciente}
              </p>

              {formulario.edad && (
                <p>
                  <strong>{es ? "Edad" : "Age"}:</strong>{" "}
                  {formulario.edad}
                </p>
              )}

              <p>
                <strong>{es ? "Fecha" : "Date"}:</strong>{" "}
                {formatoFecha(formulario.fecha, es)}
              </p>

              {formulario.diagnostico && (
                <p>
                  <strong>
                    {es ? "Diagnóstico" : "Diagnosis"}:
                  </strong>{" "}
                  {formulario.diagnostico}
                </p>
              )}
            </div>

            <h4 className="mb-4 mt-7 border-b border-[#dce6e8] pb-2 text-sm font-extrabold">
              {es ? "Prescripción" : "Prescription"}
            </h4>

            <div className="space-y-4">
              {medicamentos.map((medicamento, index) => (
                <div
                  key={medicamento.id}
                  className="rounded-xl border border-[#e0e8ed] p-4 text-xs leading-6"
                >
                  <h5 className="mb-2 text-sm font-extrabold text-[#087e73]">
                    {index + 1}. {medicamento.nombre}
                  </h5>

                  {medicamento.presentacion && (
                    <p>
                      <strong>
                        {es ? "Presentación" : "Form"}:
                      </strong>{" "}
                      {medicamento.presentacion}
                    </p>
                  )}

                  <p>
                    <strong>{es ? "Dosis" : "Dose"}:</strong>{" "}
                    {medicamento.dosis}
                  </p>

                  <p>
                    <strong>{es ? "Vía" : "Route"}:</strong>{" "}
                    {medicamento.via}
                  </p>

                  <p>
                    <strong>
                      {es ? "Frecuencia" : "Frequency"}:
                    </strong>{" "}
                    {medicamento.frecuencia}
                  </p>

                  <p>
                    <strong>
                      {es ? "Duración" : "Duration"}:
                    </strong>{" "}
                    {medicamento.duracion}
                  </p>

                  <p>
                    <strong>
                      {es ? "Cantidad" : "Quantity"}:
                    </strong>{" "}
                    {medicamento.cantidad}
                  </p>
                </div>
              ))}
            </div>

            {formulario.indicaciones.trim() && (
              <div className="mt-7 rounded-xl border-l-[3px] border-[#0b8f80] bg-[#f3f8f7] p-4">
                <p className="text-xs font-bold">
                  {es
                    ? "Indicaciones generales"
                    : "General instructions"}
                </p>

                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed">
                  {formulario.indicaciones}
                </p>
              </div>
            )}

            <div className="mx-auto mt-24 max-w-72 border-t border-[#17364b] pt-3 text-center">
              <p className="text-sm font-bold">
                {formulario.odontologo}
              </p>

              <p className="mt-1 text-xs">
                {es
                  ? "Cédula profesional"
                  : "Professional license"}
                : {formulario.cedula}
              </p>

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