import {
  Save,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext";
import SelectorDientesPresupuesto from "./SelectorDientesPresupuesto";

type CatalogoTratamiento = {
  id: number;
  nombre: string;
  nombre_en: string | null;
  precio_mxn: number | null;
  precio_usd: number | null;
  activo: boolean;
};

type Paciente = {
  id: number;
  nombre: string;
};

type ItemFormulario = {
  id: number;
  diente: string;
  tratamiento: string;
  catalogo_tratamiento_id: number | null;
  dientes: number[];
  arcada: "superior" | "inferior" | null;
  cantidad: number;
  precio_unitario: number;
};

type PresupuestoFormProps = {
  pacientes: Paciente[];
  onCancelar: () => void;
  onGuardar: (datos: {
    paciente_id: number | null;
    nombre_paciente: string;
    moneda: "MXN" | "USD";
    idioma: "es" | "en";
    descuento: number;
    notas: string;
    items: ItemFormulario[];
  }) => Promise<void>;
};

export default function PresupuestoForm({
  pacientes,
  onCancelar,
  onGuardar,
}: PresupuestoFormProps) {

  const { language } = useLanguage();
  const es = language === "es";

  const [
    idiomaDocumento,
    setIdiomaDocumento,
  ] = useState<"es" | "en">("es");

  const [
    pacienteId,
    setPacienteId,
  ] = useState("");

  const [
    tipoPaciente,
    setTipoPaciente,
  ] = useState<
    "registrado" | "nuevo"
  >("registrado");

  const [
    nombrePacienteNuevo,
    setNombrePacienteNuevo,
  ] = useState("");

  const [
    moneda,
    setMoneda,
  ] = useState<"MXN" | "USD">(
    "MXN"
  );

  const [
    notas,
    setNotas,
  ] = useState("");

  const [
    tipoDescuento,
    setTipoDescuento,
  ] = useState<"monto" | "porcentaje">(
    "monto"
  );

  const [
    valorDescuento,
    setValorDescuento,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    catalogoTratamientos,
    setCatalogoTratamientos,
  ] = useState<CatalogoTratamiento[]>([]);

  const [
    items,
    setItems,
  ] = useState<ItemFormulario[]>([
    {
      id: Date.now(),
      diente: "",
      tratamiento: "",
      catalogo_tratamiento_id: null,
      dientes: [],
      arcada: null,
      cantidad: 1,
      precio_unitario: 0,
    },
  ]);

  const [
    itemDentalActivoId,
    setItemDentalActivoId,
  ] = useState<number>(
    items[0].id
  );

  useEffect(() => {
    cargarCatalogoTratamientos();
  }, []);

  async function cargarCatalogoTratamientos() {
    const {
      data,
      error,
    } = await supabase
      .from("catalogo_tratamientos")
      .select(`
        id,
        nombre,
        nombre_en,
        precio_mxn,
        precio_usd,
        activo
      `)
      .eq("activo", true)
      .order("nombre", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error cargando catálogo de tratamientos:",
        error
      );
      return;
    }

    setCatalogoTratamientos(
      (data || []) as CatalogoTratamiento[]
    );
  }

  function obtenerPrecioCatalogo(
    tratamiento: CatalogoTratamiento,
    monedaSeleccionada: "MXN" | "USD"
  ) {
    return Number(
      monedaSeleccionada === "USD"
        ? tratamiento.precio_usd || 0
        : tratamiento.precio_mxn || 0
    );
  }

  function seleccionarTratamiento(
    itemId: number,
    catalogoId: string
  ) {
    const idSeleccionado =
      catalogoId
        ? Number(catalogoId)
        : null;

    const tratamientoSeleccionado =
      catalogoTratamientos.find(
        (tratamiento) =>
          Number(tratamiento.id) ===
          idSeleccionado
      );

    setItems((actuales) =>
      actuales.map((item) =>
        item.id === itemId
          ? {
              ...item,
              catalogo_tratamiento_id:
                tratamientoSeleccionado?.id || null,
              tratamiento:
                tratamientoSeleccionado?.nombre || "",
              precio_unitario:
                tratamientoSeleccionado
                  ? obtenerPrecioCatalogo(
                      tratamientoSeleccionado,
                      moneda
                    )
                  : 0,
            }
          : item
      )
    );
  }

  function cambiarMoneda(
    nuevaMoneda: "MXN" | "USD"
  ) {
    setMoneda(nuevaMoneda);

    setItems((actuales) =>
      actuales.map((item) => {
        const tratamientoCatalogo =
          catalogoTratamientos.find(
            (tratamiento) =>
              Number(tratamiento.id) ===
              Number(
                item.catalogo_tratamiento_id
              )
          );

        if (!tratamientoCatalogo) {
          return item;
        }

        return {
          ...item,
          precio_unitario:
            obtenerPrecioCatalogo(
              tratamientoCatalogo,
              nuevaMoneda
            ),
        };
      })
    );
  }

  const subtotal =
    useMemo(
      () => {

        return items.reduce(
          (
            acumulado,
            item
          ) =>
            acumulado +
            (
              Number(
                item.cantidad
              ) *
              Number(
                item.precio_unitario
              )
            ),
          0
        );

      },
      [
        items,
      ]
    );

  const descuentoCalculado =
    useMemo(
      () => {
        const valor = Math.max(
          0,
          Number(valorDescuento || 0)
        );

        const descuento =
          tipoDescuento === "porcentaje"
            ? subtotal * Math.min(valor, 100) / 100
            : valor;

        return Math.min(descuento, subtotal);
      },
      [subtotal, tipoDescuento, valorDescuento]
    );

  const total = Math.max(
    subtotal - descuentoCalculado,
    0
  );

  function actualizarItem(
    id: number,
    campo:
      | "diente"
      | "tratamiento"
      | "cantidad"
      | "precio_unitario",
    valor: string | number
  ) {

    setItems(
      (
        actuales
      ) =>
        actuales.map(
          (
            item
          ) =>
            item.id === id
              ? {
                  ...item,
                  [campo]:
                    valor,
                }
              : item
        )
    );

  }

  const itemDentalActivo =
    items.find(
      (item) =>
        item.id === itemDentalActivoId
    ) || items[0];

  function actualizarDientesItem(
    dientes: number[]
  ) {
    if (!itemDentalActivo) {
      return;
    }

    setItems((actuales) =>
      actuales.map((item) =>
        item.id === itemDentalActivo.id
          ? {
              ...item,
              dientes,
              diente:
                dientes.length === 1
                  ? String(dientes[0])
                  : dientes.join(", "),
              arcada: null,
            }
          : item
      )
    );
  }

  function actualizarArcadaItem(
    arcada:
      | "superior"
      | "inferior"
      | null
  ) {
    if (!itemDentalActivo) {
      return;
    }

    setItems((actuales) =>
      actuales.map((item) =>
        item.id === itemDentalActivo.id
          ? {
              ...item,
              arcada,
              diente:
                arcada === "superior"
                  ? "Arcada superior"
                  : arcada === "inferior"
                    ? "Arcada inferior"
                    : item.dientes.length === 1
                      ? String(item.dientes[0])
                      : item.dientes.join(", "),
            }
          : item
      )
    );
  }

  function agregarItem() {

    const nuevoItem: ItemFormulario = {
      id: Date.now(),
      diente: "",
      tratamiento: "",
      catalogo_tratamiento_id: null,
      dientes: [],
      arcada: null,
      cantidad: 1,
      precio_unitario: 0,
    };

    setItems((actuales) => [
      ...actuales,
      nuevoItem,
    ]);

    setItemDentalActivoId(
      nuevoItem.id
    );

  }

  function eliminarItem(
    id: number
  ) {

    if (
      items.length === 1
    ) {

      return;

    }

    const restantes =
      items.filter(
        (item) =>
          item.id !== id
      );

    setItems(restantes);

    if (
      itemDentalActivoId === id &&
      restantes.length > 0
    ) {
      setItemDentalActivoId(
        restantes[0].id
      );
    }

  }

  async function guardar() {

    if (
      tipoPaciente ===
        "registrado" &&
      !pacienteId
    ) {

      alert(
        es ? "Selecciona un paciente." : "Select a patient."
      );

      return;

    }

    if (
      tipoPaciente ===
        "nuevo" &&
      !nombrePacienteNuevo.trim()
    ) {

      alert(
        es ? "Escribe el nombre del paciente." : "Enter the patient name."
      );

      return;

    }

    const itemsValidos =
      items.filter(
        (
          item
        ) =>
          item.tratamiento
            .trim() !== "" &&
          Number(
            item.cantidad
          ) > 0 &&
          Number(
            item.precio_unitario
          ) >= 0
      );

    if (
      itemsValidos.length === 0
    ) {

      alert(
        es ? "Agrega al menos un tratamiento." : "Add at least one treatment."
      );

      return;

    }

    setGuardando(
      true
    );

    try {

      const pacienteRegistrado =
        pacientes.find(
          (paciente) =>
            paciente.id ===
            Number(
              pacienteId
            )
        );

      await onGuardar({
        paciente_id:
          tipoPaciente ===
          "registrado"
            ? Number(
                pacienteId
              )
            : null,
        nombre_paciente:
          tipoPaciente ===
          "registrado"
            ? pacienteRegistrado
                ?.nombre || ""
            : nombrePacienteNuevo
                .trim(),
        moneda,
        idioma:
          idiomaDocumento,
        descuento:
          descuentoCalculado,
        notas:
          notas.trim(),
        items:
          itemsValidos,
      });

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

      <section
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-[var(--mint-border)]
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.14em]
                font-bold
                mint-text-brand
              "
            >
              {es ? "Presupuestos" : "Estimates"}
            </p>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                mint-text-primary
                mt-1
              "
            >
              {es ? "Nuevo presupuesto" : "New estimate"}
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {es
                ? "Crea una propuesta de tratamiento para el paciente."
                : "Create a treatment estimate for the patient."}
            </p>

          </div>

          <button
            type="button"
            onClick={
              onCancelar
            }
            className="
              mint-btn
              inline-flex
              items-center
              gap-2
            "
          >
            <X
              size={17}
            />

            {es ? "Cancelar" : "Cancel"}
          </button>

        </div>

        <div
          className="
            p-6
            space-y-6
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            <div>

              <label
                className="
                  block
                  text-xs
                  font-bold
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Paciente" : "Patient"}
              </label>

              <div
                className="
                  inline-flex
                  rounded-xl
                  bg-[var(--mint-bg-soft)]
                  border
                  border-[var(--mint-border)]
                  p-1
                  mb-3
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setTipoPaciente(
                      "registrado"
                    )
                  }
                  className={`
                    px-4
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    transition

                    ${
                      tipoPaciente ===
                      "registrado"
                        ? `
                            bg-[var(--mint-bg-card)]
                            text-[var(--mint-primary)]
                            shadow-sm
                          `
                        : `
                            mint-text-secondary
                          `
                    }
                  `}
                >
                  {es ? "Registrado" : "Registered"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTipoPaciente(
                      "nuevo"
                    )
                  }
                  className={`
                    px-4
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    transition

                    ${
                      tipoPaciente ===
                      "nuevo"
                        ? `
                            bg-[var(--mint-bg-card)]
                            text-[var(--mint-primary)]
                            shadow-sm
                          `
                        : `
                            mint-text-secondary
                          `
                    }
                  `}
                >
                  {es ? "Paciente nuevo" : "New patient"}
                </button>

              </div>

              {
                tipoPaciente ===
                "registrado"
                  ? (

                    <select
                      value={
                        pacienteId
                      }
                      onChange={
                        (e) =>
                          setPacienteId(
                            e.target.value
                          )
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[var(--mint-border)]
                        bg-[var(--mint-bg-card)]
                        px-3
                        py-2.5
                        text-sm
                        mint-text-primary
                      "
                    >

                      <option
                        value=""
                      >
                        {es ? "Seleccionar paciente" : "Select patient"}
                      </option>

                      {
                        pacientes.map(
                          (paciente) => (

                            <option
                              key={
                                paciente.id
                              }
                              value={
                                paciente.id
                              }
                            >
                              {
                                paciente.nombre
                              }
                            </option>

                          )
                        )
                      }

                    </select>

                  )
                  : (

                    <div>

                      <input
                        type="text"
                        value={
                          nombrePacienteNuevo
                        }
                        onChange={
                          (e) =>
                            setNombrePacienteNuevo(
                              e.target.value
                            )
                        }
                        placeholder={es ? "Nombre del paciente" : "Patient name"}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-[var(--mint-border)]
                          bg-[var(--mint-bg-card)]
                          px-3
                          py-2.5
                          text-sm
                          mint-text-primary
                        "
                      />

                      <p
                        className="
                          mt-2
                          text-xs
                          mint-text-muted
                        "
                      >
                        {es ? "Puedes crear el presupuesto sin registrar todavía un expediente." : "You can create the estimate before registering a patient record."}
                      </p>

                    </div>

                  )
              }

            </div>

            <div>

              <label
                className="
                  block
                  text-xs
                  font-bold
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Moneda" : "Currency"}
              </label>

              <div
                className="
                  inline-flex
                  rounded-xl
                  bg-[var(--mint-bg-soft)]
                  border
                  border-[var(--mint-border)]
                  p-1
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    cambiarMoneda(
                      "MXN"
                    )
                  }
                  className={`
                    px-5
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    transition

                    ${
                      moneda ===
                      "MXN"
                        ? `
                            bg-[var(--mint-bg-card)]
                            text-[var(--mint-primary)]
                            shadow-sm
                          `
                        : `
                            mint-text-secondary
                          `
                    }
                  `}
                >
                  MXN
                </button>

                <button
                  type="button"
                  onClick={() =>
                    cambiarMoneda(
                      "USD"
                    )
                  }
                  className={`
                    px-5
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    transition

                    ${
                      moneda ===
                      "USD"
                        ? `
                            bg-[var(--mint-bg-card)]
                            text-[var(--mint-primary)]
                            shadow-sm
                          `
                        : `
                            mint-text-secondary
                          `
                    }
                  `}
                >
                  USD
                </button>

              </div>

            </div>

          </div>

          <div
            className="
              rounded-2xl
              border
              border-[var(--mint-border)]
              bg-[var(--mint-bg-soft)]
              p-4
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >
            <div>
              <p className="text-sm font-bold mint-text-primary">
                {es ? "Idioma del presupuesto" : "Estimate language"}
              </p>
              <p className="text-xs mint-text-secondary mt-1">
                {es
                  ? "Este idioma es independiente del idioma de MintOS."
                  : "This language is independent from the MintOS interface language."}
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-[var(--mint-bg-card)] border border-[var(--mint-border)] p-1">
              <button
                type="button"
                onClick={() => setIdiomaDocumento("es")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  idiomaDocumento === "es"
                    ? "bg-[var(--mint-primary-soft)] text-[var(--mint-primary)] shadow-sm"
                    : "mint-text-secondary"
                }`}
              >
                Español
              </button>

              <button
                type="button"
                onClick={() => setIdiomaDocumento("en")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  idiomaDocumento === "en"
                    ? "bg-[var(--mint-primary-soft)] text-[var(--mint-primary)] shadow-sm"
                    : "mint-text-secondary"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div
            className="
              border
              border-[var(--mint-border)]
              rounded-2xl
              overflow-hidden
            "
          >

            <div
              className="
                px-5
                py-4
                bg-[var(--mint-bg-soft)]
                border-b
                border-[var(--mint-border)]
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <div>

                <h3
                  className="
                    font-bold
                    mint-text-primary
                  "
                >
                  {es ? "Tratamientos" : "Treatments"}
                </h3>

                <p
                  className="
                    text-xs
                    mint-text-muted
                    mt-1
                  "
                >
                  Agrega los procedimientos incluidos
                  en este presupuesto.
                </p>

              </div>



            </div>

            <div className="p-5 border-b border-[var(--mint-border)]">
              <div className="mb-4">
                <p className="text-sm font-bold mint-text-primary">
                  {es ? "Renglón activo" : "Active line item"}
                </p>
                <p className="text-xs mint-text-secondary mt-1">
                  {es
                    ? "La selección dental se aplicará al tratamiento resaltado en la tabla."
                    : "The dental selection will be applied to the highlighted treatment row."}
                </p>
              </div>

              {itemDentalActivo && (
                <SelectorDientesPresupuesto
                  dientesSeleccionados={
                    itemDentalActivo.dientes
                  }
                  onChange={
                    actualizarDientesItem
                  }
                  arcada={
                    itemDentalActivo.arcada
                  }
                  onArcadaChange={
                    actualizarArcadaItem
                  }
                />
              )}
            </div>

            <div
              className="
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                  text-sm
                "
              >

                <thead
                  className="
                    bg-[var(--mint-bg-soft)]
                  "
                >

                  <tr>

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                        text-xs
                        mint-text-muted
                      "
                    >
                      {es ? "Diente / Arcada" : "Tooth / Arch"}
                    </th>

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                        text-xs
                        mint-text-muted
                      "
                    >
                      {es ? "Tratamiento" : "Treatment"}
                    </th>

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                        text-xs
                        mint-text-muted
                      "
                    >
                      {es ? "Cantidad" : "Quantity"}
                    </th>

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                        text-xs
                        mint-text-muted
                      "
                    >
                      {es ? "Precio unitario" : "Unit price"}
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                        text-xs
                        mint-text-muted
                      "
                    >
                      Total
                    </th>

                    <th
                      className="
                        w-14
                      "
                    />

                  </tr>

                </thead>

                <tbody>

                  {
                    items.map(
                      (
                        item
                      ) => {

                        const totalItem =
                          Number(
                            item.cantidad
                          ) *
                          Number(
                            item.precio_unitario
                          );

                        return (

                          <tr
                            key={
                              item.id
                            }
                            onClick={() =>
                              setItemDentalActivoId(
                                item.id
                              )
                            }
                            className={`
                              border-t
                              border-[var(--mint-border)]
                              ${
                                itemDentalActivoId === item.id
                                  ? "bg-[var(--mint-primary-soft)]"
                                  : ""
                              }
                            `}
                          >

                            <td
                              className="
                                p-3
                              "
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  setItemDentalActivoId(
                                    item.id
                                  )
                                }
                                className={`
                                  min-w-[150px]
                                  text-left
                                  rounded-lg
                                  border
                                  px-3
                                  py-2
                                  text-sm
                                  transition
                                  ${
                                    itemDentalActivoId === item.id
                                      ? "border-[var(--mint-primary)] bg-[var(--mint-primary-soft)] text-[var(--mint-primary)]"
                                      : "border-[var(--mint-border)] bg-[var(--mint-bg-card)] mint-text-primary"
                                  }
                                `}
                              >
                                {item.arcada
                                  ? item.arcada === "superior"
                                    ? es ? "Arcada superior" : "Upper arch"
                                    : es ? "Arcada inferior" : "Lower arch"
                                  : item.dientes.length > 0
                                    ? item.dientes.slice().sort((a, b) => a - b).join(", ")
                                    : es ? "Seleccionar" : "Select"}
                              </button>

                            </td>

                            <td
                              className="
                                p-3
                              "
                            >

                              <div className="flex items-center gap-2 min-w-[290px]">
                                <select
                                  value={
                                    item.catalogo_tratamiento_id || ""
                                  }
                                  onChange={
                                    (
                                      e
                                    ) =>
                                      seleccionarTratamiento(
                                        item.id,
                                        e.target.value
                                      )
                                  }
                                  className="
                                    w-full
                                    min-w-[240px]
                                    rounded-lg
                                    border
                                    border-[var(--mint-border)]
                                    px-3
                                    py-2
                                    bg-[var(--mint-bg-card)]
                                    mint-text-primary
                                  "
                                >
                                  <option value="">
                                    {es ? "Seleccionar tratamiento" : "Select treatment"}
                                  </option>

                                  {
                                    catalogoTratamientos.map(
                                      (tratamiento) => (
                                        <option
                                          key={
                                            tratamiento.id
                                          }
                                          value={
                                            tratamiento.id
                                          }
                                        >
                                          {
                                            idiomaDocumento === "en" &&
                                            tratamiento.nombre_en
                                              ? tratamiento.nombre_en
                                              : tratamiento.nombre
                                          }
                                        </option>
                                      )
                                    )
                                  }
                                </select>

                                {itemDentalActivoId === item.id && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      agregarItem();
                                    }}
                                    disabled={!item.catalogo_tratamiento_id}
                                    title={es ? "Agregar otro tratamiento" : "Add another treatment"}
                                    aria-label={es ? "Agregar otro tratamiento" : "Add another treatment"}
                                    className="
                                      shrink-0
                                      w-10
                                      h-10
                                      rounded-lg
                                      border
                                      border-[var(--mint-primary)]
                                      bg-[var(--mint-primary)]
                                      text-white
                                      inline-flex
                                      items-center
                                      justify-center
                                      hover:opacity-90
                                      disabled:opacity-30
                                      disabled:cursor-not-allowed
                                      transition
                                    "
                                  >
                                    <Plus size={17} />
                                  </button>
                                )}
                              </div>

                            </td>

                            <td
                              className="
                                p-3
                              "
                            >

                              <input
                                type="number"
                                min="1"
                                value={
                                  item.cantidad
                                }
                                onChange={
                                  (
                                    e
                                  ) =>
                                    actualizarItem(
                                      item.id,
                                      "cantidad",
                                      Number(
                                        e.target.value
                                      )
                                    )
                                }
                                className="
                                  w-20
                                  rounded-lg
                                  border
                                  border-[var(--mint-border)]
                                  px-3
                                  py-2
                                  bg-[var(--mint-bg-card)]
                                  mint-text-primary
                                "
                              />

                            </td>

                            <td
                              className="
                                p-3
                              "
                            >

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.precio_unitario
                                }
                                onChange={
                                  (
                                    e
                                  ) =>
                                    actualizarItem(
                                      item.id,
                                      "precio_unitario",
                                      Number(
                                        e.target.value
                                      )
                                    )
                                }
                                className="
                                  w-36
                                  rounded-lg
                                  border
                                  border-[var(--mint-border)]
                                  px-3
                                  py-2
                                  bg-[var(--mint-bg-card)]
                                  mint-text-primary
                                "
                              />

                            </td>

                            <td
                              className="
                                p-3
                                text-right
                                font-bold
                                mint-text-primary
                                whitespace-nowrap
                              "
                            >
                              $
                              {
                                totalItem
                                  .toLocaleString(
                                    es ? "es-MX" : "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                              }
                            </td>

                            <td
                              className="
                                p-3
                                text-right
                              "
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  eliminarItem(
                                    item.id
                                  )
                                }
                                disabled={
                                  items.length === 1
                                }
                                className="
                                  p-2
                                  rounded-lg
                                  text-[var(--mint-danger)]
                                  hover:bg-[var(--mint-danger-bg)]
                                  disabled:opacity-30
                                  transition
                                "
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>

                            </td>

                          </tr>

                        );

                      }
                    )
                  }

                </tbody>

              </table>

            </div>

          </div>

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-[1fr_320px]
              gap-6
            "
          >

            <div>

              <label
                className="
                  block
                  text-xs
                  font-bold
                  mint-text-secondary
                  mb-2
                "
              >
                {es ? "Notas" : "Notes"}
              </label>

              <textarea
                value={
                  notas
                }
                onChange={
                  (
                    e
                  ) =>
                    setNotas(
                      e.target.value
                    )
                }
                rows={5}
                placeholder={es ? "Notas u observaciones del presupuesto..." : "Estimate notes or observations..."}
                className="
                  w-full
                  rounded-xl
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg-card)]
                  px-3
                  py-3
                  text-sm
                  mint-text-primary
                  resize-none
                "
              />

            </div>

            <div
              className="
                rounded-2xl
                bg-[var(--mint-bg-soft)]
                border
                border-[var(--mint-border)]
                p-5
                space-y-4
              "
            >

              <div
                className="
                  flex
                  justify-between
                  gap-4
                  text-sm
                "
              >
                <span
                  className="
                    mint-text-secondary
                  "
                >
                  Subtotal
                </span>

                <strong
                  className="
                    mint-text-primary
                  "
                >
                  $
                  {
                    subtotal.toLocaleString(
                      es ? "es-MX" : "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  }
                </strong>
              </div>



              <div
                className="
                  pt-4
                  border-t
                  border-[var(--mint-border)]
                  space-y-3
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold mint-text-secondary">
                    {es ? "Descuento" : "Discount"}
                  </span>

                  <div className="inline-flex rounded-xl bg-[var(--mint-bg-card)] border border-[var(--mint-border)] p-1">
                    <button
                      type="button"
                      onClick={() => setTipoDescuento("monto")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        tipoDescuento === "monto"
                          ? "bg-[var(--mint-primary-soft)] text-[var(--mint-primary)]"
                          : "mint-text-secondary"
                      }`}
                    >
                      {moneda}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoDescuento("porcentaje")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        tipoDescuento === "porcentaje"
                          ? "bg-[var(--mint-primary-soft)] text-[var(--mint-primary)]"
                          : "mint-text-secondary"
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={tipoDescuento === "porcentaje" ? 100 : subtotal}
                    step="0.01"
                    value={valorDescuento}
                    onChange={(e) =>
                      setValorDescuento(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[var(--mint-border)] bg-[var(--mint-bg-card)] px-3 py-2.5 text-sm mint-text-primary"
                  />

                  <span className="text-sm font-bold mint-text-secondary whitespace-nowrap">
                    {tipoDescuento === "porcentaje" ? "%" : moneda}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="mint-text-secondary">
                    {es ? "Descuento aplicado" : "Applied discount"}
                  </span>

                  <strong className="text-[var(--mint-danger)]">
                    -${descuentoCalculado.toLocaleString(
                      es ? "es-MX" : "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </strong>
                </div>
              </div>


              <div
                className="
                  pt-4
                  border-t
                  border-[var(--mint-border)]
                  flex
                  items-end
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-wide
                      font-bold
                      mint-text-muted
                    "
                  >
                    Total
                  </p>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-primary)]
                      mt-1
                    "
                  >
                    $
                    {
                      total.toLocaleString(
                        es ? "es-MX" : "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    }
                  </p>

                  <p
                    className="
                      text-xs
                      mint-text-muted
                    "
                  >
                    {moneda}
                  </p>

                </div>

              </div>

            </div>

          </div>

          <div
            className="
              flex
              justify-end
              gap-3
              pt-2
            "
          >

            <button
              type="button"
              onClick={
                onCancelar
              }
              className="
                mint-btn
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
                mint-btn
                mint-btn-primary
                inline-flex
                items-center
                gap-2
                disabled:opacity-60
              "
            >

              <Save
                size={17}
              />

              {
                guardando
                  ? es ? "Guardando..." : "Saving..."
                  : es ? "Guardar borrador" : "Save draft"
              }

            </button>

          </div>

        </div>

      </section>

    </div>

  );

}