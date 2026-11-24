import type { CargoAdicional } from "../../services/cargosAdicionales.service";
import { useState, type Dispatch, type SetStateAction } from "react";
import { supabase } from "../../lib/supabase";
import { registrarBitacora } from "../../lib/registrarBitacora";
import PresupuestoForm from "../presupuestos/PresupuestoForm";

export type PacienteGeneralProps = {
  tabActiva: any;
  mostrarFormularioPresupuestoPaciente: any;
  pacienteAbierto: any;
  setMostrarFormularioPresupuestoPaciente: Dispatch<SetStateAction<any>>;
  guardarPresupuestoPaciente: any;
  es: any;
  tratamientos: any[];
  saldoMonetarioMXN: any;
  tipoCambioCobro: any;
  puedeCrearTratamientos: any;
  setMostrarModalTratamiento: Dispatch<SetStateAction<any>>;
  puedeCambiarEstadoTratamientos: any;
  actualizarEstadoTratamiento: any;
  puedeRegistrarCobros: any;
  abrirModalCobro: any;
  abrirLiquidacionGlobal: () => void;
  abrirCobroGeneral: () => void;
  cargosAdicionales: CargoAdicional[];
  cargosListos: boolean;
  puedeConsultarCargos: boolean;
  setNuevoTratamiento: Dispatch<SetStateAction<any>>;
  setDoctorSeleccionado: Dispatch<SetStateAction<any>>;
  doctores: any;
  setEditandoIndex: Dispatch<SetStateAction<any>>;
  puedeAnularTratamientos: any;
  puedeArchivarTratamientos: boolean;
  setTratamientos: Dispatch<SetStateAction<any>>;
  puedeAgregarNotasClinicas: any;
  doctorNotaId: any;
  setDoctorNotaId: Dispatch<SetStateAction<any>>;
  nuevaNotaClinica: any;
  setNuevaNotaClinica: Dispatch<SetStateAction<any>>;
  guardarNotaClinica: any;
  notasClinicas: any;
  notaCorrigiendoId: any;
  doctorCorreccionId: any;
  setDoctorCorreccionId: Dispatch<SetStateAction<any>>;
  textoCorreccionNota: any;
  setTextoCorreccionNota: Dispatch<SetStateAction<any>>;
  setNotaCorrigiendoId: Dispatch<SetStateAction<any>>;
  guardarCorreccionNotaClinica: any;
};

export default function PacienteGeneral({
  tabActiva,
  mostrarFormularioPresupuestoPaciente,
  pacienteAbierto,
  setMostrarFormularioPresupuestoPaciente,
  guardarPresupuestoPaciente,
  es,
  tratamientos,
  saldoMonetarioMXN,
  tipoCambioCobro,
  puedeCrearTratamientos,
  setMostrarModalTratamiento,
  puedeCambiarEstadoTratamientos,
  actualizarEstadoTratamiento,
  puedeRegistrarCobros,
  abrirModalCobro,
  abrirLiquidacionGlobal,
  abrirCobroGeneral,
  cargosAdicionales,
  cargosListos,
  puedeConsultarCargos,
  setNuevoTratamiento,
  setDoctorSeleccionado,
  doctores,
  setEditandoIndex,
  puedeArchivarTratamientos,
  setTratamientos,
  puedeAgregarNotasClinicas,
  doctorNotaId,
  setDoctorNotaId,
  nuevaNotaClinica,
  setNuevaNotaClinica,
  guardarNotaClinica,
  notasClinicas,
  notaCorrigiendoId,
  doctorCorreccionId,
  setDoctorCorreccionId,
  textoCorreccionNota,
  setTextoCorreccionNota,
  setNotaCorrigiendoId,
  guardarCorreccionNotaClinica,
}: PacienteGeneralProps) {
  const [monedaResumen, setMonedaResumen] = useState<"MXN" | "USD">("MXN");
  const fxResumen = Number(tipoCambioCobro);
  const fxValidoResumen = Number.isFinite(fxResumen) && fxResumen > 0;
  const conceptos = [
    ...tratamientos.map(t => ({ moneda: t.moneda_precio === "USD" ? "USD" : "MXN", total: Number(t.total_original ?? t.total ?? 0), pagado: Number(t.pagado_original ?? t.pagado ?? t.pago ?? 0), pendiente: Number(t.resta_original ?? t.resta ?? 0) })),
    ...cargosAdicionales.map(c => ({ moneda: c.moneda, total: c.total_cargo, pagado: c.total_pagado, pendiente: c.saldo_pendiente }))
  ];
  const resumen = (moneda: "MXN" | "USD") => conceptos.filter(c => c.moneda === moneda).reduce((a,c) => ({ total: a.total+c.total, pagado: a.pagado+c.pagado, pendiente: a.pendiente+c.pendiente }), {total:0,pagado:0,pendiente:0});
  const mxn = resumen("MXN");
  const usd = resumen("USD");
  const formato = (n: number, m: "MXN" | "USD") => `${n.toLocaleString(es ? "es-MX" : "en-US", {minimumFractionDigits:2, maximumFractionDigits:2})} ${m}`;
  const resumenDisponible = !puedeConsultarCargos || cargosListos;
  const haySaldo = conceptos.some(c => c.pendiente > 0.005);
  return (
    <>

{
  tabActiva ===
  "general" && (

    <div className="
      space-y-6
      rounded-[22px]
      border
      border-[var(--mint-border-teal)]
      bg-[var(--mint-surface-teal)]
      p-4
    ">

    {mostrarFormularioPresupuestoPaciente ? (
      <PresupuestoForm
        pacientes={pacienteAbierto ? [{ id: pacienteAbierto.id, nombre: pacienteAbierto.nombre }] : []}
        pacienteInicialId={pacienteAbierto?.id ?? null}
        bloquearPaciente={true}
        onCancelar={() => setMostrarFormularioPresupuestoPaciente(false)}
        onGuardar={guardarPresupuestoPaciente}
      />
    ) : (
      <div className="overflow-hidden rounded-[22px] border border-[var(--mint-border-teal)] bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)] shadow-[var(--mint-shadow-brand)]">
        <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mint-teal-soft)]">
              {es ? "VALORACIÓN" : "ASSESSMENT"}
            </p>
            <h3 className="mt-1 text-xl font-bold text-white">
              {es ? "Plan de tratamiento / Presupuesto" : "Treatment plan / Estimate"}
            </h3>
            <p className="mt-1 text-sm text-white/70">
              {es
                ? "Registra una sola vez los hallazgos y tratamientos indicados durante la valoración."
                : "Record findings and recommended treatments once during the assessment."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarFormularioPresupuestoPaciente(true)}
            className="mint-btn shrink-0 border border-white/20 bg-white px-5 py-2.5 font-bold text-[var(--mint-navy)] shadow-sm hover:bg-white/90"
          >
            {es ? "+ Crear presupuesto" : "+ Create estimate"}
          </button>
        </div>
        <div className="h-[3px] bg-[linear-gradient(90deg,var(--mint-teal-soft)_0%,var(--mint-gold)_100%)]" />
      </div>
    )}

    <div className="
      grid
      grid-cols-1
      md:grid-cols-3
      gap-4
    ">

     <div className="
  mint-card-accent
  p-5
">

        <div className="
          flex
          items-center
          justify-between
          gap-4
        ">

          <div>

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              mint-text-muted
            ">
              {es ? "Tratamientos" : "Treatments"}
            </p>

            <h3 className="
              text-3xl
              font-bold
              mint-text-primary
              mt-2
            ">
              {tratamientos.length}
            </h3>

            <p className="
              text-sm
              mint-text-secondary
              mt-1
            ">
              {es ? "Registrados" : "Registered"}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-[var(--mint-primary-light)]
            flex
            items-center
            justify-center
            text-[var(--mint-primary)]
            font-bold
            text-lg
          ">
            #
          </div>

        </div>

      </div>

      <div className="
        mint-card-success
        p-5
      ">

        <div className="
          flex
          items-center
          justify-between
          gap-4
        ">

          <div>

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              mint-text-muted
            ">
              {es ? "Total Pagado" : "Total Paid"}
            </p>

            <h3 className="
              text-3xl
              font-bold
              text-[var(--mint-success)]
              mt-2
            ">
              {resumenDisponible ? formato(mxn.pagado, "MXN") : "—"}
              {resumenDisponible && usd.pagado !== 0 && <span className="block text-base">{formato(usd.pagado, "USD")}</span>}
            </h3>

            <p className="
              text-sm
              mint-text-secondary
              mt-1
            ">
              {es ? "Pagos recibidos" : "Payments received"}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-[var(--mint-success-bg)]
            flex
            items-center
            justify-center
            text-[var(--mint-success)]
            font-bold
            text-xl
          ">
            $
          </div>

        </div>

      </div>

      <div className="
        mint-card-danger
        p-5
      ">

        <div className="
          flex
          items-center
          justify-between
          gap-4
        ">

          <div>

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              mint-text-muted
            ">
              {es ? "Saldo Pendiente" : "Outstanding Balance"}
            </p>

            <h3 className="
              text-3xl
              font-bold
              text-[var(--mint-danger)]
              mt-2
            ">
              {resumenDisponible ? formato(mxn.pendiente, "MXN") : "—"}
              {resumenDisponible && usd.pendiente !== 0 && <span className="block text-base">{formato(usd.pendiente, "USD")}</span>}
            </h3>
            {resumenDisponible && fxValidoResumen && usd.pendiente !== 0 && <p className="text-sm mint-text-secondary">≈ {formato(mxn.pendiente + usd.pendiente * fxResumen, "MXN")}</p>}
            <p className="
              text-sm
              mint-text-secondary
              mt-1
            ">
              {es ? "Por cobrar" : "Outstanding"}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-[var(--mint-danger-bg)]
            flex
            items-center
            justify-center
            text-[var(--mint-danger)]
            font-bold
            text-xl
          ">
            $
          </div>

        </div>

      </div>

    </div>

      <div className="
        mint-card
        overflow-hidden
      ">

        <div className="
          flex
          items-center
          justify-between
          p-5
          border-b
          border-[var(--mint-border)]
        ">

          <h3 className="
            text-xl
            font-bold
            mint-text-primary
          ">

            {es ? "Tratamientos" : "Treatments"}

          </h3>

          <div className="flex flex-wrap items-center justify-end gap-2">
          {
            puedeCrearTratamientos && (

              <button
                onClick={() =>
                  setMostrarModalTratamiento(
                    true
                  )
                }
                className="
                  mint-btn
                  mint-btn-primary
                  px-4
                  py-2
                  text-sm
                "
              >

                {es ? "+ Agregar" : "+ Add"}

              </button>

            )
          }
          </div>

        </div>

        <div className="
          overflow-x-auto
        ">

          <table className="
            w-full
            min-w-[1050px]
          ">

            <thead>

              <tr className="
                bg-[var(--mint-bg-soft)]
                border-b
                border-[var(--mint-border)]
              ">

                <th className="
                  p-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Fecha" : "Date"}
                </th>

                <th className="
                  p-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Tratamiento" : "Treatment"}
                </th>

                <th className="
                  p-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Doctor" : "Doctor"}
                </th>

                <th className="
                  p-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Total" : "Total"}
                </th>

                <th className="
                  p-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Pagado" : "Paid"}
                </th>

                <th className="
                  p-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Pendiente" : "Pending"}
                </th>

                <th className="
                  p-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Estado" : "Status"}
                </th>

                <th className="
                  p-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-secondary
                ">
                  {es ? "Acciones" : "Actions"}
                </th>

              </tr>

            </thead>

            <tbody>

              {

                tratamientos.length === 0

                  ? (

                    <tr>

                      <td
                        colSpan={8}
                        className="
                          text-center
                          p-10
                          mint-text-muted
                        "
                      >
                        {es ? "No hay tratamientos registrados" : "No treatments registered"}
                      </td>

                    </tr>

                  )

                  : (

                    tratamientos.map(
                      (
                        tratamiento,
                        index
                      ) => (

                        <tr
                          key={
                            tratamiento.id ||
                            index
                          }
                          className="
                            border-b
                            border-[var(--mint-border)]
                            hover:bg-[var(--mint-bg-soft)]
                            transition-colors
                          "
                        >

                          <td className="
                            p-4
                            text-sm
                            mint-text-secondary
                            whitespace-nowrap
                          ">

                            {
                              tratamiento.fecha ||
                              "-"
                            }

                          </td>

                          <td className="
                            p-4
                          ">

                            <p className="
                              font-semibold
                              mint-text-primary
                            ">
                              {
                                tratamiento.tratamiento ||
                                "-"
                              }
                            </p>
                            <p className="mt-1 text-xs mint-text-secondary">
                              {es ? "Cantidad" : "Quantity"}: {Number(tratamiento.cantidad ?? 1)}
                              {" · "}
                              {es ? "Precio unitario" : "Unit price"}: {tratamiento.precio_unitario == null
                                ? (es ? "Histórico" : "Legacy")
                                : `${Number(tratamiento.precio_unitario).toLocaleString(es ? "es-MX" : "en-US", { style: "currency", currency: tratamiento.moneda_precio === "USD" ? "USD" : "MXN" })}`}
                            </p>

                            {
                              tratamiento.notas && (

                                <p className="
                                  text-xs
                                  mint-text-muted
                                  mt-1
                                  max-w-[260px]
                                  truncate
                                ">
                                  {tratamiento.notas}
                                </p>

                              )
                            }

                          </td>

                          <td className="
                            p-4
                            text-sm
                            mint-text-secondary
                            whitespace-nowrap
                          ">

                            {
                              tratamiento.doctor ||
                              "-"
                            }

                          </td>

                          <td className="
                            p-4
                            text-right
                            text-sm
                            font-semibold
                            mint-text-primary
                            whitespace-nowrap
                          ">

                            $
                            {
                              Number(
                                tratamiento.moneda_precio === "USD"
                                  ? tratamiento.total_original ??
                                    tratamiento.total ??
                                    0
                                  : tratamiento.total || 0
                              ).toLocaleString()
                            }
                            {" "}
                            {
                              tratamiento.moneda_precio ||
                              "MXN"
                            }

                          </td>

                          <td className="
                            p-4
                            text-right
                            text-sm
                            font-semibold
                            text-[var(--mint-success)]
                            whitespace-nowrap
                          ">

                            $
                            {
                              Number(
                                tratamiento.moneda_precio === "USD"
                                  ? tratamiento.pagado_original ??
                                    tratamiento.pagado ??
                                    0
                                  : tratamiento.pagado || 0
                              ).toLocaleString()
                            }
                            {" "}
                            {
                              tratamiento.moneda_precio ||
                              "MXN"
                            }

                          </td>

                          <td className="
                            p-4
                            text-right
                            text-sm
                            font-semibold
                            text-[var(--mint-danger)]
                            whitespace-nowrap
                          ">

                            $
                            {
                              Number(
                                tratamiento.moneda_precio === "USD"
                                  ? tratamiento.resta_original ??
                                    tratamiento.resta ??
                                    0
                                  : saldoMonetarioMXN(tratamiento)
                              ).toLocaleString()
                            }
                            {" "}
                            {
                              tratamiento.moneda_precio ||
                              "MXN"
                            }

                          </td>

                          <td className="
                            p-4
                          ">

                            {
                              tratamiento.estado ===
                              "Finalizado"

                                ? (

                                  <span className="
                                    inline-flex
                                    bg-[var(--mint-success-bg)]
                                    text-[var(--mint-success)]
                                    border
                                    border-[var(--mint-success-border)]
                                    px-3
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-semibold
                                    whitespace-nowrap
                                  ">
                                    {es ? "Finalizado" : "Completed"}
                                  </span>

                                )

                                : tratamiento.estado ===
                                  "En proceso"

                                  ? (

                                    <span className="
                                      inline-flex
                                      bg-[var(--mint-info-bg)]
                                      text-[var(--mint-info)]
                                      border
                                      border-[var(--mint-info-border)]
                                      px-3
                                      py-1
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      whitespace-nowrap
                                    ">
                                      {es ? "En proceso" : "In progress"}
                                    </span>

                                  )

                                  : tratamiento.estado ===
                                    "Confirmado"

                                    ? (

                                      <span className="
                                        inline-flex
                                        bg-[var(--mint-primary-soft)]
                                        text-[var(--mint-primary)]
                                        border
                                        border-[var(--mint-border-primary)]
                                        px-3
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-semibold
                                        whitespace-nowrap
                                      ">
                                        {es ? "Confirmado" : "Confirmed"}
                                      </span>

                                    )

                                    : tratamiento.estado ===
                                      "Cancelado"

                                      ? (

                                        <span className="
                                          inline-flex
                                          bg-[var(--mint-bg-muted)]
                                          text-[var(--mint-text-secondary)]
                                          border
                                          border-[var(--mint-border)]
                                          px-3
                                          py-1
                                          rounded-full
                                          text-xs
                                          font-semibold
                                          whitespace-nowrap
                                        ">
                                          {es ? "Cancelado" : "Cancelled"}
                                        </span>

                                      )

                                      : (

                                        <span className="
                                          inline-flex
                                          bg-[var(--mint-warning-bg)]
                                          text-[var(--mint-warning)]
                                          border
                                          border-[var(--mint-warning-border)]
                                          px-3
                                          py-1
                                          rounded-full
                                          text-xs
                                          font-semibold
                                          whitespace-nowrap
                                        ">
                                          {es ? "Pendiente" : "Pending"}
                                        </span>

                                      )
                            }

                          </td>

                          <td className="
                            p-4
                          ">

                            <div className="
                              flex
                              justify-end
                              items-center
                              gap-2
                            ">

                              {
                                puedeCambiarEstadoTratamientos &&
                                tratamiento.estado !== "Finalizado" && (

                                  <select
                                    value={
                                      tratamiento.estado ||
                                      "Pendiente"
                                    }
                                    onChange={(e) =>
                                      actualizarEstadoTratamiento(
                                        tratamiento.id,
                                        e.target.value
                                      )
                                    }
                                    className="
                                      mint-input
                                      px-3
                                      py-2
                                      text-xs
                                    "
                                  >

                                    <option value="Pendiente">
                                      {es ? "Pendiente" : "Pending"}
                                    </option>

                                    <option value="Confirmado">
                                      {es ? "Confirmado" : "Confirmed"}
                                    </option>

                                    <option value="En proceso">
                                      {es ? "En proceso" : "In progress"}
                                    </option>

                                    <option value="Finalizado">
                                      {es ? "Finalizado" : "Completed"}
                                    </option>

                                    <option value="Cancelado">
                                      {es ? "Cancelado" : "Cancelled"}
                                    </option>

                                  </select>

                                )
                              }

                              {
                                ((String(tratamiento.moneda_precio || "MXN") === "USD"
                                  ? Number(tratamiento.resta_original ??
                                      (Number(tratamiento.total_original ?? 0) - Number(tratamiento.pagado_original ?? 0))) > 0
                                  : saldoMonetarioMXN(tratamiento) > 0) ||
                                  (puedeConsultarCargos && cargosListos &&
                                    !tratamiento.archivado &&
                                    (tratamiento.estado === "Pendiente" || tratamiento.estado === "En proceso") &&
                                    cargosAdicionales.some(c =>
                                      Number(c.tratamiento_id) === Number(tratamiento.id) &&
                                      Number(c.paciente_id) === Number(pacienteAbierto?.id) &&
                                      (c.estado === "Pendiente" || c.estado === "Parcial") &&
                                      c.saldo_pendiente > 0.005))) && (

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!puedeRegistrarCobros) {
                                        alert(es
                                          ? "Tu usuario no tiene permiso para registrar cobros. Revisa Configuración → Usuarios y Roles."
                                          : "Your account does not have permission to record payments. Check Settings → Users and Roles.");
                                        return;
                                      }
                                      abrirModalCobro(tratamiento);
                                    }}
                                    title={!puedeRegistrarCobros
                                      ? (es ? "Sin permiso para registrar cobros" : "No permission to record payments")
                                      : undefined}
                                    className="
                                      mint-btn
                                      mint-btn-action
                                      px-3
                                      py-2
                                      text-xs
                                    "
                                  >
                                    {es ? "Registrar cobro" : "Record payment"}
                                  </button>

                                )
                              }

                              {
                                puedeCrearTratamientos &&
                                puedeCambiarEstadoTratamientos &&
                                tratamiento.estado !== "Finalizado" && (

                                  <button
                                    type="button"
                                    onClick={() => {

                                      setNuevoTratamiento({
  ...tratamiento,
  especialista_tratamiento_id: tratamiento.especialista_tratamiento_id ?? null,
  especialista_id: tratamiento.especialista_id == null ? "" : String(tratamiento.especialista_id),
  especialista: String(tratamiento.especialista ?? "0"),
  cantidad: Number(tratamiento.cantidad ?? 1),
  precio_unitario: String(tratamiento.precio_unitario ??
    (Number(tratamiento.total_original ?? tratamiento.total ?? 0) / Number(tratamiento.cantidad ?? 1))),
  total: String(tratamiento.moneda_precio === "USD"
    ? tratamiento.total_original ?? tratamiento.total ?? 0
    : tratamiento.total ?? 0),
});

                                      setDoctorSeleccionado(
                                        doctores.find((d: any) =>
                                          String(d.id) === String(tratamiento.doctor_id)
                                        ) || null
                                      );

                                      setEditandoIndex(
                                        index
                                      );

                                      setMostrarModalTratamiento(
                                        true
                                      );

                                    }}
                                    className="
                                      mint-btn
                                      mint-btn-secondary
                                      px-3
                                      py-2
                                      text-xs
                                    "
                                  >
                                    {es ? "Editar" : "Edit"}
                                  </button>

                                )
                              }

                              {puedeArchivarTratamientos && !tratamiento.archivado && (
                                <button
                                  type="button"
                                  className="mint-btn mint-btn-danger px-3 py-2 text-xs"
                                  onClick={async (event) => {
                                    const boton = event.currentTarget;
                                    const tratamientoArchivar = tratamientos[index];
                                    if (!tratamientoArchivar?.id || boton.disabled) return;

                                    const confirmar = window.confirm(
                                      es
                                        ? "¿Archivar este tratamiento? Se ocultará del expediente activo, pero se conservarán todos los registros financieros e históricos."
                                        : "Archive this treatment? It will be hidden from the active record, but all financial and historical records will be preserved."
                                    );
                                    if (!confirmar) return;

                                    boton.disabled = true;
                                    try {
                                      const { data, error } = await supabase.rpc(
                                        "mintos_archivar_tratamiento",
                                        { p_tratamiento_id: tratamientoArchivar.id }
                                      );
                                      if (error || data !== true) {
                                        console.error("No se pudo archivar el tratamiento:", error);
                                        alert(error?.message || (es
                                          ? "No se pudo archivar el tratamiento."
                                          : "The treatment could not be archived."));
                                        return;
                                      }

                                      setTratamientos((actuales: any[]) =>
                                        actuales.filter((t: any) => t.id !== tratamientoArchivar.id)
                                      );
                                      try {
                                        await registrarBitacora({
                                          accion: "Archivar tratamiento",
                                          modulo: "Tratamientos",
                                          detalle: `Tratamiento ID: ${tratamientoArchivar.id} | Paciente ID: ${pacienteAbierto?.id || "-"} | Paciente: ${pacienteAbierto?.nombre || "-"} | Tratamiento: ${tratamientoArchivar.tratamiento || "-"}`,
                                        });
                                      } catch (errorBitacora) {
                                        console.error("Tratamiento archivado; no se pudo registrar bitácora adicional:", errorBitacora);
                                      }
                                    } finally {
                                      boton.disabled = false;
                                    }
                                  }}
                                >
                                  {es ? "Archivar" : "Archive"}
                                </button>
                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )

              }

              {cargosAdicionales.map(c => (
                <tr key={`cargo:${c.cargo_id}`} className="border-b border-[var(--mint-border)] bg-[var(--mint-bg-soft)] text-sm">
                  <td className="p-4">{new Date(c.creado_at).toLocaleDateString(es ? "es-MX" : "en-US")}</td>
                  <td className="p-4"><span className="font-semibold">{c.concepto}</span><div className="text-xs mint-text-secondary">{es ? "Cargo adicional" : "Additional charge"} · #{c.tratamiento_id}</div></td>
                  <td className="p-4">—</td>
                  <td className="p-4 text-right">{formato(c.total_cargo,c.moneda)}</td>
                  <td className="p-4 text-right">{formato(c.total_pagado,c.moneda)}</td>
                  <td className="p-4 text-right">{formato(c.saldo_pendiente,c.moneda)}</td>
                  <td className="p-4">{es ? c.estado : ({Pendiente:"Pending",Parcial:"Partial",Pagado:"Paid",Cancelado:"Cancelled"}[c.estado])}</td>
                  <td className="p-4" />
                </tr>
              ))}
              {puedeConsultarCargos && !cargosListos && <tr><td colSpan={8} className="p-3 text-sm mint-text-secondary">{es ? "Saldos adicionales no disponibles; verificando consulta." : "Additional balances unavailable; checking data."}</td></tr>}
              {tratamientos.length > 0 && (() => {
                const fx = Number(tipoCambioCobro);
                const fxValido = Number.isFinite(fx) && fx > 0;
                const tieneMXN = conceptos.some(c => c.moneda === "MXN");
                const tieneUSD = conceptos.some(c => c.moneda === "USD");
                const requiereConversion = monedaResumen === "MXN" ? tieneUSD : tieneMXN;
                const puedeMostrar = resumenDisponible && (!requiereConversion || fxValido);
                const convertir = (importeMXN: number, importeUSD: number) =>
                  monedaResumen === "MXN"
                    ? importeMXN + (fxValido ? importeUSD * fx : 0)
                    : importeUSD + (fxValido ? importeMXN / fx : 0);
                const formato = (importe: number, moneda: "MXN" | "USD") =>
                  new Intl.NumberFormat(es ? "es-MX" : "en-US", { style: "currency", currency: moneda }).format(importe);
                return (
                  <tr className="border-t-2 border-[var(--mint-border-teal)] bg-[var(--mint-surface-teal)] font-bold">
                    <td className="p-4 text-sm mint-text-secondary">—</td>
                    <td className="p-4 mint-text-primary">
                      <div>{es ? "TOTAL GENERAL" : "GRAND TOTAL"}</div>
                      <div className="mt-1 text-xs font-normal mint-text-secondary">
                        {resumenDisponible && tieneMXN && <span>MXN: {formato(mxn.pendiente, "MXN")}</span>}
                        {resumenDisponible && tieneMXN && tieneUSD && <span> · </span>}
                        {resumenDisponible && tieneUSD && <span>USD: {formato(usd.pendiente, "USD")}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-sm mint-text-secondary">—</td>
                    <td className="p-4 text-right whitespace-nowrap mint-text-primary">
                      {puedeMostrar ? formato(convertir(mxn.total, usd.total), monedaResumen) : "—"}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap text-[var(--mint-success)]">
                      {puedeMostrar ? formato(convertir(mxn.pagado, usd.pagado), monedaResumen) : "—"}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap text-[var(--mint-danger)]">
                      {puedeMostrar ? formato(convertir(mxn.pendiente, usd.pendiente), monedaResumen) : "—"}
                    </td>
                    <td className="p-4 text-sm mint-text-secondary">
                      <label className="block text-xs font-normal mb-1" htmlFor="moneda-resumen-tratamientos">
                        {es ? "Visualizar en" : "Display in"}
                      </label>
                      <select id="moneda-resumen-tratamientos" value={monedaResumen}
                        onChange={(event) => setMonedaResumen(event.target.value as "MXN" | "USD")}
                        className="rounded-lg border border-[var(--mint-border-teal)] bg-white px-2 py-1 text-sm mint-text-primary">
                        <option value="MXN">MXN</option>
                        <option value="USD">USD</option>
                      </select>
                      {requiereConversion && !fxValido && (
                        <div className="mt-1 text-xs font-normal text-[var(--mint-danger)]">
                          {es ? "Configura el tipo de cambio" : "Set an exchange rate"}
                        </div>
                      )}
                      {requiereConversion && fxValido && (
                        <div className="mt-1 text-xs font-normal mint-text-secondary">1 USD = {formato(fx, "MXN")}</div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {puedeRegistrarCobros && cargosListos && cargosAdicionales.every(c => c.saldo_pendiente <= 0.005) && tratamientos.some(t => Number(t.resta_original ?? t.resta ?? 0) > 0.005) && <button type="button" onClick={abrirCobroGeneral} className="mint-btn mint-btn-secondary px-3 py-2 text-xs whitespace-nowrap mr-2">{es ? "Cobro general" : "General payment"}</button>}
                      {puedeRegistrarCobros && cargosListos && haySaldo && (
                        <button type="button" onClick={abrirLiquidacionGlobal}
                          className="mint-btn mint-btn-primary px-3 py-2 text-xs whitespace-nowrap">
                          {es ? "Liquidar todo / Abonar" : "Settle all / Pay"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })()}

            </tbody>

          </table>

        </div>

      </div>

      <div
        className="
          rounded-[22px]
          border
          border-[var(--mint-border-teal)]
          bg-[var(--mint-surface)]
          p-5
          shadow-[var(--mint-shadow-card)]
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            mb-5
          "
        >

          <div>

            <h3
              className="
                text-lg
                font-bold
                mint-text-primary
              "
            >

              {es ? "Evolución Clínica" : "Clinical Progress"}

            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >

              {es ? "Historial de notas y observaciones clínicas del paciente." : "History of patient clinical notes and observations."}

            </p>

          </div>

        </div>

        {
          puedeAgregarNotasClinicas && (

            <div
          className="
            grid
            gap-3
            mb-6
          "
        >

          <select
            value={
              doctorNotaId
            }
            onChange={(e) =>
              setDoctorNotaId(
                e.target.value
              )
            }
            className="
              mint-input
              p-3
              w-full
              cursor-pointer
              relative
              z-10
            "
          >

            <option value="">

              {es ? "Seleccionar Doctor" : "Select Doctor"}

            </option>

            {
              doctores.map(
                (
                  doctor: any
                ) => (

                  <option
                    key={
                      doctor.id
                    }
                    value={
                      doctor.id
                    }
                  >

                    {doctor.nombre}

                  </option>

                )
              )
            }

          </select>

          <textarea
            value={
              nuevaNotaClinica
            }
            onChange={(e) =>
              setNuevaNotaClinica(
                e.target.value
              )
            }
            placeholder={es ? "Agregar nueva nota clínica..." : "Add a new clinical note..."}
            className="
              mint-input
              w-full
              p-3
              min-h-[120px]
              resize-y
            "
          />

          <div
            className="
              flex
              justify-end
            "
          >

            <button
              type="button"
              onClick={
                guardarNotaClinica
              }
              className="
                mint-btn
                mint-btn-primary
                px-5
                py-2.5
                text-sm
              "
            >

              {es ? "Guardar Nota Clínica" : "Save Clinical Note"}

            </button>

          </div>

        </div>

          )
        }

        <div
          className="
            border-t
            border-[var(--mint-border)]
            pt-5
          "
        >

          <h4
            className="
              font-bold
              mint-text-primary
              mb-4
            "
          >

            {es ? "Historial" : "History"}

          </h4>

          {

            notasClinicas.length === 0

              ? (

                <div
                  className="
                    bg-[var(--mint-bg-soft)]
                    rounded-xl
                    p-5
                    text-sm
                    mint-text-secondary
                  "
                >

                  {es ? "No hay notas clínicas registradas." : "No clinical notes recorded."}

                </div>

              )

              : (

                <div
                  className="
                    space-y-3
                  "
                >

                  {

                    notasClinicas
                      .filter(
                        (nota: any) =>
                          nota.tipo !== "correccion"
                      )
                      .map(
                        (nota: any) => {

                          const correcciones =
                            notasClinicas.filter(
                              (item: any) =>
                                item.tipo === "correccion" &&
                                Number(item.nota_original_id) ===
                                  Number(nota.id)
                            );

                          return (

                            <div
                              key={nota.id}
                              className="
                                bg-[var(--mint-bg-card)]
                                border
                                border-[var(--mint-border)]
                                rounded-2xl
                                p-4
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  justify-between
                                  gap-4
                                  mb-3
                                "
                              >

                                <div className="flex items-center gap-2">
                                  <span
                                    className="
                                      font-semibold
                                      mint-text-primary
                                    "
                                  >
                                    {nota.doctor_nombre}
                                  </span>

                                  {correcciones.length > 0 && (
                                    <span
                                      className="
                                        text-xs
                                        font-semibold
                                        px-2
                                        py-1
                                        rounded-full
                                        bg-amber-50
                                        text-amber-700
                                        border
                                        border-amber-200
                                      "
                                    >
                                      Corregida
                                    </span>
                                  )}
                                </div>

                                <span
                                  className="
                                    text-xs
                                    mint-text-secondary
                                  "
                                >
                                  {new Date(
                                    nota.created_at
                                  ).toLocaleString(
                                    "es-MX"
                                  )}
                                </span>

                              </div>

                              <p
                                className="
                                  text-sm
                                  mint-text-primary
                                  whitespace-pre-wrap
                                "
                              >
                                {nota.nota}
                              </p>

                              {correcciones.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {correcciones
                                    .slice()
                                    .sort(
                                      (a: any, b: any) =>
                                        new Date(a.created_at).getTime() -
                                        new Date(b.created_at).getTime()
                                    )
                                    .map(
                                      (correccion: any) => (
                                        <div
                                          key={correccion.id}
                                          className="
                                            rounded-xl
                                            border
                                            border-amber-200
                                            bg-amber-50/60
                                            p-4
                                          "
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                                {es ? "Corrección" : "Correction"}
                                              </span>
                                              <span className="text-sm font-semibold mint-text-primary">
                                                {correccion.doctor_nombre}
                                              </span>
                                            </div>

                                            <span className="text-xs mint-text-secondary">
                                              {new Date(
                                                correccion.created_at
                                              ).toLocaleString(
                                                "es-MX"
                                              )}
                                            </span>
                                          </div>

                                          <p className="text-sm mint-text-primary whitespace-pre-wrap">
                                            {correccion.nota}
                                          </p>

                                          <p className="text-xs mint-text-secondary mt-2">
                                            {es ? "Corrige la nota" : "Correct note"} #{nota.id}
                                          </p>
                                        </div>
                                      )
                                    )}
                                </div>
                              )}

                              {puedeAgregarNotasClinicas && (
                                <div className="mt-4">
                                  {notaCorrigiendoId === nota.id ? (
                                    <div className="grid gap-3 rounded-xl border border-[var(--mint-border)] bg-[var(--mint-bg-soft)] p-4">
                                      <div>
                                        <p className="text-sm font-semibold mint-text-primary">
                                          {es ? "Registrar corrección" : "Record correction"}
                                        </p>
                                        <p className="text-xs mint-text-secondary mt-1">
                                          {es ? "La nota original permanecerá intacta en el expediente." : "The original note will remain unchanged in the record."}
                                        </p>
                                      </div>

                                      <select
                                        value={doctorCorreccionId}
                                        onChange={(e) =>
                                          setDoctorCorreccionId(
                                            e.target.value
                                          )
                                        }
                                        className="mint-input p-3 w-full"
                                      >
                                        <option value="">
                                          {es ? "Seleccionar Doctor" : "Select Doctor"}
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

                                      <textarea
                                        value={textoCorreccionNota}
                                        onChange={(e) =>
                                          setTextoCorreccionNota(
                                            e.target.value
                                          )
                                        }
                                        placeholder={es ? "Escribe la corrección clínica..." : "Write the clinical correction..."}
                                        className="mint-input w-full p-3 min-h-[100px] resize-y"
                                      />

                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNotaCorrigiendoId(
                                              null
                                            );
                                            setTextoCorreccionNota(
                                              ""
                                            );
                                            setDoctorCorreccionId(
                                              ""
                                            );
                                          }}
                                          className="mint-btn mint-btn-secondary px-4 py-2 text-sm"
                                        >
                                          {es ? "Cancelar" : "Cancel"}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            guardarCorreccionNotaClinica(
                                              nota.id
                                            )
                                          }
                                          className="mint-btn mint-btn-primary px-4 py-2 text-sm"
                                        >
                                          {es ? "Guardar corrección" : "Save correction"}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNotaCorrigiendoId(
                                          nota.id
                                        );
                                        setTextoCorreccionNota(
                                          ""
                                        );
                                        setDoctorCorreccionId(
                                          ""
                                        );
                                      }}
                                      className="mint-btn mint-btn-secondary px-3 py-2 text-xs"
                                    >
                                      {es ? "Registrar corrección" : "Record correction"}
                                    </button>
                                  )}
                                </div>
                              )}

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

    </div>

  )
}

    </>
  );
}
