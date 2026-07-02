export type IndicadoresProps = {

  tratamientosFiltrados: any[];

  gastosFiltrados: any[];

  doctores: any[];

};

export default function useIndicadores({

  tratamientosFiltrados,

  gastosFiltrados,

  doctores,

}: IndicadoresProps) {

  const ingresos =

    tratamientosFiltrados.reduce(

      (
        total: number,
        item: any
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
        total: number,
        item: any
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
        total: number,
        gasto: any
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
        total: number,
        item: any
      ) =>

        total +

        (

          Number(item.pago || 0)

          -

          Number(item.laboratorio || 0)

          -

          Number(item.especialista || 0)

          -

          Number(item.comision_banco || 0)

        ),

      0

    );

  const totalComisionesDoctor =

    tratamientosFiltrados.reduce(

      (
        total: number,
        item: any
      ) => {

        const doctor =

          doctores.find(

            (d: any) =>

              d.id ===

              item.doctor_id

          );

        const porcentaje =

          Number(

            doctor?.porcentaje || 0

          );

        const baseClinica =

          Number(item.pago || 0)

          -

          Number(item.laboratorio || 0)

          -

          Number(item.especialista || 0)

          -

          Number(item.comision_banco || 0);

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

        (t: any) =>

          t.metodo_pago ===

          "Tarjeta"

      )

      .reduce(

        (
          total: number,
          t: any
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

        (t: any) =>

          t.metodo_pago ===

          "Transferencia"

      )

      .reduce(

        (
          total: number,
          t: any
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

        (t: any) =>

          t.moneda === "MXN"

          &&

          t.metodo_pago === "Efectivo"

      )

      .reduce(

        (
          total: number,
          t: any
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

        (t: any) =>

          t.moneda === "USD"

          &&

          t.metodo_pago === "Efectivo"

      )

      .reduce(

        (
          total: number,
          t: any
        ) =>

          total +

          Number(
            t.pago || 0
          ),

        0

      );

  const gastosPorCategoria =

    gastosFiltrados.reduce(

      (
        acumulado: any,
        gasto: any
      ) => {

        const categoria =

          gasto.categoria ||

          "Sin categoría";

        acumulado[categoria] =

          (

            acumulado[categoria] || 0

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