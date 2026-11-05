import ConsentimientosPaciente from "./consentimientos/ConsentimientosPaciente";

type HistorialMedicoCambio = {
  id: number;
  paciente_id: number;
  usuario_id: string;
  alergias?: string | null;
  enfermedades?: string | null;
  medicamentos?: string | null;
  historial_clinico?: any;
  created_at: string;
  usuario_nombre?: string | null;
};

type PacienteHistorialMedicoProps = {
  es: boolean;
  pacienteAbierto: any;
  registroInicialPaciente: any;
  historialMedicoCambios: HistorialMedicoCambio[];
  cargandoHistorialMedico: boolean;
  traducirPreguntaHistorial: (id: string, preguntaGuardada: string) => string;
};

export default function PacienteHistorialMedico({
  es,
  pacienteAbierto,
  registroInicialPaciente,
  historialMedicoCambios,
  cargandoHistorialMedico,
  traducirPreguntaHistorial,
}: PacienteHistorialMedicoProps) {
  return (
    <div className="
      space-y-6
      rounded-[22px]
      border
      border-[var(--mint-border-teal)]
      bg-[var(--mint-surface-teal)]
      p-4
    ">

      {(() => {
        const historial =
  registroInicialPaciente?.historial_declarado ||
  pacienteAbierto?.historial_declarado ||
  pacienteAbierto?.historial_clinico ||
  {};

        const datosGenerales =
          historial?.datos_generales || {};

        const antecedentes =
          Array.isArray(historial?.antecedentes_medicos)
            ? historial.antecedentes_medicos
            : [];

        const habitos =
          Array.isArray(historial?.habitos_salud_oral)
            ? historial.habitos_salud_oral
            : [];

        const tieneFormularioNuevo =
          antecedentes.length > 0 ||
          habitos.length > 0 ||
          Boolean(historial?.version_formulario);

        const textoRespuesta = (valor: any) => {
          if (
            valor === true ||
            valor === "Sí" ||
            valor === "Si" ||
            valor === "sí" ||
            valor === "si"
          ) {
            return es ? "Sí" : "Yes";
          }

          if (
            valor === false ||
            valor === "No" ||
            valor === "no"
          ) {
            return "No";
          }

          return valor || "-";
        };

        const fechaNacimiento =
          pacienteAbierto?.fecha_nacimiento
            ? new Date(
                `${pacienteAbierto.fecha_nacimiento}T00:00:00`
              ).toLocaleDateString(
                es ? "es-MX" : "en-US"
              )
            : "-";

        return (
          <>
            <div className="
              rounded-[22px]
              border border-[var(--mint-border-teal)]
              bg-[var(--mint-surface)]
              p-6
              shadow-[var(--mint-shadow-card)]
            ">
              <div className="
                flex flex-col gap-2
                md:flex-row md:items-start md:justify-between
                mb-6
              ">
                <div>
                  <p className="
                    text-[10px] font-bold uppercase
                    tracking-[0.16em]
                    text-[var(--mint-primary)]
                  ">
                    {es
                      ? "INFORMACIÓN DECLARADA POR EL PACIENTE"
                      : "PATIENT-REPORTED INFORMATION"}
                  </p>

                  <h3 className="
                    text-2xl font-bold
                    mint-text-primary mt-1
                  ">
                    {es ? "Historial Médico" : "Medical History"}
                  </h3>

                  <p className="
                    text-sm mint-text-secondary mt-1
                  ">
                    {es
                      ? "Información registrada en el formulario de ingreso del paciente."
                      : "Information recorded in the patient's intake form."}
                  </p>
                </div>

                {historial?.idioma_formulario && (
                  <span className="
                    inline-flex self-start rounded-full
                    border border-[var(--mint-border-teal)]
                    bg-[var(--mint-surface-teal)]
                    px-3 py-1 text-xs font-semibold
                    mint-text-brand
                  ">
                    {es ? "Formulario" : "Form"}
                    {": "}
                    {String(historial.idioma_formulario).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="
                grid grid-cols-1 md:grid-cols-2
                xl:grid-cols-4 gap-3
              ">
                {[
                  [
                    es ? "Fecha de nacimiento" : "Date of birth",
                    fechaNacimiento,
                  ],
                  [
                    es ? "Estado civil" : "Marital status",
                    datosGenerales?.estado_civil || "-",
                  ],
                  [
                    es ? "Ocupación" : "Occupation",
                    datosGenerales?.ocupacion || "-",
                  ],
                  [
                    es ? "¿Cómo nos conoció?" : "How did you hear about us?",
                    datosGenerales?.recomendacion || "-",
                  ],
                ].map(([etiqueta, valor]) => (
                  <div
                    key={String(etiqueta)}
                    className="
                      rounded-2xl
                      border border-[var(--mint-border)]
                      bg-[var(--mint-bg-soft)] p-4
                    "
                  >
                    <p className="
                      text-xs font-semibold mint-text-muted
                    ">
                      {String(etiqueta)}
                    </p>

                    <p className="
                      mt-1 text-sm font-bold
                      mint-text-primary whitespace-pre-wrap
                    ">
                      {String(valor || "-")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="
                mt-4 rounded-2xl
                border border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)] p-4
              ">
                <p className="
                  text-xs font-semibold mint-text-muted
                ">
                  {es ? "Motivo de consulta" : "Reason for visit"}
                </p>

                <p className="
                  mt-1 text-sm font-bold
                  mint-text-primary whitespace-pre-wrap
                ">
                  {datosGenerales?.motivo_consulta || "-"}
                </p>
              </div>
            </div>

            {tieneFormularioNuevo ? (
              <>
                <div className="
                  rounded-[22px]
                  border border-[var(--mint-border-teal)]
                  bg-[var(--mint-surface)]
                  p-6
                  shadow-[var(--mint-shadow-card)]
                ">
                  <div className="mb-5">
                    <h3 className="
                      text-xl font-bold mint-text-primary
                    ">
                      {es ? "Antecedentes médicos" : "Medical history"}
                    </h3>

                    <p className="
                      mt-1 text-sm mint-text-secondary
                    ">
                      {es
                        ? "Respuestas proporcionadas directamente por el paciente."
                        : "Answers provided directly by the patient."}
                    </p>
                  </div>

                  <div className="
                    grid grid-cols-1 lg:grid-cols-2 gap-3
                  ">
                    {antecedentes.map(
                      (item: any, index: number) => (
                        <div
                          key={item?.id || `antecedente-${index}`}
                          className="
                            rounded-2xl
                            border border-[var(--mint-border)]
                            bg-[var(--mint-bg-soft)] p-4
                          "
                        >
                          <div className="
                            flex items-start justify-between gap-4
                          ">
                            <p className="
                              text-sm font-semibold mint-text-primary
                            ">
                              {traducirPreguntaHistorial(
                                String(item?.id || ""),
                                String(item?.pregunta || "")
                              )}
                            </p>

                            <span className={`
                              shrink-0 rounded-full border
                              px-2.5 py-1 text-xs font-bold
                              ${
                                textoRespuesta(item?.respuesta) ===
                                (es ? "Sí" : "Yes")
                                  ? "border-[var(--mint-border-teal)] bg-[var(--mint-surface-teal)] mint-text-brand"
                                  : "border-[var(--mint-border)] bg-[var(--mint-surface)] mint-text-secondary"
                              }
                            `}>
                              {textoRespuesta(item?.respuesta)}
                            </span>
                          </div>

                          {item?.detalle && (
                            <div className="
                              mt-3 rounded-xl
                              border border-[var(--mint-border)]
                              bg-[var(--mint-surface)]
                              px-3 py-2.5
                            ">
                              <p className="
                                text-xs font-semibold mint-text-muted
                              ">
                                {es ? "Detalle" : "Details"}
                              </p>

                              <p className="
                                mt-1 text-sm mint-text-primary
                                whitespace-pre-wrap
                              ">
                                {String(item.detalle)}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="
                  rounded-[22px]
                  border border-[var(--mint-border-teal)]
                  bg-[var(--mint-surface)]
                  p-6
                  shadow-[var(--mint-shadow-card)]
                ">
                  <div className="mb-5">
                    <h3 className="
                      text-xl font-bold mint-text-primary
                    ">
                      {es
                        ? "Hábitos y salud oral"
                        : "Oral habits and health"}
                    </h3>

                    <p className="
                      mt-1 text-sm mint-text-secondary
                    ">
                      {es
                        ? "Hábitos reportados en el formulario de ingreso."
                        : "Habits reported in the intake form."}
                    </p>
                  </div>

                  <div className="
                    grid grid-cols-1 lg:grid-cols-2 gap-3
                  ">
                    {habitos.map(
                      (item: any, index: number) => (
                        <div
                          key={item?.id || `habito-${index}`}
                          className="
                            rounded-2xl
                            border border-[var(--mint-border)]
                            bg-[var(--mint-bg-soft)] p-4
                          "
                        >
                          <div className="
                            flex items-start justify-between gap-4
                          ">
                            <p className="
                              text-sm font-semibold mint-text-primary
                            ">
                              {traducirPreguntaHistorial(
                                String(item?.id || ""),
                                String(item?.pregunta || "")
                              )}
                            </p>

                            <span className="
                              shrink-0 rounded-full border
                              border-[var(--mint-border)]
                              bg-[var(--mint-surface)]
                              px-2.5 py-1 text-xs font-bold
                              mint-text-secondary
                            ">
                              {textoRespuesta(item?.respuesta)}
                            </span>
                          </div>

                          {item?.detalle && (
                            <p className="
                              mt-3 text-sm mint-text-secondary
                              whitespace-pre-wrap
                            ">
                              {String(item.detalle)}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="
                  rounded-[22px]
                  border border-[var(--mint-border-teal)]
                  bg-[var(--mint-surface)]
                  p-6
                  shadow-[var(--mint-shadow-card)]
                ">
                  <h3 className="
                    text-xl font-bold mint-text-primary
                  ">
                    {es
                      ? "Observaciones del paciente"
                      : "Patient observations"}
                  </h3>

                  <div className="
                    mt-4 rounded-2xl
                    border border-[var(--mint-border)]
                    bg-[var(--mint-bg-soft)]
                    p-4 text-sm mint-text-primary
                    whitespace-pre-wrap
                  ">
                    {historial?.observaciones || "-"}
                  </div>
                </div>
              </>
            ) : (
              <div className="
                rounded-[22px]
                border border-[var(--mint-border-teal)]
                bg-[var(--mint-surface)]
                p-6
                shadow-[var(--mint-shadow-card)]
              ">
                <h3 className="
                  text-xl font-bold mint-text-primary mb-5
                ">
                  {es
                    ? "Historial médico anterior"
                    : "Previous medical history"}
                </h3>

                <div className="
                  grid grid-cols-1 md:grid-cols-2 gap-3
                ">
                  {[
                    [
                      es ? "Fuma" : "Smokes",
                      textoRespuesta(historial?.fuma),
                    ],
                    [
                      es ? "Consume alcohol" : "Consumes alcohol",
                      textoRespuesta(historial?.alcohol),
                    ],
                    [
                      es ? "Embarazo" : "Pregnancy",
                      textoRespuesta(historial?.embarazo),
                    ],
                  ].map(([etiqueta, valor]) => (
                    <div
                      key={String(etiqueta)}
                      className="
                        rounded-2xl
                        border border-[var(--mint-border)]
                        bg-[var(--mint-bg-soft)] p-4
                      "
                    >
                      <p className="
                        text-sm mint-text-secondary
                      ">
                        {String(etiqueta)}
                      </p>

                      <p className="
                        mt-1 font-bold mint-text-primary
                      ">
                        {String(valor)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    [
                      es ? "Alergias" : "Allergies",
                      historial?.alergias,
                    ],
                    [
                      es ? "Enfermedades" : "Conditions",
                      historial?.enfermedades,
                    ],
                    [
                      es ? "Medicamentos" : "Medications",
                      historial?.medicamentos,
                    ],
                  ].map(([etiqueta, valor]) => (
                    <div key={String(etiqueta)}>
                      <p className="
                        mb-1 text-sm mint-text-secondary
                      ">
                        {String(etiqueta)}
                      </p>

                      <div className="
                        rounded-2xl
                        border border-[var(--mint-border)]
                        bg-[var(--mint-bg-soft)]
                        p-4 mint-text-primary
                        whitespace-pre-wrap
                      ">
                        {valor ? String(valor) : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ConsentimientosPaciente es={es} pacienteAbierto={pacienteAbierto} />
          </>
        );
      })()}

      <div className="
        rounded-[22px]
        border
        border-[var(--mint-border-teal)]
        bg-[var(--mint-surface)]
        p-6
        shadow-[var(--mint-shadow-card)]
      ">

        <div className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-3
          mb-5
        ">

          <div>

            <h3 className="
              text-xl
              font-bold
              mint-text-primary
            ">
              {es ? "Historial de cambios" : "Change history"}
            </h3>

            <p className="
              text-sm
              mint-text-secondary
              mt-1
            ">
              {es ? "Versiones anteriores del historial médico." : "Previous versions of the medical history."}
              {es ? "Este registro es de solo lectura." : "This record is read-only."}
            </p>

          </div>

          <span className="
            inline-flex
            items-center
            self-start
            rounded-full
            bg-[var(--mint-primary-soft)]
            border
            border-[var(--mint-border-primary)]
            px-3
            py-1
            text-xs
            font-semibold
            mint-text-brand
          ">
            {historialMedicoCambios.length}
            {" "}
            {
              historialMedicoCambios.length === 1
                ? (es ? "versión" : "version")
                : (es ? "versiones" : "versions")
            }
          </span>

        </div>

        {
          cargandoHistorialMedico ? (

            <div className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-5
              text-sm
              mint-text-secondary
            ">
              {es ? "Cargando historial de cambios..." : "Loading change history..."}
            </div>

          ) : historialMedicoCambios.length === 0 ? (

            <div className="
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              rounded-2xl
              p-5
            ">

              <p className="
                font-semibold
                mint-text-primary
              ">
                {es ? "Sin cambios registrados" : "No changes recorded"}
              </p>

              <p className="
                text-sm
                mint-text-secondary
                mt-1
              ">
                {es
                  ? "Cuando se modifique información médica, la versión anterior aparecerá aquí automáticamente."
                  : "When medical information changes, the previous version will appear here automatically."}
              </p>

            </div>

          ) : (

            <div className="
              space-y-4
            ">

              {
                historialMedicoCambios.map(
                  (cambio, index) => {

                    const versionMasNueva =
                      index === 0
                        ? pacienteAbierto
                        : historialMedicoCambios[
                            index - 1
                          ];

                    const valorHistorial = (
                      registro: any,
                      campo: string
                    ) =>
                      registro?.[campo] ??
                      registro?.historial_clinico?.[
                        campo
                      ] ??
                      "";

                    const campos = [
                      {
                        clave: "alergias",
                        etiqueta: es ? "Alergias" : "Allergies",
                      },
                      {
                        clave: "enfermedades",
                        etiqueta: es ? "Enfermedades" : "Conditions",
                      },
                      {
                        clave: "medicamentos",
                        etiqueta: "Medicamentos",
                      },
                      {
                        clave: "fuma",
                        etiqueta: "Fuma",
                      },
                      {
                        clave: "alcohol",
                        etiqueta:
                          "Consume alcohol",
                      },
                      {
                        clave: "embarazo",
                        etiqueta: "Embarazo",
                      },
                    ];

                    const camposModificados =
                      campos.filter(
                        ({ clave }) =>
                          JSON.stringify(
                            valorHistorial(
                              cambio,
                              clave
                            )
                          ) !==
                          JSON.stringify(
                            valorHistorial(
                              versionMasNueva,
                              clave
                            )
                          )
                      );

                    return (

                      <div
                        key={cambio.id}
                        className="
                          bg-[var(--mint-bg-soft)]
                          border
                          border-[var(--mint-border)]
                          rounded-2xl
                          p-5
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          md:flex-row
                          md:items-start
                          md:justify-between
                          gap-3
                        ">

                          <div>

                            <p className="
                              font-bold
                              mint-text-primary
                            ">
                              Versión anterior
                            </p>

                            <p className="
                              text-sm
                              mint-text-secondary
                              mt-1
                            ">
                              {
                                cambio.usuario_nombre ||
                                "Usuario de MintOS"
                              }
                              {" · "}
                              {
                                new Date(
                                  cambio.created_at
                                ).toLocaleString(
                                  "es-MX",
                                  {
                                    dateStyle:
                                      "medium",
                                    timeStyle:
                                      "short",
                                  }
                                )
                              }
                            </p>

                          </div>

                          <span className="
                            inline-flex
                            self-start
                            rounded-full
                            bg-white
                            border
                            border-[var(--mint-border)]
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            mint-text-secondary
                          ">
                            Solo lectura
                          </span>

                        </div>

                        {
                          camposModificados.length > 0 && (

                            <div className="
                              mt-4
                              flex
                              flex-wrap
                              gap-2
                            ">

                              {
                                camposModificados.map(
                                  ({ clave, etiqueta }) => (

                                    <span
                                      key={clave}
                                      className="
                                        rounded-full
                                        bg-[var(--mint-primary-soft)]
                                        border
                                        border-[var(--mint-border-primary)]
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-semibold
                                        mint-text-brand
                                      "
                                    >
                                      {etiqueta} modificado
                                    </span>

                                  )
                                )
                              }

                            </div>

                          )
                        }

                        <div className="
                          mt-4
                          grid
                          grid-cols-1
                          md:grid-cols-3
                          gap-3
                        ">

                          {
                            [
                              [
                                es ? "Alergias" : "Allergies",
                                valorHistorial(
                                  cambio,
                                  "alergias"
                                ),
                              ],
                              [
                                es ? "Enfermedades" : "Conditions",
                                valorHistorial(
                                  cambio,
                                  "enfermedades"
                                ),
                              ],
                              [
                                "Medicamentos",
                                valorHistorial(
                                  cambio,
                                  "medicamentos"
                                ),
                              ],
                            ].map(
                              ([etiqueta, valor]) => (

                                <div
                                  key={String(etiqueta)}
                                  className="
                                    bg-white
                                    border
                                    border-[var(--mint-border)]
                                    rounded-xl
                                    p-3
                                  "
                                >

                                  <p className="
                                    text-xs
                                    font-semibold
                                    mint-text-muted
                                  ">
                                    {String(etiqueta)}
                                  </p>

                                  <p className="
                                    text-sm
                                    font-semibold
                                    mint-text-primary
                                    mt-1
                                    whitespace-pre-wrap
                                  ">
                                    {
                                      valor
                                        ? String(valor)
                                        : "-"
                                    }
                                  </p>

                                </div>

                              )
                            )
                          }

                        </div>

                      </div>

                    );

                  }
                )
              }

            </div>

          )
        }

      </div>

    </div>

  );
}
