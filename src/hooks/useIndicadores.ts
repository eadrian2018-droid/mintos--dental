import type {
  Doctor,
} from "../types/Doctor";

import type {
  Gasto,
} from "../types/Gasto";

import type {
  Tratamiento,
} from "../types/Tratamiento";

type PagoIndicador = {

  id?: number;

  fecha?: string;

  paciente_id?: number;

  tratamiento_id?: number;

  metodo_pago?: string;

  moneda?: string;

  monto_original?: number;

  monto_mxn?: number;

  comision_banco?: number;

  neto_recibido?: number;

};

export type IndicadoresProps = {

  tratamientosFiltrados: Tratamiento[];

  gastosFiltrados: Gasto[];

  doctores: Doctor[];

  pagosFiltrados?: PagoIndicador[];

};

export default function useIndicadores({

  tratamientosFiltrados,

  gastosFiltrados,

  doctores,

  pagosFiltrados = [],

}: IndicadoresProps) {

  /*
  |--------------------------------------------------------------------------
  | TRATAMIENTOS
  |--------------------------------------------------------------------------
  |
  | El tratamiento conserva su valor administrativo en MXN.
  | La moneda en la que el paciente paga pertenece exclusivamente
  | a cada registro de la tabla pagos.
  |
  */

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

  /*
  |--------------------------------------------------------------------------
  | COBROS REALES
  |--------------------------------------------------------------------------
  |
  | Estos valores salen de transacciones individuales.
  |
  | No convertimos USD a MXN para fingir que son la misma moneda.
  | Cada moneda conserva su monto original.
  |
  */

  const cobradoMXN =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.moneda === "MXN"
      )
      .reduce(
        (
          total,
          pago
        ) =>
          total +
          Number(
            pago.monto_original || 0
          ),
        0
      );

  const cobradoUSD =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.moneda === "USD"
      )
      .reduce(
        (
          total,
          pago
        ) =>
          total +
          Number(
            pago.monto_original || 0
          ),
        0
      );

  /*
  |--------------------------------------------------------------------------
  | COBROS SIN TARJETA
  |--------------------------------------------------------------------------
  |
  | Representan dinero recibido directamente en la moneda correspondiente.
  | La tarjeta se mantiene separada porque llega al banco en MXN
  | después de comisiones.
  |
  */

  const cobradoDirectoMXN =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.moneda === "MXN"
          &&
          pago.metodo_pago !==
            "Tarjeta"
      )
      .reduce(
        (
          total,
          pago
        ) =>
          total +
          Number(
            pago.monto_original || 0
          ),
        0
      );

  const cobradoDirectoUSD =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.moneda === "USD"
          &&
          pago.metodo_pago !==
            "Tarjeta"
      )
      .reduce(
        (
          total,
          pago
        ) =>
          total +
          Number(
            pago.monto_original || 0
          ),
        0
      );

  /*
  |--------------------------------------------------------------------------
  | TARJETAS
  |--------------------------------------------------------------------------
  |
  | Para tarjeta usamos neto_recibido porque eso representa
  | lo que realmente entra a la cuenta después de comisión bancaria.
  |
  */

  const totalTarjeta =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.metodo_pago ===
          "Tarjeta"
      )
      .reduce(
        (
          total,
          pago
        ) =>
          total +
          Number(
            pago.neto_recibido || 0
          ),
        0
      );

  const totalComisionBanco =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.metodo_pago ===
          "Tarjeta"
      )
      .reduce(
        (
          total,
          pago
        ) =>
          total +
          Number(
            pago.comision_banco || 0
          ),
        0
      );

  /*
  |--------------------------------------------------------------------------
  | TRANSFERENCIAS
  |--------------------------------------------------------------------------
  */

  const totalTransferenciaMXN =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.metodo_pago ===
            "Transferencia"
          &&
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
            pago.monto_original || 0
          ),
        0
      );

  const totalTransferenciaUSD =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.metodo_pago ===
            "Transferencia"
          &&
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
            pago.monto_original || 0
          ),
        0
      );

  /*
  |--------------------------------------------------------------------------
  | COMPATIBILIDAD
  |--------------------------------------------------------------------------
  |
  | Conservamos totalTransferencia porque actualmente Finanzas
  | todavía espera esta propiedad.
  |
  */

  const totalTransferencia =
    totalTransferenciaMXN;

  /*
  |--------------------------------------------------------------------------
  | CAJA
  |--------------------------------------------------------------------------
  */

  const cajaMXN =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.moneda === "MXN"
          &&
          pago.metodo_pago ===
            "Efectivo"
      )
      .reduce(
        (
          total,
          pago
        ) =>
          total +
          Number(
            pago.monto_original || 0
          ),
        0
      );

  const cajaUSD =
    pagosFiltrados
      .filter(
        (pago) =>
          pago.moneda === "USD"
          &&
          pago.metodo_pago ===
            "Efectivo"
      )
      .reduce(
        (
          total,
          pago
        ) =>
          total +
          Number(
            pago.monto_original || 0
          ),
        0
      );

  /*
  |--------------------------------------------------------------------------
  | GASTOS
  |--------------------------------------------------------------------------
  |
  | MXN y USD permanecen completamente separados.
  | No hacemos conversiones automáticas entre monedas.
  |
  */

  const totalGastosMXN =
    gastosFiltrados
      .filter(
        (gasto) =>
          !gasto.moneda ||
          gasto.moneda ===
            "MXN"
      )
      .reduce(
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

  const totalGastosUSD =
    gastosFiltrados
      .filter(
        (gasto) =>
          gasto.moneda ===
            "USD"
      )
      .reduce(
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

  /*
  |--------------------------------------------------------------------------
  | COMPATIBILIDAD TOTAL GASTOS
  |--------------------------------------------------------------------------
  |
  | La lógica financiera histórica trabaja en MXN.
  | Por eso NO sumamos USD dentro de totalGastos.
  |
  */

  const totalGastos =
    totalGastosMXN;

  /*
  |--------------------------------------------------------------------------
  | BASE CLÍNICA
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | COMISIONES DE DOCTORES
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | GANANCIA NETA POR MONEDA
  |--------------------------------------------------------------------------
  |
  | MXN y USD permanecen completamente separados.
  |
  | gananciaNetaMXN conserva por ahora la lógica clínica existente:
  | base clínica - comisiones de doctores - gastos MXN.
  |
  | gananciaNetaUSD representa los dólares realmente conservados:
  | cobros reales USD - gastos reales USD.
  |
  | NO convertimos MXN a USD ni USD a MXN.
  |
  */

  const gananciaNetaMXN =
    totalBaseClinica
    -
    totalComisionesDoctor
    -
    totalGastosMXN;

  const gananciaNetaUSD =
    cobradoUSD
    -
    totalGastosUSD;

  /*
  |--------------------------------------------------------------------------
  | COMPATIBILIDAD GANANCIA NETA
  |--------------------------------------------------------------------------
  |
  | Conservamos gananciaNeta porque Finanzas y Resumen todavía
  | utilizan este nombre.
  |
  */

  const gananciaNeta =
    gananciaNetaMXN;

  /*
  |--------------------------------------------------------------------------
  | GASTOS POR CATEGORÍA
  |--------------------------------------------------------------------------
  |
  | Este objeto se mantiene en MXN por compatibilidad.
  | Gastos.tsx ya realiza su propia separación de monedas.
  |
  */

  const gastosPorCategoria =
    gastosFiltrados
      .filter(
        (gasto) =>
          !gasto.moneda ||
          gasto.moneda ===
            "MXN"
      )
      .reduce<
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

    /*
    | Tratamientos
    */

    ingresos,

    cobrado,

    pendiente,

    /*
    | Cobros reales
    */

    cobradoMXN,

    cobradoUSD,

    cobradoDirectoMXN,

    cobradoDirectoUSD,

    /*
    | Gastos
    */

    totalGastos,

    totalGastosMXN,

    totalGastosUSD,

    /*
    | Clínica
    */

    totalBaseClinica,

    totalComisionesDoctor,

    gananciaNeta,

    gananciaNetaMXN,

    gananciaNetaUSD,

    /*
    | Métodos de pago
    */

    totalTarjeta,

    totalComisionBanco,

    totalTransferencia,

    totalTransferenciaMXN,

    totalTransferenciaUSD,

    /*
    | Caja
    */

    cajaMXN,

    cajaUSD,

    /*
    | Categorías
    */

    gastosPorCategoria,

  };

}