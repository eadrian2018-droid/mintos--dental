import { useEffect, useRef, useState } from "react";

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
  moneda_laboratorio: "MXN" | "USD";
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
  const [especialistaHabilitado, setEspecialistaHabilitado] = useState(false);
  // Los importes históricos de un tratamiento en edición no se recalculan
  // sin una acción explícita. Los tratamientos nuevos usan el tarifario.
  const [contextoCalculoAutomatico, setContextoCalculoAutomatico] = useState<string | null>(null);
  const [honorariosManuales, setHonorariosManuales] = useState(false);
  // Identifica el tratamiento para evitar recalcular un importe guardado al
  // reabrir el modal, incluso si la sesión anterior usaba cálculo automático.
  const contextoActual = editandoIndex === null
    ? "nuevo"
    : `editar:${tratamientos[editandoIndex]?.id ?? editandoIndex}`;
  const calculoAutomaticoActivo = contextoCalculoAutomatico === contextoActual;
  useEffect(() => {
    if (!mostrarModalTratamiento) {
      setContextoCalculoAutomatico(null);
      return;
    }
    setEspecialistaHabilitado(Boolean(nuevoTratamiento.especialista_id));
    setContextoCalculoAutomatico(editandoIndex === null ? "nuevo" : null);
    setHonorariosManuales(false);
  }, [mostrarModalTratamiento, editandoIndex]);
  const tratamientoId = catalogoTratamientos.find((item: any) => item.nombre === nuevoTratamiento.tratamiento)?.id;
  const especialistaExterno = doctores.find((item: any) => String(item.id) === String(nuevoTratamiento.especialista_id));
  const tarifasEspecialista = especialistasDisponibles.filter((tarifa: any) =>
    String(tarifa.doctor_id) === String(especialistaExterno?.id) &&
    String(tarifa.tratamiento_id) === String(tratamientoId) && tarifa.activo
  );
  // Mantener la misma prioridad de moneda que tenía el modal.
  const tarifaSeleccionada = tarifasEspecialista.find((item: any) => item.moneda === "MXN") ||
    tarifasEspecialista.find((item: any) => item.moneda === "USD");
  const costoUnitario = Number(tarifaSeleccionada?.costo);
  const cantidadActual = Number(nuevoTratamiento.cantidad);
  const tarifaValida = Boolean(tarifaSeleccionada) && Number.isFinite(costoUnitario) && costoUnitario >= 0;
  const cantidadValida = Number.isSafeInteger(cantidadActual) && cantidadActual >= 1;
  const totalTarifa = tarifaValida && cantidadValida
    ? Math.round(costoUnitario * cantidadActual * 100) / 100
    : null;
  const costosBloqueados = Boolean(editandoIndex !== null && (() => {
    const existente = tratamientos[editandoIndex];
    return existente && (
      existente.estado === "Finalizado" ||
      Number(existente.pagado ?? existente.pago ?? 0) !== 0 ||
      Number(existente.descuento ?? 0) !== 0 ||
      Number(existente.descuento_original ?? 0) !== 0 ||
      existente.comision_autorizada_at != null ||
      existente.comision_autorizada_por != null
    );
  })());
  useEffect(() => {
    if (!mostrarModalTratamiento || !calculoAutomaticoActivo || honorariosManuales || costosBloqueados ||
        !especialistaExterno || !tratamientoId || !tarifaValida || totalTarifa === null ||
        !Number.isFinite(totalTarifa)) return;
    const solicitud = ++tarifaRequestRef.current;
    if (solicitud !== tarifaRequestRef.current) return;
    setNuevoTratamiento((prev) => {
      // Nunca aplicar una tarifa de otro especialista o tratamiento.
      const catalogoActual = catalogoTratamientos.find((item: any) => item.nombre === prev.tratamiento);
      if (String(prev.especialista_id) !== String(especialistaExterno.id) ||
          String(catalogoActual?.id) !== String(tratamientoId) ||
          Number(prev.cantidad) !== cantidadActual) return prev;
      const importe = String(totalTarifa);
      const moneda = tarifaSeleccionada.moneda as "MXN" | "USD";
      const idTarifa = Number(tarifaSeleccionada.id);
      if (prev.especialista === importe && prev.moneda_especialista === moneda &&
          prev.especialista_tratamiento_id === idTarifa &&
          prev.especialista_nombre === String(especialistaExterno.nombre)) return prev;
      return { ...prev, especialista: importe, moneda_especialista: moneda,
        especialista_nombre: String(especialistaExterno.nombre),
        especialista_tratamiento_id: idTarifa };
    });
  }, [mostrarModalTratamiento, calculoAutomaticoActivo, honorariosManuales,
      especialistaExterno?.id, tratamientoId, especialistasDisponibles,
      cantidadActual, tarifaValida, totalTarifa, costosBloqueados,
      setNuevoTratamiento, catalogoTratamientos]);
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
            p-2
            sm:p-4
          "
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mintos-tratamiento-modal-titulo"
            className="
              flex
              w-full
              max-w-5xl
              max-h-[calc(100vh-1rem)]
              max-h-[calc(100dvh-1rem)]
              flex-col
              overflow-hidden
              rounded-[24px]
              border
              border-white/20
              bg-[var(--mint-surface)]
              shadow-[0_28px_80px_rgba(15,42,65,0.30)]
              sm:max-h-[calc(100vh-2rem)]
              sm:max-h-[calc(100dvh-2rem)]
            "
          >
            <h2
              id="mintos-tratamiento-modal-titulo"
              className="
                shrink-0
                text-xl
                font-bold
                text-white
                px-6
                py-4
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

            {/* Distribución en dos paneles: desplazamiento interno solo en pantallas pequeñas. */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
              <p className="mb-4 text-sm mint-text-secondary">
                {es
                  ? "Registra la información clínica del tratamiento."
                  : "Enter the clinical information for this treatment."}
              </p>
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5">
                {/* Panel izquierdo: datos clínicos y precio. */}
                <section
                  aria-labelledby="mintos-tratamiento-datos"
                  className="min-w-0 rounded-2xl border border-[var(--mint-border)] bg-[var(--mint-surface)] p-4"
                >
                  <h3 id="mintos-tratamiento-datos" className="mb-4 text-base font-bold mint-text-primary">
                    {es ? "Datos del tratamiento" : "Treatment details"}
                  </h3>
                  <div className="grid gap-3">
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
                          setDoctorSeleccionado(doctor || null);
                          setNuevoTratamiento((prev) => ({ ...prev, doctor: doctor?.nombre || "" }));
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
                          setHonorariosManuales(false);
                          setContextoCalculoAutomatico(contextoActual);
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
                  </div>
                </section>

                {/* Panel derecho: costos y notas independientes del doctor comisionista. */}
                <section
                  aria-labelledby="mintos-tratamiento-costos"
                  className="min-w-0 rounded-2xl border border-[var(--mint-border)] bg-[var(--mint-surface)] p-4"
                >
                  <h3 id="mintos-tratamiento-costos" className="mb-4 text-base font-bold mint-text-primary">
                    {es ? "Costos y notas clínicas" : "Costs and clinical notes"}
                  </h3>
                  <div className="grid gap-3">
                    {/* Costos independientes del doctor responsable de comisión. */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold mint-text-primary">
                        {es ? "Costo de laboratorio" : "Laboratory cost"}
                      </label>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <input type="number" min="0" step="0.01" className="mint-input w-full p-3"
                          value={nuevoTratamiento.laboratorio} disabled={costosBloqueados}
                          onChange={(e) => setNuevoTratamiento((prev) => ({ ...prev, laboratorio: e.target.value }))} />
                        <select className="mint-input p-3" value={nuevoTratamiento.moneda_laboratorio}
                          disabled={costosBloqueados}
                          onChange={(e) => setNuevoTratamiento((prev) => ({ ...prev, moneda_laboratorio: e.target.value as "MXN" | "USD" }))}>
                          <option value="MXN">MXN</option><option value="USD">USD</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--mint-border-teal)] bg-[var(--mint-surface-teal)] p-4">
                      <label className="flex items-center gap-3 text-sm font-semibold mint-text-primary">
                        <input type="checkbox" checked={especialistaHabilitado} disabled={costosBloqueados}
                          onChange={(e) => {
                            setEspecialistaHabilitado(e.target.checked);
                            setHonorariosManuales(false);
                            setContextoCalculoAutomatico(contextoActual);
                            setNuevoTratamiento((prev) => ({ ...prev,
                            especialista_id: e.target.checked ? prev.especialista_id : "",
                            especialista_nombre: e.target.checked ? prev.especialista_nombre : "",
                            especialista: e.target.checked ? prev.especialista : "",
                            especialista_tratamiento_id: e.target.checked ? prev.especialista_tratamiento_id : null,
                            moneda_especialista: e.target.checked ? prev.moneda_especialista : "MXN",
                          })); }} />
                        {es ? "Especialista externo (opcional)" : "External specialist (optional)"}
                      </label>
                      {especialistaHabilitado && <select className="mint-input mt-3 w-full p-3" disabled={costosBloqueados}
                        value={nuevoTratamiento.especialista_id}
                        onChange={(e) => {
                          const especialista = doctores.find((d: any) => String(d.id) === e.target.value);
                          setHonorariosManuales(false);
                          setContextoCalculoAutomatico(contextoActual);
                          setNuevoTratamiento((prev) => ({ ...prev,
                            especialista_id: especialista ? String(especialista.id) : "",
                            especialista_nombre: especialista?.nombre || "",
                            especialista: "", especialista_tratamiento_id: null, moneda_especialista: "MXN",
                          }));
                        }}>
                        <option value="">{es ? "Sin especialista externo" : "No external specialist"}</option>
                        {doctores.filter((d: any) => d.tipo_doctor === "especialista" || d.tipo_doctor === "ambos" || String(d.id) === String(nuevoTratamiento.especialista_id)).map((d: any) => (
                          <option key={d.id} value={String(d.id)}>{d.nombre}</option>
                        ))}
                      </select>}
                      {Boolean(nuevoTratamiento.especialista_id) && (
                        <div className="mt-3">
                          {tarifaValida ? (
                            <p className="mb-2 text-xs mint-text-secondary">
                              {es ? "Tarifa unitaria" : "Unit fee"}: {costoUnitario.toLocaleString(es ? "es-MX" : "en-US", { style: "currency", currency: tarifaSeleccionada.moneda })}
                              {" × "}{cantidadValida ? cantidadActual : "—"}
                              {" = "}{totalTarifa !== null ? totalTarifa.toLocaleString(es ? "es-MX" : "en-US", { style: "currency", currency: tarifaSeleccionada.moneda }) : "—"}
                            </p>
                          ) : (
                            <p className="mb-2 text-xs mint-text-muted">
                              {es ? "Sin tarifa configurada: captura el total manualmente." : "No configured fee: enter the total manually."}
                            </p>
                          )}
                          <label className="mb-2 block text-sm font-semibold mint-text-primary">
                            {es ? "Honorarios totales del especialista" : "Total specialist fee"}
                          </label>
                          <div className="grid grid-cols-[1fr_auto] gap-2">
                            <input type="number" min="0" step="0.01" className="mint-input w-full p-3"
                              value={nuevoTratamiento.especialista} disabled={costosBloqueados}
                              onChange={(e) => {
                                setHonorariosManuales(true);
                                setNuevoTratamiento((prev) => ({ ...prev,
                                  especialista: e.target.value, especialista_tratamiento_id: null,
                                }));
                              }} />
                            <select className="mint-input p-3" value={nuevoTratamiento.moneda_especialista}
                              disabled={costosBloqueados}
                              onChange={(e) => {
                                setHonorariosManuales(true);
                                setNuevoTratamiento((prev) => ({ ...prev,
                                  moneda_especialista: e.target.value as "MXN" | "USD", especialista_tratamiento_id: null,
                                }));
                              }}>
                              <option value="MXN">MXN</option><option value="USD">USD</option>
                            </select>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs mint-text-muted">
                            <span>
                              {honorariosManuales
                                ? (es ? "Importe ajustado manualmente" : "Manually adjusted amount")
                                : calculoAutomaticoActivo && tarifaValida
                                  ? (es ? "Cálculo automático" : "Automatic calculation")
                                  : (es ? "Importe registrado" : "Saved amount")}
                            </span>
                            {tarifaValida && !costosBloqueados && (honorariosManuales || !calculoAutomaticoActivo) && (
                              <button type="button" className="font-semibold text-[var(--mint-primary)] underline underline-offset-2"
                                onClick={() => {
                                  setHonorariosManuales(false);
                                  setContextoCalculoAutomatico(contextoActual);
                                }}>
                                {es ? "Usar cálculo automático" : "Use automatic calculation"}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
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
                          min-h-[96px]
                          w-full
                          resize-y
                        "
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Acciones fijas al pie del modal, fuera del área desplazable. */}
            <div
              className="
                flex
                shrink-0
                flex-wrap
                justify-end
                gap-3
                border-t
                border-[var(--mint-border)]
                bg-[var(--mint-surface)]
                px-6
                py-4
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