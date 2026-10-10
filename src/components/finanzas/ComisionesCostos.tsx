import {
  useEffect,
  useState,
} from "react";

import { useLanguage } from "../../context/LanguageContext";
import { supabase } from "../../lib/supabase";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  TratamientoCatalogo,
} from "../../types/TratamientoCatalogo";

type ComisionesCostosProps = {

  doctores: Doctor[];

  catalogoTratamientos:
    TratamientoCatalogo[];

  guardarTratamientoCatalogo:
    (
      tratamiento:
        Omit<
          TratamientoCatalogo,
          "id"
        >
    ) => Promise<void>;

  actualizarTratamientoCatalogo:
    (
      id: number,
      cambios:
        Partial<
          Omit<
            TratamientoCatalogo,
            "id"
          >
        >
    ) => Promise<void>;

};

export default function ComisionesCostos({

  doctores,

  catalogoTratamientos,

  actualizarTratamientoCatalogo,

}: ComisionesCostosProps) {

  const { language } = useLanguage();
  const es = language === "es";
  const [monedaPrincipal, setMonedaPrincipal] = useState<"MXN" | "USD">("MXN");
  const [monedaSecundariaActiva, setMonedaSecundariaActiva] = useState(true);

  useEffect(() => {
    let activo = true;
    async function cargarMonedas() {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("clave, valor")
        .in("clave", ["moneda_principal", "moneda_secundaria_activa"]);
      if (error) {
        console.error("Error cargando configuración de moneda:", error);
        return;
      }
      if (!activo) return;
      const valores = Object.fromEntries(
        (data ?? []).map((fila) => [fila.clave, String(fila.valor ?? "")])
      );
      setMonedaPrincipal(valores.moneda_principal === "USD" ? "USD" : "MXN");
      setMonedaSecundariaActiva(valores.moneda_secundaria_activa !== "false");
    }
    void cargarMonedas();
    return () => { activo = false; };
  }, []);

  const mostrarMXN = monedaPrincipal === "MXN" || monedaSecundariaActiva;
  const mostrarUSD = monedaPrincipal === "USD" || monedaSecundariaActiva;

  function traducirCategoria(valor: string) {
    if (!es) return valor;
    const categorias: Record<string, string> = {
      Preventive: "Preventivo", Restorative: "Restaurativo",
      Endodontics: "Endodoncia", Periodontics: "Periodoncia",
      Surgery: "Cirugía", Prosthodontics: "Prótesis",
      Implants: "Implantes", Orthodontics: "Ortodoncia",
      Cosmetic: "Estética", Diagnostic: "Diagnóstico",
      Pediatric: "Odontopediatría", Other: "Otro",
    };
    return categorias[valor] ?? valor;
  }


  const tratamientosEspecialistas =
    catalogoTratamientos.filter(
      (tratamiento) =>
        tratamiento.tipo ===
        "especialista"
    );

  const [
    seccionActiva,
    setSeccionActiva,
  ] = useState<
    "comisiones" |
    "especialistas"
  >("comisiones");

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    tratamientoEditando,
    setTratamientoEditando,
  ] = useState<number | null>(
    null
  );

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    categoria,
    setCategoria,
  ] = useState("");

  const [
    doctorId,
    setDoctorId,
  ] = useState("");

  const [
    precioMXN,
    setPrecioMXN,
  ] = useState("");

  const [
    precioUSD,
    setPrecioUSD,
  ] = useState("");

  const [
    costoMXN,
    setCostoMXN,
  ] = useState("");

  const [
    costoUSD,
    setCostoUSD,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  function limpiarFormulario() {

    setNombre("");

    setCategoria("");

    setDoctorId("");

    setPrecioMXN("");

    setPrecioUSD("");

    setCostoMXN("");

    setCostoUSD("");

    setTratamientoEditando(
      null
    );

  }

  function cancelarFormulario() {

    limpiarFormulario();

    setMostrarFormulario(
      false
    );

  }

  function iniciarEdicion(
    tratamiento:
      TratamientoCatalogo
  ) {

    setTratamientoEditando(
      tratamiento.id
    );

    setNombre(
      tratamiento.nombre || ""
    );

    setCategoria(
      tratamiento.categoria || ""
    );

    setDoctorId(
      tratamiento.doctor_id
        ? String(
            tratamiento.doctor_id
          )
        : ""
    );

    setPrecioMXN(
      String(
        tratamiento.precio_mxn
        || 0
      )
    );

    setPrecioUSD(
      String(
        tratamiento.precio_usd
        || 0
      )
    );

    setCostoMXN(
      String(
        tratamiento
          .costo_especialista_mxn
        || 0
      )
    );

    setCostoUSD(
      String(
        tratamiento
          .costo_especialista_usd
        || 0
      )
    );

    setMostrarFormulario(
      true
    );

  }

  async function guardar() {

    if (!nombre.trim()) {

      alert(
        es ? "Ingresa el nombre del tratamiento." : "Enter the treatment name."
      );

      return;

    }

    if (!categoria.trim()) {

      alert(
        es ? "Ingresa la categoría." : "Enter a category."
      );

      return;

    }

    if (!doctorId) {

      alert(
        es ? "Selecciona un especialista." : "Select a specialist."
      );

      return;

    }

    const valorPrecioMXN =
      Number(
        precioMXN || 0
      );

    const valorPrecioUSD =
      Number(
        precioUSD || 0
      );

    const valorCostoMXN =
      Number(
        costoMXN || 0
      );

    const valorCostoUSD =
      Number(
        costoUSD || 0
      );

    if (
      valorPrecioMXN < 0 ||
      valorPrecioUSD < 0 ||
      valorCostoMXN < 0 ||
      valorCostoUSD < 0
    ) {

      alert(
        es ? "Los precios y costos no pueden ser negativos." : "Prices and costs cannot be negative."
      );

      return;

    }

    if (
      tratamientoEditando ===
      null
    ) {

      return;

    }

    setGuardando(
      true
    );

    try {

      await actualizarTratamientoCatalogo(

        tratamientoEditando,

        {

          nombre:
            nombre.trim(),

          categoria:
            categoria.trim(),

          tipo:
            "especialista",

          precio_mxn:
            valorPrecioMXN,

          precio_usd:
            valorPrecioUSD,

          costo_especialista_mxn:
            valorCostoMXN,

          costo_especialista_usd:
            valorCostoUSD,

          doctor_id:
            Number(
              doctorId
            ),

        }

      );

      cancelarFormulario();

    } catch (error) {

      console.error(
        "Error guardando tratamiento de especialista:",
        error
      );

      alert(
        es ? "No se pudo guardar el tratamiento de especialista." : "Could not save the specialist treatment."
      );

    } finally {

      setGuardando(
        false
      );

    }

  }

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="relative overflow-hidden rounded-[24px] border border-white/10 px-7 py-7 shadow-[0_16px_36px_rgba(15,42,65,0.18)]"
        style={{ background: "linear-gradient(112deg, #102f4f 0%, #1b4f68 56%, #0b8f80 100%)", color: "#ffffff" }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#63c8b2,#d8bd72)]" />
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "#9ce5d7" }}>
          {es ? "Configuración financiera" : "Financial settings"}
        </p>
        <h2 className="text-[25px] font-extrabold tracking-tight" style={{ color: "#ffffff" }}>
          {es ? "Comisiones y costos" : "Commissions and costs"}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: "#e4f4f3" }}>
          {es
            ? "Resumen de comisiones de doctores y costos configurados para especialistas."
            : "Overview of doctor commissions and configured specialist costs."}
        </p>
      </div>

      <div
        className="
          grid
          md:grid-cols-2
          gap-6
        "
      >

        <div
          className="
            mint-card-primary
            p-6
          "
        >

          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >

            {es ? "Doctores configurados" : "Configured doctors"}

          </p>

          <h3
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-primary)]
            "
          >

            {doctores.length}

          </h3>

        </div>

        <div
          className="
            mint-card-accent
            p-6
          "
        >

          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >

            {es ? "Tratamientos de especialista" : "Specialist treatments"}

          </p>

          <h3
            className="
              text-3xl
              font-bold
              mt-2
              mint-text-accent
            "
          >

            {
              tratamientosEspecialistas
                .length
            }

          </h3>

        </div>

      </div>

      <div className="rounded-[22px] border border-[var(--mint-border)] bg-[var(--mint-bg-card)] p-2 shadow-[0_8px_24px_rgba(15,42,65,0.07)]">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSeccionActiva("comisiones")}
            aria-pressed={seccionActiva === "comisiones"}
            className="rounded-[14px] border px-5 py-3.5 text-sm font-extrabold tracking-wide shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={seccionActiva === "comisiones"
              ? { background: "linear-gradient(110deg,#102f4f,#0b8f80)", color: "#ffffff", borderColor: "#0b8f80", boxShadow: "0 7px 18px rgba(11,143,128,.20)" }
              : { background: "var(--mint-bg-card)", color: "var(--mint-text-primary)", borderColor: "var(--mint-border)" }}
          >
            {es ? "Comisión por doctor" : "Commission by doctor"}
          </button>
          <button
            type="button"
            onClick={() => setSeccionActiva("especialistas")}
            aria-pressed={seccionActiva === "especialistas"}
            className="rounded-[14px] border px-5 py-3.5 text-sm font-extrabold tracking-wide shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={seccionActiva === "especialistas"
              ? { background: "linear-gradient(110deg,#102f4f,#0b8f80)", color: "#ffffff", borderColor: "#0b8f80", boxShadow: "0 7px 18px rgba(11,143,128,.20)" }
              : { background: "var(--mint-bg-card)", color: "var(--mint-text-primary)", borderColor: "var(--mint-border)" }}
          >
            {es ? "Costos de especialistas" : "Specialist costs"}
          </button>
        </div>
      </div>

      {seccionActiva === "comisiones" && (
      <div
        className="
          mint-card
          p-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
            mint-text-primary
            mb-2
          "
        >

          {es ? "Comisión por doctor" : "Commission by doctor"}

        </h3>

        <p
          className="
            mint-text-secondary
            mb-6
          "
        >

          {es
            ? "Este porcentaje se utiliza para calcular la comisión correspondiente al doctor."
            : "This percentage is used to calculate the doctor's commission."}

        </p>

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              mint-table
              w-full
              text-sm
            "
          >

            <thead
              className="
                mint-table-head
              "
            >

              <tr>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  Doctor
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  {es ? "Especialidad" : "Specialty"}
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  {es ? "Comisión" : "Commission"}
                </th>

              </tr>

            </thead>

            <tbody>

              {
                doctores.map(
                  (doctor) => (

                    <tr
                      key={
                        doctor.id
                      }
                      className="
                        mint-table-row
                      "
                    >

                      <td
                        className="
                          p-3
                          font-semibold
                          mint-text-primary
                        "
                      >

                        {doctor.nombre}

                      </td>

                      <td
                        className="
                          p-3
                          mint-text-secondary
                        "
                      >

                        {
                          doctor.especialidad
                        }

                      </td>

                      <td
                        className="
                          p-3
                        "
                      >

                        <span
                          className="
                            mint-badge
                            mint-badge-accent
                          "
                        >

                          {
                            doctor.porcentaje
                          }%

                        </span>

                      </td>

                    </tr>

                  )
                )
              }

            </tbody>

          </table>

        </div>

      </div>


      )}

      {seccionActiva === "especialistas" && (
      <div
        className="
          mint-card
          p-6
        "
      >

        <div
          className="
            mb-6
          "
        >

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
              mb-2
            "
          >

            {es ? "Costos de especialistas" : "Specialist costs"}

          </h3>

          <p
            className="
              mint-text-secondary
            "
          >

            {es
              ? "Consulta y ajusta los precios cobrados al paciente y los costos configurados para cada especialista."
              : "Review and adjust patient prices and costs configured for each specialist."}

          </p>

        </div>

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              mint-table
              w-full
              text-sm
            "
          >

            <thead
              className="
                mint-table-head
              "
            >

              <tr>

                <th className="p-3 text-left">
                  {es ? "Tratamiento" : "Treatment"}
                </th>

                <th className="p-3 text-left">
                  {es ? "Categoría" : "Category"}
                </th>

                <th className="p-3 text-left">
                  {es ? "Especialista" : "Specialist"}
                </th>

                {mostrarMXN && (
                <th className="p-3 text-left">
                  {es ? "Precio MXN" : "Price MXN"}
                </th>
                )}

                {mostrarUSD && (
                <th className="p-3 text-left">
                  {es ? "Precio USD" : "Price USD"}
                </th>
                )}

                {mostrarMXN && (
                <th className="p-3 text-left">
                  {es ? "Costo MXN" : "Cost MXN"}
                </th>
                )}

                {mostrarUSD && (
                <th className="p-3 text-left">
                  {es ? "Costo USD" : "Cost USD"}
                </th>
                )}

                <th className="p-3 text-right">
                  {es ? "Acción" : "Action"}
                </th>

              </tr>

            </thead>

            <tbody>

              {
                tratamientosEspecialistas
                  .map(
                    (
                      tratamiento
                    ) => {

                      const doctor =
                        doctores.find(
                          (item) =>
                            item.id ===
                            tratamiento
                              .doctor_id
                        );

                      return (

                        <tr
                          key={
                            tratamiento.id
                          }
                          className="
                            mint-table-row
                          "
                        >

                          <td
                            className="
                              p-3
                              font-semibold
                              mint-text-primary
                            "
                          >

                            {
                              tratamiento.nombre
                            }

                          </td>

                          <td
                            className="
                              p-3
                            "
                          >

                            <span
                              className="
                                mint-badge
                                mint-badge-muted
                              "
                            >

                              {
                                traducirCategoria(tratamiento.categoria)
                              }

                            </span>

                          </td>

                          <td
                            className="
                              p-3
                              mint-text-secondary
                            "
                          >

                            {
                              doctor?.nombre ||
                              (es ? "Sin asignar" : "Unassigned")
                            }

                          </td>

{mostrarMXN && (
                          <td
                            className="
                              p-3
                              font-semibold
                              mint-text-primary
                            "
                          >

                            $
                            {
                              Number(
                                tratamiento
                                  .precio_mxn
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>
                          )}

{mostrarUSD && (
                          <td
                            className="
                              p-3
                              font-semibold
                              mint-text-primary
                            "
                          >

                            $
                            {
                              Number(
                                tratamiento
                                  .precio_usd
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>
                          )}

{mostrarMXN && (
                          <td
                            className="
                              p-3
                              font-semibold
                              text-[var(--mint-danger)]
                            "
                          >

                            $
                            {
                              Number(
                                tratamiento
                                  .costo_especialista_mxn
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>
                          )}

{mostrarUSD && (
                          <td
                            className="
                              p-3
                              font-semibold
                              text-[var(--mint-danger)]
                            "
                          >

                            $
                            {
                              Number(
                                tratamiento
                                  .costo_especialista_usd
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>
                          )}

                          <td
                            className="
                              p-3
                              text-right
                            "
                          >

                            <button
                              type="button"
                              onClick={() =>
                                iniciarEdicion(
                                  tratamiento
                                )
                              }
                              className="
                                mint-btn
                                mint-btn-action
                                px-3
                                py-2
                              "
                            >

                              {es ? "Editar" : "Edit"}

                            </button>

                          </td>

                        </tr>

                      );

                    }
                  )
              }

              {
                tratamientosEspecialistas
                  .length === 0

                &&

                <tr>

                  <td
                    colSpan={4 + Number(mostrarMXN) * 2 + Number(mostrarUSD) * 2}
                    className="
                      p-8
                      text-center
                      mint-text-muted
                    "
                  >

                    {es
                      ? "No hay tratamientos de especialista configurados."
                      : "No specialist treatments configured."}

                  </td>

                </tr>
              }

            </tbody>

          </table>

        </div>

      </div>


      )}

      {
        mostrarFormulario &&
        tratamientoEditando !== null && (

          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-[rgba(15,42,65,0.66)]
              backdrop-blur-[3px]
              p-4
            "
            onMouseDown={(e) => {

              if (
                e.target ===
                e.currentTarget
              ) {

                cancelarFormulario();

              }

            }}
          >

            <div
              className="
                w-full
                max-w-2xl
                max-h-[92vh]
                overflow-hidden
                rounded-[24px]
                border
                border-white/20
                bg-white
                shadow-[0_30px_90px_rgba(15,42,65,0.34)]
              "
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  border-b
                  border-white/10
                  bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)]
                  px-6
                  py-5
                "
              >

                <div>

                  <p
                    className="
                      mb-1
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[var(--mint-teal-soft)]
                    "
                  >
                    {es ? "Tratamiento configurado" : "Configured treatment"}
                  </p>

                  <h4
                    className="
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    {es ? "Editar costos de especialista" : "Edit specialist costs"}
                  </h4>

                </div>

                <button
                  type="button"
                  onClick={
                    cancelarFormulario
                  }
                  disabled={
                    guardando
                  }
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/20
                    bg-white/10
                    text-lg
                    font-medium
                    text-white
                    transition
                    hover:bg-white/20
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                  aria-label={es ? "Cerrar" : "Close"}
                >
                  ×
                </button>

              </div>

              <div
                className="
                  max-h-[calc(92vh-145px)]
                  overflow-y-auto
                  bg-[var(--mint-app-bg)]
                  px-6
                  py-5
                "
              >

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-2
                  "
                >

                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {es ? "Tratamiento" : "Treatment"}
                    </label>

                    <div
                      className="
                        flex
                        min-h-11
                        items-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-3.5
                        text-sm
                        font-semibold
                        text-slate-900
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-100
                      "
                    >
                      {nombre}
                    </div>

                  </div>

                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {es ? "Categoría" : "Category"}
                    </label>

                    <div
                      className="
                        flex
                        min-h-11
                        items-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-3.5
                        text-sm
                        font-semibold
                        text-slate-900
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-100
                      "
                    >
                      {traducirCategoria(categoria)}
                    </div>

                  </div>

                </div>

                <div className="mt-6">

                  <p
                    className="
                      mb-3
                      text-sm
                      font-bold
                      text-slate-900
                      dark:text-slate-100
                    "
                  >
                    {es ? "Clínica" : "Clinic"}
                  </p>

                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      md:grid-cols-2
                    "
                  >

                    {mostrarMXN && (
                    <div>

                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {es ? "Precio paciente MXN" : "Patient price MXN"}
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-sm
                            font-semibold
                            text-slate-400
                          "
                        >
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            precioMXN
                          }
                          onChange={(e) =>
                            setPrecioMXN(
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            pl-8
                            pr-3
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            focus:border-teal-500
                            focus:ring-2
                            focus:ring-teal-500/10
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-100
                          "
                        />

                      </div>
                    </div>
                    )}

                    {mostrarUSD && (
                    <div>

                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {es ? "Precio paciente USD" : "Patient price USD"}
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-sm
                            font-semibold
                            text-slate-400
                          "
                        >
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            precioUSD
                          }
                          onChange={(e) =>
                            setPrecioUSD(
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            pl-8
                            pr-3
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            focus:border-teal-500
                            focus:ring-2
                            focus:ring-teal-500/10
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-100
                          "
                        />

                      </div>
                    </div>
                    )}

                  </div>

                </div>

                <div
                  className="
                    my-6
                    border-t
                    border-slate-200
                    dark:border-slate-700
                  "
                />

                <div>

                  <div className="mb-3">

                    <p
                      className="
                        text-sm
                        font-bold
                        text-slate-900
                        dark:text-slate-100
                      "
                    >
                      {es ? "Especialista" : "Specialist"}
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-medium
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {
                        doctores.find(
                          (doctor) =>
                            doctor.id ===
                            Number(doctorId)
                        )?.nombre ||
                        (es ? "Sin especialista" : "No specialist")
                      }
                    </p>

                  </div>

                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      md:grid-cols-2
                    "
                  >

                    {mostrarMXN && (
                    <div>

                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {es ? "Costo especialista MXN" : "Specialist cost MXN"}
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-sm
                            font-semibold
                            text-slate-400
                          "
                        >
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            costoMXN
                          }
                          onChange={(e) =>
                            setCostoMXN(
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            pl-8
                            pr-3
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            focus:border-teal-500
                            focus:ring-2
                            focus:ring-teal-500/10
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-100
                          "
                        />

                      </div>
                    </div>
                    )}

                    {mostrarUSD && (
                    <div>

                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {es ? "Costo especialista USD" : "Specialist cost USD"}
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-3.5
                            top-1/2
                            -translate-y-1/2
                            text-sm
                            font-semibold
                            text-slate-400
                          "
                        >
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            costoUSD
                          }
                          onChange={(e) =>
                            setCostoUSD(
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            pl-8
                            pr-3
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            focus:border-teal-500
                            focus:ring-2
                            focus:ring-teal-500/10
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-100
                          "
                        />

                      </div>
                    </div>
                    )}

                  </div>

                </div>

              </div>

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  border-t
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg-card)]
                  px-6
                  py-4
                "
              >

                <button
                  type="button"
                  onClick={
                    cancelarFormulario
                  }
                  disabled={
                    guardando
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-slate-600
                    dark:bg-slate-800
                    dark:text-slate-200
                    dark:hover:bg-slate-700
                  "
                >
                  {es ? "Cancelar" : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={
                    guardar
                  }
                  disabled={
                    guardando
                  }
                  className="
                    rounded-xl
                    bg-teal-600
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-teal-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {
                    guardando
                      ? (es ? "Guardando..." : "Saving...")
                      : (es ? "Guardar cambios" : "Save changes")
                  }
                </button>

              </div>

            </div>

          </div>

        )
      }

      <div
        className="
          bg-[var(--mint-bg-soft)]
          border
          border-[var(--mint-border)]
          rounded-2xl
          p-6
        "
      >

        <h3
          className="
            font-bold
            text-lg
            mint-text-primary
            mb-3
          "
        >

          {es ? "Regla de cálculo" : "Calculation rule"}

        </h3>

        <p
          className="
            mint-text-secondary
            leading-7
          "
        >

          {es
            ? "La base de la clínica se calcula tomando el monto pagado y descontando los costos asociados al tratamiento, como laboratorio, especialista y comisión bancaria. Después se calcula la comisión correspondiente al doctor sobre esa base."
            : "The clinic's base amount is calculated by subtracting treatment-related costs, such as laboratory fees, specialist costs and bank fees, from the amount paid. The doctor's commission is then calculated on that base."}

        </p>

      </div>

    </div>

  );

}