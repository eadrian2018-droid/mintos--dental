import {
  useMemo,
  useState,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  Tratamiento,
} from "../../types/Tratamiento";

import { supabase }
  from "../../lib/supabase";

type PagoComision = {
  id?: number;
  tratamiento_id?: number;
  moneda?: string;
  monto_original?: number;
};

type ComisionesProps = {
  doctores: Doctor[];
  tratamientos: Tratamiento[];
  pagos?: PagoComision[];

  setDoctorDetalle:
    Dispatch<
      SetStateAction<
        Doctor | null
      >
    >;

  setMostrarDetalleDoctor:
    Dispatch<
      SetStateAction<boolean>
    >;
};

type Vista =
  | "doctores"
  | "especialistas";

type MetodoPago =
  | "Efectivo"
  | "Transferencia"
  | "Tarjeta";

export default function Comisiones({
  doctores,
  tratamientos,
  pagos = [],
  setDoctorDetalle,
  setMostrarDetalleDoctor,
}: ComisionesProps) {

  const [
    vista,
    setVista,
  ] = useState<Vista>(
    "doctores"
  );

  const [
    tratamientoPago,
    setTratamientoPago,
  ] = useState<any | null>(
    null
  );

  const [
    metodoPago,
    setMetodoPago,
  ] = useState<MetodoPago>(
    "Efectivo"
  );

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const formatoMonto =
    (
      monto: number
    ) =>
      Number(
        monto || 0
      ).toLocaleString(
        "es-MX",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

  const tratamientosAny =
    tratamientos as any[];

  const resumenDoctores =
    useMemo(
      () =>
        doctores.map(
          (doctor) => {

            const tratamientosDoctor =
              tratamientosAny.filter(
                (tratamiento) =>
                  Number(
                    tratamiento.doctor_id
                  ) ===
                  Number(
                    doctor.id
                  )
              );

            const finalizados =
              tratamientosDoctor.filter(
                (tratamiento) =>
                  tratamiento.estado ===
                  "Finalizado"
              );

            const ids =
              new Set(
                finalizados.map(
                  (tratamiento) =>
                    Number(
                      tratamiento.id
                    )
                )
              );

            const pagosDoctor =
              pagos.filter(
                (pago) =>
                  ids.has(
                    Number(
                      pago.tratamiento_id
                    )
                  )
              );

            const porcentaje =
              Number(
                doctor.porcentaje || 0
              );

            const cobradoMXN =
              pagosDoctor
                .filter(
                  (pago) =>
                    pago.moneda ===
                    "MXN"
                )
                .reduce(
                  (
                    total,
                    pago
                  ) =>
                    total +
                    Number(
                      pago.monto_original ||
                      0
                    ),
                  0
                );

            const cobradoUSD =
              pagosDoctor
                .filter(
                  (pago) =>
                    pago.moneda ===
                    "USD"
                )
                .reduce(
                  (
                    total,
                    pago
                  ) =>
                    total +
                    Number(
                      pago.monto_original ||
                      0
                    ),
                  0
                );

            return {
              doctor,
              finalizados:
                finalizados.length,
              cobradoMXN,
              cobradoUSD,
              comisionMXN:
                cobradoMXN *
                porcentaje /
                100,
              comisionUSD:
                cobradoUSD *
                porcentaje /
                100,
            };

          }
        ),
      [
        doctores,
        pagos,
        tratamientos,
      ]
    );

  const totalComisionMXN =
    resumenDoctores.reduce(
      (
        total,
        item
      ) =>
        total +
        item.comisionMXN,
      0
    );

  const totalComisionUSD =
    resumenDoctores.reduce(
      (
        total,
        item
      ) =>
        total +
        item.comisionUSD,
      0
    );

  const tratamientosEspecialistas =
    useMemo(
      () =>
        tratamientosAny.filter(
          (tratamiento) =>
            Boolean(
              tratamiento
                .especialista_id
            )
            &&
            Number(
              tratamiento.especialista ||
              0
            ) > 0
        ),
      [
        tratamientos,
      ]
    );

  const resumenEspecialistas =
    useMemo(
      () => {

        const mapa =
          new Map<
            string,
            {
              id: any;
              nombre: string;
              tratamientos: any[];
              pendienteMXN: number;
              pendienteUSD: number;
              pagadoMXN: number;
              pagadoUSD: number;
            }
          >();

        tratamientosEspecialistas
          .forEach(
            (tratamiento) => {

              const id =
                tratamiento
                  .especialista_id;

              const nombre =
                tratamiento
                  .especialista_nombre
                ||
                doctores.find(
                  (doctor) =>
                    Number(
                      doctor.id
                    ) ===
                    Number(
                      id
                    )
                )?.nombre
                ||
                "Especialista";

              const key =
                String(id);

              if (
                !mapa.has(
                  key
                )
              ) {
                mapa.set(
                  key,
                  {
                    id,
                    nombre,
                    tratamientos: [],
                    pendienteMXN: 0,
                    pendienteUSD: 0,
                    pagadoMXN: 0,
                    pagadoUSD: 0,
                  }
                );
              }

              const item =
                mapa.get(
                  key
                )!;

              item.tratamientos.push(
                tratamiento
              );

              const costo =
                Number(
                  tratamiento.especialista ||
                  0
                );

              const moneda =
                tratamiento
                  .moneda_especialista ===
                  "USD"
                  ? "USD"
                  : "MXN";

              if (
                tratamiento
                  .especialista_pagado ===
                true
              ) {

                if (
                  moneda ===
                  "USD"
                ) {
                  item.pagadoUSD +=
                    costo;
                }
                else {
                  item.pagadoMXN +=
                    costo;
                }

                return;

              }

              if (
                tratamiento.estado !==
                "Finalizado"
              ) {
                return;
              }

              if (
                moneda ===
                "USD"
              ) {
                item.pendienteUSD +=
                  costo;
              }
              else {
                item.pendienteMXN +=
                  costo;
              }

            }
          );

        return Array.from(
          mapa.values()
        );

      },
      [
        doctores,
        tratamientosEspecialistas,
      ]
    );

  const pendienteEspecialistasMXN =
    resumenEspecialistas.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteMXN,
      0
    );

  const pendienteEspecialistasUSD =
    resumenEspecialistas.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteUSD,
      0
    );

  async function registrarPagoEspecialista() {

    if (
      !tratamientoPago?.id
    ) {
      return;
    }

    setGuardando(
      true
    );

    const {
      error,
    } =
      await supabase
        .from(
          "tratamientos"
        )
        .update({
          especialista_pagado:
            true,
          especialista_fecha_pago:
            new Date()
              .toISOString(),
          especialista_metodo_pago:
            metodoPago,
        })
        .eq(
          "id",
          tratamientoPago.id
        );

    setGuardando(
      false
    );

    if (
      error
    ) {

      console.error(
        "Error registrando pago a especialista:",
        error
      );

      alert(
        "No se pudo registrar el pago al especialista."
      );

      return;

    }

    setTratamientoPago(
      null
    );

    /*
    | Recargamos para que tratamientos, corte de caja
    | y todos los indicadores financieros lean
    | inmediatamente el nuevo estado desde Supabase.
    */
    window.location.reload();

  }

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          mint-card
          p-6
        "
      >

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
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
              Finanzas
            </p>

            <h2
              className="
                text-2xl
                font-bold
                mint-text-primary
                mt-1
              "
            >
              Comisiones y especialistas
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Comisiones clínicas y adeudos
              reales a especialistas.
            </p>

          </div>

          <div
            className="
              inline-flex
              p-1
              rounded-xl
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              self-start
            "
          >

            <button
              type="button"
              onClick={() =>
                setVista(
                  "doctores"
                )
              }
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold

                ${
                  vista ===
                  "doctores"

                    ? `
                      bg-white
                      text-[var(--mint-primary)]
                      shadow-sm
                    `

                    : `
                      mint-text-secondary
                    `
                }
              `}
            >
              Doctores
            </button>

            <button
              type="button"
              onClick={() =>
                setVista(
                  "especialistas"
                )
              }
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold

                ${
                  vista ===
                  "especialistas"

                    ? `
                      bg-white
                      text-[var(--mint-primary)]
                      shadow-sm
                    `

                    : `
                      mint-text-secondary
                    `
                }
              `}
            >
              Especialistas
            </button>

          </div>

        </div>

      </div>

      {
        vista ===
        "doctores"

          ? (

            <>

              <div
                className="
                  grid
                  md:grid-cols-3
                  gap-4
                "
              >

                <div
                  className="
                    mint-card-primary
                    p-5
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    Doctores
                  </p>
                  <p className="text-2xl font-bold mint-text-primary mt-2">
                    {
                      doctores.length
                    }
                  </p>
                </div>

                <div
                  className="
                    mint-card
                    p-5
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    Comisiones MXN
                  </p>
                  <p className="text-2xl font-bold text-[var(--mint-success)] mt-2">
                    $
                    {
                      formatoMonto(
                        totalComisionMXN
                      )
                    }
                  </p>
                </div>

                <div
                  className="
                    mint-card-accent
                    p-5
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    Comisiones USD
                  </p>
                  <p className="text-2xl font-bold mint-text-accent mt-2">
                    $
                    {
                      formatoMonto(
                        totalComisionUSD
                      )
                    }
                  </p>
                </div>

              </div>

              <div
                className="
                  mint-card
                  overflow-hidden
                "
              >

                <div className="overflow-x-auto">

                  <table className="mint-table w-full">

                    <thead>
                      <tr>
                        <th className="p-4 text-left">
                          Doctor
                        </th>
                        <th className="p-4 text-center">
                          %
                        </th>
                        <th className="p-4 text-center">
                          Finalizados
                        </th>
                        <th className="p-4 text-right">
                          Comisión MXN
                        </th>
                        <th className="p-4 text-right">
                          Comisión USD
                        </th>
                        <th className="p-4 text-right">
                          Acción
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {
                        resumenDoctores.map(
                          (
                            item
                          ) => (

                            <tr
                              key={
                                item.doctor.id
                              }
                              className="
                                mint-table-row
                              "
                            >

                              <td className="p-4">
                                <p className="font-semibold mint-text-primary">
                                  {
                                    item.doctor.nombre
                                  }
                                </p>
                                <p className="text-xs mint-text-muted mt-1">
                                  {
                                    item.doctor.especialidad ||
                                    "Doctor clínico"
                                  }
                                </p>
                              </td>

                              <td className="p-4 text-center font-semibold">
                                {
                                  Number(
                                    item.doctor.porcentaje ||
                                    0
                                  )
                                }%
                              </td>

                              <td className="p-4 text-center">
                                {
                                  item.finalizados
                                }
                              </td>

                              <td className="p-4 text-right font-bold text-[var(--mint-success)]">
                                $
                                {
                                  formatoMonto(
                                    item.comisionMXN
                                  )
                                }
                              </td>

                              <td className="p-4 text-right font-bold mint-text-accent">
                                $
                                {
                                  formatoMonto(
                                    item.comisionUSD
                                  )
                                }
                              </td>

                              <td className="p-4 text-right">

                                <button
                                  type="button"
                                  onClick={() => {

                                    setDoctorDetalle(
                                      item.doctor
                                    );

                                    setMostrarDetalleDoctor(
                                      true
                                    );

                                  }}
                                  className="
                                    mint-btn
                                    mint-btn-action
                                    mint-btn-sm
                                  "
                                >
                                  Ver detalle
                                </button>

                              </td>

                            </tr>

                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>

              </div>

            </>

          )

          : (

            <>

              <div
                className="
                  grid
                  md:grid-cols-3
                  gap-4
                "
              >

                <div className="mint-card-primary p-5">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    Especialistas
                  </p>
                  <p className="text-2xl font-bold mint-text-primary mt-2">
                    {
                      resumenEspecialistas.length
                    }
                  </p>
                </div>

                <div className="mint-card p-5">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    Por pagar MXN
                  </p>
                  <p className="text-2xl font-bold text-[var(--mint-danger)] mt-2">
                    $
                    {
                      formatoMonto(
                        pendienteEspecialistasMXN
                      )
                    }
                  </p>
                </div>

                <div className="mint-card-accent p-5">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    Por pagar USD
                  </p>
                  <p className="text-2xl font-bold mint-text-accent mt-2">
                    $
                    {
                      formatoMonto(
                        pendienteEspecialistasUSD
                      )
                    }
                  </p>
                </div>

              </div>

              {
                resumenEspecialistas
                  .length === 0

                  ? (

                    <div className="mint-card p-10 text-center">
                      <p className="font-semibold mint-text-primary">
                        No hay tratamientos con especialista.
                      </p>
                    </div>

                  )

                  : resumenEspecialistas.map(
                      (
                        especialista
                      ) => (

                        <div
                          key={
                            especialista.id
                          }
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
                              flex-col
                              md:flex-row
                              md:items-center
                              md:justify-between
                              gap-4
                            "
                          >

                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mint-text-brand">
                                Especialista
                              </p>
                              <h3 className="text-xl font-bold mint-text-primary mt-1">
                                {
                                  especialista.nombre
                                }
                              </h3>
                            </div>

                            <div className="flex gap-3 flex-wrap">

                              <div className="px-4 py-2 rounded-xl bg-[var(--mint-danger-bg)] border border-[var(--mint-danger-border)]">
                                <p className="text-[10px] uppercase font-bold text-[var(--mint-danger)]">
                                  Pendiente MXN
                                </p>
                                <p className="font-bold text-[var(--mint-danger)]">
                                  $
                                  {
                                    formatoMonto(
                                      especialista.pendienteMXN
                                    )
                                  }
                                </p>
                              </div>

                              <div className="px-4 py-2 rounded-xl bg-[var(--mint-warning-bg)] border border-[var(--mint-warning-border)]">
                                <p className="text-[10px] uppercase font-bold text-[var(--mint-warning)]">
                                  Pendiente USD
                                </p>
                                <p className="font-bold text-[var(--mint-warning)]">
                                  $
                                  {
                                    formatoMonto(
                                      especialista.pendienteUSD
                                    )
                                  }
                                </p>
                              </div>

                            </div>

                          </div>

                          <div className="overflow-x-auto">

                            <table className="mint-table w-full">

                              <thead>
                                <tr>
                                  <th className="p-4 text-left">
                                    Fecha
                                  </th>
                                  <th className="p-4 text-left">
                                    Tratamiento
                                  </th>
                                  <th className="p-4 text-left">
                                    Estado
                                  </th>
                                  <th className="p-4 text-right">
                                    Costo
                                  </th>
                                  <th className="p-4 text-center">
                                    Pago
                                  </th>
                                  <th className="p-4 text-right">
                                    Acción
                                  </th>
                                </tr>
                              </thead>

                              <tbody>

                                {
                                  especialista
                                    .tratamientos
                                    .map(
                                      (
                                        tratamiento
                                      ) => {

                                        const pagado =
                                          tratamiento
                                            .especialista_pagado ===
                                          true;

                                        const finalizado =
                                          tratamiento.estado ===
                                          "Finalizado";

                                        return (

                                          <tr
                                            key={
                                              tratamiento.id
                                            }
                                            className="mint-table-row"
                                          >

                                            <td className="p-4 mint-text-secondary whitespace-nowrap">
                                              {
                                                tratamiento.fecha ||
                                                "—"
                                              }
                                            </td>

                                            <td className="p-4">
                                              <p className="font-semibold mint-text-primary">
                                                {
                                                  tratamiento.tratamiento ||
                                                  "Tratamiento"
                                                }
                                              </p>
                                            </td>

                                            <td className="p-4">
                                              <span
                                                className={`
                                                  inline-flex
                                                  px-3
                                                  py-1
                                                  rounded-full
                                                  text-xs
                                                  font-semibold
                                                  border

                                                  ${
                                                    finalizado

                                                      ? `
                                                        bg-[var(--mint-success-bg)]
                                                        text-[var(--mint-success)]
                                                        border-[var(--mint-success-border)]
                                                      `

                                                      : `
                                                        bg-[var(--mint-bg-soft)]
                                                        mint-text-secondary
                                                        border-[var(--mint-border)]
                                                      `
                                                  }
                                                `}
                                              >
                                                {
                                                  tratamiento.estado ||
                                                  "Pendiente"
                                                }
                                              </span>
                                            </td>

                                            <td className="p-4 text-right whitespace-nowrap">
                                              <span className="font-bold mint-text-primary">
                                                $
                                                {
                                                  formatoMonto(
                                                    Number(
                                                      tratamiento.especialista ||
                                                      0
                                                    )
                                                  )
                                                }
                                              </span>
                                              <span className="ml-2 text-xs mint-text-muted">
                                                {
                                                  tratamiento.moneda_especialista ===
                                                  "USD"
                                                    ? "USD"
                                                    : "MXN"
                                                }
                                              </span>
                                            </td>

                                            <td className="p-4 text-center">

                                              {
                                                pagado

                                                  ? (

                                                    <div>
                                                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[var(--mint-success-bg)] text-[var(--mint-success)] border border-[var(--mint-success-border)]">
                                                        Pagado
                                                      </span>
                                                      <p className="text-[10px] mint-text-muted mt-1">
                                                        {
                                                          tratamiento.especialista_metodo_pago ||
                                                          "—"
                                                        }
                                                      </p>
                                                    </div>

                                                  )

                                                  : (

                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[var(--mint-danger-bg)] text-[var(--mint-danger)] border border-[var(--mint-danger-border)]">
                                                      Pendiente
                                                    </span>

                                                  )
                                              }

                                            </td>

                                            <td className="p-4 text-right">

                                              {
                                                pagado

                                                  ? (

                                                    <span className="text-xs mint-text-muted">
                                                      {
                                                        tratamiento.especialista_fecha_pago
                                                          ? new Date(
                                                              tratamiento.especialista_fecha_pago
                                                            )
                                                              .toLocaleDateString(
                                                                "es-MX"
                                                              )
                                                          : "Registrado"
                                                      }
                                                    </span>

                                                  )

                                                  : finalizado

                                                    ? (

                                                      <button
                                                        type="button"
                                                        onClick={() => {

                                                          setMetodoPago(
                                                            "Efectivo"
                                                          );

                                                          setTratamientoPago(
                                                            tratamiento
                                                          );

                                                        }}
                                                        className="
                                                          mint-btn
                                                          mint-btn-primary
                                                          mint-btn-sm
                                                        "
                                                      >
                                                        Pagar
                                                      </button>

                                                    )

                                                    : (

                                                      <span className="text-xs mint-text-muted">
                                                        Al finalizar
                                                      </span>

                                                    )
                                              }

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

                      )
                    )
              }

            </>

          )
      }

      {
        tratamientoPago

        &&

        <div
          className="
            fixed
            inset-0
            z-50
            bg-slate-950/35
            backdrop-blur-[2px]
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              mint-card
              w-full
              max-w-md
              p-6
              shadow-xl
            "
          >

            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mint-text-brand">
              Pago a especialista
            </p>

            <h3 className="text-xl font-bold mint-text-primary mt-1">
              {
                tratamientoPago.especialista_nombre ||
                "Especialista"
              }
            </h3>

            <div className="mt-5 p-4 rounded-xl bg-[var(--mint-bg-soft)] border border-[var(--mint-border)]">

              <p className="text-sm font-semibold mint-text-primary">
                {
                  tratamientoPago.tratamiento
                }
              </p>

              <p className="text-2xl font-bold mint-text-primary mt-2">
                $
                {
                  formatoMonto(
                    Number(
                      tratamientoPago.especialista ||
                      0
                    )
                  )
                }
                <span className="text-sm ml-2 mint-text-muted">
                  {
                    tratamientoPago.moneda_especialista ===
                    "USD"
                      ? "USD"
                      : "MXN"
                  }
                </span>
              </p>

            </div>

            <div className="mt-5">

              <label className="text-sm font-semibold mint-text-primary">
                Método de pago
              </label>

              <div className="grid grid-cols-3 gap-2 mt-2">

                {
                  (
                    [
                      "Efectivo",
                      "Transferencia",
                      "Tarjeta",
                    ] as MetodoPago[]
                  ).map(
                    (
                      metodo
                    ) => (

                      <button
                        key={
                          metodo
                        }
                        type="button"
                        onClick={() =>
                          setMetodoPago(
                            metodo
                          )
                        }
                        className={`
                          px-3
                          py-2.5
                          rounded-xl
                          text-sm
                          font-semibold
                          border
                          transition

                          ${
                            metodoPago ===
                            metodo

                              ? `
                                bg-[var(--mint-primary)]
                                text-white
                                border-[var(--mint-primary)]
                              `

                              : `
                                bg-white
                                mint-text-secondary
                                border-[var(--mint-border)]
                              `
                          }
                        `}
                      >
                        {
                          metodo
                        }
                      </button>

                    )
                  )
                }

              </div>

              {
                metodoPago ===
                "Efectivo"

                &&

                <p className="text-xs text-[var(--mint-warning)] mt-3">
                  Este pago reducirá la caja física de {
                    tratamientoPago.moneda_especialista ===
                    "USD"
                      ? "USD"
                      : "MXN"
                  }.
                </p>
              }

              {
                metodoPago !==
                "Efectivo"

                &&

                <p className="text-xs mint-text-muted mt-3">
                  Este pago no modificará la caja física.
                </p>
              }

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                disabled={
                  guardando
                }
                onClick={() =>
                  setTratamientoPago(
                    null
                  )
                }
                className="
                  mint-btn
                  mint-btn-secondary
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={
                  guardando
                }
                onClick={
                  registrarPagoEspecialista
                }
                className="
                  mint-btn
                  mint-btn-primary
                "
              >
                {
                  guardando
                    ? "Guardando..."
                    : "Confirmar pago"
                }
              </button>

            </div>

          </div>

        </div>
      }

    </div>

  );

}
