import {
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

type Paciente = {
  id: number;
  nombre: string;
};

type ItemFormulario = {
  id: number;
  diente: string;
  tratamiento: string;
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
    notas: string;
    items: ItemFormulario[];
  }) => Promise<void>;
};

export default function PresupuestoForm({
  pacientes,
  onCancelar,
  onGuardar,
}: PresupuestoFormProps) {

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
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    items,
    setItems,
  ] = useState<ItemFormulario[]>([
    {
      id: Date.now(),
      diente: "",
      tratamiento: "",
      cantidad: 1,
      precio_unitario: 0,
    },
  ]);

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

  const total = subtotal;

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

  function agregarItem() {

    setItems(
      (
        actuales
      ) => [
        ...actuales,
        {
          id:
            Date.now(),
          diente: "",
          tratamiento: "",
          cantidad: 1,
          precio_unitario: 0,
        },
      ]
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

    setItems(
      (
        actuales
      ) =>
        actuales.filter(
          (
            item
          ) =>
            item.id !== id
        )
    );

  }

  async function guardar() {

    if (
      tipoPaciente ===
        "registrado" &&
      !pacienteId
    ) {

      alert(
        "Selecciona un paciente."
      );

      return;

    }

    if (
      tipoPaciente ===
        "nuevo" &&
      !nombrePacienteNuevo.trim()
    ) {

      alert(
        "Escribe el nombre del paciente."
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
        "Agrega al menos un tratamiento."
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
              Presupuestos
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
              Nuevo presupuesto
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Crea una propuesta de tratamiento
              para el paciente.
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

            Cancelar
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
                Paciente
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
                  Registrado
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
                  Paciente nuevo
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
                        Seleccionar paciente
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
                        placeholder="Nombre del paciente"
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
                        Puedes crear el presupuesto sin registrar todavía un expediente.
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
                Moneda
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
                    setMoneda(
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
                    setMoneda(
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
                  Tratamientos
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

              <button
                type="button"
                onClick={
                  agregarItem
                }
                className="
                  mint-btn
                  inline-flex
                  items-center
                  gap-2
                "
              >
                <Plus
                  size={16}
                />

                Agregar
              </button>

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
                      Diente
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
                      Tratamiento
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
                      Cantidad
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
                      Precio unitario
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
                            className="
                              border-t
                              border-[var(--mint-border)]
                            "
                          >

                            <td
                              className="
                                p-3
                              "
                            >

                              <input
                                type="text"
                                value={
                                  item.diente
                                }
                                onChange={
                                  (
                                    e
                                  ) =>
                                    actualizarItem(
                                      item.id,
                                      "diente",
                                      e.target.value
                                    )
                                }
                                placeholder="Ej. 11"
                                className="
                                  w-24
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
                                type="text"
                                value={
                                  item.tratamiento
                                }
                                onChange={
                                  (
                                    e
                                  ) =>
                                    actualizarItem(
                                      item.id,
                                      "tratamiento",
                                      e.target.value
                                    )
                                }
                                placeholder="Ej. Corona de zirconia"
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
                              />

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
                                    "es-MX",
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
                Notas
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
                placeholder="Notas u observaciones del presupuesto..."
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
                      "es-MX",
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
                        "es-MX",
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
              Cancelar
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
                  ? "Guardando..."
                  : "Guardar borrador"
              }

            </button>

          </div>

        </div>

      </section>

    </div>

  );

}