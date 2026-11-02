import { useEffect, useMemo, useState } from "react";

import {
  ClipboardCheck,
  FileBadge,
  FileHeart,
  FileText,
  ImagePlus,
  Building2,
  IdCard,
  Save,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

import DocumentosRouter from "../components/documentosclinicos/DocumentosRouter";

import type { ModuloDocumento } from "../components/documentosclinicos/DocumentosRouter";

type ClinicaDocumento = {
  nombre: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  pais: string | null;
  responsable: string | null;
  sitio_web: string | null;
};

type DoctorDocumento = {
  id: number;
  nombre: string;
  especialidad: string | null;
  activo: boolean;
};

type CedulaDocumento = {
  doctor_id: number;
  cedula_profesional: string;
  cedula_especialidad: string | null;
};

type DocumentCategory = ModuloDocumento;

type Category = {
  id: DocumentCategory;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  icon: typeof FileText;
};

const CATEGORIES: Category[] = [
  {
    id: "consent",
    titleEs: "Consentimientos informados",
    titleEn: "Informed consents",
    descriptionEs:
      "Autorizaciones y explicaciones de procedimientos odontológicos.",
    descriptionEn:
      "Patient authorizations and explanations of dental procedures.",
    icon: ClipboardCheck,
  },
  {
    id: "warranty",
    titleEs: "Garantías y cuidados",
    titleEn: "Warranties & aftercare",
    descriptionEs:
      "Condiciones de garantía e indicaciones de mantenimiento.",
    descriptionEn:
      "Warranty terms and maintenance instructions.",
    icon: ShieldCheck,
  },
  {
    id: "prescription",
    titleEs: "Recetas médicas",
    titleEn: "Prescriptions",
    descriptionEs:
      "Recetas odontológicas emitidas por profesionales autorizados.",
    descriptionEn:
      "Dental prescriptions issued by authorized professionals.",
    icon: FileHeart,
  },
  {
    id: "certificate",
    titleEs: "Justificantes médicos",
    titleEn: "Medical certificates",
    descriptionEs:
      "Constancias de atención y recomendaciones de reposo.",
    descriptionEn:
      "Proof of attendance and recommended rest periods.",
    icon: FileBadge,
  },
];

export default function DocumentosClinicos() {
  const { language } = useLanguage();

  const es = language === "es";
  const { perfil } = useAuth();
  const esAdmin = perfil?.rol === "admin";

  const [clinica, setClinica] = useState<ClinicaDocumento | null>(null);
  const [doctores, setDoctores] = useState<DoctorDocumento[]>([]);
  const [cedulas, setCedulas] = useState<CedulaDocumento[]>([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState("");
  const [cedulaProfesional, setCedulaProfesional] = useState("");
  const [cedulaEspecialidad, setCedulaEspecialidad] = useState("");
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [guardandoCedula, setGuardandoCedula] = useState(false);
  const [guardandoLogo, setGuardandoLogo] = useState(false);
  const [mensajeConfig, setMensajeConfig] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoGuardadoUrl, setLogoGuardadoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [moduloActivo, setModuloActivo] =
    useState<ModuloDocumento | null>(null);

  const [search, setSearch] = useState("");

  const [logoPreview, setLogoPreview] =
    useState<string | null>(null);

  const [logoName, setLogoName] = useState("");

  const [logoError, setLogoError] = useState("");

  useEffect(() => {
    let vigente = true;
    async function cargarConfiguracion() {
      setCargandoConfig(true);
      const [clinicaRes, doctoresRes, cedulasRes, configRes] = await Promise.all([
        supabase.from("configuracion_clinica")
          .select("nombre,telefono,whatsapp,email,direccion,ciudad,estado,pais,responsable,sitio_web")
          .limit(1).maybeSingle(),
        supabase.from("doctores")
          .select("id,nombre,especialidad,activo")
          .eq("activo", true).order("nombre"),
        supabase.from("mintos_documentos_profesionales")
          .select("doctor_id,cedula_profesional,cedula_especialidad"),
        supabase.from("mintos_documentos_configuracion")
          .select("logo_path").eq("id", 1).maybeSingle(),
      ]);
      if (!vigente) return;
      const error = clinicaRes.error || doctoresRes.error || cedulasRes.error || configRes.error;
      if (error) {
        console.error("Error cargando configuración documental:", error);
        setMensajeConfig(es ? "No se pudo cargar toda la configuración documental." : "Could not load all document settings.");
      }
      setClinica((clinicaRes.data as ClinicaDocumento | null) ?? null);
      setDoctores((doctoresRes.data as DoctorDocumento[] | null) ?? []);
      setCedulas((cedulasRes.data as CedulaDocumento[] | null) ?? []);
      const path = configRes.data?.logo_path ?? null;
      setLogoPath(path);
      if (path) {
        const { data, error: urlError } = await supabase.storage
          .from("documentos_clinicos").createSignedUrl(path, 3600);
        if (vigente) {
          if (urlError) console.error("Error obteniendo logotipo:", urlError);
          setLogoGuardadoUrl(data?.signedUrl ?? null);
        }
      }
      if (vigente) setCargandoConfig(false);
    }
    void cargarConfiguracion();
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    const registro = cedulas.find(item => String(item.doctor_id) === doctorSeleccionado);
    setCedulaProfesional(registro?.cedula_profesional ?? "");
    setCedulaEspecialidad(registro?.cedula_especialidad ?? "");
  }, [doctorSeleccionado, cedulas]);

  async function guardarCedula() {
    if (!esAdmin || !doctorSeleccionado || !cedulaProfesional.trim()) {
      setMensajeConfig(es ? "Selecciona un odontólogo e ingresa su cédula profesional." : "Select a dentist and enter their professional license.");
      return;
    }
    setGuardandoCedula(true);
    setMensajeConfig("");
    const doctorId = Number(doctorSeleccionado);
    const { error } = await supabase.from("mintos_documentos_profesionales").upsert({
      doctor_id: doctorId,
      cedula_profesional: cedulaProfesional.trim(),
      cedula_especialidad: cedulaEspecialidad.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "doctor_id" });
    if (error) {
      console.error("Error guardando cédula:", error);
      setMensajeConfig(es ? "No se pudo guardar la cédula." : "Could not save the license.");
    } else {
      setCedulas(actual => [...actual.filter(item => item.doctor_id !== doctorId), {
        doctor_id: doctorId,
        cedula_profesional: cedulaProfesional.trim(),
        cedula_especialidad: cedulaEspecialidad.trim() || null,
      }]);
      setMensajeConfig(es ? "Cédula guardada correctamente." : "License saved successfully.");
    }
    setGuardandoCedula(false);
  }

  async function guardarLogo() {
    if (!esAdmin || !logoFile) return;
    setGuardandoLogo(true);
    setLogoError("");
    setMensajeConfig("");
    const extension = logoFile.type === "image/png" ? "png" : logoFile.type === "image/webp" ? "webp" : "jpg";
    const nuevoPath = `logos/${crypto.randomUUID()}.${extension}`;
    const storage = supabase.storage.from("documentos_clinicos");
    const { error: uploadError } = await storage.upload(nuevoPath, logoFile, {
      contentType: logoFile.type,
      upsert: false,
    });
    if (uploadError) {
      console.error("Error subiendo logotipo:", uploadError);
      setLogoError(es ? "No se pudo subir el logotipo." : "Could not upload the logo.");
      setGuardandoLogo(false);
      return;
    }
    const { error: dbError } = await supabase.from("mintos_documentos_configuracion").upsert({
      id: 1, logo_path: nuevoPath, updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (dbError) {
      console.error("Error guardando referencia del logotipo:", dbError);
      await storage.remove([nuevoPath]);
      setLogoError(es ? "No se pudo guardar la configuración del logotipo." : "Could not save the logo settings.");
      setGuardandoLogo(false);
      return;
    }
    const { data } = await storage.createSignedUrl(nuevoPath, 3600);
    setLogoGuardadoUrl(data?.signedUrl ?? null);
    setLogoPath(nuevoPath);
    setLogoFile(null);
    setLogoPreview(null);
    setLogoName("");
    setMensajeConfig(es ? "Logotipo guardado correctamente." : "Logo saved successfully.");
    if (logoPath && logoPath !== nuevoPath) {
      const { error: cleanupError } = await storage.remove([logoPath]);
      if (cleanupError) console.warn("No se pudo eliminar el logotipo anterior:", cleanupError);
    }
    setGuardandoLogo(false);
  }


  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) return CATEGORIES;

    return CATEGORIES.filter((category) =>
      `${category.titleEs} ${category.titleEn} ${category.descriptionEs} ${category.descriptionEn}`
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [search]);

  function handleLogoUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (
      !["image/png", "image/jpeg", "image/webp"].includes(
        file.type,
      )
    ) {
      setLogoError(
        es
          ? "Selecciona una imagen PNG, JPG o WebP."
          : "Select a PNG, JPG or WebP image.",
      );

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError(
        es
          ? "El logotipo no debe superar 2 MB."
          : "The logo must not exceed 2 MB.",
      );

      return;
    }

    setLogoError("");
    setLogoName(file.name);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  // NAVEGACIÓN CENTRALIZADA DE LOS CUATRO MÓDULOS

  if (moduloActivo !== null) {
    return (
      <DocumentosRouter
        modulo={moduloActivo}
        onBack={() => setModuloActivo(null)}
      />
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 text-[#102f4f] dark:text-slate-100">

      {/* HEADER — SIN CAMBIOS */}

      <header className="rounded-[24px] border border-[#d7e9e5] bg-gradient-to-br from-[#102f4f] via-[#123e55] to-[#0a716b] p-6 text-white shadow-[0_18px_40px_rgba(16,47,79,0.13)] dark:border-white/10 sm:p-8">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#9af2df]">
              <Stethoscope size={14} />
              MintOS Dental System
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {es ? "Documentos Clínicos" : "Clinical Documents"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
              {es
                ? "Biblioteca de documentos odontológicos para tu consultorio."
                : "Dental document library for your practice."}
            </p>

          </div>

          <span className="rounded-full border border-[#7de5d0]/30 bg-[#7de5d0]/10 px-3 py-1.5 text-xs font-semibold text-[#a6f4e4]">
            {es ? "Módulo en preparación" : "Module in preparation"}
          </span>

        </div>

      </header>

      {/* BIBLIOTECA DE DOCUMENTOS */}

      <section
        className="
          rounded-[24px]
          border
          border-[#e0e9eb]
          bg-[#f5f9f8]
          p-5
          shadow-[0_8px_24px_rgba(16,47,79,0.035)]
          dark:border-white/10
          dark:bg-[#102635]
          sm:p-6
        "
      >

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-[14px]
                bg-[#123b50]
                text-[#8ee8d7]
                shadow-[0_6px_16px_rgba(16,47,79,0.10)]
              "
            >
              <FileText size={21} />
            </div>

            <div>

              <h2 className="text-base font-extrabold tracking-tight text-[#102f4f] dark:text-white">
                {es
                  ? "Biblioteca de documentos"
                  : "Document library"}
              </h2>

              <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
                {es
                  ? "Selecciona el tipo de documento que necesitas."
                  : "Choose the document type you need."}
              </p>

            </div>

          </div>

          <label className="relative block w-full sm:max-w-xs">

            <Search
              size={16}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-[#77929d]
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                es
                  ? "Buscar documentos..."
                  : "Search documents..."
              }
              aria-label={
                es
                  ? "Buscar documentos"
                  : "Search documents"
              }
              className="
                w-full
                rounded-[13px]
                border
                border-[#dce6e8]
                bg-[#fcfdfd]
                py-2.5
                pl-10
                pr-3
                text-sm
                text-[#102f4f]
                shadow-[0_2px_8px_rgba(16,47,79,0.025)]
                outline-none
                transition
                placeholder:text-[#8299a2]
                focus:border-[#0b9a88]
                focus:ring-2
                focus:ring-[#0b9a88]/15
                dark:border-white/15
                dark:bg-[#0a2130]
                dark:text-white
              "
            />

          </label>

        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {filteredCategories.map((category) => {
            const Icon = category.icon;

            return (
              <article
                key={category.id}
                role="button"
                tabIndex={0}
                aria-label={
                  es
                    ? `Abrir ${category.titleEs}`
                    : `Open ${category.titleEn}`
                }
                onClick={() =>
                  setModuloActivo(category.id)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    setModuloActivo(category.id);
                  }
                }}
                className="
                  group
                  relative
                  flex
                  min-h-56
                  cursor-pointer
                  flex-col
                  overflow-hidden
                  rounded-[19px]
                  border
                  border-[#e0e8ed]
                  bg-[#fcfdfd]
                  p-5
                  shadow-[0_4px_12px_rgba(16,47,79,0.035)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-[#9ccfc5]
                  hover:shadow-[0_10px_22px_rgba(16,47,79,0.075)]
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#0b9a88]
                  dark:border-white/10
                  dark:bg-[#142f40]
                "
              >

                {/* ACENTO SUPERIOR */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-[3px]
                    bg-[#0b9a88]
                  "
                />

                {/* ÍCONO */}

                <div
                  className="
                    mb-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-[15px]
                    border
                    border-[#d2e9e4]
                    bg-[#eaf6f2]
                    text-[#087e73]
                    dark:border-[#62dfc8]/15
                    dark:bg-[#0b8f80]/20
                    dark:text-[#8be9d7]
                  "
                >
                  <Icon size={23} strokeWidth={1.8} />
                </div>

                {/* TÍTULO */}

                <h3 className="text-sm font-bold leading-snug tracking-tight text-[#123b50] dark:text-white">
                  {es
                    ? category.titleEs
                    : category.titleEn}
                </h3>

                {/* DESCRIPCIÓN */}

                <p className="mt-2 flex-1 text-xs leading-relaxed text-[#607987] dark:text-slate-400">
                  {es
                    ? category.descriptionEs
                    : category.descriptionEn}
                </p>

                {/* ESTADO */}

                <div className="mt-5 border-t border-[#e4ebee] pt-4 dark:border-white/10">

                  <span
                    className="
                      inline-flex
                      w-fit
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-[#d1e9e3]
                      bg-[#eef8f5]
                      px-3
                      py-1.5
                      text-[11px]
                      font-semibold
                      text-[#087e73]
                      dark:border-[#75dbc8]/20
                      dark:bg-[#2a8479]/20
                      dark:text-[#a5eddf]
                    "
                  >

                    <span className="h-1.5 w-1.5 rounded-full bg-[#0b9a88]" />

                    {es
                      ? "Próximamente"
                      : "Coming soon"}

                  </span>

                </div>

              </article>
            );
          })}

          {filteredCategories.length === 0 && (
            <p className="col-span-full rounded-[16px] border border-[#e0e8ed] bg-[#fcfdfd] py-8 text-center text-sm text-[#607987] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
              {es
                ? "No se encontraron categorías."
                : "No categories found."}
            </p>
          )}

        </div>

      </section>

      {/* CONFIGURACIÓN DOCUMENTAL: CLÍNICA Y CÉDULAS */}
      <section className="space-y-5 rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]"><Building2 size={21}/></div>
          <div>
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">{es ? "Configuración de documentos" : "Document settings"}</h2>
            <p className="text-xs text-[#5e7885] dark:text-slate-400">{es ? "Datos institucionales y cédulas profesionales." : "Clinic information and professional licenses."}</p>
          </div>
        </div>
        {cargandoConfig ? <p className="text-sm text-[#607987]">{es ? "Cargando configuración..." : "Loading settings..."}</p> : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[19px] border border-[#e0e8ed] bg-white p-5 dark:border-white/10 dark:bg-[#142f40]">
              <h3 className="mb-3 font-bold text-[#102f4f] dark:text-white">{es ? "Datos de la clínica" : "Clinic information"}</h3>
              {clinica ? (
                <div className="space-y-1.5 text-sm text-[#496675] dark:text-slate-300">
                  <p className="font-bold">{clinica.nombre || "—"}</p>
                  <p>{[clinica.direccion, clinica.ciudad, clinica.estado, clinica.pais].filter(Boolean).join(", ") || "—"}</p>
                  <p>{clinica.telefono || "—"} {clinica.whatsapp ? ` · WhatsApp: ${clinica.whatsapp}` : ""}</p>
                  <p>{clinica.email || "—"}</p>
                  <p>{clinica.sitio_web || "—"}</p>
                  <p>{es ? "Responsable: " : "Contact: "}{clinica.responsable || "—"}</p>
                </div>
              ) : <p className="text-sm text-[#607987]">{es ? "No hay información de clínica disponible." : "No clinic information available."}</p>}
              <p className="mt-4 text-xs text-[#607987] dark:text-slate-400">{es ? "Estos datos se administran en Configuración → Clínica." : "Manage these details in Settings → Clinic."}</p>
            </div>
            <div className="rounded-[19px] border border-[#e0e8ed] bg-white p-5 dark:border-white/10 dark:bg-[#142f40]">
              <div className="mb-3 flex items-center gap-2"><IdCard size={19} className="text-[#0b8f80]"/><h3 className="font-bold text-[#102f4f] dark:text-white">{es ? "Cédulas profesionales" : "Professional licenses"}</h3></div>
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#496675] dark:text-slate-300">{es ? "Odontólogo" : "Dentist"}
                  <select value={doctorSeleccionado} onChange={event => setDoctorSeleccionado(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#dce6e8] bg-white px-3 py-2.5 text-sm text-[#102f4f] dark:border-white/20 dark:bg-[#0a2130] dark:text-white">
                    <option value="">{es ? "Seleccionar odontólogo" : "Select dentist"}</option>
                    {doctores.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.nombre}{doctor.especialidad ? ` · ${doctor.especialidad}` : ""}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-[#496675] dark:text-slate-300">{es ? "Cédula profesional" : "Professional license"}
                  <input type="text" maxLength={80} value={cedulaProfesional} disabled={!esAdmin || !doctorSeleccionado} onChange={event => setCedulaProfesional(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#dce6e8] bg-white px-3 py-2.5 text-sm text-[#102f4f] disabled:opacity-60 dark:border-white/20 dark:bg-[#0a2130] dark:text-white" />
                </label>
                <label className="block text-xs font-semibold text-[#496675] dark:text-slate-300">{es ? "Cédula de especialidad (opcional)" : "Specialty license (optional)"}
                  <input type="text" maxLength={80} value={cedulaEspecialidad} disabled={!esAdmin || !doctorSeleccionado} onChange={event => setCedulaEspecialidad(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#dce6e8] bg-white px-3 py-2.5 text-sm text-[#102f4f] disabled:opacity-60 dark:border-white/20 dark:bg-[#0a2130] dark:text-white" />
                </label>
                {esAdmin && <button type="button" onClick={() => void guardarCedula()} disabled={guardandoCedula || !doctorSeleccionado || !cedulaProfesional.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#0b8f80] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"><Save size={15}/>{guardandoCedula ? (es ? "Guardando..." : "Saving...") : (es ? "Guardar cédula" : "Save license")}</button>}
                <p className="text-xs text-[#607987] dark:text-slate-400">{es ? "Los documentos se imprimirán para firma manual." : "Documents will be printed for handwritten signatures."}</p>
              </div>
            </div>
          </div>
        )}
        {mensajeConfig && <p role="status" className="text-sm font-medium text-[#087e73] dark:text-[#8be9d7]">{mensajeConfig}</p>}
      </section>

      {/* LOGOTIPO PARA DOCUMENTOS */}

      <section
        className="
          rounded-[24px]
          border
          border-[#e0e9eb]
          bg-[#f5f9f8]
          p-5
          shadow-[0_8px_24px_rgba(16,47,79,0.035)]
          dark:border-white/10
          dark:bg-[#102635]
          sm:p-6
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              bg-[#123b50]
              text-[#8ee8d7]
              shadow-[0_6px_16px_rgba(16,47,79,0.10)]
            "
          >
            <ImagePlus size={21} />
          </div>

          <div>

            <h2 className="text-base font-extrabold tracking-tight text-[#102f4f] dark:text-white">
              {es
                ? "Logotipo para documentos"
                : "Document logo"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Logotipo institucional (PNG, JPG o WebP; máximo 2 MB)."
                : "Clinic logo (PNG, JPG or WebP; maximum 2 MB)."}
            </p>

          </div>

        </div>

        <div
          className="
            mt-6
            flex
            flex-col
            gap-5
            rounded-[19px]
            border
            border-[#e0e8ed]
            bg-[#fcfdfd]
            p-4
            shadow-[0_3px_10px_rgba(16,47,79,0.025)]
            sm:flex-row
            sm:items-center
            sm:p-5
            dark:border-white/10
            dark:bg-[#091f2c]/55
          "
        >

          {/* VISTA PREVIA */}

          <div
            className="
              flex
              h-32
              w-full
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-[17px]
              border-2
              border-dashed
              border-[#c3ddd8]
              bg-[#f3f9f7]
              sm:w-48
              dark:border-[#4b827f]
              dark:bg-[#0b2b37]
            "
          >

            {logoPreview || logoGuardadoUrl ? (
              <img
                src={logoPreview || logoGuardadoUrl || ""}
                alt={
                  es
                    ? "Vista previa del logotipo"
                    : "Logo preview"
                }
                className="h-full w-full object-contain p-3"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#719c98] dark:text-[#83b5b1]">

                <ImagePlus
                  size={28}
                  strokeWidth={1.5}
                />

                <span className="text-xs font-semibold">
                  {es
                    ? "Sin logotipo"
                    : "No logo"}
                </span>

              </div>
            )}

          </div>

          {/* CONTROLES */}

          <div className="min-w-0 flex-1 space-y-3">

            <div className="flex flex-wrap items-center gap-2">

              <label
                className="
                  inline-flex
                  cursor-pointer
                  items-center
                  gap-2
                  rounded-[12px]
                  bg-[#0b8f80]
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  shadow-[0_6px_14px_rgba(11,143,128,0.14)]
                  transition
                  hover:bg-[#08796e]
                "
              >

                <ImagePlus size={15} />

                {es
                  ? "Seleccionar logotipo"
                  : "Select logo"}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  disabled={!esAdmin || guardandoLogo}
                  className="sr-only"
                />

              </label>

              {logoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview(null);
                    setLogoName("");
                    setLogoFile(null);
                    setLogoError("");
                  }}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-[12px]
                    border
                    border-[#dce6e8]
                    bg-[#f5f9f8]
                    px-3
                    py-2.5
                    text-xs
                    font-semibold
                    text-[#315b63]
                    transition
                    hover:bg-[#edf5f2]
                    dark:border-white/15
                    dark:bg-white/[0.06]
                    dark:text-slate-200
                  "
                >

                  <X size={14} />

                  {es
                    ? "Quitar vista previa"
                    : "Remove preview"}

                </button>
              )}

            </div>

            {esAdmin && logoFile && (
              <button type="button" onClick={() => void guardarLogo()} disabled={guardandoLogo}
                className="inline-flex items-center gap-2 rounded-xl bg-[#102f4f] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                <Save size={15} />{guardandoLogo ? (es ? "Guardando..." : "Saving...") : (es ? "Guardar logotipo" : "Save logo")}
              </button>
            )}
            {logoName && (
              <p className="break-all text-xs font-medium text-[#52777a] dark:text-slate-300">
                {logoName}
              </p>
            )}

            {logoError && (
              <p
                role="alert"
                className="text-xs text-rose-600 dark:text-rose-300"
              >
                {logoError}
              </p>
            )}

            {/* NOTA INFORMATIVA */}

            <div
              className="
                rounded-[12px]
                border
                border-[#e0e9eb]
                bg-[#f5f9f8]
                px-3.5
                py-3
                dark:border-white/10
                dark:bg-white/[0.04]
              "
            >

              <p className="max-w-xl text-xs leading-relaxed text-[#587477] dark:text-slate-400">
                {es
                  ? "El logotipo se guarda en un almacenamiento privado. Su incorporación a recetas y justificantes se realizará al integrar la hoja membretada."
                  : "The logo is saved in private storage. It will appear on prescriptions and certificates once the shared letterhead is integrated."}
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}