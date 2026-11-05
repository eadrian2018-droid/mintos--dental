type PacienteLandingItem = {
  id: number;
  nombre: string;
  telefono: string;
  correo?: string;
  created_at?: string | null;
};

type FiltroRapido = "todos" | "nuevos" | "saldo" | "tratamientos";

type PacientesLandingProps = {
  es: boolean;
  pacientes: PacienteLandingItem[];
  pacientesFiltrados: PacienteLandingItem[];
  pacientesNuevosMes: number;
  pacientesConSaldo: number;
  tratamientosPendientesGlobal: number;
  busqueda: string;
  setBusqueda: (valor: string) => void;
  busquedaTelefono: string;
  setBusquedaTelefono: (valor: string) => void;
  filtroRapido: FiltroRapido;
  setFiltroRapido: (valor: FiltroRapido) => void;
  setMostrarQR: (mostrar: boolean) => void;
  abrirPaciente: (paciente: PacienteLandingItem) => void | Promise<void>;
};

export default function PacientesLanding({
  es, pacientes, pacientesFiltrados, pacientesNuevosMes,
  pacientesConSaldo, tratamientosPendientesGlobal,
  busqueda, setBusqueda, busquedaTelefono, setBusquedaTelefono,
  filtroRapido, setFiltroRapido, setMostrarQR, abrirPaciente,
}: PacientesLandingProps) {
  return (
            <div className="h-full flex flex-col gap-5">

              <section
                className="relative overflow-hidden rounded-[24px] px-7 py-6 text-white shadow-[var(--mint-shadow-brand)]"
                style={{ background: "var(--mint-gradient-brand)" }}
              >
                <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/[0.06]" />
                <div className="absolute right-24 -bottom-28 h-52 w-52 rounded-full border border-white/10" />
                <div
                  className="absolute inset-x-0 bottom-0 h-[3px]"
                  style={{ background: "var(--mint-gradient-accent)" }}
                />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[var(--mint-gold)] shadow-[0_0_0_5px_rgba(216,189,114,0.12)]" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                        {es ? "CENTRO DE PACIENTES" : "PATIENT CENTER"}
                      </p>
                    </div>

                    <h1 className="text-[28px] font-bold leading-tight text-white">
                      {es ? "Pacientes" : "Patients"}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                      {es
                        ? "Expedientes clínicos, contacto y seguimiento del paciente en un solo lugar."
                        : "Clinical records, contact details, and patient follow-up in one place."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMostrarQR(true)}
                    className="group shrink-0 rounded-2xl border border-white/20 bg-white/[0.11] px-5 py-3 text-left text-white shadow-sm backdrop-blur-sm transition hover:bg-white/[0.18]"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                      {es ? "NUEVO INGRESO" : "NEW INTAKE"}
                    </span>
                    <span className="mt-1 block text-sm font-bold">
                      {es ? "Registro por QR  →" : "QR Registration  →"}
                    </span>
                  </button>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() =>
                    setFiltroRapido("todos")
                  }
                  aria-pressed={
                    filtroRapido === "todos"
                  }
                  className={`
                    relative overflow-hidden rounded-[18px]
                    border bg-[var(--mint-surface)]
                    px-5 py-4 text-left
                    shadow-[var(--mint-shadow-soft)]
                    transition
                    hover:-translate-y-0.5
                    hover:border-[var(--mint-border-teal)]
                    ${
                      filtroRapido === "todos"
                        ? "border-[var(--mint-teal)] ring-2 ring-[var(--mint-teal-pale)]"
                        : "border-[var(--mint-border)]"
                    }
                  `}
                >
                  <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--mint-teal)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mint-text-muted)]">
                    {es ? "Registrados" : "Registered"}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-[26px] font-bold leading-none text-[var(--mint-text-primary)]">
                      {pacientes.length}
                    </p>
                    <span className="rounded-full border border-[var(--mint-border-teal)] bg-[var(--mint-teal-pale)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--mint-teal)]">
                      {filtroRapido === "todos"
                        ? (es ? "Activo" : "Active")
                        : (es ? "Ver todos" : "View all")}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFiltroRapido("nuevos")
                  }
                  aria-pressed={
                    filtroRapido === "nuevos"
                  }
                  className={`
                    relative overflow-hidden rounded-[18px]
                    border bg-[var(--mint-surface)]
                    px-5 py-4 text-left
                    shadow-[var(--mint-shadow-soft)]
                    transition
                    hover:-translate-y-0.5
                    hover:border-[var(--mint-border-teal)]
                    ${
                      filtroRapido === "nuevos"
                        ? "border-[var(--mint-teal)] ring-2 ring-[var(--mint-teal-pale)]"
                        : "border-[var(--mint-border)]"
                    }
                  `}
                >
                  <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--mint-teal-soft)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mint-text-muted)]">
                    {es ? "Nuevos este mes" : "New this month"}
                  </p>
                  <p className="mt-2 text-[26px] font-bold leading-none text-[var(--mint-teal)]">
                    {pacientesNuevosMes}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFiltroRapido("saldo")
                  }
                  aria-pressed={
                    filtroRapido === "saldo"
                  }
                  className={`
                    relative overflow-hidden rounded-[18px]
                    border bg-[var(--mint-surface)]
                    px-5 py-4 text-left
                    shadow-[var(--mint-shadow-soft)]
                    transition
                    hover:-translate-y-0.5
                    hover:border-[var(--mint-danger)]
                    ${
                      filtroRapido === "saldo"
                        ? "border-[var(--mint-danger)] ring-2 ring-[var(--mint-teal-pale)]"
                        : "border-[var(--mint-border)]"
                    }
                  `}
                >
                  <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--mint-danger)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mint-text-muted)]">
                    {es ? "Saldo pendiente" : "Outstanding balance"}
                  </p>
                  <p className="mt-2 text-[26px] font-bold leading-none text-[var(--mint-danger)]">
                    {pacientesConSaldo}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFiltroRapido(
                      "tratamientos"
                    )
                  }
                  aria-pressed={
                    filtroRapido ===
                    "tratamientos"
                  }
                  className={`
                    relative overflow-hidden rounded-[18px]
                    border bg-[var(--mint-surface)]
                    px-5 py-4 text-left
                    shadow-[var(--mint-shadow-soft)]
                    transition
                    hover:-translate-y-0.5
                    hover:border-[var(--mint-gold)]
                    ${
                      filtroRapido === "tratamientos"
                        ? "border-[var(--mint-gold)] ring-2 ring-[var(--mint-teal-pale)]"
                        : "border-[var(--mint-border)]"
                    }
                  `}
                >
                  <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--mint-gold)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mint-text-muted)]">
                    {es ? "Tratamientos pendientes" : "Pending treatments"}
                  </p>
                  <p className="mt-2 text-[26px] font-bold leading-none text-[var(--mint-warning)]">
                    {tratamientosPendientesGlobal}
                  </p>
                </button>
              </section>

              <section className="relative overflow-hidden rounded-[22px] border border-[var(--mint-border)] bg-[var(--mint-surface)] shadow-[var(--mint-shadow-card)]">
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: "var(--mint-gradient-accent)" }}
                />

                <div className="border-b border-[var(--mint-border-soft)] px-5 pb-5 pt-6">
                  <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mint-teal)]">
                        {es ? "DIRECTORIO CLÍNICO" : "CLINICAL DIRECTORY"}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-[var(--mint-text-primary)]">
                        {es ? "Encuentra un expediente" : "Find a patient record"}
                      </h2>
                    </div>
                    <span className="w-fit rounded-full border border-[var(--mint-border-teal)] bg-[var(--mint-teal-pale)] px-3 py-1 text-[10px] font-bold text-[var(--mint-teal)]">
                      {pacientesFiltrados.length} {es ? "pacientes" : "patients"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.35fr_1fr]">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold text-[var(--mint-text-secondary)]">
                        {es ? "Buscar por nombre" : "Search by name"}
                      </span>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-[var(--mint-teal)]">⌕</span>
                        <input
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                          placeholder={es ? "Nombre del paciente..." : "Patient name..."}
                          className="w-full rounded-2xl border border-[var(--mint-border)] bg-[var(--mint-surface-soft)] py-3 pl-11 pr-4 text-sm text-[var(--mint-text-primary)] outline-none transition focus:border-[var(--mint-teal-soft)] focus:bg-white focus:ring-4 focus:ring-[var(--mint-teal-pale)]"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold text-[var(--mint-text-secondary)]">
                        {es ? "Buscar por teléfono" : "Search by phone"}
                      </span>
                      <input
                        value={busquedaTelefono}
                        onChange={(e) => setBusquedaTelefono(e.target.value)}
                        placeholder={es ? "Ej. 653 123 4567" : "E.g. 653 123 4567"}
                        className="w-full rounded-2xl border border-[var(--mint-border)] bg-[var(--mint-surface-soft)] px-4 py-3 text-sm text-[var(--mint-text-primary)] outline-none transition focus:border-[var(--mint-teal-soft)] focus:bg-white focus:ring-4 focus:ring-[var(--mint-teal-pale)]"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-b border-[var(--mint-border-soft)] bg-[var(--mint-surface-soft)] px-5 py-3">
                  <p className="text-xs font-semibold text-[var(--mint-text-secondary)]">
                    {es ? "Selecciona un paciente para entrar a su expediente clínico" : "Select a patient to open their clinical record"}
                  </p>
                  {(busqueda || busquedaTelefono || filtroRapido !== "todos") && (
                    <button
                      type="button"
                      onClick={() => {
                        setBusqueda("");
                        setBusquedaTelefono("");
                        setFiltroRapido("todos");
                      }}
                      className="shrink-0 text-xs font-bold text-[var(--mint-teal)] hover:text-[var(--mint-navy-soft)]"
                    >
                      {es ? "Limpiar búsqueda" : "Clear search"}
                    </button>
                  )}
                </div>

                {pacientesFiltrados.length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--mint-border-teal)] bg-[var(--mint-teal-pale)] text-lg font-bold text-[var(--mint-teal)]">⌕</div>
                    <p className="mt-3 text-sm font-bold text-[var(--mint-text-primary)]">
                      {es ? "No encontramos pacientes" : "No patients found"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--mint-text-secondary)]">
                      {es ? "Prueba con otro nombre o número de teléfono." : "Try another name or phone number."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--mint-border-soft)]">
                    {pacientesFiltrados.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => abrirPaciente(p)}
                        className="group grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 text-left transition hover:bg-[var(--mint-surface-teal)] md:grid-cols-[44px_minmax(220px,1.4fr)_minmax(180px,1fr)_90px_150px]"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--mint-border-teal)] bg-[var(--mint-teal-pale)] text-sm font-bold text-[var(--mint-teal)] transition group-hover:scale-[1.03]">
                          {p.nombre?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--mint-text-primary)]">{p.nombre}</p>
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mint-text-muted)] md:hidden">
                            {es ? "Expediente" : "Record"} #{p.id}
                          </p>
                        </div>

                        <div className="hidden min-w-0 md:block">
                          <p className="truncate text-xs font-semibold text-[var(--mint-text-secondary)]">
                            {p.telefono || (es ? "Sin teléfono" : "No phone")}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-[var(--mint-text-muted)]">
                            {p.correo || (es ? "Sin correo registrado" : "No email on file")}
                          </p>
                        </div>

                        <div className="hidden text-right md:block">
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mint-text-muted)]">
                            {es ? "Expediente" : "Record"}
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-[var(--mint-text-primary)]">#{p.id}</p>
                        </div>

                        <span className="hidden items-center justify-center rounded-xl border border-[var(--mint-border-teal)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--mint-teal)] shadow-sm transition group-hover:border-[var(--mint-teal)] group-hover:bg-[var(--mint-teal)] group-hover:text-white md:flex">
                          {es ? "Abrir expediente  →" : "Open record  →"}
                        </span>

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mint-teal)] text-white md:hidden">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

            </div>
  );
}