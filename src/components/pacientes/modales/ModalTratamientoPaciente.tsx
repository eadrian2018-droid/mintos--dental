import type {
  Dispatch,
  SetStateAction,
} from "react";

type NuevoTratamiento = {
  fecha: string;
  tratamiento: string;
  doctor: string;
  estado: string;
  metodo_pago: string;
  moneda: string;
  moneda_precio: "MXN" | "USD";
  laboratorio: string;
  especialista: string;
  especialista_id: string;
  especialista_nombre: string;
  moneda_especialista: "MXN" | "USD";
  comision_banco: string;
  total: string;
  pagado: string;
  notas: string;
};

type Props = {
  mostrarModalTratamiento: boolean;
  es: boolean;
  nuevoTratamiento: NuevoTratamiento;
  setNuevoTratamiento: Dispatch<
    SetStateAction<NuevoTratamiento>
  >;
  doctores: any[];
  doctorSeleccionado: any;
  setDoctorSeleccionado: Dispatch<
    SetStateAction<any>
  >;
  catalogoTratamientos: any[];
  especialistasDisponibles: any[];
  editandoIndex: number | null;
  tratamientos: any[];
  setMostrarModalTratamiento: Dispatch<
    SetStateAction<boolean>
  >;
  setEditandoIndex: Dispatch<
    SetStateAction<number | null>
  >;
  guardarTratamiento: () => Promise<void>;
};

export default function ModalTratamientoPaciente({
  mostrarModalTratamiento,
  es,
  nuevoTratamiento,
  setNuevoTratamiento,
  doctores,
  doctorSeleccionado,
  setDoctorSeleccionado,
  catalogoTratamientos,
  especialistasDisponibles,
  editandoIndex,
  tratamientos,
  setMostrarModalTratamiento,
  setEditandoIndex,
  guardarTratamiento,
}: Props) {
  return (
    <>
      {mostrarModalTratamiento && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-[rgba(15,42,65,0.62)]
            backdrop-blur-[3px]
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-xl
              overflow-hidden
              rounded-[24px]
              border
              border-white/20
              bg-[var(--mint-surface)]
              shadow-[0_28px_80px_rgba(15,42,65,0.30)]
              [&>*:not(h2)]:mx-6
            "
          >
            <h2
              className="
                text-xl
                font-bold
                text-white
                px-6
                py-5
                mb-0
                bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)]
                border-b-[3px]
                border-[var(--mint-teal-soft)]
              "
            >
              {es
                ? "Nuevo Tratamiento"
                : "New Treatment"}
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mb-5
              "
            >
              {es
                ? "Registra la información clínica del tratamiento."
                : "Enter the clinical information for this treatment."}
            </p>

            <div
              className="
                grid
                gap-4
              "
            >
              {/* FECHA */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mint-text-primary
                    mb-2
                  "
                >
                  {es ? "Fecha" : "Date"}
                </label>

                <input
                  type="date"
                  value={nuevoTratamiento.fecha}
                  onChange={(e) =>
                    setNuevoTratamiento({
                      ...nuevoTratamiento,
                      fecha: e.target.value,
                    })
                  }
                  className="
                    mint-input
                    p-3
                    w-full
                  "
                />
              </div>

              {/* DOCTOR */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mint-text-primary
                    mb-2
                  "
                >
                  {es ? "Doctor" : "Doctor"}
                </label>

                <select
                  value={
                    doctorSeleccionado?.id
                      ? String(
                          doctorSeleccionado.id
                        )
                      : ""
                  }
                  onChange={(e) => {
                    const doctor =
                      doctores.find(
                        (d: any) =>
                          String(d.id) ===
                          e.target.value
                      );

                    setDoctorSeleccionado(
                      doctor || null
                    );

                    setNuevoTratamiento({
                      ...nuevoTratamiento,
                      doctor:
                        doctor?.nombre || "",
                    });
                  }}
                  className="
                    mint-input
                    p-3
                    w-full
                  "
                >
                  <option value="">
                    {es
                      ? "Seleccionar Doctor"
                      : "Select Doctor"}
                  </option>

                  {doctores.map(
                    (doctor: any) => (
                      <option
                        key={doctor.id}
                        value={doctor.id}
                      >
                        {doctor.nombre}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* TRATAMIENTO */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mint-text-primary
                    mb-2
                  "
                >
                  {es
                    ? "Tratamiento"
                    : "Treatment"}
                </label>

                <select
                  value={
                    nuevoTratamiento.tratamiento ||
                    ""
                  }
                  onChange={(e) => {
                    const nombreTratamiento =
                      e.target.value;

                    const tratamientoSeleccionado =
                      catalogoTratamientos.find(
                        (tratamiento: any) =>
                          tratamiento.nombre ===
                          nombreTratamiento
                      );

                    if (
                      !tratamientoSeleccionado
                    ) {
                      return;
                    }

                    setNuevoTratamiento({
                      ...nuevoTratamiento,

                      tratamiento:
                        tratamientoSeleccionado.nombre,

                      moneda: "MXN",

                      moneda_precio: "MXN",

                      total: String(
                        Number(
                          tratamientoSeleccionado
                            .precio_mxn || 0
                        )
                      ),

                      pagado: "0",

                      laboratorio: "",

                      especialista: "",

                      especialista_id: "",

                      especialista_nombre: "",

                      moneda_especialista:
                        "MXN",

                      comision_banco: "0",
                    });
                  }}
                  className="
                    mint-input
                    p-3
                    w-full
                  "
                  disabled={
                    !doctorSeleccionado
                  }
                >
                  <option value="">
                    {doctorSeleccionado
                      ? es
                        ? "Seleccionar Tratamiento"
                        : "Select Treatment"
                      : es
                        ? "Selecciona primero un doctor"
                        : "Select a doctor first"}
                  </option>

                  {doctorSeleccionado
                    ? catalogoTratamientos.map(
                        (tratamiento: any) => (
                          <option
                            key={
                              tratamiento.id
                            }
                            value={
                              tratamiento.nombre
                            }
                          >
                            {
                              tratamiento.nombre
                            }
                          </option>
                        )
                      )
                    : null}
                </select>
              </div>

              {/* LABORATORIO */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mint-text-primary
                    mb-2
                  "
                >
                  {es
                    ? "Costo de laboratorio"
                    : "Laboratory cost"}{" "}
                  (MXN)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="
                    mint-input
                    p-3
                    w-full
                  "
                  value={
                    nuevoTratamiento.laboratorio ??
                    ""
                  }
                  disabled={
                    editandoIndex !== null &&
                    tratamientos[
                      editandoIndex
                    ]?.estado === "Finalizado"
                  }
                  onChange={(e) =>
                    setNuevoTratamiento({
                      ...nuevoTratamiento,
                      laboratorio:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* ESPECIALISTA */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mint-text-primary
                    mb-2
                  "
                >
                  {es
                    ? "Tarifa de especialista (opcional)"
                    : "Specialist fee (optional)"}
                </label>

                <select
                  className="
                    mint-input
                    p-3
                    w-full
                  "
                  value={
                    especialistasDisponibles.find(
                      (tarifa: any) =>
                        String(
                          tarifa.doctor_id
                        ) ===
                          String(
                            nuevoTratamiento.especialista_id
                          ) &&
                        tarifa.nombre_tratamiento ===
                          nuevoTratamiento.tratamiento &&
                        Number(
                          tarifa.costo
                        ) ===
                          Number(
                            nuevoTratamiento.especialista
                          )
                    )?.id ?? ""
                  }
                  onChange={(e) => {
                    const tarifa =
                      especialistasDisponibles.find(
                        (item: any) =>
                          String(
                            item.id
                          ) ===
                          e.target.value
                      );

                    const especialistaDoctor =
                      doctores.find(
                        (d: any) =>
                          String(d.id) ===
                          String(
                            tarifa?.doctor_id
                          )
                      );

                    setNuevoTratamiento({
                      ...nuevoTratamiento,

                      especialista_id:
                        tarifa
                          ? String(
                              tarifa.doctor_id
                            )
                          : "",

                      especialista_nombre:
                        tarifa
                          ? String(
                              especialistaDoctor?.nombre ||
                                ""
                            )
                          : "",

                      especialista:
                        tarifa
                          ? String(
                              Number(
                                tarifa.costo || 0
                              )
                            )
                          : "0",

                      moneda_especialista:
                        tarifa?.moneda ===
                        "USD"
                          ? "USD"
                          : "MXN",
                    });
                  }}
                >
                  <option value="">
                    {es
                      ? "Sin especialista"
                      : "No specialist"}
                  </option>

                  {especialistasDisponibles
                    .filter(
                      (tarifa: any) =>
                        tarifa.nombre_tratamiento ===
                        nuevoTratamiento.tratamiento
                    )
                    .map((tarifa: any) => {
                      const especialistaDoctor =
                        doctores.find(
                          (d: any) =>
                            String(d.id) ===
                            String(
                              tarifa.doctor_id
                            )
                        );

                      return (
                        <option
                          key={tarifa.id}
                          value={tarifa.id}
                        >
                          {especialistaDoctor?.nombre ||
                            (es
                              ? "Especialista"
                              : "Specialist")}
                          {` — ${tarifa.nombre_tratamiento} — ${tarifa.costo} ${tarifa.moneda || "MXN"}`}
                        </option>
                      );
                    })}
                </select>

                {nuevoTratamiento.especialista_id && (
                  <p
                    className="
                      text-xs
                      mint-text-secondary
                      mt-2
                    "
                  >
                    {es
                      ? "Costo asociado"
                      : "Associated cost"}
                    :{" "}
                    {nuevoTratamiento.especialista ||
                      0}{" "}
                    {nuevoTratamiento.moneda_especialista ||
                      "MXN"}
                  </p>
                )}

                {nuevoTratamiento.tratamiento &&
                  !especialistasDisponibles.some(
                    (tarifa: any) =>
                      tarifa.nombre_tratamiento ===
                      nuevoTratamiento.tratamiento
                  ) && (
                    <p
                      className="
                        text-xs
                        mint-text-secondary
                        mt-2
                      "
                    >
                      {es
                        ? "No hay tarifas de especialistas vinculadas a este tratamiento."
                        : "No specialist fees are linked to this treatment."}
                    </p>
                  )}
              </div>

              {/* ESTADO */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mint-text-primary
                    mb-2
                  "
                >
                  {es ? "Estado" : "Status"}
                </label>

                <select
                  value={
                    nuevoTratamiento.estado ||
                    "Pendiente"
                  }
                  onChange={(e) =>
                    setNuevoTratamiento({
                      ...nuevoTratamiento,
                      estado:
                        e.target.value,
                    })
                  }
                  className="
                    mint-input
                    p-3
                    w-full
                  "
                  disabled
                >
                  <option value="Pendiente">
                    {es
                      ? "Pendiente"
                      : "Pending"}
                  </option>
                </select>

                <p
                  className="
                    text-xs
                    mint-text-muted
                    mt-1
                  "
                >
                  {es
                    ? "El doctor podrá confirmar y actualizar el estado posteriormente."
                    : "The doctor can confirm and update the status later."}
                </p>
              </div>

              {/* NOTAS CLÍNICAS */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mint-text-primary
                    mb-2
                  "
                >
                  {es
                    ? "Notas clínicas iniciales"
                    : "Initial Clinical Notes"}
                </label>

                <textarea
                  placeholder={
                    es
                      ? "Observaciones relevantes sobre el tratamiento..."
                      : "Relevant clinical notes about the treatment..."
                  }
                  value={
                    nuevoTratamiento.notas
                  }
                  onChange={(e) =>
                    setNuevoTratamiento({
                      ...nuevoTratamiento,
                      notas:
                        e.target.value,
                    })
                  }
                  className="
                    mint-input
                    p-3
                    min-h-[120px]
                    w-full
                    resize-y
                  "
                />
              </div>
            </div>

            {/* ACCIONES */}

            <div
              className="
                flex
                justify-end
                gap-3
                mt-6
              "
            >
              <button
                type="button"
                onClick={() => {
                  setMostrarModalTratamiento(
                    false
                  );

                  setEditandoIndex(
                    null
                  );

                  setDoctorSeleccionado(
                    null
                  );
                }}
                className="
                  mint-btn
                  mint-btn-secondary
                  px-4
                  py-2
                  text-sm
                "
              >
                {es
                  ? "Cancelar"
                  : "Cancel"}
              </button>

              <button
                type="button"
                onClick={
                  guardarTratamiento
                }
                className="
                  mint-btn
                  mint-btn-primary
                  px-4
                  py-2
                  text-sm
                "
              >
                {es
                  ? "Guardar Tratamiento"
                  : "Save Treatment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}