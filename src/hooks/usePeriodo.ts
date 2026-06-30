import { useMemo } from "react";

export default function usePeriodo(
  periodo: string,
  tratamientos: any[],
  gastos: any[]
) {

  const hoy = new Date();

  const lunesSemana = new Date(hoy);

  const diaActual = hoy.getDay();

  const diasDesdeLunes =
    diaActual === 0 ? 6 : diaActual - 1;

  lunesSemana.setDate(
    hoy.getDate() - diasDesdeLunes
  );

  lunesSemana.setHours(
    0,
    0,
    0,
    0
  );

  const domingoSemana =
    new Date(lunesSemana);

  domingoSemana.setDate(
    lunesSemana.getDate() + 6
  );

  const tratamientosFiltrados =
    useMemo(() => {

      return tratamientos.filter(
        (item: any) => {

          if (
            periodo === "historico"
          ) return true;

          const fecha =
            new Date(item.fecha);

          if (periodo === "semana") {

            return (
              fecha >= lunesSemana &&
              fecha <= domingoSemana
            );

          }

          if (periodo === "mes") {

            return (
              fecha.getMonth() ===
                hoy.getMonth()
              &&
              fecha.getFullYear() ===
                hoy.getFullYear()
            );

          }

          if (periodo === "anio") {

            return (
              fecha.getFullYear() ===
              hoy.getFullYear()
            );

          }

          return true;

        }

      );

    }, [
      periodo,
      tratamientos
    ]);

  const gastosFiltrados =
    useMemo(() => {

      return gastos.filter(
        (gasto: any) => {

          if (
            periodo === "historico"
          ) return true;

          const fecha =
            new Date(gasto.fecha);

          if (periodo === "semana") {

            return (
              fecha >= lunesSemana &&
              fecha <= domingoSemana
            );

          }

          if (periodo === "mes") {

            return (
              fecha.getMonth() ===
                hoy.getMonth()
              &&
              fecha.getFullYear() ===
                hoy.getFullYear()
            );

          }

          if (periodo === "anio") {

            return (
              fecha.getFullYear() ===
              hoy.getFullYear()
            );

          }

          return true;

        }

      );

    }, [
      periodo,
      gastos
    ]);

  return {

    hoy,

    lunesSemana,

    domingoSemana,

    tratamientosFiltrados,

    gastosFiltrados,

  };

}