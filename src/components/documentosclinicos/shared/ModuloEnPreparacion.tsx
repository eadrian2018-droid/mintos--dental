import {
  ArrowLeft,
  FileText,
  Stethoscope,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";

type ModuloEnPreparacionProps = {
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  onBack: () => void;
};

export default function ModuloEnPreparacion({
  titleEs,
  titleEn,
  descriptionEs,
  descriptionEn,
  onBack,
}: ModuloEnPreparacionProps) {
  const { language } = useLanguage();

  const es = language === "es";

  return (
    <div className="w-full min-w-0 space-y-6 text-[#102f4f] dark:text-slate-100">
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

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#9af2df]">
          <Stethoscope size={14} />
          MintOS Dental System
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {es ? titleEs : titleEn}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          {es ? descriptionEs : descriptionEn}
        </p>
      </header>

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 shadow-[0_8px_24px_rgba(16,47,79,0.035)] dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="rounded-[19px] border border-[#e0e8ed] bg-[#fcfdfd] p-6 dark:border-white/10 dark:bg-[#142f40]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[15px] border border-[#d2e9e4] bg-[#eaf6f2] text-[#087e73] dark:border-[#62dfc8]/15 dark:bg-[#0b8f80]/20 dark:text-[#8be9d7]">
            <FileText size={23} />
          </div>

          <h2 className="text-base font-bold text-[#123b50] dark:text-white">
            {es
              ? "Módulo en preparación"
              : "Module in preparation"}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#607987] dark:text-slate-400">
            {es
              ? "Esta sección se habilitará conforme integremos sus plantillas, formularios y documentos."
              : "This section will become available as we integrate its templates, forms, and documents."}
          </p>
        </div>
      </section>
    </div>
  );
}