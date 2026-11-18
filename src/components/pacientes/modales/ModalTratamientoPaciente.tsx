import { useEffect, useRef } from "react";

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
  especialista_tratamiento_id: number | null;
  especialista_nombre: string;
  moneda_especialista: "MXN" | "USD";
  comision_banco: string;
  total: string;
  cantidad: number;
  precio_unitario: string;
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
  const tarifaRequestRef = useRef(0);
  const doctorId = doctorSeleccionado?.id;
  const tratamientoId = catalogoTratamientos.find((item: any) => item.nombre === nuevoTratamiento.tratamiento)?.id;
  useEffect(() => {
    if (!mostrarModalTratamiento || editandoIndex !== null) return;
    const solicitud = ++tarifaRequestRef.current;
    const doctor = doctores.find((item: any) => String(item.id) === String(doctorId));
    const esEspecialista = doctor?.tipo_doctor === "especialista" || doctor?.tipo_doctor === "ambos";
    const tarifas = especialistasDisponibles.filter((tarifa: any) =>
      String(tarifa.doctor_id) === String(doctorId) &&
      String(tarifa.tratamiento_id) === String(tratamientoId) && tarifa.activo
    );
    // Las tarifas se cargan en el padre; una vez disponibles se aplica una sola vez
    // por selección. Un cambio manual posterior no se sobreescribe.
    if (!esEspecialista || !tratamientoId) return;
    const tarifa = tarifas.find((item: any) => item.moneda === "MXN") || tarifas.find((item: any) => item.moneda === "USD");
    if (!tarifa) return;
    if (solicitud !== tarifaRequestRef.current) return;
    setNuevoTratamiento((prev) => {
      if (prev.especialista !== "") return prev;
      return {
        ...prev,
        especialista: String(tarifa.costo),
        moneda_especialista: tarifa.moneda as "MXN" | "USD",
        especialista_id: String(doctorId),
        especialista_nombre: String(doctor.nombre),
        especialista_tratamiento_id: Number(tarifa.id),
      };
    });
  }, [mostrarModalTratamiento, editandoIndex, doctorId, tratamientoId, doctores, especialistasDisponibles, setNuevoTratamiento]);
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

              {/* DOCTOR: un único responsable por tratamiento. */}
              <div>
                <label className="mb-2 block text-sm font-semibold mint-text-primary">
                  {es ? "Doctor" : "Doctor"}
                </label>
                <select
                  className="mint-input w-full p-3"
                  value={doctorSeleccionado?.id != null ? String(doctorSeleccionado.id) : ""}
                  onChange={(e) => {
                    const doctor = doctores.find((item: any) => String(item.id) === e.target.value);
                    const esEspecialista = doctor?.tipo_doctor === "especialista" || doctor?.tipo_doctor === "ambos";
                    setDoctorSeleccionado(doctor || null);
                    setNuevoTratamiento((prev) => ({
                      ...prev,
                      doctor: doctor?.nombre || "",
                      especialista_id: esEspecialista ? String(doctor.id) : "",
                      especialista_nombre: esEspecialista ? String(doctor.nombre) : "",
                      especialista: "",
                      especialista_tratamiento_id: null,
                      moneda_especialista: "MXN",
                    }));
                  }}
                >
                  <option value="">{es ? "Seleccionar doctor" : "Select doctor"}</option>
                  {doctores.map((doctor: any) => (
                    <option key={doctor.id} value={doctor.id}>{doctor.nombre}</option>
                  ))}
                </select>
              </div>

              {/* TRATAMIENTO: exclusivamente del catálogo general. */}
              <div>
                <label className="mb-2 block text-sm font-semibold mint-text-primary">
                  {es ? "Tratamiento" : "Treatment"}
                </label>
                <select
                  className="mint-input w-full p-3"
                  value={nuevoTratamiento.tratamiento}
                  onChange={(e) => {
                    const tratamiento = catalogoTratamientos.find((item: any) => item.nombre === e.target.value);
                    if (!tratamiento) return;
                    const precioMXN = Number(tratamiento.precio_mxn ?? 0);
                    const precioUSD = Number(tratamiento.precio_usd ?? 0);
                    const soloUSD = precioUSD > 0 && !(precioMXN > 0);
                    const monedaPrecio = soloUSD ? "USD" : "MXN";
                    const precioUnitario = soloUSD ? precioUSD : precioMXN;
                    setNuevoTratamiento((prev) => ({
                      ...prev,
                      tratamiento: tratamiento.nombre,
                      total: String(Math.round(Number(prev.cantidad || 1) * precioUnitario * 100) / 100),
                      precio_unitario: String(precioUnitario),
                      moneda: monedaPrecio,
                      moneda_precio: monedaPrecio,
                      pagado: "0",
                      especialista: "",
                      especialista_tratamiento_id: null,
                    }));
                  }}
                  disabled={!doctorSeleccionado}
                >
                  <option value="">{es ? "Seleccionar tratamiento" : "Select treatment"}</option>
                  {nuevoTratamiento.tratamiento && !catalogoTratamientos.some((item: any) => item.nombre === nuevoTratamiento.tratamiento) && (
                    <option value={nuevoTratamiento.tratamiento}>{nuevoTratamiento.tratamiento}</option>
                  )}
                  {catalogoTratamientos.map((item: any) => (
                    <option key={item.id} value={item.nombre}>{item.nombre}</option>
                  ))}
                </select>
              </div>

              {/* CANTIDAD Y PRECIO UNITARIO */}
              {(() => {
                const existente = editandoIndex !== null ? tratamientos[editandoIndex] : null;
                const bloqueado = Boolean(existente && (
                  existente.estado === "Finalizado" ||
                  Number(existente.pagado ?? existente.pago ?? 0) !== 0 ||
                  Number(existente.descuento ?? 0) !== 0 ||
                  Number(existente.descuento_original ?? 0) !== 0 ||
                  existente.comision_autorizada_at != null ||
                  existente.comision_autorizada_por != null
                ));
                const catalogo = catalogoTratamientos.find((item: any) => item.nombre === nuevoTratamiento.tratamiento);
                const precio = editandoIndex !== null
                  ? Number(nuevoTratamiento.precio_unitario || 0)
                  : Number(nuevoTratamiento.moneda_precio === "USD" ? catalogo?.precio_usd ?? 0 : catalogo?.precio_mxn ?? 0);
                const cantidad = Number(nuevoTratamiento.cantidad);
                const moneda = nuevoTratamiento.moneda_precio === "USD" ? "USD" : "MXN";
                const formato = (valor: number) => Number.isFinite(valor)
                  ? valor.toLocaleString(es ? "es-MX" : "en-US", { style: "currency", currency: moneda })
                  : "—";
                return (
                  <div className="rounded-2xl border border-[var(--mint-border-teal)] bg-[var(--mint-surface-teal)] p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold mint-text-primary">{es ? "Cantidad" : "Quantity"}</label>
                        <input type="number" min="1" step="1" required className="mint-input w-full p-3"
                          disabled={bloqueado}
                          value={nuevoTratamiento.cantidad}
                          onChange={(e) => setNuevoTratamiento((prev) => ({ ...prev, cantidad: Number(e.target.value) }))} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold mint-text-primary">{es ? "Precio unitario" : "Unit price"} ({moneda})</label>
                        <div className="mint-input w-full p-3" aria-label={es ? "Precio unitario" : "Unit price"}>{formato(precio)}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--mint-border-teal)] pt-3 text-sm font-semibold mint-text-primary">
                      <span>{es ? "Total del tratamiento" : "Treatment total"}</span>
                      <span>{formato(Math.round(cantidad * precio * 100) / 100)}</span>
                    </div>
                    {bloqueado && <p className="mt-2 text-xs mint-text-muted">{es ? "Cantidad y precio bloqueados por actividad financiera o autorización." : "Quantity and price are locked due to financial activity or authorization."}</p>}
                  </div>
                );
              })()}

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

              {/* Honorarios manuales, solo para doctores clasificados como especialistas. */}
              {(doctorSeleccionado?.tipo_doctor === "especialista" ||
                (doctorSeleccionado?.tipo_doctor === "ambos" &&
                  String(nuevoTratamiento.especialista_id) === String(doctorSeleccionado?.id))) && (
                <div>
                  <label className="mb-2 block text-sm font-semibold mint-text-primary">
                    {es ? "Honorarios del especialista" : "Specialist fee"}
                  </label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mint-input w-full p-3"
                      value={nuevoTratamiento.especialista === "0" ? "" : nuevoTratamiento.especialista}
                      disabled={editandoIndex !== null && (
                        tratamientos[editandoIndex]?.estado === "Finalizado" ||
                        Number(tratamientos[editandoIndex]?.pagado ?? tratamientos[editandoIndex]?.pago ?? 0) > 0 ||
                        Number(tratamientos[editandoIndex]?.descuento ?? 0) > 0
                      )}
                      onChange={(e) => setNuevoTratamiento((prev) => ({
                        ...prev,
                        especialista: e.target.value,
                        especialista_id: String(doctorSeleccionado.id),
                        especialista_nombre: String(doctorSeleccionado.nombre),
                        especialista_tratamiento_id: null,
                      }))}
                    />
                    <select
                      className="mint-input p-3"
                      value={nuevoTratamiento.moneda_especialista}
                      disabled={editandoIndex !== null && (
                        tratamientos[editandoIndex]?.estado === "Finalizado" ||
                        Number(tratamientos[editandoIndex]?.pagado ?? tratamientos[editandoIndex]?.pago ?? 0) > 0 ||
                        Number(tratamientos[editandoIndex]?.descuento ?? 0) > 0
                      )}
                      onChange={(e) => setNuevoTratamiento((prev) => ({
                        ...prev,
                        moneda_especialista: e.target.value as "MXN" | "USD",
                      }))}
                    >
                      <option value="MXN">MXN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              )}

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