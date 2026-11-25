import { useMemo } from "react";

import type { Tratamiento } from "../types/Tratamiento";
import type { Gasto } from "../types/Gasto";

type Props = {
  periodo: string;
  tratamientos: Tratamiento[];
  gastos: Gasto[];
};

const ZONA_HORARIA_MINTOS = "America/Hermosillo";

const formatoFechaMintOS = new Intl.DateTimeFormat(
  "en-CA",
  {
    timeZone: ZONA_HORARIA_MINTOS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }
);

export function obtenerFechaCalendarioMintOS(
  valor: string | Date | null | undefined
): string | null {

  if (!valor) return null;

  if (
    typeof valor === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    const fechaValidacion = new Date(
      `${valor}T00:00:00.000Z`
    );

    if (
      !Number.isFinite(fechaValidacion.getTime()) ||
      fechaValidacion.toISOString().slice(0, 10) !== valor
    ) {
      return null;
    }

    return valor;
  }

  const fecha =
    valor instanceof Date
      ? valor
      : new Date(valor);

  if (!Number.isFinite(fecha.getTime())) {
    return null;
  }

  const partes = formatoFechaMintOS.formatToParts(fecha);

  const anio = partes.find(
    (parte) => parte.type === "year"
  )?.value;

  const mes = partes.find(
    (parte) => parte.type === "month"
  )?.value;

  const dia = partes.find(
    (parte) => parte.type === "day"
  )?.value;

  if (!anio || !mes || !dia) {
    return null;
  }

  return `${anio}-${mes}-${dia}`;
}

function fechaCalendarioLocal(fecha: Date): string {

  const anio = String(fecha.getFullYear()).padStart(4, "0");

  const mes = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

export default function usePeriodo({
  periodo,
  tratamientos,
  gastos,
}: Props) {

  const fechaActualMintOS =
    obtenerFechaCalendarioMintOS(new Date());

  if (!fechaActualMintOS) {
    throw new Error("No fue posible determinar la fecha de MintOS");
  }

  const hoy = new Date(
    `${fechaActualMintOS}T12:00:00`
  );

  const lunesSemana = new Date(hoy);

  const diaActual = hoy.getDay();

  const diasDesdeLunes =
    diaActual === 0
      ? 6
      : diaActual - 1;

  lunesSemana.setDate(
    hoy.getDate() - diasDesdeLunes
  );

  lunesSemana.setHours(0, 0, 0, 0);

  const sabadoSemana = new Date(lunesSemana);

  sabadoSemana.setDate(
    lunesSemana.getDate() + 5
  );

  sabadoSemana.setHours(23, 59, 59, 999);

  const domingoSemana = new Date(lunesSemana);

  domingoSemana.setDate(
    lunesSemana.getDate() + 6
  );

  domingoSemana.setHours(23, 59, 59, 999);

  const lunesSemanaPasada = new Date(lunesSemana);

  lunesSemanaPasada.setDate(
    lunesSemana.getDate() - 7
  );

  const domingoSemanaPasada = new Date(
    lunesSemanaPasada
  );

  domingoSemanaPasada.setDate(
    lunesSemanaPasada.getDate() + 6
  );

  domingoSemanaPasada.setHours(23, 59, 59, 999);

  const inicioMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    1
  );

  inicioMes.setHours(0, 0, 0, 0);

  const finMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + 1,
    0
  );

  finMes.setHours(23, 59, 59, 999);

  const inicioAnio = new Date(
    hoy.getFullYear(),
    0,
    1
  );

  inicioAnio.setHours(0, 0, 0, 0);

  const finAnio = new Date(
    hoy.getFullYear(),
    11,
    31
  );

  finAnio.setHours(23, 59, 59, 999);

  let fechaInicio: string | null = null;
  let fechaFin: string | null = null;

  switch (periodo) {

    case "semana":

      fechaInicio = fechaCalendarioLocal(
        lunesSemana
      );

      fechaFin = fechaCalendarioLocal(
        domingoSemana
      );

      break;

    case "semana_pasada":

      fechaInicio = fechaCalendarioLocal(
        lunesSemanaPasada
      );

      fechaFin = fechaCalendarioLocal(
        domingoSemanaPasada
      );

      break;

    case "mes":

      fechaInicio = fechaCalendarioLocal(
        inicioMes
      );

      fechaFin = fechaCalendarioLocal(
        finMes
      );

      break;

    case "anio":

      fechaInicio = fechaCalendarioLocal(
        inicioAnio
      );

      fechaFin = fechaCalendarioLocal(
        finAnio
      );

      break;

    default:

      break;
  }

  const fechaDentroPeriodo = useMemo(() => {

    return (
      fechaValor: string | Date | null | undefined
    ): boolean => {

      if (periodo === "historico") {
        return true;
      }

      const fecha =
        obtenerFechaCalendarioMintOS(fechaValor);

      if (!fecha) {
        return false;
      }

      if (!fechaInicio || !fechaFin) {
        return true;
      }

      return (
        fecha >= fechaInicio &&
        fecha <= fechaFin
      );
    };

  }, [
    periodo,
    fechaInicio,
    fechaFin,
  ]);

  const tratamientosFiltrados = useMemo(() => {

    return tratamientos.filter(
      (tratamiento) =>
        fechaDentroPeriodo(tratamiento.fecha)
    );

  }, [
    tratamientos,
    fechaDentroPeriodo,
  ]);

  const gastosFiltrados = useMemo(() => {

    return gastos.filter(
      (gasto) =>
        fechaDentroPeriodo(gasto.fecha)
    );

  }, [
    gastos,
    fechaDentroPeriodo,
  ]);

  return {

    hoy,

    lunesSemana,

    sabadoSemana,

    domingoSemana,

    lunesSemanaPasada,

    domingoSemanaPasada,

    inicioMes,

    finMes,

    inicioAnio,

    finAnio,

    fechaInicio,

    fechaFin,

    fechaDentroPeriodo,

    tratamientosFiltrados,

    gastosFiltrados,

  };
}