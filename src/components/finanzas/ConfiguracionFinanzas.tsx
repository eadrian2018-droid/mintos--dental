import {
  useEffect,
  useState,
} from "react";

import CatalogoTratamientos
  from "./CatalogoTratamientos";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  TratamientoCatalogo,
} from "../../types/TratamientoCatalogo";

import ComisionesCostos
  from "./ComisionesCostos";

import ConfiguracionPagos
  from "./ConfiguracionPagos";

import type {
  ConfiguracionPago,
} from "../../types/ConfiguracionPago";

import { supabase }
  from "../../lib/supabase";

type SeccionConfiguracion =
  | "tratamientos"
  | "comisiones"
  | "pagos"
  | "tipo_cambio";

type ConfiguracionFinanzasProps = {

  doctores: Doctor[];

  catalogoTratamientos:
    TratamientoCatalogo[];

  configuracionPagos:
    ConfiguracionPago[];

  actualizarConfiguracionPago:
    (
      id: number,
      cambios:
        Partial<
          Omit<
            ConfiguracionPago,
            "id"
          >
        >
    ) => Promise<void>;

  guardarTratamientoCatalogo:
    (
      tratamiento:
        Omit<
          TratamientoCatalogo,
          "id"
        >
    ) => Promise<void>;

  actualizarTratamientoCatalogo:
    (
      id: number,
      cambios:
        Partial<
          Omit<
            TratamientoCatalogo,
            "id"
          >
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

  configuracionPagos,

  actualizarConfiguracionPago,

  guardarTratamientoCatalogo,

  actualizarTratamientoCatalogo,

  cambiarEstadoTratamientoCatalogo,

}: ConfiguracionFinanzasProps) {

  const [
    seccion,
    setSeccion,
  ] = useState<SeccionConfiguracion>(
    "tratamientos"
  );

  const [
    tipoCambio,
    setTipoCambio,
  ] = useState("");

  const [
    cargandoTipoCambio,
    setCargandoTipoCambio,
  ] = useState(true);

  const [
    guardandoTipoCambio,
    setGuardandoTipoCambio,
  ] = useState(false);

  useEffect(() => {

    cargarTipoCambio();

  }, []);

  async function cargarTipoCambio() {

    setCargandoTipoCambio(
      true
    );

    const {
      data,
      error,
    } = await supabase

      .from(
        "configuracion_finanzas"
      )

      .select(
        "valor"
      )

      .eq(
        "clave",
        "tipo_cambio_usd_mxn"
      )

      .maybeSingle();

    if (error) {

      console.error(
        "Error cargando tipo de cambio:",
        error
      );

      setCargandoTipoCambio(
        false
      );

      return;

    }

    if (data) {

      setTipoCambio(
        String(
          data.valor
        )
      );

    }

    setCargandoTipoCambio(
      false
    );

  }

  async function guardarTipoCambio() {

    const valor =
      Number(
        tipoCambio
      );

    if (
      !valor ||
      valor <= 0
    ) {

      alert(
        "Ingresa un tipo de cambio válido."
      );

      return;

    }

    setGuardandoTipoCambio(
      true
    );

    const {
      error,
    } = await supabase

      .from(
        "configuracion_finanzas"
      )

      .update({

        valor,

        updated_at:
          new Date()
            .toISOString(),

      })

      .eq(
        "clave",
        "tipo_cambio_usd_mxn"
      );

    if (error) {

      console.error(
        "Error guardando tipo de cambio:",
        error
      );

      alert(
        "Error guardando el tipo de cambio."
      );

      setGuardandoTipoCambio(
        false
      );

      return;

    }

    setTipoCambio(
      valor.toFixed(2)
    );

    setGuardandoTipoCambio(
      false
    );

    alert(
      "Tipo de cambio actualizado correctamente."
    );

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
              mint-tab

              ${
                seccion ===
                "tratamientos"

                  ? "mint-tab-active"

                  : ""
              }
            `}
          >

            Tratamientos

          </button>

          <button
            onClick={() =>
              setSeccion(
                "comisiones"
              )
            }
            className={`
              mint-tab

              ${
                seccion ===
                "comisiones"

                  ? "mint-tab-active"

                  : ""
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
              mint-tab

              ${
                seccion ===
                "pagos"

                  ? "mint-tab-active"

                  : ""
              }
            `}
          >

            Pagos

          </button>

          <button
            onClick={() =>
              setSeccion(
                "tipo_cambio"
              )
            }
            className={`
              mint-tab

              ${
                seccion ===
                "tipo_cambio"

                  ? "mint-tab-active"

                  : ""
              }
            `}
          >

            Tipo de cambio

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

          actualizarTratamientoCatalogo={
            actualizarTratamientoCatalogo
          }

          cambiarEstadoTratamientoCatalogo={
            cambiarEstadoTratamientoCatalogo
          }

        />
      }

      {
        seccion ===
        "comisiones"

        &&

<ComisionesCostos

  doctores={
    doctores
  }

  catalogoTratamientos={
    catalogoTratamientos
  }

  guardarTratamientoCatalogo={
    guardarTratamientoCatalogo
  }

  actualizarTratamientoCatalogo={
    actualizarTratamientoCatalogo
  }

/>
      }

      {
        seccion ===
        "pagos"

        &&

        <ConfiguracionPagos

          configuracionPagos={
            configuracionPagos
          }

          actualizarConfiguracionPago={
            actualizarConfiguracionPago
          }

        />
      }

      {
        seccion ===
        "tipo_cambio"

        &&

        <div
          className="
            mint-card
            p-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              mint-text-primary
            "
          >
            Tipo de cambio
          </h2>

          <p
            className="
              mint-text-secondary
              mt-2
            "
          >
            Configura el valor utilizado para convertir
            dólares estadounidenses a pesos mexicanos.
          </p>

          <div
            className="
              mt-6
              max-w-xl
            "
          >

            <label
              className="
                block
                text-sm
                font-semibold
                mint-text-primary
                mb-2
              "
            >
              Dólar estadounidense
            </label>

            {
              cargandoTipoCambio

                ? (

                  <div
                    className="
                      mint-card
                      p-4
                      mint-text-secondary
                    "
                  >
                    Cargando tipo de cambio...
                  </div>

                )

                : (

                  <>

                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-3
                        sm:items-end
                      "
                    >

                      <div
                        className="
                          flex-1
                        "
                      >

                        <p
                          className="
                            text-xs
                            font-semibold
                            mint-text-muted
                            mb-2
                          "
                        >
                          1 USD equivale a:
                        </p>

                        <div
                          className="
                            relative
                          "
                        >

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              tipoCambio
                            }
                            onChange={(e) =>
                              setTipoCambio(
                                e.target.value
                              )
                            }
                            className="
                              mint-input
                              w-full
                              p-3
                              pr-16
                              text-lg
                              font-semibold
                            "
                          />

                          <span
                            className="
                              absolute
                              right-4
                              top-1/2
                              -translate-y-1/2
                              text-sm
                              font-semibold
                              mint-text-secondary
                            "
                          >
                            MXN
                          </span>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={
                          guardarTipoCambio
                        }
                        disabled={
                          guardandoTipoCambio
                        }
                        className="
                          mint-btn
                          mint-btn-primary
                          px-5
                          py-3
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >

                        {
                          guardandoTipoCambio

                            ? "Guardando..."

                            : "Guardar"
                        }

                      </button>

                    </div>

                    <div
                      className="
                        mt-5
                        bg-[var(--mint-primary-soft)]
                        border
                        border-[var(--mint-border-primary)]
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-wide
                          font-semibold
                          mint-text-muted
                        "
                      >
                        Tipo de cambio actual
                      </p>

                      <p
                        className="
                          text-2xl
                          font-bold
                          mint-text-brand
                          mt-1
                        "
                      >
                        1 USD = $
                        {
                          Number(
                            tipoCambio || 0
                          ).toFixed(2)
                        } MXN
                      </p>

                    </div>

                  </>

                )
            }

          </div>

        </div>
      }

    </div>

  );

}