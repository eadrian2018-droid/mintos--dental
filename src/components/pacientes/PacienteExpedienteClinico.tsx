import Incisor from "../teeth/Incisor";
import Canino from "../teeth/Canino";
import Premolar from "../teeth/Premolar";
import Molar from "../teeth/Molar";

type PacienteExpedienteClinicoProps = {
  es: boolean;
  cargandoPresupuestosPaciente: boolean;
  expedienteClinicoBase: any;
  tratamientos: any[];
  textoEstado: (valor: any) => string;
  subirRadiografia: (archivo: File) => Promise<void>;
  imagenPreview: string;
};

export default function PacienteExpedienteClinico({
  es,
  cargandoPresupuestosPaciente,
  expedienteClinicoBase,
  tratamientos,
  textoEstado,
  subirRadiografia,
  imagenPreview,
}: PacienteExpedienteClinicoProps) {
  return (
    <div className="space-y-6 rounded-[22px] border border-[var(--mint-border-teal)] bg-[var(--mint-surface-teal)] p-4">

      <section className="overflow-hidden rounded-[24px] border border-[var(--mint-border-teal)] bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)] shadow-[var(--mint-shadow-brand)]">
        <div className="px-6 py-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">
            {es ? "Expediente clínico" : "Clinical record"}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {es ? "Estado clínico inicial" : "Initial clinical status"}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-white/75">
            {es
              ? "Vista clínica base del paciente obtenida del primer plan de tratamiento registrado en MintOS."
              : "The patient's baseline clinical view generated from the first treatment plan recorded in MintOS."}
          </p>
        </div>
        <div className="h-1 bg-[linear-gradient(90deg,#19a991_0%,#65cdb8_55%,#d8bd72_100%)]" />
      </section>

      {cargandoPresupuestosPaciente ? (
        <section className="rounded-[24px] border border-[var(--mint-border)] bg-[var(--mint-surface)] px-6 py-14 text-center text-sm mint-text-muted shadow-[var(--mint-shadow-card)]">
          {es ? "Cargando expediente clínico..." : "Loading clinical record..."}
        </section>
      ) : !expedienteClinicoBase ? (
        <section className="rounded-[24px] border border-dashed border-[var(--mint-border-teal)] bg-[var(--mint-surface)] px-6 py-12 text-center shadow-[var(--mint-shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mint-teal-pale)] text-xl font-bold text-[var(--mint-teal)]">
            +
          </div>
          <h3 className="mt-4 text-lg font-bold mint-text-primary">
            {es ? "Sin plan clínico inicial" : "No initial clinical plan"}
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm mint-text-secondary">
            {es
              ? "Cuando se guarde el primer presupuesto / plan de tratamiento del paciente, aquí aparecerá automáticamente su odontograma clínico inicial."
              : "Once the patient's first estimate / treatment plan is saved, the initial clinical odontogram will appear here automatically."}
          </p>
        </section>
      ) : (
        (() => {
          const superiores = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
          const inferiores = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
          const dientesMarcados = new Set<number>();

          (expedienteClinicoBase.items || []).forEach((item: any) => {
            if (item.arcada === "superior") {
              superiores.forEach((diente) => dientesMarcados.add(diente));
            } else if (item.arcada === "inferior") {
              inferiores.forEach((diente) => dientesMarcados.add(diente));
            } else if (Array.isArray(item.dientes) && item.dientes.length > 0) {
              item.dientes.forEach((diente: unknown) => dientesMarcados.add(Number(diente)));
            } else if (item.diente) {
              String(item.diente)
                .split(/[,\s]+/)
                .map((valor) => Number(valor))
                .filter((valor) => Number.isFinite(valor))
                .forEach((diente) => dientesMarcados.add(diente));
            }
          });

          const fechaBase = expedienteClinicoBase.fecha || expedienteClinicoBase.created_at;

          return (
            <>
              <section className="overflow-hidden rounded-[24px] border border-[var(--mint-border-teal)] bg-[var(--mint-surface)] shadow-[var(--mint-shadow-card)]">
                <div className="flex flex-col gap-3 border-b border-[var(--mint-border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold mint-text-primary">
                      {es ? "Odontograma clínico inicial" : "Initial clinical odontogram"}
                    </h3>
                    <p className="mt-1 text-sm mint-text-secondary">
                      {es
                        ? "Los dientes resaltados corresponden al plan de tratamiento inicial del paciente."
                        : "Highlighted teeth correspond to the patient's initial treatment plan."}
                    </p>
                  </div>
                  {fechaBase && (
                    <div className="rounded-xl border border-[var(--mint-border-teal)] bg-[var(--mint-teal-pale)] px-3 py-2 text-xs font-bold text-[var(--mint-teal)]">
                      {new Date(fechaBase).toLocaleDateString(es ? "es-MX" : "en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>

                <div className="px-4 py-5 sm:px-6 sm:py-6">
                  <div className="rounded-[22px] border border-[var(--mint-border)] bg-[var(--mint-surface-soft)] px-3 py-5 sm:px-5">
                    <div className="mx-auto w-full max-w-[1120px]">
                      {(() => {
                        const renderDienteClinico = (numero: number, superior: boolean) => {
                          const marcado = dientesMarcados.has(numero);
                          const colorMarcado = "#63c8b2";
                          const colorNormal = "#ffffff";
                          const colores = {
                            oclusal: marcado ? colorMarcado : colorNormal,
                            vestibular: marcado ? colorMarcado : colorNormal,
                            distal: marcado ? colorMarcado : colorNormal,
                            mesial: marcado ? colorMarcado : colorNormal,
                          };

                          const propsDiente = {
                            colores,
                            invertido: superior,
                            onZonaClick: () => {},
                          };

                          let dienteVisual;

                          if ([11, 12, 21, 22, 31, 32, 41, 42].includes(numero)) {
                            dienteVisual = <Incisor {...propsDiente} />;
                          } else if ([13, 23, 33, 43].includes(numero)) {
                            dienteVisual = <Canino {...propsDiente} />;
                          } else if ([14, 15, 24, 25, 34, 35, 44, 45].includes(numero)) {
                            dienteVisual = <Premolar {...propsDiente} />;
                          } else {
                            dienteVisual = <Molar {...propsDiente} />;
                          }

                          return (
                            <div
                              key={numero}
                              className={`min-w-0 rounded-xl px-0.5 py-1.5 text-center transition ${
                                marcado
                                  ? "bg-[var(--mint-teal-pale)] ring-1 ring-inset ring-[var(--mint-border-teal)]"
                                  : ""
                              }`}
                            >
                              <div className="pointer-events-none mx-auto flex h-[94px] w-full max-w-[54px] items-center justify-center overflow-hidden [&>svg]:block [&>svg]:h-full [&>svg]:w-full">
                                {dienteVisual}
                              </div>
                              <span
                                className={`mt-1 block text-[10px] font-bold leading-none ${
                                  marcado
                                    ? "text-[var(--mint-teal)]"
                                    : "mint-text-muted"
                                }`}
                              >
                                {numero}
                              </span>
                            </div>
                          );
                        };

                        return (
                          <div className="space-y-5">
                            <div>
                              <div className="mb-2 flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] mint-text-muted">
                                  {es ? "Maxilar superior" : "Upper arch"}
                                </span>
                                <div className="h-px flex-1 bg-[var(--mint-border)]" />
                              </div>
                              <div
                                className="grid items-end gap-[2px]"
                                style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
                              >
                                {superiores.map((numero) =>
                                  renderDienteClinico(numero, true)
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 px-1">
                              <div className="h-px flex-1 bg-[var(--mint-border-teal)]" />
                              <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--mint-teal)]">
                                {es ? "Línea oclusal" : "Occlusal line"}
                              </span>
                              <div className="h-px flex-1 bg-[var(--mint-border-teal)]" />
                            </div>

                            <div>
                              <div
                                className="grid items-start gap-[2px]"
                                style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
                              >
                                {inferiores.map((numero) =>
                                  renderDienteClinico(numero, false)
                                )}
                              </div>
                              <div className="mt-2 flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] mint-text-muted">
                                  {es ? "Maxilar inferior" : "Lower arch"}
                                </span>
                                <div className="h-px flex-1 bg-[var(--mint-border)]" />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs mint-text-secondary">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded border border-[var(--mint-teal)] bg-[var(--mint-teal-soft)]" />
                      {es ? "Incluido en plan inicial" : "Included in initial plan"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded border border-[var(--mint-border)] bg-white" />
                      {es ? "Sin hallazgo registrado" : "No recorded finding"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-[var(--mint-border-teal)] bg-[var(--mint-surface)] shadow-[var(--mint-shadow-card)]">
                <div className="border-b border-[var(--mint-border)] px-6 py-5">
                  <h3 className="text-lg font-bold mint-text-primary">
                    {es ? "Hallazgos y tratamiento recomendado" : "Findings and recommended treatment"}
                  </h3>
                  <p className="mt-1 text-sm mint-text-secondary">
                    {es
                      ? "Información clínica tomada del plan inicial del paciente."
                      : "Clinical information taken from the patient's initial plan."}
                  </p>
                </div>

                <div className="divide-y divide-[var(--mint-border)]">
                  {(expedienteClinicoBase.items || []).map((item: any, index: number) => {
                    const etiquetaDiente = item.arcada === "superior"
                      ? (es ? "Arcada superior" : "Upper arch")
                      : item.arcada === "inferior"
                        ? (es ? "Arcada inferior" : "Lower arch")
                        : Array.isArray(item.dientes) && item.dientes.length > 0
                          ? item.dientes.join(", ")
                          : item.diente || "—";

                    return (
                      <div key={item.id || index} className="grid gap-3 px-6 py-4 md:grid-cols-[150px_1fr] md:items-center">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mint-text-muted">
                            {es ? "Diente / Arcada" : "Tooth / Arch"}
                          </p>
                          <p className="mt-1 font-bold text-[var(--mint-teal)]">
                            {etiquetaDiente}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mint-text-muted">
                            {es ? "Tratamiento recomendado" : "Recommended treatment"}
                          </p>
                          <p className="mt-1 font-semibold mint-text-primary">
                            {item.tratamiento || "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {expedienteClinicoBase.notas && (
                  <div className="border-t border-[var(--mint-border)] bg-[var(--mint-surface-soft)] px-6 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] mint-text-muted">
                      {es ? "Observaciones iniciales" : "Initial notes"}
                    </p>
                    <p className="mt-1 text-sm mint-text-primary">
                      {expedienteClinicoBase.notas}
                    </p>
                  </div>
                )}
              </section>
            </>
          );
        })()
      )}

      <section className="overflow-hidden rounded-[24px] border border-[var(--mint-border-teal)] bg-[var(--mint-surface)] shadow-[var(--mint-shadow-card)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--mint-border)] px-6 py-5">
          <div>
            <h3 className="text-lg font-bold mint-text-primary">
              {es ? "Evolución clínica" : "Clinical progression"}
            </h3>
            <p className="mt-1 text-sm mint-text-secondary">
              {es
                ? "Tratamientos realizados o registrados después del plan clínico inicial."
                : "Treatments performed or recorded after the initial clinical plan."}
            </p>
          </div>
          <span className="rounded-xl border border-[var(--mint-border-teal)] bg-[var(--mint-teal-pale)] px-3 py-2 text-xs font-bold text-[var(--mint-teal)]">
            {tratamientos.length}
          </span>
        </div>

        {tratamientos.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm mint-text-muted">
            {es ? "Aún no hay tratamientos registrados." : "No treatments have been recorded yet."}
          </div>
        ) : (
          <div className="divide-y divide-[var(--mint-border)]">
            {tratamientos.map((tratamiento: any) => (
              <div key={tratamiento.id} className="grid gap-3 px-6 py-4 md:grid-cols-[130px_1fr_180px_130px] md:items-center">
                <div className="text-sm mint-text-secondary">
                  {tratamiento.fecha
                    ? new Date(`${tratamiento.fecha}T12:00:00`).toLocaleDateString(es ? "es-MX" : "en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </div>
                <div>
                  <p className="font-semibold mint-text-primary">{tratamiento.tratamiento || "—"}</p>
                  {tratamiento.notas && <p className="mt-1 text-xs mint-text-muted">{tratamiento.notas}</p>}
                </div>
                <div className="text-sm mint-text-secondary">{tratamiento.doctor || "—"}</div>
                <div className="md:text-right">
                  <span className="inline-flex rounded-lg border border-[var(--mint-border)] bg-[var(--mint-surface-soft)] px-2.5 py-1 text-[11px] font-bold mint-text-secondary">
                    {textoEstado(tratamiento.estado)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[var(--mint-border-teal)] bg-[var(--mint-surface)] shadow-[var(--mint-shadow-card)]">
        <div className="border-b border-[var(--mint-border)] px-6 py-5">
          <h3 className="text-lg font-bold mint-text-primary">
            {es ? "Radiografías / Fotos clínicas" : "X-rays / Clinical photos"}
          </h3>
          <p className="mt-1 text-sm mint-text-secondary">
            {es
              ? "Material clínico asociado al expediente del paciente."
              : "Clinical material associated with the patient record."}
          </p>
        </div>

        <div className="p-6">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (!archivo) return;
              subirRadiografia(archivo);
            }}
            className="mint-input w-full p-2 text-sm"
          />

          {imagenPreview ? (
            <button
              type="button"
              onClick={() => window.open(imagenPreview, "_blank", "noopener,noreferrer")}
              className="mt-5 block w-full overflow-hidden rounded-2xl border border-[var(--mint-border)] bg-[var(--mint-surface-soft)] p-2 text-left"
            >
              <img
                src={imagenPreview}
                alt={es ? "Radiografía" : "X-ray"}
                className="max-h-[520px] w-full rounded-xl object-contain"
              />
              <p className="mt-2 text-center text-xs font-semibold text-[var(--mint-teal)]">
                {es ? "Abrir imagen en tamaño completo" : "Open full-size image"}
              </p>
            </button>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[var(--mint-border)] bg-[var(--mint-surface-soft)] px-5 py-8 text-center text-sm mint-text-muted">
              {es ? "No hay radiografías o fotos cargadas." : "No X-rays or photos uploaded."}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
