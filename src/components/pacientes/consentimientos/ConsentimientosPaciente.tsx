type ConsentimientosPacienteProps = {
  es: boolean;
  pacienteAbierto: {
    consentimiento_firmado?: boolean | null;
    texto_consentimiento?: string | null;
    firma_paciente?: string | null;
  } | null;
};

export default function ConsentimientosPaciente({
  es,
  pacienteAbierto,
}: ConsentimientosPacienteProps) {
  return (
            <div className="
              rounded-[22px]
              border border-[var(--mint-border-teal)]
              bg-[var(--mint-surface)]
              p-6
              shadow-[var(--mint-shadow-card)]
            ">
              <div className="
                flex flex-col gap-4
                md:flex-row md:items-start md:justify-between
              ">
                <div>
                  <h3 className="
                    text-xl font-bold mint-text-primary
                  ">
                    {es
                      ? "Consentimiento informado"
                      : "Informed consent"}
                  </h3>

                  <p className="
                    mt-1 text-sm mint-text-secondary
                  ">
                    {es
                      ? "Consentimiento y firma registrados durante el ingreso."
                      : "Consent and signature recorded during intake."}
                  </p>
                </div>

                <span className={`
                  inline-flex self-start rounded-full
                  border px-3 py-1 text-xs font-bold
                  ${
                    pacienteAbierto?.consentimiento_firmado
                      ? "border-[var(--mint-border-teal)] bg-[var(--mint-surface-teal)] mint-text-brand"
                      : "border-[var(--mint-border)] bg-[var(--mint-bg-soft)] mint-text-secondary"
                  }
                `}>
                  {pacienteAbierto?.consentimiento_firmado
                    ? (es ? "Firmado" : "Signed")
                    : (es ? "No firmado" : "Not signed")}
                </span>
              </div>

              {pacienteAbierto?.texto_consentimiento && (
                <div className="
                  mt-5 max-h-52 overflow-y-auto
                  rounded-2xl
                  border border-[var(--mint-border)]
                  bg-[var(--mint-bg-soft)]
                  p-4 text-sm leading-6
                  mint-text-secondary whitespace-pre-wrap
                ">
                  {pacienteAbierto.texto_consentimiento}
                </div>
              )}

              {pacienteAbierto?.firma_paciente ? (
                <div className="mt-5">
                  <p className="
                    mb-2 text-xs font-semibold uppercase
                    tracking-wide mint-text-muted
                  ">
                    {es
                      ? "Firma del paciente"
                      : "Patient signature"}
                  </p>

                  <div className="
                    inline-flex max-w-full rounded-2xl
                    border border-[var(--mint-border)]
                    bg-white p-3
                  ">
                    <img
                      src={pacienteAbierto.firma_paciente}
                      alt={
                        es
                          ? "Firma del paciente"
                          : "Patient signature"
                      }
                      className="
                        max-h-40 max-w-full object-contain
                      "
                    />
                  </div>
                </div>
              ) : (
                <p className="
                  mt-5 text-sm mint-text-muted
                ">
                  {es
                    ? "No hay firma digital registrada."
                    : "No digital signature is recorded."}
                </p>
              )}
            </div>
  );
}
