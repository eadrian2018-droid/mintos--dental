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
    { codigo: "AED", nombreEs: "Dírham de Emiratos Árabes Unidos", nombreEn: "UAE dirham" },
    { codigo: "ARS", nombreEs: "Peso argentino", nombreEn: "Argentine peso" },
    { codigo: "AUD", nombreEs: "Dólar australiano", nombreEn: "Australian dollar" },
    { codigo: "BOB", nombreEs: "Boliviano", nombreEn: "Bolivian boliviano" },
    { codigo: "BRL", nombreEs: "Real brasileño", nombreEn: "Brazilian real" },
    { codigo: "CAD", nombreEs: "Dólar canadiense", nombreEn: "Canadian dollar" },
    { codigo: "CHF", nombreEs: "Franco suizo", nombreEn: "Swiss franc" },
    { codigo: "CLP", nombreEs: "Peso chileno", nombreEn: "Chilean peso" },
    { codigo: "CNY", nombreEs: "Yuan chino", nombreEn: "Chinese yuan" },
    { codigo: "COP", nombreEs: "Peso colombiano", nombreEn: "Colombian peso" },
    { codigo: "CRC", nombreEs: "Colón costarricense", nombreEn: "Costa Rican colón" },
    { codigo: "DOP", nombreEs: "Peso dominicano", nombreEn: "Dominican peso" },
    { codigo: "EUR", nombreEs: "Euro", nombreEn: "Euro" },
    { codigo: "GBP", nombreEs: "Libra esterlina", nombreEn: "British pound" },
    { codigo: "GTQ", nombreEs: "Quetzal guatemalteco", nombreEn: "Guatemalan quetzal" },
    { codigo: "HKD", nombreEs: "Dólar de Hong Kong", nombreEn: "Hong Kong dollar" },
    { codigo: "HNL", nombreEs: "Lempira hondureño", nombreEn: "Honduran lempira" },
    { codigo: "INR", nombreEs: "Rupia india", nombreEn: "Indian rupee" },
    { codigo: "JPY", nombreEs: "Yen japonés", nombreEn: "Japanese yen" },
    { codigo: "KRW", nombreEs: "Won surcoreano", nombreEn: "South Korean won" },
    { codigo: "MXN", nombreEs: "Peso mexicano", nombreEn: "Mexican peso" },
    { codigo: "NIO", nombreEs: "Córdoba nicaragüense", nombreEn: "Nicaraguan córdoba" },
    { codigo: "NOK", nombreEs: "Corona noruega", nombreEn: "Norwegian krone" },
    { codigo: "NZD", nombreEs: "Dólar neozelandés", nombreEn: "New Zealand dollar" },
    { codigo: "PAB", nombreEs: "Balboa panameño", nombreEn: "Panamanian balboa" },
    { codigo: "PEN", nombreEs: "Sol peruano", nombreEn: "Peruvian sol" },
    { codigo: "PYG", nombreEs: "Guaraní paraguayo", nombreEn: "Paraguayan guaraní" },
    { codigo: "SEK", nombreEs: "Corona sueca", nombreEn: "Swedish krona" },
    { codigo: "SGD", nombreEs: "Dólar de Singapur", nombreEn: "Singapore dollar" },
    { codigo: "USD", nombreEs: "Dólar estadounidense", nombreEn: "U.S. dollar" },
    { codigo: "UYU", nombreEs: "Peso uruguayo", nombreEn: "Uruguayan peso" },
    { codigo: "ZAR", nombreEs: "Rand sudafricano", nombreEn: "South African rand" },
  ];

  function cambiarMonedaPrincipal(nuevaMoneda: string) {
    setMonedaPrincipal(nuevaMoneda);

    if (nuevaMoneda === monedaSecundaria) {
      setMonedaSecundaria("");
      setTipoCambio("");
    }
  }

  useEffect(() => {
    cargarConfiguracionMoneda();
  }, []);

  async function cargarConfiguracionMoneda() {
    setCargandoMoneda(true);

    const { data, error } = await supabase
      .from("configuracion_finanzas")
      .select("clave, valor")
      .in("clave", [
        "moneda_principal",
        "moneda_secundaria",
        "moneda_secundaria_activa",
        "tipo_cambio",
      ]);

    if (error) {
      console.error("Error cargando configuración de moneda:", error);
      setCargandoMoneda(false);
      return;
    }

    const valores = Object.fromEntries(
      (data ?? []).map((fila) => [fila.clave, String(fila.valor ?? "")])
    );

    const principal = valores.moneda_principal || "MXN";
    const secundaria = valores.moneda_secundaria || "USD";
    const secundariaActiva = valores.moneda_secundaria_activa !== "false";
    const cambio = valores.tipo_cambio || "";

    setMonedaPrincipal(principal);
    setMonedaSecundaria(secundaria);
    setMonedaSecundariaActiva(secundariaActiva);
    setTipoCambio(cambio);
    setConfiguracionMonedaOriginal({
      monedaPrincipal: principal,
      monedaSecundaria: secundaria,
      monedaSecundariaActiva: secundariaActiva,
      tipoCambio: cambio,
    });

    setCargandoMoneda(false);
  }

  async function guardarConfiguracionMoneda() {
    if (monedaSecundariaActiva && !monedaSecundaria) {
      alert(
        es
          ? "Selecciona una moneda secundaria."
          : "Select a secondary currency."
      );
      return;
    }

    if (monedaSecundariaActiva && monedaPrincipal === monedaSecundaria) {
      alert(
        es
          ? "La moneda secundaria debe ser diferente de la moneda principal."
          : "The secondary currency must be different from the primary currency."
      );
      return;
    }

    const valorCambio = Number(tipoCambio);

    if (monedaSecundariaActiva && (!valorCambio || valorCambio <= 0)) {
      alert(
        es
          ? "Ingresa un tipo de cambio válido."
          : "Enter a valid exchange rate."
      );
      return;
    }

    setGuardandoMoneda(true);

    const ahora = new Date().toISOString();
    const filas = [
      {
        clave: "moneda_principal",
        valor: monedaPrincipal,
        descripcion: "Moneda principal utilizada por la clínica",
        updated_at: ahora,
      },
      {
        clave: "moneda_secundaria",
        valor: monedaSecundaria,
        descripcion: "Moneda secundaria opcional utilizada por la clínica",
        updated_at: ahora,
      },
      {
        clave: "moneda_secundaria_activa",
        valor: String(monedaSecundariaActiva),
        descripcion: "Indica si la clínica utiliza una segunda moneda",
        updated_at: ahora,
      },
      {
        clave: "tipo_cambio",
        valor: monedaSecundariaActiva ? valorCambio.toFixed(4) : "1",
        descripcion: "Tipo de cambio entre la moneda secundaria y la moneda principal",
        updated_at: ahora,
      },
    ];

    const { error } = await supabase
      .from("configuracion_finanzas")
      .upsert(filas, { onConflict: "clave" });

    if (error) {
      console.error("Error guardando configuración de moneda:", error);
      alert(
        es
          ? "Error guardando la configuración de moneda."
          : "Error saving currency settings."
      );
      setGuardandoMoneda(false);
      return;
    }

    const cambioGuardado = monedaSecundariaActiva
      ? valorCambio.toFixed(4)
      : "1";

    await registrarBitacora({
      accion: "Cambiar configuración de moneda",
      modulo: "Configuración financiera",
      detalle:
        `${configuracionMonedaOriginal.monedaPrincipal}` +
        `${configuracionMonedaOriginal.monedaSecundariaActiva ? ` + ${configuracionMonedaOriginal.monedaSecundaria} (${configuracionMonedaOriginal.tipoCambio || "—"})` : ""}` +
        ` → ${monedaPrincipal}` +
        `${monedaSecundariaActiva ? ` + ${monedaSecundaria} (${cambioGuardado})` : ""}`,
    });

    setTipoCambio(cambioGuardado);
    setConfiguracionMonedaOriginal({
      monedaPrincipal,
      monedaSecundaria,
      monedaSecundariaActiva,
      tipoCambio: cambioGuardado,
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

            {es ? "Tratamientos" : "Treatments"}

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

            {es ? "Comisiones y costos" : "Commissions and costs"}

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
                mint-tab

                ${
                  seccion ===
                  "pagos"

                    ? "mint-tab-active"

                    : ""
                }
              `}
            >

             {es ? "Métodos de pago" : "Payment Methods"}

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
                mint-tab

                ${
                  seccion ===
                  "moneda"

                    ? "mint-tab-active"

                    : ""
                }
              `}
            >

              {es ? "Moneda" : "Currency"}

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
            bg-white
            p-6
            shadow-[0_12px_34px_rgba(15,42,65,0.06)]
          "
        >

          <h2
            className="
              text-xl
              font-bold
              text-[var(--mint-navy)]
            "
          >
            {es ? "Moneda" : "Currency"}
          </h2>

          <p
            className="
              mint-text-secondary
              mt-2
            "
          >
            {
              es
                ? "Configura la moneda principal de la clínica y, si lo necesitas, una segunda moneda con su tipo de cambio."
                : "Configure the clinic's primary currency and, if needed, a secondary currency with its exchange rate."
            }
          </p>

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
                  {es ? "Cargando configuración..." : "Loading settings..."}
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
                      bg-white
                      p-5
                    "
                  >
                    <label className="block text-sm font-bold text-[var(--mint-navy)] mb-2">
                      {es ? "Moneda principal" : "Primary currency"}
                    </label>

                    <select
                      value={monedaPrincipal}
                      onChange={(e) => cambiarMonedaPrincipal(e.target.value)}
                      className="mint-input w-full p-3"
                    >
                      {monedas.map((moneda) => (
                        <option key={moneda.codigo} value={moneda.codigo}>
                          {moneda.codigo} — {es ? moneda.nombreEs : moneda.nombreEn}
                        </option>
                      ))}
                    </select>

                    <p className="text-xs mint-text-muted mt-2">
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
                      bg-[linear-gradient(100deg,#f1faf8_0%,#ffffff_100%)]
                      p-5
                    "
                  >
                    <div>
                      <p className="font-semibold mint-text-primary">
                        {es ? "Usar segunda moneda" : "Use secondary currency"}
                      </p>
                      <p className="text-sm mint-text-secondary mt-1">
                        {
                          es
                            ? "Actívala si la clínica cobra o registra importes en otra moneda."
                            : "Enable it if the clinic charges or records amounts in another currency."
                        }
                      </p>
                    </div>

                    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={monedaSecundariaActiva}
                        onChange={(e) => setMonedaSecundariaActiva(e.target.checked)}
                        className="peer sr-only"
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
                      <div>
                        <label className="block text-sm font-semibold mint-text-primary mb-2">
                          {es ? "Moneda secundaria" : "Secondary currency"}
                        </label>

                        <select
                          value={monedaSecundaria}
                          onChange={(e) => setMonedaSecundaria(e.target.value)}
                          className="mint-input w-full p-3"
                        >
                          <option value="">
                            {es ? "Selecciona una moneda" : "Select a currency"}
                          </option>

                          {monedas
                            .filter((moneda) => moneda.codigo !== monedaPrincipal)
                            .map((moneda) => (
                              <option key={moneda.codigo} value={moneda.codigo}>
                                {moneda.codigo} — {es ? moneda.nombreEs : moneda.nombreEn}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mint-text-primary mb-2">
                          {es ? "Tipo de cambio" : "Exchange rate"}
                        </label>

                        <p className="text-xs font-semibold mint-text-muted mb-2">
                          1 {monedaSecundaria} {es ? "equivale a:" : "equals:"}
                        </p>

                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="0.0001"
                            value={tipoCambio}
                            onChange={(e) => setTipoCambio(e.target.value)}
                            className="mint-input w-full p-3 pr-20 text-lg font-semibold"
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
                            {monedaPrincipal}
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
                        <p className="text-xs uppercase tracking-wide font-semibold text-white/60">
                          {es ? "Tipo de cambio actual" : "Current exchange rate"}
                        </p>

                        <p className="text-2xl font-bold text-white mt-1">
                          1 {monedaSecundaria} = {Number(tipoCambio || 0).toFixed(4)} {monedaPrincipal}
                        </p>
                      </div>
                    </>
                  }

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={guardarConfiguracionMoneda}
                      disabled={guardandoMoneda}
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
                          ? es ? "Guardando..." : "Saving..."
                          : es ? "Guardar cambios" : "Save changes"
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