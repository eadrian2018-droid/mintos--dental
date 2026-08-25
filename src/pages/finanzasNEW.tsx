import { useState } from "react";

import Gastos from "../components/finanzas/Gastos";
import Resumen from "../components/finanzas/Resumen";
import Comisiones from "../components/finanzas/Comisiones";
import DoctorDetalle from "../components/DoctorDetalle";
import ConfiguracionFinanzas from "../components/finanzas/ConfiguracionFinanzas";

import usePeriodo from "../hooks/usePeriodo";
import useIndicadores from "../hooks/useIndicadores";
import useFinanzas from "../hooks/useFinanzas";

import type {
  Doctor,
} from "../types/Doctor";

type SeccionFinanzas =
  | "resumen"
  | "gastos"
  | "comisiones"
  | "configuracion";

type PeriodoFinanzas =
  | "semana"
  | "mes"
  | "anio"
  | "historico";

export default function Finanzas() {

  const finanzas =
    useFinanzas();

  const [
    seccionActiva,
    setSeccionActiva,
  ] = useState<SeccionFinanzas>(
    "resumen"
  );

  const [
    periodo,
    setPeriodo,
  ] = useState<PeriodoFinanzas>(
    "semana"
  );

  const {

    tratamientos,

    pacientes,

    gastos,

    doctores,

    nombreDoctor,
    setNombreDoctor,

    especialidadDoctor,
    setEspecialidadDoctor,

    porcentajeDoctor,
    setPorcentajeDoctor,

    fechaGasto,
    setFechaGasto,

    conceptoGasto,
    setConceptoGasto,

    categoriaGasto,
    setCategoriaGasto,

    montoGasto,
    setMontoGasto,

    notasGasto,
    setNotasGasto,

    guardarDoctor,

    actualizarDoctor,

    guardarGasto,

    eliminarGasto,

    catalogoTratamientos,

    guardarTratamientoCatalogo,

    actualizarTratamientoCatalogo,

    cambiarEstadoTratamientoCatalogo,

    configuracionPagos,

    actualizarConfiguracionPago,

  } = finanzas;

  const [
    doctorDetalle,
    setDoctorDetalle,
  ] = useState<Doctor | null>(
    null
  );

  const [
    _mostrarDetalleDoctor,
    setMostrarDetalleDoctor,
  ] = useState(
    false
  );

  const {

    lunesSemana,

    sabadoSemana,

    tratamientosFiltrados,

    gastosFiltrados,

  } = usePeriodo({

    periodo,

    tratamientos,

    gastos,

  });

  const {

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

  } = useIndicadores({

    tratamientosFiltrados,

    gastosFiltrados,

    doctores,

  });

  return (

    <div
      className="
        flex
        gap-4
      "
    >

      <div
        className="
          w-40
          bg-white
          rounded-3xl
          shadow-lg
          p-4
          h-fit
        "
      >

        <h2
          className="
            font-bold
            text-lg
            mb-4
          "
        >

          Finanzas

        </h2>

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <button
            onClick={() =>
              setSeccionActiva(
                "resumen"
              )
            }
            className={`
              p-3
              rounded-xl
              text-left
              transition

              ${
                seccionActiva ===
                "resumen"

                  ? "bg-teal-600 text-white"

                  : "bg-slate-100"
              }
            `}
          >

            Resumen

          </button>

          <button
            onClick={() =>
              setSeccionActiva(
                "gastos"
              )
            }
            className={`
              p-3
              rounded-xl
              text-left
              transition

              ${
                seccionActiva ===
                "gastos"

                  ? "bg-teal-600 text-white"

                  : "bg-slate-100"
              }
            `}
          >

            Gastos

          </button>

          <button
            onClick={() =>
              setSeccionActiva(
                "comisiones"
              )
            }
            className={`
              p-3
              rounded-xl
              text-left
              transition

              ${
                seccionActiva ===
                "comisiones"

                  ? "bg-teal-600 text-white"

                  : "bg-slate-100"
              }
            `}
          >

            Comisiones

          </button>

          <button
            onClick={() =>
              setSeccionActiva(
                "configuracion"
              )
            }
            className={`
              p-3
              rounded-xl
              text-left
              transition

              ${
                seccionActiva ===
                "configuracion"

                  ? "bg-teal-600 text-white"

                  : "bg-slate-100"
              }
            `}
          >

            Configuración

          </button>

        </div>

      </div>

      <div
        className="
          flex-1
        "
      >

        <h1
          className="
            text-4xl
            font-bold
            text-slate-800
            mb-8
          "
        >

          {
            seccionActiva
              .charAt(0)
              .toUpperCase()
            +
            seccionActiva.slice(1)
          }

        </h1>

        <div
          className="
            mb-6
          "
        >

      <select
  value={periodo}
  onChange={(e) => {
    setPeriodo(
      e.target.value as PeriodoFinanzas
    );
  }}
            className="
              border
              rounded-xl
              px-4
              py-2
              bg-white
            "
          >

            <option value="semana">

              Semana

            </option>

            <option value="mes">

              Mes

            </option>

            <option value="anio">

              Año

            </option>

            <option value="historico">

              Histórico

            </option>

          </select>

        </div>

        <div
          className="
            mb-6
            text-slate-600
          "
        >

          {
            periodo ===
            "semana"

            &&

            <>

              Semana Actual

              <br />

              {
                lunesSemana
                  .toLocaleDateString()
              }

              {" - "}

              {
                sabadoSemana
                  .toLocaleDateString()
              }

            </>
          }

          {
            periodo ===
            "mes"

            &&

            <>Mes Actual</>
          }

          {
            periodo ===
            "anio"

            &&

            <>Año Actual</>
          }

          {
            periodo ===
            "historico"

            &&

            <>Todos los registros</>
          }

        </div>

        {
          seccionActiva ===
          "gastos"

          &&

          <Gastos

            total={
              totalGastos
            }

            cantidad={
              gastosFiltrados.length
            }

            fechaGasto={
              fechaGasto
            }

            setFechaGasto={
              setFechaGasto
            }

            conceptoGasto={
              conceptoGasto
            }

            setConceptoGasto={
              setConceptoGasto
            }

            categoriaGasto={
              categoriaGasto
            }

            setCategoriaGasto={
              setCategoriaGasto
            }

            montoGasto={
              montoGasto
            }

            setMontoGasto={
              setMontoGasto
            }

            notasGasto={
              notasGasto
            }

            setNotasGasto={
              setNotasGasto
            }

            guardarGasto={
              guardarGasto
            }

            gastosFiltrados={
              gastosFiltrados
            }

            eliminarGasto={
              eliminarGasto
            }

            gastosPorCategoria={
              gastosPorCategoria
            }

          />
        }

        {
          seccionActiva ===
          "comisiones"

          &&

          <Comisiones

            doctores={
              doctores
            }

            tratamientos={
              tratamientos
            }

            setDoctorDetalle={
              setDoctorDetalle
            }

            setMostrarDetalleDoctor={
              setMostrarDetalleDoctor
            }

          />
        }

        {
          doctorDetalle

          &&

          <DoctorDetalle

            doctor={
              doctorDetalle
            }

            pacientes={
              pacientes
            }

            tratamientos={
              tratamientos
            }

            onClose={() =>
              setDoctorDetalle(
                null
              )
            }

          />
        }
{
  seccionActiva ===
  "configuracion"

  &&

  <ConfiguracionFinanzas

    doctores={
      doctores
    }

    catalogoTratamientos={
      catalogoTratamientos
    }

    configuracionPagos={
      configuracionPagos
    }

    actualizarConfiguracionPago={
      actualizarConfiguracionPago
    }

    actualizarTratamientoCatalogo={
      actualizarTratamientoCatalogo
    }

    nombreDoctor={
      nombreDoctor
    }

    setNombreDoctor={
      setNombreDoctor
    }

    especialidadDoctor={
      especialidadDoctor
    }

    setEspecialidadDoctor={
      setEspecialidadDoctor
    }

    porcentajeDoctor={
      porcentajeDoctor
    }

    setPorcentajeDoctor={
      setPorcentajeDoctor
    }

    guardarDoctor={
      guardarDoctor
    }

    actualizarDoctor={
      actualizarDoctor
    }

    setDoctorDetalle={
      setDoctorDetalle
    }

    guardarTratamientoCatalogo={
      guardarTratamientoCatalogo
    }

    cambiarEstadoTratamientoCatalogo={
      cambiarEstadoTratamientoCatalogo
    }

  />
}

        {
          seccionActiva ===
          "resumen"

          &&

          <Resumen

            ingresos={
              ingresos
            }

            cobrado={
              cobrado
            }

            pendiente={
              pendiente
            }

            gananciaNeta={
              gananciaNeta
            }

            totalGastos={
              totalGastos
            }

            totalBaseClinica={
              totalBaseClinica
            }

            totalComisionesDoctor={
              totalComisionesDoctor
            }

            cajaMXN={
              cajaMXN
            }

            cajaUSD={
              cajaUSD
            }

            totalTarjeta={
              totalTarjeta
            }

            totalTransferencia={
              totalTransferencia
            }

            pacientes={
              pacientes
            }

            tratamientosFiltrados={
              tratamientosFiltrados
            }

          />
        }

      </div>

    </div>

  );

}