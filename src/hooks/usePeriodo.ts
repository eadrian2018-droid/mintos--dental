import { useMemo } from "react";

import type {
  Tratamiento,
} from "../types/Tratamiento";

import type {
  Gasto,
} from "../types/Gasto";

type Props = {

  periodo: string;

  tratamientos: Tratamiento[];

  gastos: Gasto[];

};

export default function usePeriodo({

  periodo,

  tratamientos,

  gastos,

}: Props) {

  const hoy = new Date();

  const lunesSemana =
    new Date(hoy);

  const diaActual =
    hoy.getDay();

  const diasDesdeLunes =
    diaActual === 0
      ? 6
      : diaActual - 1;

  lunesSemana.setDate(
    hoy.getDate() -
    diasDesdeLunes
  );

  lunesSemana.setHours(
    0,
    0,
    0,
    0
  );

  const sabadoSemana =
    new Date(lunesSemana);

  sabadoSemana.setDate(
    lunesSemana.getDate() +
    5
  );

  sabadoSemana.setHours(
    23,
    59,
    59,
    999
  );

  const inicioMes =
    new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      1
    );

  inicioMes.setHours(
    0,
    0,
    0,
    0
  );

  const finMes =
    new Date(
      hoy.getFullYear(),
      hoy.getMonth() + 1,
      0
    );

  finMes.setHours(
    23,
    59,
    59,
    999
  );

  const inicioAnio =
    new Date(
      hoy.getFullYear(),
      0,
      1
    );

  inicioAnio.setHours(
    0,
    0,
    0,
    0
  );

  const finAnio =
    new Date(
      hoy.getFullYear(),
      11,
      31
    );

  finAnio.setHours(
    23,
    59,
    59,
    999
  );

  function fechaDentroPeriodo(
    fechaValor: string
  ) {

    if (
      periodo === "historico"
    ) {

      return true;

    }

    const fecha =
      new Date(fechaValor);

    if (
      periodo === "semana"
    ) {

      return (
        fecha >= lunesSemana &&
        fecha <= sabadoSemana
      );

    }

    if (
      periodo === "mes"
    ) {

      return (
        fecha >= inicioMes &&
        fecha <= finMes
      );

    }

    if (
      periodo === "anio"
    ) {

      return (
        fecha >= inicioAnio &&
        fecha <= finAnio
      );

    }

    return true;

  }

  const tratamientosFiltrados =
    useMemo(() => {

      return tratamientos.filter(
        (item) =>
          fechaDentroPeriodo(
            item.fecha
          )
      );

    }, [
      periodo,
      tratamientos,
    ]);

  const gastosFiltrados =
    useMemo(() => {

      return gastos.filter(
        (gasto) =>
          fechaDentroPeriodo(
            gasto.fecha
          )
      );

    }, [
      periodo,
      gastos,
    ]);

  return {

    hoy,

    lunesSemana,

    sabadoSemana,

    inicioMes,

    finMes,

    inicioAnio,

    finAnio,

    tratamientosFiltrados,

    gastosFiltrados,

  };

}