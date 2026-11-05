import type { ReactNode } from "react";

type TipoDocumento = "receta" | "justificante";

export type DatosHojaMembretada = {
  clinica: string;
  titular?: string;
  subtituloMembrete?: string;
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
    ? es
      ? "Receta médica"
      : "Medical prescription"
    : es
      ? "Justificante médico"
      : "Medical certificate";

  const [anio = "", mes = "", dia = ""] =
    datos.fecha.split("-");

  const fechaOrdenada = es
    ? [
        [dia, es ? "Día" : "Day"],
        [mes, es ? "Mes" : "Month"],
        [anio, es ? "Año" : "Year"],
      ]
    : [
        [mes, "Month"],
        [dia, "Day"],
        [anio, "Year"],
      ];

  const titular =
    datos.titular?.trim() || datos.clinica;

  const subtitulo =
    datos.subtituloMembrete?.trim() || datos.clinica;

  const direccion = datos.direccion?.trim();
  const telefono = datos.telefono?.trim();
  const whatsapp = datos.whatsapp?.trim();
  const email = datos.email?.trim();
  const sitioWeb = datos.sitioWeb?.trim();

  return (
    <article
      aria-label={titulo}
      className="
        mintos-letter-sheet
        relative
        mx-auto
        h-[279.4mm]
        w-[215.9mm]
        shrink-0
        overflow-hidden
        bg-white
        px-[15mm]
        pt-[13mm]
        font-sans
        text-[#152b32]
        shadow-[0_12px_36px_rgba(0,0,0,0.12)]
      "
    >
      {/* ==========================================
          ENCABEZADO DEL RECETARIO
      ========================================== */}

      <header className="relative z-10">
        <div className="flex items-start gap-[7mm]">

          {/* LOGOTIPO IZQUIERDO */}

          <div className="flex h-[34mm] w-[35mm] shrink-0 items-center justify-center">
            {datos.logoUrl && (
              <img
                src={datos.logoUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            )}
          </div>

          {/* IDENTIDAD Y DATOS DEL CONSULTORIO */}

          <div className="min-w-0 flex-1 pt-[1mm]">

            <h1
              className="
                break-words
                font-serif
                text-[33px]
                italic
                font-normal
                leading-[1.1]
                tracking-[-0.04em]
                text-[#142f37]
              "
            >
              {titular}
            </h1>

            <p
              className="
                mt-[2mm]
                break-words
                text-[10px]
                font-bold
                uppercase
                leading-snug
                tracking-[0.11em]
                text-[#273c43]
              "
            >
              {subtitulo}
            </p>

            {direccion && (
              <p className="mt-[2mm] break-words text-[9px] leading-[1.45] text-[#34484f]">
                {direccion}
              </p>
            )}

            <div className="mt-[1mm] flex flex-wrap gap-x-[4mm] text-[9px] font-semibold leading-[1.45] text-[#263c43]">
              {telefono && (
                <span>
                  {es ? "Tel." : "Phone"} {telefono}
                </span>
              )}

              {whatsapp && (
                <span>
                  WhatsApp {whatsapp}
                </span>
              )}
            </div>

            {email && (
              <p className="mt-[1mm] break-all text-[9px] text-[#34484f]">
                {email}
              </p>
            )}

            {sitioWeb && (
              <p className="break-all text-[9px] text-[#34484f]">
                {sitioWeb}
              </p>
            )}

          </div>

          {/* FECHA SUPERIOR DERECHA */}

          <div className="w-[44mm] shrink-0 pt-[2mm]">

            <div className="overflow-hidden rounded-[4px] border border-[#294c55]">

              <div
                className="
                  bg-[#173e49]
                  py-[2mm]
                  text-center
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-white
                "
              >
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

        {/* DOBLE LÍNEA DIVISORIA */}

        <div className="mt-[6mm] space-y-[1mm]">
          <div className="h-[1.2mm] w-full bg-[#173e49]" />
          <div className="h-[0.45mm] w-full bg-[#173e49]" />
        </div>
      </header>

      {/* ==========================================
          ÁREA PRINCIPAL DE LA RECETA
      ========================================== */}

      <div className="relative z-10 mt-[5mm]">

        {/* PACIENTE */}

        <div className="mb-[5mm] flex items-end gap-[3mm] text-[11px]">
          <span className="shrink-0 font-semibold text-[#173e49]">
            {es ? "Paciente:" : "Patient:"}
          </span>

          <div className="min-w-0 flex-1 border-b border-[#84989d] pb-[1mm]">
            {datos.paciente.trim() || "\u00A0"}
          </div>
        </div>

        {/* RX O JUSTIFICANTE */}

        <main className="relative min-h-[73mm]">

          {receta ? (
            <div
              className="
                font-serif
                text-[39px]
                italic
                leading-none
                text-[#173e49]
              "
            >
              ℞
            </div>
          ) : (
            <h2
              className="
                text-[13px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-[#173e49]
              "
            >
              {titulo}
            </h2>
          )}

          {datos.contenido && (
            <div className="mt-[5mm] whitespace-pre-wrap break-words text-[12px] leading-relaxed">
              {datos.contenido}
            </div>
          )}

          {children}

        </main>
      </div>

      {/* ==========================================
          MARCA DE AGUA CENTRAL
      ========================================== */}

      {datos.logoUrl && (
        <img
          src={datos.logoUrl}
          alt=""
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[40%]
            h-[90mm]
            w-[90mm]
            -translate-x-1/2
            -translate-y-1/2
            select-none
            object-contain
            opacity-[0.055]
          "
        />
      )}

      {/* ==========================================
          FIRMA DEL ODONTÓLOGO
      ========================================== */}

      <section className="relative z-10 mt-[2mm] flex justify-end">

        <div className="w-[72mm] text-center">

          <div className="h-[10mm]" />

          <div className="border-t border-[#173e49] pt-[2mm]">

            <p className="text-[11px] font-semibold text-[#173e49]">
              {datos.odontologo}
            </p>

            {datos.especialidad?.trim() && (
              <p className="mt-[1mm] text-[9px] text-[#405960]">
                {datos.especialidad}
              </p>
            )}

            <p className="mt-[1mm] text-[9px] text-[#405960]">
              {es
                ? "Cédula profesional"
                : "Professional license"}
              : {datos.cedulaProfesional}
            </p>

            {datos.cedulaEspecialidad?.trim() && (
              <p className="text-[9px] text-[#405960]">
                {es
                  ? "Cédula de especialidad"
                  : "Specialty license"}
                : {datos.cedulaEspecialidad}
              </p>
            )}

            <p className="mt-[1mm] text-[8px] text-[#687c82]">
              {es
                ? "Firma del odontólogo"
                : "Dentist's signature"}
            </p>

          </div>
        </div>
      </section>

      {/* ==========================================
          FRANJA INSTITUCIONAL INFERIOR
      ========================================== */}

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

            {email && (
              <p className="break-all font-semibold">
                {email}
              </p>
            )}

            {sitioWeb && (
              <p className="break-all">
                {sitioWeb}
              </p>
            )}

            {whatsapp && (
              <p>
                WhatsApp: {whatsapp}
              </p>
            )}

          </div>
        </div>

        <div className="mt-[3mm] h-[0.4mm] w-full bg-[#173e49]" />

      </footer>

      {/* ==========================================
          ESPACIO INFERIOR LIBRE
          No se agregan elementos adicionales.
      ========================================== */}

    </article>
  );
}