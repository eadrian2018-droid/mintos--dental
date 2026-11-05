import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Printer,
  RotateCcw,
  Stethoscope,
  Save,
  ImagePlus,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../context/LanguageContext";

import HojaMembretada from "../shared/HojaMembretada";

import type {
  DatosHojaMembretada,
} from "../shared/HojaMembretada";

type RecetasMedicasProps = {
  onBack: () => void;
};

type Clinica = {
  responsable: string | null;
  nombre: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  pais: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
};

type Doctor = {
  id: number;
  nombre: string;
  especialidad: string | null;
  activo: boolean;
  tipo_doctor: string | null;
};

type Profesional = {
  doctor_id: number;
  cedula_profesional: string;
  cedula_especialidad: string | null;
};

type ConfiguracionDocumentos = {
  logo_path: string | null;
  nombre_membrete: string | null;
  subtitulo_membrete: string | null;
};

const BUCKET = "documentos_clinicos";

const fechaLocal = (): string => {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const construirDireccion = (clinica: Clinica): string =>
  [
    clinica.direccion,
    clinica.ciudad,
    clinica.estado,
    clinica.pais,
  ]
    .map((valor) => valor?.trim())
    .filter(Boolean)
    .join(", ");

export default function RecetasMedicas({
  onBack,
}: RecetasMedicasProps) {
  const { language } = useLanguage();

  const es = language === "es";

  const [clinica, setClinica] = useState<Clinica | null>(
    null,
  );

  const [doctores, setDoctores] = useState<Doctor[]>([]);

  const [profesionales, setProfesionales] = useState<
    Profesional[]
  >([]);

  const [logoUrl, setLogoUrl] = useState<string | null>(
    null,
  );

  const [esAdmin, setEsAdmin] = useState(false);
  const [nombreMembrete, setNombreMembrete] = useState("");
  const [subtituloMembrete, setSubtituloMembrete] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [archivoLogo, setArchivoLogo] = useState<File | null>(null);
  const [guardandoMembrete, setGuardandoMembrete] = useState(false);
  const [mensajeMembrete, setMensajeMembrete] = useState("");
  const [errorMembrete, setErrorMembrete] = useState("");
  const [doctorId, setDoctorId] = useState("");

  const [paciente, setPaciente] = useState("");

  const [fecha, setFecha] = useState(fechaLocal);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [mostrarVistaPrevia, setMostrarVistaPrevia] =
    useState(false);

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      setCargando(true);
      setError("");

      try {
        const [
          respuestaClinica,
          respuestaDoctores,
          respuestaProfesionales,
          respuestaConfiguracion,
          respuestaAdmin,
        ] = await Promise.all([
          supabase
            .from("configuracion_clinica")
            .select(
              "nombre,responsable,direccion,ciudad,estado,pais,telefono,whatsapp,email,sitio_web",
            )
            .limit(1)
            .maybeSingle(),

          supabase
            .from("doctores")
            .select(
              "id,nombre,especialidad,activo,tipo_doctor",
            )
            .eq("activo", true)
            .order("nombre"),

          supabase
            .from("mintos_documentos_profesionales")
            .select(
              "doctor_id,cedula_profesional,cedula_especialidad",
            ),

          supabase
            .from("mintos_documentos_configuracion")
            .select("logo_path,nombre_membrete,subtitulo_membrete")
            .eq("id", 1)
            .maybeSingle(),

          supabase.rpc("es_admin"),
        ]);

        if (respuestaClinica.error) {
          throw respuestaClinica.error;
        }

        if (respuestaDoctores.error) {
          throw respuestaDoctores.error;
        }

        if (respuestaProfesionales.error) {
          throw respuestaProfesionales.error;
        }

        if (respuestaConfiguracion.error) {
          throw respuestaConfiguracion.error;
        }

        const clinicaObtenida =
          respuestaClinica.data as Clinica | null;

        const doctoresObtenidos = (
          (respuestaDoctores.data ?? []) as Doctor[]
        ).filter(
          (doctor) =>
            doctor.tipo_doctor === "doctor" ||
            doctor.tipo_doctor === "ambos",
        );

        const profesionalesObtenidos =
          (respuestaProfesionales.data ?? []) as Profesional[];

        const configuracion =
          respuestaConfiguracion.data as
            | ConfiguracionDocumentos
            | null;

        let urlLogotipo: string | null = null;

        if (configuracion?.logo_path) {
          const { data, error: errorLogo } =
            await supabase.storage
              .from(BUCKET)
              .createSignedUrl(
                configuracion.logo_path,
                3600,
              );

          if (errorLogo) {
            throw errorLogo;
          }

          urlLogotipo = data?.signedUrl ?? null;
        }

        if (!activo) return;

        setClinica(clinicaObtenida);
        setDoctores(doctoresObtenidos);
        setProfesionales(profesionalesObtenidos);
        setLogoUrl(urlLogotipo);
        setLogoPath(configuracion?.logo_path ?? null);
        setNombreMembrete(configuracion?.nombre_membrete ?? clinicaObtenida?.responsable ?? "");
        setSubtituloMembrete(configuracion?.subtitulo_membrete ?? clinicaObtenida?.nombre ?? "");
        setEsAdmin(!respuestaAdmin.error && respuestaAdmin.data === true);
      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : es
              ? "No fue posible cargar la configuración."
              : "Unable to load document settings.",
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const doctorSeleccionado = useMemo(
    () =>
      doctores.find(
        (doctor) => String(doctor.id) === doctorId,
      ) ?? null,
    [doctores, doctorId],
  );

  const profesionalSeleccionado = useMemo(
    () =>
      profesionales.find(
        (profesional) =>
          profesional.doctor_id === doctorSeleccionado?.id,
      ) ?? null,
    [profesionales, doctorSeleccionado],
  );

  const datosHoja = useMemo<
    DatosHojaMembretada | null
  >(() => {
    if (!clinica || !doctorSeleccionado) {
      return null;
    }

    return {
      clinica: clinica.nombre ?? "",
      titular: nombreMembrete.trim() || clinica.responsable || "",
      subtituloMembrete: subtituloMembrete.trim() || clinica.nombre || "",
      direccion: construirDireccion(clinica),
      telefono: clinica.telefono ?? "",
      whatsapp: clinica.whatsapp ?? "",
      email: clinica.email ?? "",
      sitioWeb: clinica.sitio_web ?? "",
      logoUrl,

      paciente: paciente.trim(),
      fecha,

      odontologo: doctorSeleccionado.nombre,
      especialidad: doctorSeleccionado.especialidad ?? "",
      cedulaProfesional:
        profesionalSeleccionado?.cedula_profesional ?? "",
      cedulaEspecialidad:
        profesionalSeleccionado?.cedula_especialidad ?? "",

      contenido: "",
    };
  }, [
    clinica,
    doctorSeleccionado,
    profesionalSeleccionado,
    paciente,
    fecha,
    logoUrl,
    nombreMembrete,
    subtituloMembrete,
  ]);

  const puedeImprimir =
    !cargando &&
    !error &&
    Boolean(clinica?.nombre?.trim()) &&
    Boolean(doctorSeleccionado) &&
    Boolean(
      profesionalSeleccionado?.cedula_profesional?.trim(),
    ) &&
    Boolean(fecha);

  const guardarMembrete = async () => {
    if (!esAdmin || guardandoMembrete || !clinica) return;
    const nombre = nombreMembrete.trim();
    const subtitulo = subtituloMembrete.trim();
    setErrorMembrete("");
    setMensajeMembrete("");
    if (!nombre || !subtitulo) {
      setErrorMembrete(es ? "Completa el nombre y el subtítulo." : "Enter the main name and subtitle.");
      return;
    }
    setGuardandoMembrete(true);
    let nuevoPath: string | null = null;
    try {
      if (archivoLogo) {
        if (!archivoLogo.type.startsWith("image/") || archivoLogo.size > 2 * 1024 * 1024) {
          throw new Error(es ? "El logotipo debe ser una imagen de máximo 2 MB." : "Logo must be an image under 2 MB.");
        }
        const extension = archivoLogo.type === "image/png" ? "png" : archivoLogo.type === "image/webp" ? "webp" : archivoLogo.type === "image/jpeg" ? "jpg" : "";
        if (!extension) throw new Error(es ? "Usa PNG, JPG o WebP." : "Use PNG, JPG, or WebP.");
        nuevoPath = `logos/recetario-${crypto.randomUUID()}.${extension}`;
        const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(nuevoPath, archivoLogo, { contentType: archivoLogo.type, upsert: false });
        if (errorSubida) throw errorSubida;
      }
      const { data: actualizado, error: errorGuardar } = await supabase
        .from("mintos_documentos_configuracion")
        .update({ nombre_membrete: nombre, subtitulo_membrete: subtitulo, ...(nuevoPath ? { logo_path: nuevoPath } : {}) })
        .eq("id", 1)
        .select("id")
        .single();
      if (errorGuardar) throw errorGuardar;
      if (!actualizado) throw new Error(es ? "No se encontró la configuración del membrete." : "Letterhead configuration not found.");
      if (nuevoPath) {
        const { data, error: errorUrl } = await supabase.storage.from(BUCKET).createSignedUrl(nuevoPath, 3600);
        if (errorUrl) throw errorUrl;
        setLogoUrl(data?.signedUrl ?? null);
        setLogoPath(nuevoPath);
        setArchivoLogo(null);
      }
      setMensajeMembrete(es ? "Membrete guardado correctamente." : "Letterhead saved successfully.");
    } catch (err) {
      // Un archivo recién subido no debe quedar huérfano si falla el guardado.
      if (nuevoPath) {
        const { data: actual } = await supabase.from("mintos_documentos_configuracion").select("logo_path").eq("id", 1).maybeSingle();
        if (actual?.logo_path !== nuevoPath) await supabase.storage.from(BUCKET).remove([nuevoPath]);
      }
      setErrorMembrete(err instanceof Error ? err.message : es ? "No se pudo guardar el membrete." : "Unable to save letterhead.");
    } finally {
      setGuardandoMembrete(false);
    }
  };

  const limpiarFormulario = () => {
    setDoctorId("");
    setPaciente("");
    setFecha(fechaLocal());
    setMostrarVistaPrevia(false);
  };

  // La impresión usa el mismo árbol React y estilos que la vista previa.
  const imprimirReceta = () => {
    if (!puedeImprimir || !datosHoja) return;
    window.print();
  };

  const inputClass =
    "w-full rounded-[12px] border border-[#dce6e8] " +
    "bg-white px-4 py-3 text-sm text-[#102f4f] " +
    "outline-none transition " +
    "focus:border-[#0b9a88] focus:ring-2 " +
    "focus:ring-[#0b9a88]/15 " +
    "dark:border-white/15 dark:bg-[#0a2130] " +
    "dark:text-white";

  return (
    <div className="mintos-recetas-page w-full min-w-0 space-y-6 text-[#102f4f] dark:text-slate-100">

            <style>{`
        @page { size: letter; margin: 0; }
        @media print {
          html, body, #root { width: 215.9mm !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          .mintos-recetas-print, .mintos-recetas-print * { visibility: visible !important; }
          .mintos-recetas-print {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 215.9mm !important;
            height: 279.4mm !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 2147483647 !important;
          }
          .mintos-letter-sheet {
            width: 215.9mm !important;
            height: 279.4mm !important;
            min-height: 279.4mm !important;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {datosHoja && (
        <div className="mintos-recetas-print hidden" aria-hidden="true">
          <HojaMembretada
            tipo="receta"
            datos={datosHoja}
            language={es ? "es" : "en"}
          />
        </div>
      )}

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
                ? "Recetario membretado"
                : "Prescription Letterhead"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
              {es
                ? "Personaliza e imprime recetas listas para completar a mano."
                : "Customize and print prescriptions ready to complete by hand."}
            </p>
          </div>

          <span className="rounded-full border border-[#7de5d0]/30 bg-[#7de5d0]/10 px-3 py-1.5 text-xs font-semibold text-[#a6f4e4]">
            {es
              ? "Formato tamaño carta"
              : "US Letter format"}
          </span>
        </div>
      </header>

      {/* PERSONALIZACIÓN DEL MEMBRETE: SOLO ADMINISTRADORES */}

      {esAdmin && !cargando && !error && (
        <section className="rounded-[24px] border border-[#d1e9e3] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#102635] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <ImagePlus size={22} className="text-[#0b8f80]" />

            <div>
              <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
                {es
                  ? "Personalizar membrete"
                  : "Customize letterhead"}
              </h2>

              <p className="text-xs text-[#607987] dark:text-slate-400">
                {es
                  ? "Identidad del consultorio en todas las recetas; no cambia al seleccionar al odontólogo."
                  : "Clinic identity on every prescription; independent of the signing dentist."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
                {es ? "Nombre principal" : "Main name"}
              </span>

              <input
                className={inputClass}
                value={nombreMembrete}
                maxLength={120}
                onChange={(event) =>
                  setNombreMembrete(event.target.value)
                }
                placeholder={
                  es
                    ? "Dra. Marlene Verdugo"
                    : "Clinic owner or name"
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
                {es ? "Subtítulo" : "Subtitle"}
              </span>

              <input
                className={inputClass}
                value={subtituloMembrete}
                maxLength={140}
                onChange={(event) =>
                  setSubtituloMembrete(event.target.value)
                }
                placeholder={
                  es
                    ? "Nombre del consultorio"
                    : "Clinic name"
                }
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
                {es
                  ? "Logotipo (PNG, JPG o WebP; máximo 2 MB)"
                  : "Logo (PNG, JPG, or WebP; max 2 MB)"}
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className={inputClass}
                onChange={(event) =>
                  setArchivoLogo(event.target.files?.[0] ?? null)
                }
              />

              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={es ? "Logotipo actual" : "Current logo"}
                  className="mt-3 h-20 w-28 rounded-lg border border-[#dce6e8] bg-white object-contain p-2"
                />
              )}

              {logoPath && (
                <p className="mt-1 text-xs text-[#607987]">
                  {es
                    ? "Logotipo actual guardado."
                    : "Current logo saved."}
                </p>
              )}

              {archivoLogo && (
                <p className="mt-1 text-xs text-[#607987]">
                  {archivoLogo.name}
                </p>
              )}
            </label>
          </div>

          {errorMembrete && (
            <p
              role="alert"
              className="mt-4 text-sm text-rose-700"
            >
              {errorMembrete}
            </p>
          )}

          {mensajeMembrete && (
            <p
              role="status"
              className="mt-4 text-sm text-emerald-700"
            >
              {mensajeMembrete}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={
                guardandoMembrete ||
                !nombreMembrete.trim() ||
                !subtituloMembrete.trim()
              }
              onClick={() => void guardarMembrete()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b8f80] px-5 py-3 text-sm font-bold text-white hover:bg-[#08796e] disabled:opacity-50"
            >
              <Save size={16} />

              {guardandoMembrete
                ? es
                  ? "Guardando..."
                  : "Saving..."
                : es
                  ? "Guardar membrete"
                  : "Save letterhead"}
            </button>
          </div>
        </section>
      )}

      {/* CONFIGURACIÓN DE LA RECETA */}

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
            <FileText size={21} />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
              {es
                ? "Personalizar receta"
                : "Customize prescription"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Selecciona al odontólogo y agrega los datos que deseas imprimir."
                : "Select the dentist and enter the details to print."}
            </p>
          </div>
        </div>

        {cargando && (
          <p className="mb-5 text-sm text-[#607987] dark:text-slate-300">
            {es
              ? "Cargando configuración..."
              : "Loading settings..."}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        {!cargando && !error && !clinica && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            {es
              ? "Primero configura los datos del consultorio en Configuración → Clínica."
              : "Configure the dental office details in Settings → Clinic first."}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* ODONTÓLOGO */}

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
              {es ? "Odontólogo" : "Dentist"}

              <span className="ml-1 text-rose-500">*</span>
            </span>

            <select
              value={doctorId}
              disabled={cargando || Boolean(error)}
              onChange={(event) => {
                setDoctorId(event.target.value);
                setMostrarVistaPrevia(false);
              }}
              className={inputClass}
            >
              <option value="">
                {es
                  ? "Seleccionar odontólogo"
                  : "Select dentist"}
              </option>

              {doctores.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  {doctor.nombre}
                </option>
              ))}
            </select>

            {doctorSeleccionado &&
              !profesionalSeleccionado?.cedula_profesional && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  {es
                    ? "Este odontólogo no tiene cédula registrada en Documentos Clínicos."
                    : "This dentist does not have a professional license registered in Clinical Documents."}
                </p>
              )}
          </label>

          {/* PACIENTE */}

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
              {es
                ? "Nombre del paciente (opcional)"
                : "Patient name (optional)"}
            </span>

            <input
              type="text"
              value={paciente}
              maxLength={150}
              onChange={(event) =>
                setPaciente(event.target.value)
              }
              placeholder={
                es
                  ? "Dejar vacío para receta en blanco"
                  : "Leave empty for a blank prescription"
              }
              className={inputClass}
            />
          </label>

          {/* FECHA */}

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#315b63] dark:text-slate-200">
              <CalendarDays size={14} />

              {es ? "Fecha" : "Date"}
            </span>

            <input
              type="date"
              value={fecha}
              onChange={(event) =>
                setFecha(event.target.value)
              }
              className={inputClass}
            />
          </label>

          {/* INFORMACIÓN AUTOMÁTICA */}

          <div className="rounded-[14px] border border-[#d1e9e3] bg-[#eef8f5] p-4 dark:border-[#75dbc8]/20 dark:bg-[#0b8f80]/10">
            <p className="text-xs font-bold text-[#087e73] dark:text-[#a5eddf]">
              {es
                ? "Información automática"
                : "Automatic information"}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-[#456773] dark:text-slate-300">
              {es
                ? "El logotipo, los datos del consultorio y la cédula profesional se incorporan automáticamente."
                : "The logo, dental office information, and professional license are included automatically."}
            </p>
          </div>
        </div>

        {/* ACCIONES */}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#dce6e8] pt-6 dark:border-white/10">
          <button
            type="button"
            onClick={limpiarFormulario}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#dce6e8] bg-white px-4 py-3 text-xs font-bold text-[#456773] transition hover:bg-[#eef8f5] dark:border-white/15 dark:bg-[#142f40] dark:text-slate-200"
          >
            <RotateCcw size={16} />

            {es ? "Limpiar" : "Clear"}
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!puedeImprimir}
              onClick={() =>
                setMostrarVistaPrevia((actual) => !actual)
              }
              className="inline-flex items-center gap-2 rounded-[12px] border border-[#0b8f80] bg-[#eef8f5] px-5 py-3 text-xs font-bold text-[#087e73] transition hover:bg-[#d9f1e9] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0b8f80]/15 dark:text-[#a5eddf]"
            >
              <FileText size={16} />

              {es ? "Vista previa" : "Preview"}
            </button>

            <button
              type="button"
              disabled={!puedeImprimir}
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

      {mostrarVistaPrevia && datosHoja && (
        <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
                {es
                  ? "Vista previa de la receta"
                  : "Prescription preview"}
              </h2>

              <p className="mt-1 text-xs text-[#607987] dark:text-slate-400">
                {es
                  ? "La zona central permanecerá en blanco para escribir a mano."
                  : "The center area will remain blank for handwriting."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMostrarVistaPrevia(false)
              }
              className="rounded-lg border border-[#dce6e8] px-3 py-2 text-xs font-semibold text-[#456773] dark:border-white/15 dark:text-slate-200"
            >
              {es
                ? "Cerrar vista previa"
                : "Close preview"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-[18px] bg-[#e8f0ef] p-3 sm:p-6">
            <HojaMembretada
              tipo="receta"
              datos={datosHoja}
              language={es ? "es" : "en"}
            />
          </div>
        </section>
      )}
    </div>
  );
}