import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  Tratamiento,
} from "../../types/Tratamiento";

import { supabase }
  from "../../lib/supabase";

import { useAuth }
  from "../../context/AuthContext";

import { useLanguage }
  from "../../context/LanguageContext";

import { registrarBitacora }
  from "../../lib/registrarBitacora";

type PagoComision = {
  id?: number;
  tratamiento_id?: number;
  moneda?: string;
  monto_original?: number;
  comision_doctor_porcentaje?: number | null;
  comision_doctor_pagada?: boolean;
  comision_doctor_fecha_pago?: string | null;
  comision_doctor_metodo_pago?: string | null;
  comision_doctor_pago_moneda?: string | null;
  comision_doctor_pago_monto?: number;
};

type ComisionesProps = {
  doctores: Doctor[];
  tratamientos: Tratamiento[];
  pagos?: PagoComision[];

  setDoctorDetalle:
    Dispatch<
      SetStateAction<
        Doctor | null
      >
    >;

  setMostrarDetalleDoctor:
    Dispatch<
      SetStateAction<boolean>
    >;
};

type Vista =
  | "doctores"
  | "especialistas";

type FormaPagoEspecialista =
  | "MXN"
  | "USD"
  | "Transferencia";

type FormaPagoDoctor =
  | "MXN"
  | "USD"
  | "Transferencia";

export default function Comisiones({
  doctores,
  tratamientos,
  pagos = [],
  setDoctorDetalle,
  setMostrarDetalleDoctor,
}: ComisionesProps) {

  const {
    perfil,
  } = useAuth();

  const esAdmin =
    perfil?.rol === "admin";

  const { language } = useLanguage();
  const es = language === "es";
  const locale = es ? "es-MX" : "en-US";
  const tr = (espanol: string, english: string) => es ? espanol : english;

  const [monedaPrincipal, setMonedaPrincipal] = useState<"MXN" | "USD">("MXN");
  const [monedaSecundariaActiva, setMonedaSecundariaActiva] = useState(true);

  useEffect(() => {
    let activo = true;
    async function cargarConfiguracionMonedas() {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("clave, valor")
        .in("clave", ["moneda_principal", "moneda_secundaria_activa"]);
      if (error || !activo) return;
      const valores = Object.fromEntries(
        (data ?? []).map((fila) => [fila.clave, String(fila.valor ?? "")])
      );
      setMonedaPrincipal(valores.moneda_principal === "USD" ? "USD" : "MXN");
      setMonedaSecundariaActiva(valores.moneda_secundaria_activa !== "false");
    }
    void cargarConfiguracionMonedas();
    return () => { activo = false; };
  }, []);

  const mostrarMXN = monedaPrincipal === "MXN" || monedaSecundariaActiva;
  const mostrarUSD = monedaPrincipal === "USD" || monedaSecundariaActiva;
  const monedasActivas = (["MXN", "USD"] as const).filter(
    (moneda) => moneda === "MXN" ? mostrarMXN : mostrarUSD
  );

  const traducirMetodo = (metodo: string) =>
    es ? metodo : ({ "Efectivo": "Cash", "Transferencia": "Transfer", "Tarjeta": "Card" } as Record<string, string>)[metodo] || metodo;


  const [
    vista,
    setVista,
  ] = useState<Vista>(
    "doctores"
  );

  const [
    tratamientoPago,
    setTratamientoPago,
  ] = useState<any | null>(
    null
  );

  const [
    formaPagoEspecialista,
    setFormaPagoEspecialista,
  ] = useState<FormaPagoEspecialista>(
    "MXN"
  );

  const [
    montoPagoEspecialista,
    setMontoPagoEspecialista,
  ] = useState("");

  const [
    doctorPago,
    setDoctorPago,
  ] = useState<any | null>(
    null
  );

  const [
    formaPagoDoctor,
    setFormaPagoDoctor,
  ] = useState<FormaPagoDoctor>(
    "MXN"
  );

  const [
    montoPagoDoctor,
    setMontoPagoDoctor,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  // Los pagos históricos conservan su moneda original; la configuración
  // únicamente afecta las opciones y los resúmenes visibles.
  useEffect(() => {
    if (formaPagoDoctor === "MXN" && !mostrarMXN) setFormaPagoDoctor("USD");
    if (formaPagoDoctor === "USD" && !mostrarUSD) setFormaPagoDoctor("MXN");
    if (formaPagoEspecialista === "MXN" && !mostrarMXN) setFormaPagoEspecialista("USD");
    if (formaPagoEspecialista === "USD" && !mostrarUSD) setFormaPagoEspecialista("MXN");
  }, [mostrarMXN, mostrarUSD, formaPagoDoctor, formaPagoEspecialista]);


  const formatoMonto =
    (
      monto: number
    ) =>
      Number(
        monto || 0
      ).toLocaleString(
        locale,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

  const tratamientosAny =
    tratamientos as any[];

  const resumenDoctores =
    useMemo(
      () =>
        doctores
          .filter(
            (doctor: any) =>
              doctor.tipo_doctor === "doctor" ||
              doctor.tipo_doctor === "ambos"
          )
          .map(
            (doctor) => {

              const tratamientosDoctor =
                tratamientosAny.filter(
                  (tratamiento) =>
                    Number(
                      tratamiento.doctor_id
                    ) ===
                    Number(
                      doctor.id
                    )
                );

              const finalizados =
                tratamientosDoctor.filter(
                  (tratamiento) =>
                    tratamiento.estado ===
                    "Finalizado"
                );

              const ids =
                new Set(
                  finalizados.map(
                    (tratamiento) =>
                      Number(
                        tratamiento.id
                      )
                  )
                );

              const pagosDoctor =
                pagos.filter(
                  (pago) =>
                    ids.has(
                      Number(
                        pago.tratamiento_id
                      )
                    )
                );

              const calcularComision =
                (pago: PagoComision) => {

                  const porcentaje =
                    pago.comision_doctor_porcentaje !==
                      null &&
                    pago.comision_doctor_porcentaje !==
                      undefined
                      ? Number(
                          pago.comision_doctor_porcentaje
                        )
                      : Number(
                          doctor.porcentaje || 0
                        );

                  return (
                    Number(
                      pago.monto_original || 0
                    ) *
                    porcentaje /
                    100
                  );

                };

              const pagosMXN =
                pagosDoctor.filter(
                  (pago) =>
                    pago.moneda === "MXN"
                );

              const pagosUSD =
                pagosDoctor.filter(
                  (pago) =>
                    pago.moneda === "USD"
                );

              const comisionMXN =
                pagosMXN.reduce(
                  (total, pago) =>
                    total +
                    calcularComision(pago),
                  0
                );

              const comisionUSD =
                pagosUSD.reduce(
                  (total, pago) =>
                    total +
                    calcularComision(pago),
                  0
                );

              const pagadoMXN =
                pagosDoctor
                  .filter(
                    (pago) =>
                      pago.comision_doctor_pagada === true
                      &&
                      pago.comision_doctor_pago_moneda === "MXN"
                  )
                  .reduce(
                    (total, pago) =>
                      total +
                      Number(
                        pago.comision_doctor_pago_monto || 0
                      ),
                    0
                  );

              const pagadoUSD =
                pagosDoctor
                  .filter(
                    (pago) =>
                      pago.comision_doctor_pagada === true
                      &&
                      pago.comision_doctor_pago_moneda === "USD"
                  )
                  .reduce(
                    (total, pago) =>
                      total +
                      Number(
                        pago.comision_doctor_pago_monto || 0
                      ),
                    0
                  );

              return {
                doctor,
                finalizados:
                  finalizados.length,
                comisionMXN,
                comisionUSD,
                pagadoMXN,
                pagadoUSD,
                pendienteMXN:
                  Math.max(
                    comisionMXN - pagadoMXN,
                    0
                  ),
                pendienteUSD:
                  Math.max(
                    comisionUSD - pagadoUSD,
                    0
                  ),
                pagosDoctor,
              };

            }
          ),
      [
        doctores,
        pagos,
        tratamientos,
      ]
    );

  const totalComisionMXN =
    resumenDoctores.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteMXN,
      0
    );

  const totalComisionUSD =
    resumenDoctores.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteUSD,
      0
    );

  const tratamientosEspecialistas =
    useMemo(
      () =>
        tratamientosAny.filter(
          (tratamiento) =>
            Boolean(
              tratamiento
                .especialista_id
            )
            &&
            Number(
              tratamiento.especialista ||
              0
            ) > 0
        ),
      [
        tratamientos,
      ]
    );

  const resumenEspecialistas =
    useMemo(
      () => {

        const especialistasConfigurados =
          doctores.filter(
            (doctor: any) =>
              doctor.tipo_doctor === "especialista" ||
              doctor.tipo_doctor === "ambos"
          );

        return especialistasConfigurados.map(
          (doctor: any) => {

            const tratamientosEspecialista =
              tratamientosEspecialistas.filter(
                (tratamiento) =>
                  Number(
                    tratamiento.especialista_id
                  ) ===
                  Number(
                    doctor.id
                  )
              );

            let pendienteMXN = 0;
            let pendienteUSD = 0;
            let pagadoMXN = 0;
            let pagadoUSD = 0;

            tratamientosEspecialista.forEach(
              (tratamiento) => {

                const costo =
                  Number(
                    tratamiento.especialista || 0
                  );

                const moneda =
                  tratamiento.moneda_especialista ===
                  "USD"
                    ? "USD"
                    : "MXN";

                if (
                  tratamiento.especialista_pagado ===
                  true
                ) {

                  if (moneda === "USD") {
                    pagadoUSD += costo;
                  }
                  else {
                    pagadoMXN += costo;
                  }

                  return;
                }

                if (
                  tratamiento.estado !==
                  "Finalizado"
                ) {
                  return;
                }

                if (moneda === "USD") {
                  pendienteUSD += costo;
                }
                else {
                  pendienteMXN += costo;
                }

              }
            );

            return {
              id: doctor.id,
              nombre:
                doctor.nombre ||
                "Especialista",
              doctor,
              tratamientos:
                tratamientosEspecialista,
              pendienteMXN,
              pendienteUSD,
              pagadoMXN,
              pagadoUSD,
            };

          }
        );

      },
      [
        doctores,
        tratamientosEspecialistas,
      ]
    );

  const pendienteEspecialistasMXN =
    resumenEspecialistas.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteMXN,
      0
    );

  const pendienteEspecialistasUSD =
    resumenEspecialistas.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pendienteUSD,
      0
    );

  async function registrarPagoDoctor() {

    if (!doctorPago?.doctor?.id) return;

    const monto =
      Number(
        montoPagoDoctor
      );

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      alert(tr("Ingresa una cantidad válida.", "Enter a valid amount."));
      return;
    }

    const monedaPago =
      formaPagoDoctor === "USD" || (formaPagoDoctor === "Transferencia" && !mostrarMXN)
        ? "USD"
        : "MXN";

    const metodoPago =
      formaPagoDoctor === "Transferencia"
        ? "Transferencia"
        : "Efectivo";

    const pendiente =
      monedaPago === "USD"
        ? Number(doctorPago.pendienteUSD || 0)
        : Number(doctorPago.pendienteMXN || 0);

    if (monto > pendiente + 0.01) {
      alert(
        tr("La cantidad no puede ser mayor a la comisión pendiente.", "The amount cannot exceed the outstanding commission.")
      );
      return;
    }

    /*
      Cada fila de pagos representa una comisión generada.
      Con el esquema actual la marcamos pagada por fila,
      igual que el tratamiento del especialista se liquida
      como una obligación completa.
    */
    const pagosPendientes =
      doctorPago.pagosDoctor.filter(
        (pago: PagoComision) =>
          pago.moneda === monedaPago
          &&
          pago.comision_doctor_pagada !== true
      );

    const totalPendienteFilas =
      pagosPendientes.reduce(
        (
          total: number,
          pago: PagoComision
        ) => {

          const porcentaje =
            pago.comision_doctor_porcentaje !==
              null &&
            pago.comision_doctor_porcentaje !==
              undefined
              ? Number(
                  pago.comision_doctor_porcentaje
                )
              : Number(
                  doctorPago.doctor.porcentaje || 0
                );

          return (
            total +
            (
              Number(
                pago.monto_original || 0
              ) *
              porcentaje /
              100
            )
          );

        },
        0
      );

    if (
      Math.abs(
        monto -
        totalPendienteFilas
      ) > 0.01
    ) {
      alert(
        tr(`Para mantener el control exacto por cobro, paga la comisión pendiente completa: $${formatoMonto(totalPendienteFilas)} ${monedaPago}.`, `To keep payment records accurate, pay the full outstanding commission: $${formatoMonto(totalPendienteFilas)} ${monedaPago}.`)
      );
      return;
    }

    setGuardando(true);

    const fechaPago =
      new Date().toISOString();

    for (
      const pago of
      pagosPendientes
    ) {

      const porcentajePago =
        pago.comision_doctor_porcentaje !==
          null &&
        pago.comision_doctor_porcentaje !==
          undefined
          ? Number(
              pago.comision_doctor_porcentaje
            )
          : Number(
              doctorPago.doctor.porcentaje || 0
            );

      const montoComision =
        Number(
          pago.monto_original || 0
        ) *
        porcentajePago /
        100;

      const { error } =
        await supabase
          .from("pagos")
          .update({
            comision_doctor_pagada:
              true,
            comision_doctor_fecha_pago:
              fechaPago,
            comision_doctor_metodo_pago:
              metodoPago,
            comision_doctor_pago_moneda:
              monedaPago,
            comision_doctor_pago_monto:
              montoComision,
          })
          .eq(
            "id",
            pago.id
          );

      if (error) {

        setGuardando(false);

        console.error(
          "Error registrando pago de comisión:",
          error
        );

        alert(
          tr("No se pudo registrar el pago de la comisión.", "The commission payment could not be recorded.")
        );

        return;

      }

    }

    await registrarBitacora({
      accion: "Pagar comisión a doctor",
      modulo: "Comisiones",
      detalle:
        `Doctor ID: ${doctorPago.doctor.id} | Doctor: ${doctorPago.doctor.nombre || "-"} | Monto: ${monto} ${monedaPago} | Método: ${metodoPago} | Registros liquidados: ${pagosPendientes.length}`,
    });

    setGuardando(false);
    setDoctorPago(null);
    setMontoPagoDoctor("");
    window.location.reload();

  }

  async function registrarPagoEspecialista() {

    if (!tratamientoPago?.id) return;

    const monto = Number(montoPagoEspecialista);

    if (!Number.isFinite(monto) || monto <= 0) {
      alert(tr("Ingresa una cantidad válida.", "Enter a valid amount."));
      return;
    }

    const monedaPago =
      formaPagoEspecialista === "USD" || (formaPagoEspecialista === "Transferencia" && !mostrarMXN)
        ? "USD"
        : "MXN";

    const metodoPago =
      formaPagoEspecialista === "Transferencia"
        ? "Transferencia"
        : "Efectivo";

    setGuardando(true);

    const { error } =
      await supabase
        .from("tratamientos")
        .update({
          especialista_pagado: true,
          especialista_fecha_pago:
            new Date().toISOString(),
          especialista_metodo_pago:
            metodoPago,
          especialista_pago_moneda:
            monedaPago,
          especialista_pago_monto:
            monto,
        })
        .eq("id", tratamientoPago.id);

    setGuardando(false);

    if (error) {
      console.error(
        "Error registrando pago a especialista:",
        error
      );
      alert(
        tr("No se pudo registrar el pago al especialista.", "The specialist payment could not be recorded.")
      );
      return;
    }

    await registrarBitacora({
      accion: "Pagar especialista",
      modulo: "Comisiones",
      detalle:
        `Tratamiento ID: ${tratamientoPago.id} | Especialista ID: ${tratamientoPago.especialista_id || "-"} | Especialista: ${tratamientoPago.especialista_nombre || "-"} | Tratamiento: ${tratamientoPago.tratamiento || "-"} | Monto: ${monto} ${monedaPago} | Método: ${metodoPago}`,
    });

    setTratamientoPago(null);
    setMontoPagoEspecialista("");
    window.location.reload();

  }

  return (

    <div
      className="
        space-y-6
      "
    >

      <div className="mint-card overflow-hidden border border-[var(--mint-border)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#63c8b2]">
              {tr("Control de comisiones", "Commission management")}
            </p>
            <p className="text-sm text-white/85 mt-1">
              {tr("Consulta comisiones de doctores y adeudos a especialistas.", "Review doctor commissions and outstanding specialist payments.")}
            </p>
          </div>

          <div
            className="
              inline-flex
              p-1
              rounded-xl
              bg-white/10
              border
              border-white/25
              self-start
              shadow-sm
            "
          >

            <button
              type="button"
              onClick={() =>
                setVista(
                  "doctores"
                )
              }
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold

                ${
                  vista ===
                  "doctores"

                    ? `
                      !bg-[#102f4f]
                      !text-white
                      shadow-[0_3px_10px_rgba(15,42,65,0.08)]
                      ring-1
                      ring-[var(--mint-border-teal)]
                    `

                    : `
                      !text-white/80 hover:!text-white
                    `
                }
              `}
            >
              {tr("Doctores", "Doctors")}
            </button>

            <button
              type="button"
              onClick={() => {

                setVista(
                  "especialistas"
                );

                setDoctorDetalle(
                  null
                );

                setMostrarDetalleDoctor(
                  false
                );

              }}
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold

                ${
                  vista ===
                  "especialistas"

                    ? `
                        !bg-[#102f4f]
                        !text-white
                        shadow-[0_3px_10px_rgba(15,42,65,0.08)]
                        ring-1
                        ring-[var(--mint-border-teal)]
                      `

                    : `
                        !text-white/80 hover:!text-white
                      `
                }
              `}
            >
              {tr("Especialistas", "Specialists")}
            </button>

          </div>

        </div>
        <div className="h-1 bg-[linear-gradient(90deg,#249884_0%,#63c8b2_58%,#d8bd72_100%)]" />
      </div>

      {
        vista ===
        "doctores"

          ? (

            <>

              <div
                className={`
                  grid
                  ${mostrarMXN && mostrarUSD ? "md:grid-cols-3" : "md:grid-cols-2"}
                  gap-4
                `}
              >

                <div
                  className="
                    mint-card-primary
                    relative
                    overflow-hidden
                    p-5
                    border
                    border-[var(--mint-border-teal)]
                    shadow-[0_8px_24px_rgba(15,42,65,0.05)]
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Doctores", "Doctors")}
                  </p>

                  <p className="text-2xl font-bold mint-text-primary mt-2">
                    {
                      resumenDoctores.length
                    }
                  </p>
                </div>

                {mostrarMXN && (
<div
                  className="
                    mint-card
                    relative
                    overflow-hidden
                    p-5
                    border
                    border-[var(--mint-border)]
                    shadow-[0_8px_24px_rgba(15,42,65,0.05)]
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Por pagar MXN", "MXN due")}
                  </p>

                  <p className="text-2xl font-bold text-[var(--mint-success)] mt-2">
                    $
                    {
                      formatoMonto(
                        totalComisionMXN
                      )
                    }
                  </p>
                </div>
)}

                {mostrarUSD && (
<div
                  className="
                    mint-card-accent
                    relative
                    overflow-hidden
                    p-5
                    border
                    border-[var(--mint-border)]
                    shadow-[0_8px_24px_rgba(15,42,65,0.05)]
                  "
                >
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Por pagar USD", "USD due")}
                  </p>

                  <p className="text-2xl font-bold mint-text-accent mt-2">
                    $
                    {
                      formatoMonto(
                        totalComisionUSD
                      )
                    }
                  </p>
                </div>
)}

              </div>

              <div
                className="
                  mint-card
                  overflow-hidden
                  border
                  border-[var(--mint-border)]
                  shadow-[0_12px_30px_rgba(15,42,65,0.055)]
                "
              >

                <div className="overflow-x-auto">

                  <table className="mint-table w-full">

                    <thead>
                      <tr>
                        <th className="p-4 text-left">
                          Doctor
                        </th>
                        <th className="p-4 text-center">
                          %
                        </th>
                        <th className="p-4 text-center">
                          {tr("Finalizados", "Completed")}
                        </th>
                        {mostrarMXN && (<th className="p-4 text-right">
                          {tr("Pendiente MXN", "MXN pending")}
                        </th>)}
                        {mostrarMXN && (<th className="p-4 text-right">
                          {tr("Pagado MXN", "MXN paid")}
                        </th>)}
                        {mostrarUSD && (<th className="p-4 text-right">
                          {tr("Pendiente USD", "USD pending")}
                        </th>)}
                        {mostrarUSD && (<th className="p-4 text-right">
                          {tr("Pagado USD", "USD paid")}
                        </th>)}
                        <th className="p-4 text-right">
                          {tr("Acción", "Action")}
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {
                        resumenDoctores.map(
                          (
                            item
                          ) => (

                            <tr
                              key={
                                item.doctor.id
                              }
                              className="
                                mint-table-row
                              "
                            >

                              <td className="p-4">
                                <p className="font-semibold mint-text-primary">
                                  {
                                    item.doctor.nombre
                                  }
                                </p>

                                <p className="text-xs mint-text-muted mt-1">
                                  {
                                    item.doctor.especialidad ||
                                    tr("Doctor clínico", "Clinical doctor")
                                  }
                                </p>
                              </td>

                              <td className="p-4 text-center font-semibold">
                                {
                                  Number(
                                    item.doctor.porcentaje ||
                                    0
                                  )
                                }%
                              </td>

                              <td className="p-4 text-center">
                                {
                                  item.finalizados
                                }
                              </td>

                              {mostrarMXN && (<td className="p-4 text-right">
                                <span className="font-bold text-[var(--mint-danger)]">
                                  $
                                  {
                                    formatoMonto(
                                      item.pendienteMXN
                                    )
                                  }
                                </span>
                              </td>)}

                              {mostrarMXN && (<td className="p-4 text-right">
                                <span className="font-bold text-[var(--mint-success)]">
                                  $
                                  {
                                    formatoMonto(
                                      item.pagadoMXN
                                    )
                                  }
                                </span>
                              </td>)}

                              {mostrarUSD && (<td className="p-4 text-right">
                                <span className="font-bold text-[var(--mint-warning)]">
                                  $
                                  {
                                    formatoMonto(
                                      item.pendienteUSD
                                    )
                                  }
                                </span>
                              </td>)}

                              {mostrarUSD && (<td className="p-4 text-right">
                                <span className="font-bold mint-text-accent">
                                  $
                                  {
                                    formatoMonto(
                                      item.pagadoUSD
                                    )
                                  }
                                </span>
                              </td>)}

                              <td className="p-4 text-right">

                                <div className="flex justify-end gap-2">

                                  {
                                    esAdmin &&
                                    (
                                      item.pendienteMXN > 0 ||
                                      item.pendienteUSD > 0
                                    )
                                    &&
                                    <button
                                      type="button"
                                      onClick={() => {

                                        const usarUSD =
                                          (!mostrarMXN || item.pendienteMXN <= 0) &&
                                          item.pendienteUSD > 0;

                                        setFormaPagoDoctor(
                                          usarUSD
                                            ? "USD"
                                            : "MXN"
                                        );

                                        setMontoPagoDoctor(
                                          String(
                                            usarUSD
                                              ? item.pendienteUSD
                                              : item.pendienteMXN
                                          )
                                        );

                                        setDoctorPago(
                                          item
                                        );

                                      }}
                                      className="
                                        mint-btn
                                        mint-btn-primary
                                        mint-btn-sm
                                      "
                                    >
                                      {tr("Pagar", "Pay")}
                                    </button>
                                  }

                                  <button
                                    type="button"
                                    onClick={() => {

                                      setDoctorDetalle(
                                        item.doctor
                                      );

                                      setMostrarDetalleDoctor(
                                        true
                                      );

                                    }}
                                    className="
                                      mint-btn
                                      mint-btn-action
                                      mint-btn-sm
                                    "
                                  >
                                    {tr("Ver detalle", "View details")}
                                  </button>

                                </div>

                              </td>

                            </tr>

                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>

              </div>

            </>

          )

          : (

            <>

              <div
                className={`
                  grid
                  ${mostrarMXN && mostrarUSD ? "md:grid-cols-3" : "md:grid-cols-2"}
                  gap-4
                `}
              >

                <div className="mint-card-primary relative overflow-hidden p-5 border border-[var(--mint-border-teal)] shadow-[0_8px_24px_rgba(15,42,65,0.05)]">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Especialistas", "Specialists")}
                  </p>

                  <p className="text-2xl font-bold mint-text-primary mt-2">
                    {
                      resumenEspecialistas.length
                    }
                  </p>
                </div>

                {mostrarMXN && (
<div className="mint-card relative overflow-hidden p-5 border border-[var(--mint-border)] shadow-[0_8px_24px_rgba(15,42,65,0.05)]">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Por pagar MXN", "MXN due")}
                  </p>

                  <p className="text-2xl font-bold text-[var(--mint-danger)] mt-2">
                    $
                    {
                      formatoMonto(
                        pendienteEspecialistasMXN
                      )
                    }
                  </p>
                </div>
)}

                {mostrarUSD && (
<div className="mint-card-accent relative overflow-hidden p-5 border border-[var(--mint-border)] shadow-[0_8px_24px_rgba(15,42,65,0.05)]">
                  <p className="text-xs font-bold mint-text-muted uppercase">
                    {tr("Por pagar USD", "USD due")}
                  </p>

                  <p className="text-2xl font-bold mint-text-accent mt-2">
                    $
                    {
                      formatoMonto(
                        pendienteEspecialistasUSD
                      )
                    }
                  </p>
                </div>
)}

              </div>

              {
                resumenEspecialistas
                  .length === 0

                  ? (

                    <div className="mint-card p-10 text-center">
                      <p className="font-semibold mint-text-primary">
                        {tr("No hay tratamientos con especialista.", "There are no specialist treatments.")}
                      </p>
                    </div>

                  )

                  : resumenEspecialistas.map(
                      (
                        especialista
                      ) => (

                        <div
                          key={
                            especialista.id
                          }
                          className="
                            mint-card
                            overflow-hidden
                            border
                            border-[var(--mint-border)]
                            shadow-[0_10px_28px_rgba(15,42,65,0.055)]
                          "
                        >

                          <div
                            className="
                              px-6
                              py-5
                              border-b
                              border-[var(--mint-border)]
                              flex
                              flex-col
                              md:flex-row
                              md:items-center
                              md:justify-between
                              gap-4
                            "
                          >

                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mint-text-brand">
                                {tr("Especialista", "Specialist")}
                              </p>

                              <h3 className="text-xl font-bold mint-text-primary mt-1">
                                {
                                  especialista.nombre
                                }
                              </h3>
                            </div>

                            <div className="flex gap-3 flex-wrap">

                              {mostrarMXN && (<div className="px-4 py-2 rounded-xl bg-[var(--mint-danger-bg)] border border-[var(--mint-danger-border)]">
                                <p className="text-[10px] uppercase font-bold text-[var(--mint-danger)]">
                                  {tr("Pendiente MXN", "MXN pending")}
                                </p>

                                <p className="font-bold text-[var(--mint-danger)]">
                                  $
                                  {
                                    formatoMonto(
                                      especialista.pendienteMXN
                                    )
                                  }
                                </p>
                              </div>)}

                              {mostrarUSD && (<div className="px-4 py-2 rounded-xl bg-[var(--mint-warning-bg)] border border-[var(--mint-warning-border)]">
                                <p className="text-[10px] uppercase font-bold text-[var(--mint-warning)]">
                                  {tr("Pendiente USD", "USD pending")}
                                </p>

                                <p className="font-bold text-[var(--mint-warning)]">
                                  $
                                  {
                                    formatoMonto(
                                      especialista.pendienteUSD
                                    )
                                  }
                                </p>
                              </div>)}

                            </div>

                          </div>

                          <div className="overflow-x-auto">

                            <table className="mint-table w-full">

                              <thead>
                                <tr>
                                  <th className="p-4 text-left">
                                    {tr("Fecha", "Date")}
                                  </th>
                                  <th className="p-4 text-left">
                                    {tr("Tratamiento", "Treatment")}
                                  </th>
                                  <th className="p-4 text-left">
                                    {tr("Estado", "Status")}
                                  </th>
                                  <th className="p-4 text-right">
                                    {tr("Costo", "Cost")}
                                  </th>
                                  <th className="p-4 text-center">
                                    {tr("Pago", "Payment")}
                                  </th>
                                  <th className="p-4 text-right">
                                    {tr("Acción", "Action")}
                                  </th>
                                </tr>
                              </thead>

                              <tbody>

                                {
                                  especialista
                                    .tratamientos
                                    .map(
                                      (
                                        tratamiento
                                      ) => {

                                        const pagado =
                                          tratamiento
                                            .especialista_pagado ===
                                          true;

                                        const finalizado =
                                          tratamiento.estado ===
                                          "Finalizado";

                                        return (

                                          <tr
                                            key={
                                              tratamiento.id
                                            }
                                            className="mint-table-row"
                                          >

                                            <td className="p-4 mint-text-secondary whitespace-nowrap">
                                              {
                                                tratamiento.fecha ||
                                                "—"
                                              }
                                            </td>

                                            <td className="p-4">
                                              <p className="font-semibold mint-text-primary">
                                                {
                                                  tratamiento.tratamiento ||
                                                  tr("Tratamiento", "Treatment")
                                                }
                                              </p>
                                            </td>

                                            <td className="p-4">
                                              <span
                                                className={`
                                                  inline-flex
                                                  px-3
                                                  py-1
                                                  rounded-full
                                                  text-xs
                                                  font-semibold
                                                  border

                                                  ${
                                                    finalizado

                                                      ? `
                                                        bg-[var(--mint-success-bg)]
                                                        text-[var(--mint-success)]
                                                        border-[var(--mint-success-border)]
                                                      `

                                                      : `
                                                        bg-[var(--mint-bg-soft)]
                                                        mint-text-secondary
                                                        border-[var(--mint-border)]
                                                      `
                                                  }
                                                `}
                                              >
                                                {
                                                  tratamiento.estado ||
                                                  tr("Pendiente", "Pending")
                                                }
                                              </span>
                                            </td>

                                            <td className="p-4 text-right whitespace-nowrap">
                                              <span className="font-bold mint-text-primary">
                                                $
                                                {
                                                  formatoMonto(
                                                    Number(
                                                      tratamiento.especialista ||
                                                      0
                                                    )
                                                  )
                                                }
                                              </span>

                                              <span className="ml-2 text-xs mint-text-muted">
                                                {
                                                  tratamiento.moneda_especialista ===
                                                  "USD"
                                                    ? "USD"
                                                    : "MXN"
                                                }
                                              </span>
                                            </td>

                                            <td className="p-4 text-center">

                                              {
                                                pagado

                                                  ? (

                                                    <div>
                                                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[var(--mint-success-bg)] text-[var(--mint-success)] border border-[var(--mint-success-border)]">
                                                        {tr("Pagado", "Paid")}
                                                      </span>

                                                      <p className="text-[10px] mint-text-muted mt-1">
                                                        {
                                                          traducirMetodo(tratamiento.especialista_metodo_pago || "—")
                                                        }
                                                      </p>
                                                    </div>

                                                  )

                                                  : (

                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[var(--mint-danger-bg)] text-[var(--mint-danger)] border border-[var(--mint-danger-border)]">
                                                      {tr("Pendiente", "Pending")}
                                                    </span>

                                                  )
                                              }

                                            </td>

                                            <td className="p-4 text-right">

                                              {
                                                pagado

                                                  ? (

                                                    <span className="text-xs mint-text-muted">
                                                      {
                                                        tratamiento.especialista_fecha_pago
                                                          ? new Date(
                                                              tratamiento.especialista_fecha_pago
                                                            )
                                                              .toLocaleDateString(
                                                                locale
                                                              )
                                                          : tr("Registrado", "Recorded")
                                                      }
                                                    </span>

                                                  )

                                                  : finalizado &&
                                                    esAdmin

                                                    ? (

                                                      <button
                                                        type="button"
                                                        onClick={() => {

                                                          setFormaPagoEspecialista(
                                                            tratamiento.moneda_especialista ===
                                                            "USD"
                                                              ? "USD"
                                                              : "MXN"
                                                          );

                                                          setMontoPagoEspecialista(
                                                            String(
                                                              Number(
                                                                tratamiento.especialista ||
                                                                0
                                                              )
                                                            )
                                                          );

                                                          setTratamientoPago(
                                                            tratamiento
                                                          );

                                                        }}
                                                        className="
                                                          mint-btn
                                                          mint-btn-primary
                                                          mint-btn-sm
                                                        "
                                                      >
                                                        {tr("Pagar", "Pay")}
                                                      </button>

                                                    )

                                                    : (

                                                      <span className="text-xs mint-text-muted">
                                                        {tr("Al finalizar", "When completed")}
                                                      </span>

                                                    )
                                              }

                                            </td>

                                          </tr>

                                        );

                                      }
                                    )
                                }

                              </tbody>

                            </table>

                          </div>

                        </div>

                      )
                    )
              }

            </>

          )
      }

      {
        doctorPago

        &&

        <div
          className="
            fixed
            inset-0
            z-50
            bg-slate-950/35
            backdrop-blur-[2px]
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              mint-card
              w-full
              max-w-md
              overflow-hidden
              border
              border-[var(--mint-border-teal)]
              bg-[var(--mint-surface)]
              p-6
              shadow-[0_24px_70px_rgba(15,42,65,0.22)]
            "
          >

            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mint-text-brand">
              {tr("Pago de comisión", "Commission payment")}
            </p>

            <h3 className="text-xl font-bold mint-text-primary mt-1">
              {
                doctorPago.doctor?.nombre ||
                "Doctor"
              }
            </h3>

            <div className="mt-5 p-4 rounded-xl bg-[var(--mint-bg-soft)] border border-[var(--mint-border)]">

              <p className="text-xs font-bold uppercase mint-text-muted">
                {tr("Comisión pendiente", "Outstanding commission")}
              </p>

              <div className={`grid ${mostrarMXN && mostrarUSD ? "grid-cols-2" : "grid-cols-1"} gap-3 mt-3`}>

                {mostrarMXN && (<div>
                  <p className="text-xs mint-text-muted">
                    MXN
                  </p>

                  <p className="text-xl font-bold mint-text-primary">
                    $
                    {
                      formatoMonto(
                        doctorPago.pendienteMXN
                      )
                    }
                  </p>
                </div>)}

                {mostrarUSD && (<div>
                  <p className="text-xs mint-text-muted">
                    USD
                  </p>

                  <p className="text-xl font-bold mint-text-accent">
                    $
                    {
                      formatoMonto(
                        doctorPago.pendienteUSD
                      )
                    }
                  </p>
                </div>)}

              </div>

            </div>

            <div className="mt-5">

              <label className="text-sm font-semibold mint-text-primary">
                {tr("Forma de pago", "Payment method")}
              </label>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {(
                  [
                    ...monedasActivas,
                    "Transferencia",
                  ] as FormaPagoDoctor[]
                ).map((forma) => (
                  <button
                    key={forma}
                    type="button"
                    disabled={
                      forma === "MXN"
                        ? doctorPago.pendienteMXN <= 0
                        : (forma === "USD" || (forma === "Transferencia" && !mostrarMXN))
                          ? doctorPago.pendienteUSD <= 0
                          : (mostrarMXN ? doctorPago.pendienteMXN : doctorPago.pendienteUSD) <= 0
                    }
                    onClick={() => {

                      setFormaPagoDoctor(
                        forma
                      );

                      setMontoPagoDoctor(
                        String(
                          (forma === "USD" || (forma === "Transferencia" && !mostrarMXN))
                            ? doctorPago.pendienteUSD
                            : doctorPago.pendienteMXN
                        )
                      );

                    }}
                    className={`
                      px-3 py-2.5 rounded-xl text-sm
                      font-semibold border transition
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      ${
                        formaPagoDoctor === forma
                          ? "bg-[var(--mint-primary)] text-white border-[var(--mint-primary)]"
                          : "bg-[var(--mint-bg-card)] mint-text-secondary border-[var(--mint-border)]"
                      }
                    `}
                  >
                    {forma}
                  </button>
                ))}
              </div>

              <div className="mt-4">

                <label className="text-sm font-semibold mint-text-primary">
                  {tr("Cantidad", "Amount")}
                </label>

                <div className="relative mt-2">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 mint-text-muted font-semibold">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      montoPagoDoctor
                    }
                    onChange={(event) =>
                      setMontoPagoDoctor(
                        event.target.value
                      )
                    }
                    className="
                      w-full rounded-xl border
                      border-[var(--mint-border)]
                      bg-[var(--mint-bg-card)] pl-8 pr-16 py-2.5
                      text-sm font-semibold
                      mint-text-primary outline-none
                      focus:border-[var(--mint-primary)]
                    "
                    placeholder="0.00"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold mint-text-muted">
                    {
                      formaPagoDoctor === "USD" || (formaPagoDoctor === "Transferencia" && !mostrarMXN)
                        ? "USD"
                        : "MXN"
                    }
                  </span>

                </div>

              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                disabled={
                  guardando
                }
                onClick={() =>
                  setDoctorPago(
                    null
                  )
                }
                className="
                  mint-btn
                  mint-btn-secondary
                "
              >
                {tr("Cancelar", "Cancel")}
              </button>

              <button
                type="button"
                disabled={
                  guardando
                }
                onClick={
                  registrarPagoDoctor
                }
                className="
                  mint-btn
                  mint-btn-primary
                "
              >
                {
                  guardando
                    ? tr("Guardando...", "Saving...")
                    : tr("Confirmar pago", "Confirm payment")
                }
              </button>

            </div>

          </div>

        </div>
      }

      {
        tratamientoPago

        &&

        <div
          className="
            fixed
            inset-0
            z-50
            bg-slate-950/35
            backdrop-blur-[2px]
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              mint-card
              w-full
              max-w-md
              overflow-hidden
              border
              border-[var(--mint-border-teal)]
              bg-[var(--mint-surface)]
              p-6
              shadow-[0_24px_70px_rgba(15,42,65,0.22)]
            "
          >

            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mint-text-brand">
              {tr("Pago a especialista", "Specialist payment")}
            </p>

            <h3 className="text-xl font-bold mint-text-primary mt-1">
              {
                tratamientoPago.especialista_nombre ||
                tr("Especialista", "Specialist")
              }
            </h3>

            <div className="mt-5 p-4 rounded-xl bg-[var(--mint-bg-soft)] border border-[var(--mint-border)]">

              <p className="text-sm font-semibold mint-text-primary">
                {
                  tratamientoPago.tratamiento
                }
              </p>

              <p className="text-2xl font-bold mint-text-primary mt-2">
                $
                {
                  formatoMonto(
                    Number(
                      tratamientoPago.especialista ||
                      0
                    )
                  )
                }

                <span className="text-sm ml-2 mint-text-muted">
                  {
                    tratamientoPago.moneda_especialista ===
                    "USD"
                      ? "USD"
                      : "MXN"
                  }
                </span>
              </p>

            </div>

            <div className="mt-5">

              <label className="text-sm font-semibold mint-text-primary">
                {tr("Forma de pago", "Payment method")}
              </label>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {(
                  [
                    ...monedasActivas,
                    "Transferencia",
                  ] as FormaPagoEspecialista[]
                ).map((forma) => (
                  <button
                    key={forma}
                    type="button"
                    onClick={() =>
                      setFormaPagoEspecialista(forma)
                    }
                    className={`
                      px-3 py-2.5 rounded-xl text-sm
                      font-semibold border transition
                      ${
                        formaPagoEspecialista === forma
                          ? "bg-[var(--mint-primary)] text-white border-[var(--mint-primary)]"
                          : "bg-[var(--mint-bg-card)] mint-text-secondary border-[var(--mint-border)]"
                      }
                    `}
                  >
                    {forma}
                  </button>
                ))}
              </div>

              <div className="mt-4">

                <label className="text-sm font-semibold mint-text-primary">
                  {tr("Cantidad", "Amount")}
                </label>

                <div className="relative mt-2">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 mint-text-muted font-semibold">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={montoPagoEspecialista}
                    onChange={(event) =>
                      setMontoPagoEspecialista(
                        event.target.value
                      )
                    }
                    className="
                      w-full rounded-xl border
                      border-[var(--mint-border)]
                      bg-[var(--mint-bg-card)] pl-8 pr-16 py-2.5
                      text-sm font-semibold
                      mint-text-primary outline-none
                      focus:border-[var(--mint-primary)]
                    "
                    placeholder="0.00"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold mint-text-muted">
                    {
                      formaPagoEspecialista === "USD" || (formaPagoEspecialista === "Transferencia" && !mostrarMXN)
                        ? "USD"
                        : "MXN"
                    }
                  </span>

                </div>

              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                disabled={
                  guardando
                }
                onClick={() =>
                  setTratamientoPago(
                    null
                  )
                }
                className="
                  mint-btn
                  mint-btn-secondary
                "
              >
                {tr("Cancelar", "Cancel")}
              </button>

              <button
                type="button"
                disabled={
                  guardando
                }
                onClick={
                  registrarPagoEspecialista
                }
                className="
                  mint-btn
                  mint-btn-primary
                "
              >
                {
                  guardando
                    ? tr("Guardando...", "Saving...")
                    : tr("Confirmar pago", "Confirm payment")
                }
              </button>

            </div>

          </div>

        </div>
      }

    </div>

  );

}