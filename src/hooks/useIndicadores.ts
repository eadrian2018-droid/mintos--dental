import type {
  Doctor,
} from "../types/Doctor";

import type {
  Gasto,
} from "../types/Gasto";

import type {
  Tratamiento,
} from "../types/Tratamiento";

export type IndicadoresProps = {

  tratamientosFiltrados: Tratamiento[];

  gastosFiltrados: Gasto[];

  doctores: Doctor[];

};

export default function useIndicadores({

  tratamientosFiltrados,

  gastosFiltrados,

  doctores,

}: IndicadoresProps) {

  const ingresos =
    tratamientosFiltrados.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.total || 0
        ),
      0
    );

  const cobrado =
    tratamientosFiltrados.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.pago || 0
        ),
      0
    );

  const pendiente =
    ingresos -
    cobrado;

  const totalGastos =
    gastosFiltrados.reduce(
      (
        total,
        gasto
      ) =>
        total +
        Number(
          gasto.monto || 0
        ),
      0
    );

  const totalBaseClinica =
    tratamientosFiltrados.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          Number(
            item.pago || 0
          )
          -
          Number(
            item.laboratorio || 0
          )
          -
          Number(
            item.especialista || 0
          )
          -
          Number(
            item.comision_banco || 0
          )
        ),
      0
    );

  const totalComisionesDoctor =
    tratamientosFiltrados.reduce(
      (
        total,
        item
      ) => {

        const doctor =
          doctores.find(
            (d) =>
              d.id ===
              item.doctor_id
          );

        const porcentaje =
          Number(
            doctor?.porcentaje || 0
          );

        const baseClinica =
          Number(
            item.pago || 0
          )
          -
          Number(
            item.laboratorio || 0
          )
          -
          Number(
            item.especialista || 0
          )
          -
          Number(
            item.comision_banco || 0
          );

        return (
          total +
          (
            baseClinica *
            porcentaje /
            100
          )
        );

      },
      0
    );

  const gananciaNeta =
    totalBaseClinica
    -
    totalComisionesDoctor
    -
    totalGastos;

  const totalTarjeta =
    tratamientosFiltrados
      .filter(
        (t) =>
          t.metodo_pago ===
          "Tarjeta"
      )
      .reduce(
        (
          total,
          t
        ) =>
          total +
          Number(
            t.pago || 0
          ),
        0
      );

  const totalTransferencia =
    tratamientosFiltrados
      .filter(
        (t) =>
          t.metodo_pago ===
          "Transferencia"
      )
      .reduce(
        (
          total,
          t
        ) =>
          total +
          Number(
            t.pago || 0
          ),
        0
      );

  const cajaMXN =
    tratamientosFiltrados
      .filter(
        (t) =>
          t.moneda === "MXN"
          &&
          t.metodo_pago === "Efectivo"
      )
      .reduce(
        (
          total,
          t
        ) =>
          total +
          Number(
            t.pago || 0
          ),
        0
      );

  const cajaUSD =
    tratamientosFiltrados
      .filter(
        (t) =>
          t.moneda === "USD"
          &&
          t.metodo_pago === "Efectivo"
      )
      .reduce(
        (
          total,
          t
        ) =>
          total +
          Number(
            t.pago || 0
          ),
        0
      );

  const gastosPorCategoria =
    gastosFiltrados.reduce<
      Record<string, number>
    >(
      (
        acumulado,
        gasto
      ) => {

        const categoria =
          gasto.categoria ||
          "Sin categoría";

        acumulado[categoria] =
          (
            acumulado[categoria] ||
            0
          )
          +
          Number(
            gasto.monto || 0
          );

        return acumulado;

      },
      {}
    );

  return {

    ingresos,

    cobrado,

    pendiente,

    totalGastos,

    totalBaseClinica,

    totalComisionesDoctor,

    gananciaNeta,

    totalTarjeta,

    totalTransferencia,

    cajaMXN,

    cajaUSD,

    gastosPorCategoria,

  };

}