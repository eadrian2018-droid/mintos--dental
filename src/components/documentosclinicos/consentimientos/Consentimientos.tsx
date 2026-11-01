import { useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  FilePlus2,
  History,
  Stethoscope,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";

import BibliotecaConsentimientos from "./BibliotecaConsentimientos";

type ConsentimientosProps = {
  onBack: () => void;
};

type Seccion = "biblioteca" | "generar" | "historial";

export default function Consentimientos({
  onBack,
}: ConsentimientosProps) {
  const { language } = useLanguage();
  const es = language === "es";

  const [seccion, setSeccion] = useState<Seccion>("biblioteca");

  const apartados = [
    {
      id: "biblioteca" as const,
      icon: BookOpen,
      titulo: es ? "Biblioteca de plantillas" : "Template library",
      descripcion: es
        ? "Consulta los consentimientos disponibles para cada procedimiento."
        : "Browse available consent forms for each procedure.",
    },
    {
      id: "generar" as const,
      icon: FilePlus2,
      titulo: es ? "Generar consentimiento" : "Generate consent",
      descripcion: es
        ? "Prepara un consentimiento para un paciente."
        : "Prepare a consent form for a patient.",
    },
    {
      id: "historial" as const,
      icon: History,
      titulo: es ? "Historial de documentos" : "Document history",
      descripcion: es
        ? "Consulta los consentimientos emitidos."
        : "Review previously issued consent forms.",
    },
  ];

  const apartadoActivo = apartados.find(
    (apartado) => apartado.id === seccion,
  );

  return (
    <div className="w-full min-w-0 space-y-6 text-[#102f4f] dark:text-slate-100">
      <header className="rounded-[24px] border border-[#d7e9e5] bg-gradient-to-br from-[#102f4f] via-[#123e55] to-[#0a716b] p-6 text-white shadow-[0_18px_40px_rgba(16,47,79,0.13)] dark:border-white/10 sm:p-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          <ArrowLeft size={15} />
          {es ? "Volver a Documentos Clínicos" : "Back to Clinical Documents"}
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#9af2df]">
              <Stethoscope size={14} />
              MintOS Dental System
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {es ? "Consentimientos informados" : "Informed Consents"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
              {es
                ? "Administra plantillas y prepara consentimientos para tus pacientes."
                : "Manage templates and prepare consent forms for your patients."}
            </p>
          </div>

          <span className="rounded-full border border-[#7de5d0]/30 bg-[#7de5d0]/10 px-3 py-1.5 text-xs font-semibold text-[#a6f4e4]">
            {es ? "Módulo en preparación" : "Module in preparation"}
          </span>
        </div>
      </header>

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 shadow-[0_8px_24px_rgba(16,47,79,0.035)] dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
            <ClipboardCheck size={21} />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
              {es ? "Gestión de consentimientos" : "Consent management"}
            </h2>
            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Selecciona el apartado que deseas consultar."
                : "Select the section you want to view."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {apartados.map((apartado) => {
            const Icon = apartado.icon;
            const activo = seccion === apartado.id;

            return (
              <button
                key={apartado.id}
                type="button"
                onClick={() => setSeccion(apartado.id)}
                aria-pressed={activo}
                className={`relative flex min-h-44 flex-col items-start overflow-hidden rounded-[19px] border p-5 text-left shadow-[0_4px_12px_rgba(16,47,79,0.035)] transition hover:-translate-y-0.5 ${
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
                  {apartado.titulo}
                </span>

                <span className="mt-2 text-xs leading-relaxed text-[#607987] dark:text-slate-400">
                  {apartado.descripcion}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        {seccion === "biblioteca" ? (
          <BibliotecaConsentimientos />
        ) : (
          <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-6 dark:border-white/10 dark:bg-[#142f40]">
            <h2 className="text-base font-bold text-[#123b50] dark:text-white">
              {apartadoActivo?.titulo}
            </h2>

            <p className="mt-2 text-sm text-[#607987] dark:text-slate-400">
              {es
                ? "Este apartado se habilitará conforme integremos las plantillas, los datos de pacientes y la emisión de documentos."
                : "This section will become available as we integrate templates, patient data, and document issuance."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}