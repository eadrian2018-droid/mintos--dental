import { useMemo, useState } from "react";

import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";

type Categoria =
  | "general"
  | "endodoncia"
  | "cirugia"
  | "implantes"
  | "rehabilitacion"
  | "estetica";

type Plantilla = {
  id: string;
  categoria: Categoria;
  nombreEs: string;
  nombreEn: string;
  descripcionEs: string;
  descripcionEn: string;
};

const PLANTILLAS: Plantilla[] = [
  {
    id: "consentimiento-general",
    categoria: "general",
    nombreEs: "Consentimiento general odontológico",
    nombreEn: "General Dental Consent",
    descripcionEs:
      "Consentimiento para la atención odontológica habitual, incluyendo procedimientos preventivos y restaurativos sencillos.",
    descripcionEn:
      "Consent for routine dental care, including preventive procedures and simple restorative treatments.",
  },
  {
    id: "endodoncia",
    categoria: "endodoncia",
    nombreEs: "Endodoncia",
    nombreEn: "Endodontic Treatment",
    descripcionEs:
      "Consentimiento específico para tratamientos de conductos y retratamientos endodónticos.",
    descripcionEn:
      "Specific consent for root canal treatments and endodontic retreatments.",
  },
  {
    id: "extracciones-cirugia",
    categoria: "cirugia",
    nombreEs: "Extracciones y cirugía oral",
    nombreEn: "Extractions and Oral Surgery",
    descripcionEs:
      "Consentimiento para extracciones simples, quirúrgicas y procedimientos de cirugía oral.",
    descripcionEn:
      "Consent for simple and surgical extractions and oral surgery procedures.",
  },
  {
    id: "implantes-dentales",
    categoria: "implantes",
    nombreEs: "Implantes dentales",
    nombreEn: "Dental Implants",
    descripcionEs:
      "Consentimiento para la colocación de implantes dentales y procedimientos asociados, según corresponda.",
    descripcionEn:
      "Consent for dental implant placement and associated procedures, as applicable.",
  },
  {
    id: "protesis-rehabilitacion",
    categoria: "rehabilitacion",
    nombreEs: "Prótesis y rehabilitación dental",
    nombreEn: "Prosthetics and Dental Rehabilitation",
    descripcionEs:
      "Consentimiento para coronas, puentes, prótesis y tratamientos de rehabilitación dental.",
    descripcionEn:
      "Consent for crowns, bridges, prostheses, and dental rehabilitation treatments.",
  },
  {
    id: "tratamientos-esteticos",
    categoria: "estetica",
    nombreEs: "Tratamientos estéticos",
    nombreEn: "Cosmetic Dental Treatments",
    descripcionEs:
      "Consentimiento para tratamientos estéticos como carillas y blanqueamiento dental.",
    descripcionEn:
      "Consent for cosmetic procedures such as veneers and teeth whitening.",
  },
];

const CATEGORIAS: {
  id: Categoria | "todas";
  es: string;
  en: string;
}[] = [
  {
    id: "todas",
    es: "Todas",
    en: "All",
  },
  {
    id: "general",
    es: "General",
    en: "General",
  },
  {
    id: "endodoncia",
    es: "Endodoncia",
    en: "Endodontics",
  },
  {
    id: "cirugia",
    es: "Cirugía oral",
    en: "Oral Surgery",
  },
  {
    id: "implantes",
    es: "Implantes",
    en: "Implants",
  },
  {
    id: "rehabilitacion",
    es: "Rehabilitación",
    en: "Rehabilitation",
  },
  {
    id: "estetica",
    es: "Estética",
    en: "Cosmetic",
  },
];

const SECCIONES_DOCUMENTO = [
  {
    es: "Diagnóstico y condición clínica",
    en: "Diagnosis and clinical condition",
  },
  {
    es: "Descripción del procedimiento",
    en: "Procedure description",
  },
  {
    es: "Beneficios esperados",
    en: "Expected benefits",
  },
  {
    es: "Riesgos y posibles complicaciones",
    en: "Risks and potential complications",
  },
  {
    es: "Alternativas de tratamiento",
    en: "Treatment alternatives",
  },
  {
    es: "Consecuencias de no realizar el tratamiento",
    en: "Consequences of declining treatment",
  },
  {
    es: "Preguntas y aclaraciones del paciente",
    en: "Patient questions and clarifications",
  },
  {
    es: "Declaración de consentimiento y firmas",
    en: "Consent declaration and signatures",
  },
];

export default function BibliotecaConsentimientos() {
  const { language } = useLanguage();
  const es = language === "es";

  const [busqueda, setBusqueda] = useState("");

  const [categoria, setCategoria] =
    useState<Categoria | "todas">("todas");

  const [plantillaSeleccionada, setPlantillaSeleccionada] =
    useState<Plantilla | null>(null);

  const plantillasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase();

    return PLANTILLAS.filter((plantilla) => {
      const coincideCategoria =
        categoria === "todas" ||
        plantilla.categoria === categoria;

      const coincideBusqueda =
        !texto ||
        [
          plantilla.nombreEs,
          plantilla.nombreEn,
          plantilla.descripcionEs,
          plantilla.descripcionEn,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(texto);

      return coincideCategoria && coincideBusqueda;
    });
  }, [busqueda, categoria]);

  const nombreCategoria = (id: Categoria) => {
    const encontrada = CATEGORIAS.find(
      (item) => item.id === id,
    );

    return es ? encontrada?.es : encontrada?.en;
  };

  return (
    <div className="space-y-5">
      {/* ENCABEZADO */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
            <BookOpen size={21} />
          </div>

          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[#102f4f] dark:text-white">
              {es
                ? "Biblioteca de consentimientos"
                : "Consent Template Library"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Explora las plantillas disponibles por procedimiento."
                : "Browse available templates by procedure."}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[#d1e9e3] bg-[#eef8f5] px-3 py-1.5 text-xs font-semibold text-[#087e73] dark:border-[#75dbc8]/20 dark:bg-[#2a8479]/20 dark:text-[#a5eddf]">
          <FileText size={14} />

          {PLANTILLAS.length}{" "}
          {es ? "plantillas" : "templates"}
        </span>
      </div>

      {/* FILTROS */}

      <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-4 dark:border-white/10 dark:bg-[#142f40]">
        <label className="relative block">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77929d]"
          />

          <input
            type="search"
            value={busqueda}
            onChange={(event) =>
              setBusqueda(event.target.value)
            }
            placeholder={
              es
                ? "Buscar consentimiento..."
                : "Search consent templates..."
            }
            aria-label={
              es
                ? "Buscar consentimiento"
                : "Search consent templates"
            }
            className="w-full rounded-[13px] border border-[#dce6e8] bg-white py-3 pl-11 pr-4 text-sm text-[#102f4f] outline-none transition placeholder:text-[#8299a2] focus:border-[#0b9a88] focus:ring-2 focus:ring-[#0b9a88]/15 dark:border-white/15 dark:bg-[#0a2130] dark:text-white"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIAS.map((item) => {
            const activa = categoria === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategoria(item.id)}
                aria-pressed={activa}
                className={`rounded-[11px] border px-3.5 py-2 text-xs font-semibold transition ${
                  activa
                    ? "border-[#0b8f80] bg-[#0b8f80] text-white"
                    : "border-[#dce6e8] bg-[#f5f9f8] text-[#456773] hover:border-[#9ccfc5] dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"
                }`}
              >
                {es ? item.es : item.en}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTADOS */}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[#607987] dark:text-slate-400">
          {plantillasFiltradas.length}{" "}
          {es
            ? "resultados encontrados"
            : "results found"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plantillasFiltradas.map((plantilla) => (
          <article
            key={plantilla.id}
            className="relative flex min-h-56 flex-col overflow-hidden rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-5 shadow-[0_4px_12px_rgba(16,47,79,0.035)] transition hover:border-[#9ccfc5] hover:shadow-[0_10px_22px_rgba(16,47,79,0.075)] dark:border-white/10 dark:bg-[#142f40]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] bg-[#0b9a88]"
            />

            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[15px] border border-[#d2e9e4] bg-[#eaf6f2] text-[#087e73] dark:border-[#62dfc8]/15 dark:bg-[#0b8f80]/20 dark:text-[#8be9d7]">
                <ClipboardList size={22} />
              </div>

              <span className="rounded-full border border-[#d1e9e3] bg-[#eef8f5] px-2.5 py-1 text-[10px] font-semibold text-[#087e73] dark:border-[#75dbc8]/20 dark:bg-[#2a8479]/20 dark:text-[#a5eddf]">
                {nombreCategoria(plantilla.categoria)}
              </span>
            </div>

            <h3 className="text-sm font-bold leading-snug text-[#123b50] dark:text-white">
              {es
                ? plantilla.nombreEs
                : plantilla.nombreEn}
            </h3>

            <p className="mt-2 flex-1 text-xs leading-relaxed text-[#607987] dark:text-slate-400">
              {es
                ? plantilla.descripcionEs
                : plantilla.descripcionEn}
            </p>

            <div className="mt-5 border-t border-[#e4ebee] pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={() =>
                  setPlantillaSeleccionada(plantilla)
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#0b8f80] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#08796e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b9a88]"
              >
                <Eye size={15} />

                {es
                  ? "Vista previa"
                  : "Preview"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {plantillasFiltradas.length === 0 && (
        <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-10 text-center dark:border-white/10 dark:bg-[#142f40]">
          <Search
            size={26}
            className="mx-auto mb-3 text-[#77929d]"
          />

          <p className="text-sm font-semibold text-[#123b50] dark:text-white">
            {es
              ? "No se encontraron consentimientos."
              : "No consent templates found."}
          </p>
        </div>
      )}

      {/* NOTA DE VALIDACIÓN */}

      <div className="flex items-start gap-3 rounded-[15px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-500/10">
        <ShieldAlert
          size={19}
          className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300"
        />

        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          {es
            ? "Catálogo preliminar. Los documentos clínicos deben ser revisados y aprobados antes de utilizarse con pacientes."
            : "Preliminary catalog. Clinical documents must be reviewed and approved before use with patients."}
        </p>
      </div>

      {/* VISTA PREVIA */}

      {plantillaSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b2b]/70 p-3 backdrop-blur-[3px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPlantillaSeleccionada(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consentimiento-preview-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-[#dce6e8] bg-[#f5f9f8] shadow-2xl dark:border-white/10 dark:bg-[#102635]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#e0e8ed] bg-white p-5 dark:border-white/10 dark:bg-[#142f40] sm:p-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b8f80]">
                  {es
                    ? "Vista previa de estructura"
                    : "Structure preview"}
                </span>

                <h2
                  id="consentimiento-preview-title"
                  className="mt-2 text-lg font-extrabold text-[#102f4f] dark:text-white"
                >
                  {es
                    ? plantillaSeleccionada.nombreEs
                    : plantillaSeleccionada.nombreEn}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPlantillaSeleccionada(null)
                }
                aria-label={es ? "Cerrar" : "Close"}
                className="rounded-xl border border-[#dce6e8] p-2 text-[#456773] transition hover:bg-[#eef8f5] dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <X size={19} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="rounded-[15px] border border-[#d1e9e3] bg-[#eef8f5] p-4 dark:border-[#75dbc8]/20 dark:bg-[#2a8479]/10">
                <p className="text-xs leading-relaxed text-[#315b63] dark:text-slate-200">
                  {es
                    ? "Esta vista muestra la estructura prevista del consentimiento. Todavía no contiene el texto clínico definitivo ni constituye un documento listo para firmar."
                    : "This preview shows the planned consent structure. It does not yet contain final clinical wording and is not ready for signing."}
                </p>
              </div>

              <div className="rounded-[19px] border border-[#e0e8ed] bg-white p-5 dark:border-white/10 dark:bg-[#142f40]">
                <div className="mb-5 flex items-center gap-2">
                  <BookOpen
                    size={18}
                    className="text-[#0b8f80]"
                  />

                  <h3 className="text-sm font-bold text-[#123b50] dark:text-white">
                    {es
                      ? "Secciones del documento"
                      : "Document sections"}
                  </h3>
                </div>

                <div className="space-y-3">
                  {SECCIONES_DOCUMENTO.map(
                    (seccion, index) => (
                      <div
                        key={seccion.en}
                        className="flex items-center gap-3 rounded-[12px] border border-[#e4ebee] bg-[#f9fbfb] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eaf6f2] text-xs font-bold text-[#087e73] dark:bg-[#0b8f80]/20 dark:text-[#8be9d7]">
                          {index + 1}
                        </span>

                        <span className="flex-1 text-xs font-medium text-[#315b63] dark:text-slate-200">
                          {es ? seccion.es : seccion.en}
                        </span>

                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-[#0b8f80]"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e0e8ed] bg-white p-4 dark:border-white/10 dark:bg-[#142f40] sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setPlantillaSeleccionada(null)
                }
                className="rounded-[12px] bg-[#123b50] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0c2d3e]"
              >
                {es ? "Cerrar vista previa" : "Close preview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}