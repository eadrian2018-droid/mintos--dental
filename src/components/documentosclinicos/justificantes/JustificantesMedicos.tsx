import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Printer,
  RotateCcw,
  Stethoscope,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../context/LanguageContext";

type JustificantesMedicosProps = {
  onBack: () => void;
};

type Clinica = {
  nombre: string | null;
  responsable: string | null;
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

type PacienteOpcion = {
  id: number;
  nombre: string;
};

type TratamientoOpcion = {
  id: number;
  nombre: string;
  nombre_en: string | null;
  activo: boolean;
};

type Formulario = {
  tratamientoId: string;
  tratamientoManual: string;
  diasActividad: string;
  paciente: string;
  doctorId: string;
  fechaAtencion: string;
  diasReposo: string;
};

const BUCKET = "documentos_clinicos";

const fechaLocal = (): string => {
  const ahora = new Date();

  const year = ahora.getFullYear();

  const month = String(
    ahora.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    ahora.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formularioInicial = (): Formulario => ({
  paciente: "",
  tratamientoId: "",
  tratamientoManual: "",
  diasActividad: "0",
  doctorId: "",
  fechaAtencion: fechaLocal(),
  diasReposo: "0",
});

const formatoFecha = (
  valor: string,
  es: boolean,
): string => {
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

const sumarDias = (
  fecha: string,
  dias: number,
): string => {
  if (
    !fecha ||
    !Number.isInteger(dias) ||
    dias < 1
  ) {
    return "";
  }

  const resultado = new Date(`${fecha}T12:00:00`);

  if (Number.isNaN(resultado.getTime())) {
    return "";
  }

  resultado.setDate(
    resultado.getDate() + dias - 1,
  );

  const year = resultado.getFullYear();

  const month = String(
    resultado.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    resultado.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const construirDireccion = (
  clinica: Clinica,
): string =>
  [
    clinica.direccion,
    clinica.ciudad,
    clinica.estado,
    clinica.pais,
  ]
    .map((valor) => valor?.trim())
    .filter(Boolean)
    .join(", ");

type DocumentoJustificanteProps = {
  clinica: Clinica;
  nombreMembrete: string;
  subtituloMembrete: string;
  logoUrl: string | null;
  formulario: Formulario;
  doctor: Doctor;
  profesional: Profesional;
  es: boolean;
  fechaFinReposo: string;
  nombreTratamiento: string;
};

function DocumentoJustificante({
  clinica,
  nombreMembrete,
  subtituloMembrete,
  logoUrl,
  formulario,
  doctor,
  profesional,
  es,
  fechaFinReposo,
  nombreTratamiento,
}: DocumentoJustificanteProps) {
  const titular =
    nombreMembrete.trim() ||
    clinica.responsable?.trim() ||
    clinica.nombre?.trim() ||
    "";

  const subtitulo =
    subtituloMembrete.trim() ||
    clinica.nombre?.trim() ||
    "";

  const direccion = construirDireccion(clinica);

  const diasReposo = Number(
    formulario.diasReposo,
  );

  const diasActividad = Number(
    formulario.diasActividad,
  );

  const tieneActividad =
    Number.isInteger(diasActividad) &&
    diasActividad > 0;

  const tieneReposo =
    Number.isInteger(diasReposo) &&
    diasReposo > 0 &&
    Boolean(formulario.fechaAtencion);

  const [anio = "", mes = "", dia = ""] =
    formulario.fechaAtencion.split("-");

  const fechaOrdenada = es
    ? [
        [dia, "Día"],
        [mes, "Mes"],
        [anio, "Año"],
      ]
    : [
        [mes, "Month"],
        [dia, "Day"],
        [anio, "Year"],
      ];

  return (
    <article
      aria-label={
        es
          ? "Justificante médico"
          : "Medical certificate"
      }
      className="mintos-justificante-sheet relative mx-auto h-[279.4mm] w-[215.9mm] shrink-0 overflow-hidden bg-white px-[15mm] pt-[13mm] font-sans text-[#152b32] shadow-[0_12px_36px_rgba(0,0,0,0.12)]"
    >
      {/* ENCABEZADO INSTITUCIONAL */}

      <header className="relative z-10">
        <div className="flex items-start gap-[7mm]">
          <div className="flex h-[34mm] w-[35mm] shrink-0 items-center justify-center">
            {logoUrl && (
              <img
                src={logoUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-[1mm]">
            <h1 className="break-words font-serif text-[33px] italic font-normal leading-[1.1] tracking-[-0.04em] text-[#142f37]">
              {titular}
            </h1>

            <p className="mt-[2mm] break-words text-[10px] font-bold uppercase leading-snug tracking-[0.11em] text-[#273c43]">
              {subtitulo}
            </p>

            {direccion && (
              <p className="mt-[2mm] break-words text-[10px] leading-[1.45] text-[#34484f]">
                {direccion}
              </p>
            )}

            <div className="mt-[1mm] flex flex-wrap gap-x-[4mm] text-[10px] font-semibold leading-[1.45] text-[#263c43]">
              {clinica.telefono && (
                <span>
                  {es ? "Tel." : "Phone"}{" "}
                  {clinica.telefono}
                </span>
              )}

              {clinica.whatsapp && (
                <span>
                  WhatsApp {clinica.whatsapp}
                </span>
              )}
            </div>

            {clinica.email && (
              <p className="mt-[1mm] break-all text-[10px] text-[#34484f]">
                {clinica.email}
              </p>
            )}

            {clinica.sitio_web && (
              <p className="break-all text-[10px] text-[#34484f]">
                {clinica.sitio_web}
              </p>
            )}
          </div>

          {/* FECHA */}

          <div className="w-[44mm] shrink-0 pt-[2mm]">
            <div className="overflow-hidden rounded-[4px] border border-[#294c55]">
              <div className="bg-[#173e49] py-[2mm] text-center text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                {es ? "Fecha" : "Date"}
              </div>

              <div className="flex bg-white px-[1mm] py-[3mm]">
                {fechaOrdenada.map(
                  ([valor, etiqueta], index) => (
                    <div
                      key={`${etiqueta}-${index}`}
                      className="flex min-w-0 flex-1 flex-col items-center justify-center"
                    >
                      <span className="text-[11px] font-semibold text-[#173e49]">
                        {valor || "—"}
                      </span>

                      <span className="mt-[1mm] text-[7px] text-[#60727a]">
                        {etiqueta}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DOBLE LÍNEA */}

        <div className="mt-[6mm] space-y-[1mm]">
          <div className="h-[1.2mm] w-full bg-[#173e49]" />
          <div className="h-[0.45mm] w-full bg-[#173e49]" />
        </div>
      </header>

      {/* TÍTULO — SIN FECHA DUPLICADA */}

      <div className="relative z-10 mt-[9mm]">
        <h2 className="text-center text-[20px] font-extrabold uppercase tracking-[0.15em] text-[#102f4f]">
          {es
            ? "Justificante médico"
            : "Medical certificate"}
        </h2>
      </div>

      {/* MARCA DE AGUA */}

      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[43%] h-[90mm] w-[90mm] -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.055]"
        />
      )}

      {/* CONTENIDO DEL JUSTIFICANTE */}

      <main className="relative z-10 mt-[12mm] text-[13px] leading-[2] text-[#20343d]">
        <p className="font-semibold uppercase tracking-[0.04em] text-[#102f4f]">
          {es
            ? "A quien corresponda:"
            : "To whom it may concern:"}
        </p>

        <p className="mt-[9mm]">
          {es ? (
            <>
              Por medio de la presente se certifica que el/la paciente{" "}
              <span className="font-semibold">
                {formulario.paciente.trim()}
              </span>{" "}
              acudió a nuestra clínica el día{" "}
              {formatoFecha(formulario.fechaAtencion, es)}
              {nombreTratamiento
                ? ` para atención relacionada con ${nombreTratamiento}`
                : " para recibir atención odontológica"}.
            </>
          ) : (
            <>
              This is to certify that patient{" "}
              <span className="font-semibold">
                {formulario.paciente.trim()}
              </span>{" "}
              visited our clinic on{" "}
              {formatoFecha(formulario.fechaAtencion, es)}
              {nombreTratamiento
                ? ` for care related to ${nombreTratamiento}`
                : " for dental care"}.
            </>
          )}
        </p>

        {/* ORACIÓN ADICIONAL */}

        <p className="mt-[5mm]">
          {es
            ? "Se expide el presente documento como constancia de su atención odontológica, para los fines que considere pertinentes."
            : "This document is issued as confirmation of the patient's dental visit for any appropriate purpose."}
        </p>

        {(tieneReposo || tieneActividad) && (
          <p className="mt-[7mm]">
            {es ? (
              <>
                Por indicación del odontólogo tratante, se recomienda
                {tieneReposo
                  ? ` guardar reposo absoluto durante ${diasReposo} ${
                      diasReposo === 1 ? "día" : "días"
                    }`
                  : ""}
                {tieneReposo && tieneActividad ? " y" : ""}
                {tieneActividad
                  ? ` evitar esfuerzos o actividades físicas durante ${diasActividad} ${
                      diasActividad === 1 ? "día" : "días"
                    }`
                  : ""}.
                {tieneReposo
                  ? ` El reposo comprende del ${formatoFecha(
                      formulario.fechaAtencion,
                      es,
                    )} al ${formatoFecha(fechaFinReposo, es)}.`
                  : ""}
              </>
            ) : (
              <>
                As recommended by the treating dentist, the patient should
                {tieneReposo
                  ? ` rest completely for ${diasReposo} ${
                      diasReposo === 1 ? "day" : "days"
                    }`
                  : ""}
                {tieneReposo && tieneActividad ? " and" : ""}
                {tieneActividad
                  ? ` avoid physical exertion or activity for ${diasActividad} ${
                      diasActividad === 1 ? "day" : "days"
                    }`
                  : ""}.
                {tieneReposo
                  ? ` The rest period runs from ${formatoFecha(
                      formulario.fechaAtencion,
                      es,
                    )} through ${formatoFecha(fechaFinReposo, es)}.`
                  : ""}
              </>
            )}
          </p>
        )}

        {(tieneReposo || tieneActividad) && (
          <p className="mt-[7mm]">
            {es
              ? "No seguir estas recomendaciones podría ocasionar sangrado u otras complicaciones durante su recuperación, según la naturaleza del procedimiento."
              : "Failure to follow these recommendations may result in bleeding or other complications during recovery, depending on the procedure."}
          </p>
        )}

                <p className="mt-[7mm]">
          {es
            ? "Sin más por el momento, quedo a sus órdenes."
            : "Please do not hesitate to contact our office if further information is required."}
        </p>

        <p className="mt-[8mm]">
          {es ? "Atentamente," : "Sincerely,"}
        </p>
      </main>

      {/* FIRMA DEL ODONTÓLOGO */}

      <section className="relative z-10 mt-[12mm] flex justify-end">
        <div className="w-[76mm] text-center">
          <div className="h-[10mm]" />

          <div className="border-t border-[#173e49] pt-[2mm]">
            <p className="text-[11px] font-semibold text-[#173e49]">
              {doctor.nombre}
            </p>

            {doctor.especialidad?.trim() && (
              <p className="mt-[1mm] text-[9px] text-[#405960]">
                {doctor.especialidad}
              </p>
            )}

            <p className="mt-[1mm] text-[9px] text-[#405960]">
              {es
                ? "Cédula profesional"
                : "Professional license"}
              : {profesional.cedula_profesional}
            </p>

            {profesional.cedula_especialidad?.trim() && (
              <p className="text-[9px] text-[#405960]">
                {es
                  ? "Cédula de especialidad"
                  : "Specialty license"}
                : {profesional.cedula_especialidad}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FRANJA INSTITUCIONAL */}

      <footer className="relative z-10 mt-[4mm]">
        <div className="h-[1mm] w-full bg-[#173e49]" />

        <div className="mt-[3mm] flex items-start justify-between gap-[5mm]">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[16px] italic leading-tight text-[#173e49]">
              {titular}
            </p>

            <p className="mt-[1mm] text-[8px] uppercase tracking-[0.1em] text-[#536970]">
              {subtitulo}
            </p>
          </div>

          <div className="max-w-[90mm] text-right text-[9px] leading-[1.5] text-[#173e49]">
            {clinica.email && (
              <p className="break-all font-semibold">
                {clinica.email}
              </p>
            )}

            {clinica.sitio_web && (
              <p className="break-all">
                {clinica.sitio_web}
              </p>
            )}

            {clinica.whatsapp && (
              <p>
                WhatsApp: {clinica.whatsapp}
              </p>
            )}
          </div>
        </div>

        <div className="mt-[3mm] h-[0.4mm] w-full bg-[#173e49]" />
      </footer>
    </article>
  );
}

export default function JustificantesMedicos({
  onBack,
}: JustificantesMedicosProps) {
  const { language } = useLanguage();

  const es = language === "es";

  const [clinica, setClinica] =
    useState<Clinica | null>(null);

  const [pacientes, setPacientes] =
    useState<PacienteOpcion[]>([]);

  const [catalogo, setCatalogo] =
    useState<TratamientoOpcion[]>([]);

  const [errorListas, setErrorListas] =
    useState("");

  const [doctores, setDoctores] =
    useState<Doctor[]>([]);

  const [profesionales, setProfesionales] =
    useState<Profesional[]>([]);

  const [nombreMembrete, setNombreMembrete] =
    useState("");

  const [subtituloMembrete, setSubtituloMembrete] =
    useState("");

  const [logoUrl, setLogoUrl] =
    useState<string | null>(null);

  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    mostrarVistaPrevia,
    setMostrarVistaPrevia,
  ] = useState(false);

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
          respuestaPacientes,
          respuestaCatalogo,
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
            .select(
              "logo_path,nombre_membrete,subtitulo_membrete",
            )
            .eq("id", 1)
            .maybeSingle(),

          supabase
            .from("pacientes")
            .select("id,nombre")
            .order("nombre"),

          supabase
            .from("catalogo_tratamientos")
            .select("id,nombre,nombre_en,activo")
            .eq("activo", true)
            .order("nombre"),
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

        if (
          respuestaPacientes.error ||
          respuestaCatalogo.error
        ) {
          setErrorListas(
            es
              ? "No se pudieron cargar pacientes o tratamientos. Puedes escribirlos manualmente."
              : "Patients or treatments could not be loaded. You can enter them manually.",
          );
        } else {
          setErrorListas("");
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
          (respuestaProfesionales.data ??
            []) as Profesional[];

        const configuracion =
          respuestaConfiguracion.data as
            | ConfiguracionDocumentos
            | null;

        let urlLogotipo: string | null = null;

        if (configuracion?.logo_path) {
          const {
            data,
            error: errorLogo,
          } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(
              configuracion.logo_path,
              3600,
            );

          if (errorLogo) {
            throw errorLogo;
          }

          urlLogotipo =
            data?.signedUrl ?? null;
        }

        if (!activo) return;

        setPacientes(
          (respuestaPacientes.data ?? []) as PacienteOpcion[],
        );

        setCatalogo(
          (respuestaCatalogo.data ?? []) as TratamientoOpcion[],
        );

        setClinica(clinicaObtenida);
        setDoctores(doctoresObtenidos);
        setProfesionales(profesionalesObtenidos);

        setNombreMembrete(
          configuracion?.nombre_membrete ??
            clinicaObtenida?.responsable ??
            "",
        );

        setSubtituloMembrete(
          configuracion?.subtitulo_membrete ??
            clinicaObtenida?.nombre ??
            "",
        );

        setLogoUrl(urlLogotipo);
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

  const actualizarCampo = <
    K extends keyof Formulario
  >(
    campo: K,
    valor: Formulario[K],
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const doctorSeleccionado = useMemo(
    () =>
      doctores.find(
        (doctor) =>
          String(doctor.id) === formulario.doctorId,
      ) ?? null,
    [doctores, formulario.doctorId],
  );

  const profesionalSeleccionado = useMemo(
    () =>
      profesionales.find(
        (profesional) =>
          profesional.doctor_id ===
          doctorSeleccionado?.id,
      ) ?? null,
    [profesionales, doctorSeleccionado],
  );

  const tratamientoSeleccionado = catalogo.find(
    (item) =>
      String(item.id) === formulario.tratamientoId,
  );

  const nombreTratamiento =
    formulario.tratamientoId === "manual"
      ? formulario.tratamientoManual.trim()
      : tratamientoSeleccionado
        ? (
            es
              ? tratamientoSeleccionado.nombre
              : tratamientoSeleccionado.nombre_en ||
                tratamientoSeleccionado.nombre
          )
        : "";

  const diasActividad = Number(
    formulario.diasActividad,
  );

  const diasActividadValidos =
    formulario.diasActividad.trim() !== "" &&
    Number.isInteger(diasActividad) &&
    diasActividad >= 0 &&
    diasActividad <= 365;

  const diasReposo = Number(
    formulario.diasReposo,
  );

  const diasReposoValidos =
    formulario.diasReposo.trim() !== "" &&
    Number.isInteger(diasReposo) &&
    diasReposo >= 0 &&
    diasReposo <= 365;

  const fechaFinReposo = useMemo(() => {
    if (
      !diasReposoValidos ||
      diasReposo === 0
    ) {
      return "";
    }

    return sumarDias(
      formulario.fechaAtencion,
      diasReposo,
    );
  }, [
    formulario.fechaAtencion,
    diasReposo,
    diasReposoValidos,
  ]);

  const puedeImprimir =
    !cargando &&
    !error &&
    Boolean(clinica?.nombre?.trim()) &&
    Boolean(doctorSeleccionado) &&
    Boolean(
      profesionalSeleccionado
        ?.cedula_profesional
        ?.trim(),
    ) &&
    Boolean(formulario.paciente.trim()) &&
    Boolean(formulario.fechaAtencion) &&
    diasReposoValidos &&
    diasActividadValidos &&
    (
      diasReposo === 0 ||
      Boolean(fechaFinReposo)
    );

  const limpiarFormulario = () => {
    setFormulario(formularioInicial());
    setMostrarVistaPrevia(false);
  };

  const imprimirJustificante = () => {
    if (!puedeImprimir) return;

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

  const documentoDisponible =
    puedeImprimir &&
    clinica !== null &&
    doctorSeleccionado !== null &&
    profesionalSeleccionado !== null;

  const documento = documentoDisponible ? (
    <DocumentoJustificante
      clinica={clinica}
      nombreMembrete={nombreMembrete}
      subtituloMembrete={subtituloMembrete}
      logoUrl={logoUrl}
      formulario={formulario}
      doctor={doctorSeleccionado}
      profesional={profesionalSeleccionado}
      es={es}
      fechaFinReposo={fechaFinReposo}
      nombreTratamiento={nombreTratamiento}
    />
  ) : null;

    return (
    <div className="mintos-justificantes-page w-full min-w-0 space-y-6 text-[#102f4f] dark:text-slate-100">
      {/* IMPRESIÓN TAMAÑO CARTA */}

      <style>{`
        @page {
          size: letter;
          margin: 0;
        }

        @media print {
          html,
          body,
          #root {
            width: 215.9mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          .mintos-justificantes-print,
          .mintos-justificantes-print * {
            visibility: visible !important;
          }

          .mintos-justificantes-print {
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

          .mintos-justificante-sheet {
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

      {/* DOCUMENTO PARA IMPRESIÓN */}

      {documentoDisponible && (
        <div
          className="mintos-justificantes-print hidden"
          aria-hidden="true"
        >
          {documento}
        </div>
      )}

      {/* ENCABEZADO DEL MÓDULO */}

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
                ? "Genera justificantes profesionales de forma rápida y sencilla."
                : "Generate professional medical certificates quickly and easily."}
            </p>
          </div>

          <span className="rounded-full border border-[#7de5d0]/30 bg-[#7de5d0]/10 px-3 py-1.5 text-xs font-semibold text-[#a6f4e4]">
            {es
              ? "Formato tamaño carta"
              : "US Letter format"}
          </span>
        </div>
      </header>

      {/* FORMULARIO */}

      <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#123b50] text-[#8ee8d7]">
            <ClipboardCheck size={21} />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
              {es
                ? "Datos del justificante"
                : "Certificate details"}
            </h2>

            <p className="mt-1 text-xs text-[#5e7885] dark:text-slate-400">
              {es
                ? "Selecciona los datos clínicos y las recomendaciones."
                : "Select clinical details and recommendations."}
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

        {errorListas && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            {errorListas}
          </div>
        )}

        {!cargando && !error && !clinica && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            {es
              ? "Primero configura los datos del consultorio en Configuración → Clínica."
              : "Configure the clinic information in Settings → Clinic first."}
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
              value={formulario.doctorId}
              disabled={cargando || Boolean(error)}
              onChange={(event) =>
                actualizarCampo(
                  "doctorId",
                  event.target.value,
                )
              }
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
              !profesionalSeleccionado
                ?.cedula_profesional
                ?.trim() && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  {es
                    ? "Este odontólogo no tiene cédula profesional registrada."
                    : "This dentist does not have a registered professional license."}
                </p>
              )}
          </label>

          {/* PACIENTE */}

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
              {es ? "Paciente" : "Patient"}
              <span className="ml-1 text-rose-500">*</span>
            </span>

            <input
              type="text"
              list="mintos-justificante-pacientes"
              value={formulario.paciente}
              maxLength={150}
              onChange={(event) =>
                actualizarCampo(
                  "paciente",
                  event.target.value,
                )
              }
              placeholder={
                es
                  ? "Buscar o escribir nombre completo"
                  : "Search or enter full name"
              }
              className={inputClass}
            />

            <datalist id="mintos-justificante-pacientes">
              {pacientes.map((paciente) => (
                <option
                  key={paciente.id}
                  value={paciente.nombre}
                />
              ))}
            </datalist>
          </label>

          {/* TRATAMIENTO */}

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
              {es ? "Tratamiento" : "Treatment"}
            </span>

            <select
              value={formulario.tratamientoId}
              disabled={cargando || Boolean(error)}
              onChange={(event) => {
                actualizarCampo(
                  "tratamientoId",
                  event.target.value,
                );

                if (event.target.value !== "manual") {
                  actualizarCampo(
                    "tratamientoManual",
                    "",
                  );
                }
              }}
              className={inputClass}
            >
              <option value="">
                {es
                  ? "Seleccionar tratamiento"
                  : "Select treatment"}
              </option>

              {catalogo.map((tratamiento) => (
                <option
                  key={tratamiento.id}
                  value={tratamiento.id}
                >
                  {es
                    ? tratamiento.nombre
                    : tratamiento.nombre_en ||
                      tratamiento.nombre}
                </option>
              ))}

              <option value="manual">
                {es
                  ? "Otro tratamiento..."
                  : "Other treatment..."}
              </option>
            </select>

            {formulario.tratamientoId === "manual" && (
              <input
                type="text"
                maxLength={180}
                value={formulario.tratamientoManual}
                onChange={(event) =>
                  actualizarCampo(
                    "tratamientoManual",
                    event.target.value,
                  )
                }
                placeholder={
                  es
                    ? "Escribir tratamiento"
                    : "Enter treatment"
                }
                className={`${inputClass} mt-3`}
              />
            )}
          </label>

          {/* FECHA DE ATENCIÓN */}

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#315b63] dark:text-slate-200">
              <CalendarDays size={14} />

              {es
                ? "Fecha de atención"
                : "Date of treatment"}

              <span className="text-rose-500">*</span>
            </span>

            <input
              type="date"
              value={formulario.fechaAtencion}
              onChange={(event) =>
                actualizarCampo(
                  "fechaAtencion",
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </label>

          {/* REPOSO ABSOLUTO */}

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
              {es
                ? "Días de reposo absoluto"
                : "Days of complete rest"}
            </span>

            <input
              type="number"
              min={0}
              max={365}
              step={1}
              value={formulario.diasReposo}
              onChange={(event) =>
                actualizarCampo(
                  "diasReposo",
                  event.target.value,
                )
              }
              className={inputClass}
            />

            {diasReposoValidos &&
              diasReposo > 0 &&
              fechaFinReposo && (
                <p className="mt-2 text-xs font-semibold text-[#087e73] dark:text-[#a5eddf]">
                  {es
                    ? "Último día de reposo:"
                    : "Last day of rest:"}{" "}
                  {formatoFecha(
                    fechaFinReposo,
                    es,
                  )}
                </p>
              )}
          </label>

          {/* RESTRICCIÓN DE ACTIVIDAD FÍSICA */}

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#315b63] dark:text-slate-200">
              {es
                ? "Días sin actividad física"
                : "Days without physical activity"}
            </span>

            <input
              type="number"
              min={0}
              max={365}
              step={1}
              value={formulario.diasActividad}
              onChange={(event) =>
                actualizarCampo(
                  "diasActividad",
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </label>
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
                setMostrarVistaPrevia(
                  (actual) => !actual,
                )
              }
              className="inline-flex items-center gap-2 rounded-[12px] border border-[#0b8f80] bg-[#eef8f5] px-5 py-3 text-xs font-bold text-[#087e73] transition hover:bg-[#d9f1e9] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0b8f80]/15 dark:text-[#a5eddf]"
            >
              <FileText size={16} />

              {es
                ? "Vista previa"
                : "Preview"}
            </button>

            <button
              type="button"
              disabled={!puedeImprimir}
              onClick={imprimirJustificante}
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

      {mostrarVistaPrevia &&
        documentoDisponible && (
          <section className="rounded-[24px] border border-[#e0e9eb] bg-[#f5f9f8] p-5 dark:border-white/10 dark:bg-[#102635] sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-[#102f4f] dark:text-white">
                  {es
                    ? "Vista previa del justificante"
                    : "Certificate preview"}
                </h2>

                <p className="mt-1 text-xs text-[#607987] dark:text-slate-400">
                  {es
                    ? "Documento listo para impresión en tamaño carta."
                    : "Document ready for US Letter printing."}
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
              {documento}
            </div>
          </section>
        )}
    </div>
  );
}