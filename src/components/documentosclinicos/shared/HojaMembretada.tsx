import type { ReactNode } from "react";

type TipoDocumento = "receta" | "justificante";

export type DatosHojaMembretada = {
  clinica: string;
  titular?: string;
  direccion?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  sitioWeb?: string;
  logoUrl?: string | null;
  paciente: string;
  fecha: string;
  odontologo: string;
  especialidad?: string;
  cedulaProfesional: string;
  cedulaEspecialidad?: string;
  contenido: string;
};

type HojaMembretadaProps = {
  tipo: TipoDocumento;
  datos: DatosHojaMembretada;
  language: "es" | "en";
  children?: ReactNode;
};

export default function HojaMembretada({
  tipo,
  datos,
  language,
  children,
}: HojaMembretadaProps) {
  const es = language === "es";
  const receta = tipo === "receta";
  const titulo = receta
    ? es ? "Receta médica" : "Medical prescription"
    : es ? "Justificante médico" : "Medical certificate";
  const [anio = "", mes = "", dia = ""] = datos.fecha.split("-");
  const titular = datos.titular?.trim() || datos.clinica;
  const direccion = datos.direccion?.trim();
  const telefono = datos.telefono?.trim();
  const whatsapp = datos.whatsapp?.trim();
  const email = datos.email?.trim();
  const sitioWeb = datos.sitioWeb?.trim();

  return (
    <article
      aria-label={titulo}
      className="mintos-letter-sheet relative mx-auto flex h-[279.4mm] w-[215.9mm] shrink-0 flex-col overflow-hidden bg-white px-[17mm] pb-[22mm] pt-[12mm] font-sans text-[#1e292e] shadow-[0_12px_36px_rgba(0,0,0,0.12)]"
    >
      {/* Identidad permanente del consultorio; NO cambia con el odontólogo firmante. */}
      <header className="relative z-10 flex flex-col items-center text-center">
        {datos.logoUrl && (
          <img
            src={datos.logoUrl}
            alt=""
            className="mb-[2mm] h-[25mm] w-[32mm] object-contain"
          />
        )}
        <h1 className="max-w-full break-words text-[28px] font-light leading-[1.12] tracking-[-0.035em] text-[#18232a]">
          {titular}
        </h1>
        <p className="mt-[2mm] max-w-full break-words text-[11px] font-medium uppercase leading-snug tracking-[0.28em] text-[#303a40]">
          {datos.clinica}
        </p>
        <div className="mt-[5mm] h-px w-full bg-gradient-to-r from-[#d9ddde] via-[#8e9699] to-[#d9ddde]" />
      </header>

      {/* Datos de receta, discretos, sin tarjetas ni títulos decorativos. */}
      <div className="relative z-10 mt-[5mm] flex items-end justify-between gap-[6mm]">
        <div className="min-w-0 flex-1">
          {datos.paciente.trim() && (
            <p className="break-words text-[11px] leading-relaxed">
              <span className="font-semibold">{es ? "Paciente:" : "Patient:"}</span>{" "}
              {datos.paciente}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-end gap-[2mm] text-center text-[9px]">
          <span className="mb-[2mm] font-semibold uppercase tracking-[0.08em]">{es ? "Fecha" : "Date"}</span>
          {[
            [dia, es ? "Día" : "Day"],
            [mes, es ? "Mes" : "Month"],
            [anio, es ? "Año" : "Year"],
          ].map(([valor, etiqueta]) => (
            <div key={etiqueta} className="w-[13mm] border-b border-[#6d777c] pb-[1mm]">
              <div className="font-medium text-[10px]">{valor}</div>
              <div className="text-[7px] text-[#6b7579]">{etiqueta}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-[3mm] border-t border-[#39454a] pt-[1mm]">
        <div className="border-t border-[#a7afb2]" />
      </div>

      {/* Marca de agua: únicamente el logotipo registrado, muy tenue. */}
      {datos.logoUrl && (
        <img
          src={datos.logoUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[46%] h-[77mm] w-[77mm] -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.035]"
        />
      )}

      <main className="relative z-10 min-h-0 flex-1 pt-[6mm]">
        {receta ? (
          <div className="font-serif text-[26px] italic leading-none text-[#28343a]">℞</div>
        ) : (
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">{titulo}</h2>
        )}
        {datos.contenido && (
          <div className="mt-[5mm] whitespace-pre-wrap break-words text-[12px] leading-relaxed">
            {datos.contenido}
          </div>
        )}
        {children}
      </main>

      {/* Firma del odontólogo que expide la receta, no de la titular por defecto. */}
      <section className="relative z-10 mb-[9mm] flex justify-end">
        <div className="w-[76mm] text-center">
          <div className="h-[11mm]" />
          <div className="border-t border-[#4b565b] pt-[2mm] text-[11px] font-semibold">
            {datos.odontologo}
          </div>
          <p className="mt-[1mm] text-[9px] text-[#465158]">
            {es ? "Cédula profesional" : "Professional license"}: {datos.cedulaProfesional}
          </p>
          {datos.cedulaEspecialidad?.trim() && (
            <p className="text-[9px] text-[#465158]">
              {es ? "Cédula de especialidad" : "Specialty license"}: {datos.cedulaEspecialidad}
            </p>
          )}
          <p className="mt-[1mm] text-[8px] text-[#727b7e]">{es ? "Firma del odontólogo" : "Dentist's signature"}</p>
        </div>
      </section>

      {/* Contacto institucional. El margen inferior queda libre. */}
      <footer className="relative z-10 border-t border-[#9ba5a9] pt-[3mm] text-center text-[9px] leading-[1.65] text-[#38454b]">
        {direccion && <p className="break-words">{direccion}</p>}
        <div className="flex flex-wrap justify-center gap-x-[5mm] gap-y-0">
          {telefono && <span>{es ? "Tel." : "Phone"}: {telefono}</span>}
          {whatsapp && <span>WhatsApp: {whatsapp}</span>}
          {email && <span className="break-all">{email}</span>}
          {sitioWeb && <span className="break-all">{sitioWeb}</span>}
        </div>
      </footer>
    </article>
  );
}
