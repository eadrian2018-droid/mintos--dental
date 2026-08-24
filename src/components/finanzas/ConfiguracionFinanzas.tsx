import { useState } from "react";

import CatalogoTratamientos
  from "./CatalogoTratamientos";

import Doctores
  from "./Doctores";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  TratamientoCatalogo,
} from "../../types/TratamientoCatalogo";

type SeccionConfiguracion =
  | "tratamientos"
  | "doctores"
  | "comisiones"
  | "pagos";

type ConfiguracionFinanzasProps = {

  doctores: Doctor[];

  catalogoTratamientos:
    TratamientoCatalogo[];

  nombreDoctor: string;

  setNombreDoctor:
    Dispatch<
      SetStateAction<string>
    >;

  especialidadDoctor: string;

  setEspecialidadDoctor:
    Dispatch<
      SetStateAction<string>
    >;

  porcentajeDoctor: string;

  setPorcentajeDoctor:
    Dispatch<
      SetStateAction<string>
    >;

  guardarDoctor:
    () => Promise<void>;

  actualizarDoctor:
    (
      id: number,
      nombre: string,
      especialidad: string,
      porcentaje: number
    ) => Promise<void>;

  setDoctorDetalle:
    Dispatch<
      SetStateAction<
        Doctor | null
      >
    >;

  guardarTratamientoCatalogo:
    (
      tratamiento:
        Omit<
          TratamientoCatalogo,
          "id"
        >
    ) => Promise<void>;

  cambiarEstadoTratamientoCatalogo:
    (
      id: number,
      activo: boolean
    ) => Promise<void>;

};

export default function ConfiguracionFinanzas({

  doctores,

  catalogoTratamientos,

  nombreDoctor,
  setNombreDoctor,

  especialidadDoctor,
  setEspecialidadDoctor,

  porcentajeDoctor,
  setPorcentajeDoctor,

  guardarDoctor,

  actualizarDoctor,

  setDoctorDetalle,

  guardarTratamientoCatalogo,

  cambiarEstadoTratamientoCatalogo,

}: ConfiguracionFinanzasProps) {

  const [
    seccion,
    setSeccion,
  ] = useState<SeccionConfiguracion>(
    "tratamientos"
  );

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-4
        "
      >

        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >

          <button
            onClick={() =>
              setSeccion(
                "tratamientos"
              )
            }
            className={`
              px-4
              py-2
              rounded-xl
              transition

              ${
                seccion ===
                "tratamientos"

                  ? "bg-teal-600 text-white"

                  : "bg-slate-100"
              }
            `}
          >

            Tratamientos

          </button>

          <button
            onClick={() =>
              setSeccion(
                "doctores"
              )
            }
            className={`
              px-4
              py-2
              rounded-xl
              transition

              ${
                seccion ===
                "doctores"

                  ? "bg-teal-600 text-white"

                  : "bg-slate-100"
              }
            `}
          >

            Doctores

          </button>

          <button
            onClick={() =>
              setSeccion(
                "comisiones"
              )
            }
            className={`
              px-4
              py-2
              rounded-xl
              transition

              ${
                seccion ===
                "comisiones"

                  ? "bg-teal-600 text-white"

                  : "bg-slate-100"
              }
            `}
          >

            Comisiones y costos

          </button>

          <button
            onClick={() =>
              setSeccion(
                "pagos"
              )
            }
            className={`
              px-4
              py-2
              rounded-xl
              transition

              ${
                seccion ===
                "pagos"

                  ? "bg-teal-600 text-white"

                  : "bg-slate-100"
              }
            `}
          >

            Pagos

          </button>

        </div>

      </div>

      {
        seccion ===
        "tratamientos"

        &&

        <CatalogoTratamientos

          doctores={
            doctores
          }

          catalogoTratamientos={
            catalogoTratamientos
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
        seccion ===
        "doctores"

        &&

        <Doctores

          doctores={
            doctores
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

        />
      }

      {
        seccion ===
        "comisiones"

        &&

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
            "
          >

            Comisiones y costos

          </h2>

          <p
            className="
              text-slate-500
              mt-2
            "
          >

            Aquí configuraremos
            comisiones por doctor,
            costos de especialistas
            y reglas financieras.

          </p>

        </div>
      }

      {
        seccion ===
        "pagos"

        &&

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
            "
          >

            Pagos

          </h2>

          <p
            className="
              text-slate-500
              mt-2
            "
          >

            Aquí configuraremos
            comisión bancaria,
            métodos de pago
            y reglas relacionadas.

          </p>

        </div>
      }

    </div>

  );

}