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
  TratamientoMaestro,
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

import { registrarBitacora }
  from "../../lib/registrarBitacora";

import { useAuth }
  from "../../context/AuthContext";

import { useLanguage }
  from "../../context/LanguageContext";

type SeccionConfiguracion =
  | "tratamientos"
  | "comisiones"
  | "pagos"
  | "moneda";

type ConfiguracionFinanzasProps = {

  doctores: Doctor[];

  catalogoTratamientos:
    TratamientoCatalogo[];

  catalogoMaestroTratamientos:
    TratamientoMaestro[];

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

  catalogoMaestroTratamientos,

  configuracionPagos,

  actualizarConfiguracionPago,

  guardarTratamientoCatalogo,

  actualizarTratamientoCatalogo,

  cambiarEstadoTratamientoCatalogo,

}: ConfiguracionFinanzasProps) {

  const {
    perfil,
  } = useAuth();

  const { language } = useLanguage();

  const es = language === "es";

  const esAdmin =
    perfil?.rol === "admin";

  const [
    seccion,
    setSeccion,
  ] = useState<SeccionConfiguracion>(
    "tratamientos"
  );

  const [
    monedaPrincipal,
    setMonedaPrincipal,
  ] = useState("MXN");

  const [
    monedaSecundaria,
    setMonedaSecundaria,
  ] = useState("USD");

  const [
    monedaSecundariaActiva,
    setMonedaSecundariaActiva,
  ] = useState(true);

  const [
    tipoCambio,
    setTipoCambio,
  ] = useState("");

  const [
    configuracionMonedaOriginal,
    setConfiguracionMonedaOriginal,
  ] = useState({
    monedaPrincipal: "MXN",
    monedaSecundaria: "USD",
    monedaSecundariaActiva: true,
    tipoCambio: "",
  });

  const [
    cargandoMoneda,
    setCargandoMoneda,
  ] = useState(true);

  const [
    guardandoMoneda,
    setGuardandoMoneda,
  ] = useState(false);

  const monedas = [
    {
      codigo: "MXN",
      nombreEs: "Peso mexicano",
      nombreEn: "Mexican peso",
    },
    {
      codigo: "USD",
      nombreEs: "Dólar estadounidense",
      nombreEn: "U.S. dollar",
    },
  ];

  function cambiarMonedaPrincipal(
    nuevaMoneda: string
  ) {

    const principal =
      nuevaMoneda === "USD"
        ? "USD"
        : "MXN";

    setMonedaPrincipal(
      principal
    );

    setMonedaSecundaria(
      principal === "MXN"
        ? "USD"
        : "MXN"
    );

    setTipoCambio("");

  }

  useEffect(() => {

    cargarConfiguracionMoneda();

  }, []);

  async function cargarConfiguracionMoneda() {

    setCargandoMoneda(true);

    const {
      data,
      error,
    } = await supabase
      .from(
        "configuracion_finanzas"
      )
      .select(
        "clave, valor"
      )
      .in(
        "clave",
        [
          "moneda_principal",
          "moneda_secundaria",
          "moneda_secundaria_activa",
          "tipo_cambio",
        ]
      );

    if (error) {

      console.error(
        "Error cargando configuración de moneda:",
        error
      );

      setCargandoMoneda(false);

      return;

    }

    const valores =
      Object.fromEntries(
        (data ?? []).map(
          (fila) => [
            fila.clave,
            String(
              fila.valor ?? ""
            ),
          ]
        )
      );

    const principalGuardada =
      valores.moneda_principal ||
      "MXN";

    const principal =
      principalGuardada === "USD"
        ? "USD"
        : "MXN";

    const secundariaEsperada =
      principal === "MXN"
        ? "USD"
        : "MXN";

    const secundariaGuardada =
      valores.moneda_secundaria ||
      secundariaEsperada;

    const secundaria =
      secundariaGuardada === principal ||
      ![
        "MXN",
        "USD",
      ].includes(
        secundariaGuardada
      )
        ? secundariaEsperada
        : secundariaGuardada;

    const secundariaActiva =
      valores
        .moneda_secundaria_activa !==
      "false";

    const cambio =
      valores.tipo_cambio || "";

    setMonedaPrincipal(
      principal
    );

    setMonedaSecundaria(
      secundaria
    );

    setMonedaSecundariaActiva(
      secundariaActiva
    );

    setTipoCambio(
      cambio
    );

    setConfiguracionMonedaOriginal({
      monedaPrincipal:
        principal,

      monedaSecundaria:
        secundaria,

      monedaSecundariaActiva:
        secundariaActiva,

      tipoCambio:
        cambio,
    });

    setCargandoMoneda(false);

  }

  async function guardarConfiguracionMoneda() {

    if (
      monedaSecundariaActiva &&
      !monedaSecundaria
    ) {

      alert(
        es
          ? "Selecciona una moneda secundaria."
          : "Select a secondary currency."
      );

      return;

    }

    if (
      monedaSecundariaActiva &&
      monedaPrincipal ===
        monedaSecundaria
    ) {

      alert(
        es
          ? "La moneda secundaria debe ser diferente de la moneda principal."
          : "The secondary currency must be different from the primary currency."
      );

      return;

    }

    const valorCambio =
      Number(
        tipoCambio
      );

    if (
      monedaSecundariaActiva &&
      (
        !valorCambio ||
        valorCambio <= 0
      )
    ) {

      alert(
        es
          ? "Ingresa un tipo de cambio válido."
          : "Enter a valid exchange rate."
      );

      return;

    }

    setGuardandoMoneda(true);

    const ahora =
      new Date()
        .toISOString();

    const filas = [
      {
        clave:
          "moneda_principal",

        valor:
          monedaPrincipal,

        descripcion:
          "Moneda principal utilizada por la clínica",

        updated_at:
          ahora,
      },
      {
        clave:
          "moneda_secundaria",

        valor:
          monedaSecundaria,

        descripcion:
          "Moneda secundaria opcional utilizada por la clínica",

        updated_at:
          ahora,
      },
      {
        clave:
          "moneda_secundaria_activa",

        valor:
          String(
            monedaSecundariaActiva
          ),

        descripcion:
          "Indica si la clínica utiliza una segunda moneda",

        updated_at:
          ahora,
      },
      {
        clave:
          "tipo_cambio",

        valor:
          monedaSecundariaActiva
            ? valorCambio
                .toFixed(4)
            : "1",

        descripcion:
          "Tipo de cambio entre la moneda secundaria y la moneda principal",

        updated_at:
          ahora,
      },
    ];

    const {
      error,
    } = await supabase
      .from(
        "configuracion_finanzas"
      )
      .upsert(
        filas,
        {
          onConflict:
            "clave",
        }
      );

    if (error) {

      console.error(
        "Error guardando configuración de moneda:",
        error
      );

      alert(
        es
          ? "Error guardando la configuración de moneda."
          : "Error saving currency settings."
      );

      setGuardandoMoneda(false);

      return;

    }

    const cambioGuardado =
      monedaSecundariaActiva
        ? valorCambio
            .toFixed(4)
        : "1";

    await registrarBitacora({
      accion:
        "Cambiar configuración de moneda",

      modulo:
        "Configuración financiera",

      detalle:
        `${configuracionMonedaOriginal.monedaPrincipal}` +
        `${
          configuracionMonedaOriginal
            .monedaSecundariaActiva
            ? ` + ${configuracionMonedaOriginal.monedaSecundaria} (${configuracionMonedaOriginal.tipoCambio || "—"})`
            : ""
        }` +
        ` → ${monedaPrincipal}` +
        `${
          monedaSecundariaActiva
            ? ` + ${monedaSecundaria} (${cambioGuardado})`
            : ""
        }`,
    });

    setTipoCambio(
      cambioGuardado
    );

    setConfiguracionMonedaOriginal({
      monedaPrincipal,
      monedaSecundaria,
      monedaSecundariaActiva,
      tipoCambio:
        cambioGuardado,
    });

    setGuardandoMoneda(false);

    alert(
      es
        ? "Configuración de moneda actualizada correctamente."
        : "Currency settings updated successfully."
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
          rounded-[22px]
          border !border-[#2a6170]
          !bg-[linear-gradient(115deg,#102f4f_0%,#1b4f68_52%,#126c70_100%)]
          p-4
          shadow-[0_12px_30px_rgba(4,28,45,0.22)]
        "
      >

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2.5
          "
        >

          <button
            onClick={() =>
              setSeccion(
                "tratamientos"
              )
            }
            className={`
              inline-flex items-center justify-center
              min-h-[44px] rounded-xl border px-5 py-2.5
              text-sm font-bold transition-all duration-200
              ${
                seccion ===
                "tratamientos"

                  ? "!border-[#67d7c6] !bg-[linear-gradient(120deg,#0b8f80_0%,#2db4a0_100%)] !text-white shadow-[0_7px_20px_rgba(3,18,27,0.25)]"

                  : "!border-white/25 !bg-white/10 !text-white hover:!border-[#69d4c0] hover:!bg-white/20"
              }
            `}
          >

            {
              es
                ? "Tratamientos"
                : "Treatments"
            }

          </button>

          <button
            onClick={() =>
              setSeccion(
                "comisiones"
              )
            }
            className={`
              inline-flex items-center justify-center
              min-h-[44px] rounded-xl border px-5 py-2.5
              text-sm font-bold transition-all duration-200
              ${
                seccion ===
                "comisiones"

                  ? "!border-[#67d7c6] !bg-[linear-gradient(120deg,#0b8f80_0%,#2db4a0_100%)] !text-white shadow-[0_7px_20px_rgba(3,18,27,0.25)]"

                  : "!border-white/25 !bg-white/10 !text-white hover:!border-[#69d4c0] hover:!bg-white/20"
              }
            `}
          >

            {
              es
                ? "Comisiones y costos"
                : "Commissions and costs"
            }

          </button>

          {
            esAdmin

            &&

            <button
              onClick={() =>
                setSeccion(
                  "pagos"
                )
              }
              className={`
                inline-flex items-center justify-center
                min-h-[44px] rounded-xl border px-5 py-2.5
                text-sm font-bold transition-all duration-200
                ${
                  seccion ===
                  "pagos"

                    ? "!border-[#67d7c6] !bg-[linear-gradient(120deg,#0b8f80_0%,#2db4a0_100%)] !text-white shadow-[0_7px_20px_rgba(3,18,27,0.25)]"

                    : "!border-white/25 !bg-white/10 !text-white hover:!border-[#69d4c0] hover:!bg-white/20"
                }
              `}
            >

              {
                es
                  ? "Métodos de pago"
                  : "Payment Methods"
              }

            </button>
          }

          {
            esAdmin

            &&

            <button
              onClick={() =>
                setSeccion(
                  "moneda"
                )
              }
              className={`
                inline-flex items-center justify-center
                min-h-[44px] rounded-xl border px-5 py-2.5
                text-sm font-bold transition-all duration-200
                ${
                  seccion ===
                  "moneda"

                    ? "!border-[#67d7c6] !bg-[linear-gradient(120deg,#0b8f80_0%,#2db4a0_100%)] !text-white shadow-[0_7px_20px_rgba(3,18,27,0.25)]"

                    : "!border-white/25 !bg-white/10 !text-white hover:!border-[#69d4c0] hover:!bg-white/20"
                }
              `}
            >

              {
                es
                  ? "Moneda"
                  : "Currency"
              }

            </button>
          }

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

          catalogoMaestroTratamientos={
            catalogoMaestroTratamientos
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
        esAdmin &&
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
        esAdmin &&
        seccion ===
        "moneda"

        &&

        <div
          className="
            overflow-hidden
            rounded-[24px]
            border
            border-[var(--mint-border)]
            bg-[var(--mint-app-bg)]
            p-6
            shadow-[0_12px_34px_rgba(15,42,65,0.06)]
          "
        >

          <div className="rounded-[18px] border border-white/10 !bg-[linear-gradient(115deg,#102f4f_0%,#1b4f68_55%,#178e82_100%)] px-6 py-5 shadow-[0_12px_28px_rgba(5,28,45,0.18)]">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] !text-[#6ce2cc]">
            {es ? "CONFIGURACIÓN FINANCIERA" : "FINANCIAL SETTINGS"}
          </p>
          <h2
            className="
              text-xl
              font-bold
              !text-white
            "
          >

            {
              es
                ? "Moneda"
                : "Currency"
            }

          </h2>

          <p
            className="
              !text-[#d0e6e8]
              mt-2
            "
          >

            {
              es
                ? "Configura la moneda principal de la clínica y, si lo necesitas, una segunda moneda con su tipo de cambio."
                : "Configure the clinic's primary currency and, if needed, a secondary currency with its exchange rate."
            }

          </p>
          </div>

          {
            cargandoMoneda

              ? (

                <div
                  className="
                    mt-6
                    mint-card
                    p-4
                    mint-text-secondary
                  "
                >

                  {
                    es
                      ? "Cargando configuración..."
                      : "Loading settings..."
                  }

                </div>

              )

              : (

                <div
                  className="
                    mt-6
                    max-w-4xl
                    space-y-5
                    rounded-[22px]
                    border
                    border-[var(--mint-border-soft)]
                    bg-[var(--mint-app-bg)]
                    p-5
                  "
                >

                  <div
                    className="
                      rounded-[18px]
                      border
                      border-[var(--mint-border)]
                      bg-[var(--mint-card-bg,var(--mint-app-bg))]
                      p-5
                    "
                  >

                    <label
                      className="
                        block
                        text-sm
                        font-bold
                        mint-text-primary
                        mb-2
                      "
                    >

                      {
                        es
                          ? "Moneda principal"
                          : "Primary currency"
                      }

                    </label>

                    <select
                      value={
                        monedaPrincipal
                      }
                      onChange={
                        (e) =>
                          cambiarMonedaPrincipal(
                            e.target.value
                          )
                      }
                      className="
                        mint-input
                        w-full
                        p-3
                      "
                    >

                      {
                        monedas.map(
                          (
                            moneda
                          ) => (

                            <option
                              key={
                                moneda.codigo
                              }
                              value={
                                moneda.codigo
                              }
                            >

                              {
                                moneda.codigo
                              }

                              {" — "}

                              {
                                es
                                  ? moneda.nombreEs
                                  : moneda.nombreEn
                              }

                            </option>

                          )
                        )
                      }

                    </select>

                    <p
                      className="
                        text-xs
                        mint-text-muted
                        mt-2
                      "
                    >

                      {
                        es
                          ? "Esta será la moneda predeterminada para precios, cobros, gastos y reportes."
                          : "This will be the default currency for prices, payments, expenses, and reports."
                      }

                    </p>

                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      rounded-[18px]
                      border
                      border-[var(--mint-border-teal)]
                      bg-[linear-gradient(115deg,#15384b_0%,#11515b_100%)]
                      p-5
                    "
                  >

                    <div>

                      <p
                        className="
                          font-semibold
                          !text-white
                        "
                      >

                        {
                          es
                            ? "Usar segunda moneda"
                            : "Use secondary currency"
                        }

                      </p>

                      <p
                        className="
                          text-sm
                          !text-[#c7e6e4]
                          mt-1
                        "
                      >

                        {
                          es
                            ? `Actívala para utilizar también ${monedaSecundaria}.`
                            : `Enable it to also use ${monedaSecundaria}.`
                        }

                      </p>

                    </div>

                    <label
                      className="
                        relative
                        inline-flex
                        shrink-0
                        cursor-pointer
                        items-center
                      "
                    >

                      <input
                        type="checkbox"
                        checked={
                          monedaSecundariaActiva
                        }
                        onChange={
                          (e) =>
                            setMonedaSecundariaActiva(
                              e.target.checked
                            )
                        }
                        className="
                          peer
                          sr-only
                        "
                      />

                      <span
                        className="
                          h-7
                          w-12
                          rounded-full
                          bg-slate-200
                          transition
                          peer-checked:bg-[var(--mint-teal)]
                          after:absolute
                          after:left-[3px]
                          after:top-[3px]
                          after:h-[22px]
                          after:w-[22px]
                          after:rounded-full
                          after:bg-white
                          after:shadow-sm
                          after:transition
                          after:content-['']
                          peer-checked:after:translate-x-5
                        "
                      />

                    </label>

                  </div>

                  {
                    monedaSecundariaActiva

                    &&

                    <>

                      <div
                        className="
                          rounded-[18px]
                          border
                          border-[var(--mint-border)]
                          bg-white
                          p-5
                        "
                      >

                        <p
                          className="
                            block
                            text-sm
                            font-semibold
                            mint-text-primary
                            mb-2
                          "
                        >

                          {
                            es
                              ? "Moneda secundaria"
                              : "Secondary currency"
                          }

                        </p>

                        <div
                          className="
                            mint-input
                            w-full
                            p-3
                            font-semibold
                            mint-text-primary
                          "
                        >

                          {
                            monedaSecundaria
                          }

                          {" — "}

                          {
                            monedaSecundaria ===
                            "USD"

                              ? (
                                es
                                  ? "Dólar estadounidense"
                                  : "U.S. dollar"
                              )

                              : (
                                es
                                  ? "Peso mexicano"
                                  : "Mexican peso"
                              )
                          }

                        </div>

                        <p
                          className="
                            text-xs
                            mint-text-muted
                            mt-2
                          "
                        >

                          {
                            es
                              ? `Al usar ${monedaPrincipal} como moneda principal, ${monedaSecundaria} será automáticamente la segunda moneda.`
                              : `When ${monedaPrincipal} is the primary currency, ${monedaSecundaria} is automatically used as the secondary currency.`
                          }

                        </p>

                      </div>

                      <div>

                        <label
                          className="
                            block
                            text-sm
                            font-semibold
                            mint-text-primary
                            mb-2
                          "
                        >

                          {
                            es
                              ? "Tipo de cambio"
                              : "Exchange rate"
                          }

                        </label>

                        <p
                          className="
                            text-xs
                            font-semibold
                            mint-text-muted
                            mb-2
                          "
                        >

                          1{" "}
                          {
                            monedaSecundaria
                          }{" "}

                          {
                            es
                              ? "equivale a:"
                              : "equals:"
                          }

                        </p>

                        <div
                          className="
                            relative
                          "
                        >

                          <input
                            type="number"
                            min="0"
                            step="0.0001"
                            value={
                              tipoCambio
                            }
                            onChange={
                              (e) =>
                                setTipoCambio(
                                  e.target.value
                                )
                            }
                            className="
                              mint-input
                              w-full
                              p-3
                              pr-20
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

                            {
                              monedaPrincipal
                            }

                          </span>

                        </div>

                      </div>

                      <div
                        className="
                          overflow-hidden
                          rounded-[18px]
                          border
                          border-white/10
                          bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)]
                          p-5
                          shadow-[0_10px_26px_rgba(15,42,65,0.12)]
                        "
                      >

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-wide
                            font-semibold
                            text-white/60
                          "
                        >

                          {
                            es
                              ? "Tipo de cambio actual"
                              : "Current exchange rate"
                          }

                        </p>

                        <p
                          className="
                            text-2xl
                            font-bold
                            text-white
                            mt-1
                          "
                        >

                          1{" "}
                          {
                            monedaSecundaria
                          }

                          {" = "}

                          {
                            Number(
                              tipoCambio ||
                              0
                            ).toFixed(4)
                          }

                          {" "}

                          {
                            monedaPrincipal
                          }

                        </p>

                      </div>

                    </>
                  }

                  <div
                    className="
                      flex
                      justify-end
                      pt-2
                    "
                  >

                    <button
                      type="button"
                      onClick={
                        guardarConfiguracionMoneda
                      }
                      disabled={
                        guardandoMoneda
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
                        guardandoMoneda

                          ? (
                            es
                              ? "Guardando..."
                              : "Saving..."
                          )

                          : (
                            es
                              ? "Guardar cambios"
                              : "Save changes"
                          )
                      }

                    </button>

                  </div>

                </div>

              )
          }

        </div>

      }

    </div>

  );

}