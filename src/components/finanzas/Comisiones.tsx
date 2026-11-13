import { useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";

import type { Dispatch, SetStateAction } from "react";

import type { Doctor } from "../../types/Doctor";

import type { Tratamiento } from "../../types/Tratamiento";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import { useLanguage } from "../../context/LanguageContext";

import { calcularComisionNeta } from "../../lib/comisionNeta";

import { registrarBitacora } from "../../lib/registrarBitacora";

type PagoComision = {
  id?: number;
  doctor_id?: number | null;
  tratamiento_id?: number;
  moneda?: string;
  monto_original?: number;
  monto_mxn?: number;
  tipo_cambio?: number | null;
  comision_banco?: number;
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

  setDoctorDetalle: Dispatch<SetStateAction<Doctor | null>>;

  setMostrarDetalleDoctor: Dispatch<SetStateAction<boolean>>;
};

type Vista = "doctores" | "especialistas";

type FormaPagoEspecialista = "Efectivo" | "Transferencia";
type MonedaPagoEspecialista = "MXN" | "USD";

// Los honorarios se liquidan completos y se redondean a centavos.
const redondearImporte = (importe: number) =>
  Math.round((importe + Number.EPSILON) * 100) / 100;

type FormaPagoDoctor = "MXN" | "USD" | "Transferencia";

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

  // Conservar la misma solicitud al reintentar una liquidación incierta.
  const liquidacionPendienteRef = useRef<{ payload: string; id: string } | null>(null);
  const liquidacionEnCursoRef = useRef(false);
  const pagoEspecialistaEnCursoRef = useRef(false);

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
  ] = useState<FormaPagoEspecialista>("Efectivo");

  const [monedaPagoEspecialista, setMonedaPagoEspecialista] =
    useState<MonedaPagoEspecialista>("MXN");
  const [tipoCambioEspecialista, setTipoCambioEspecialista] = useState<number | null>(null);
  const [cargandoTipoCambioEspecialista, setCargandoTipoCambioEspecialista] = useState(false);

  // Leer el tipo de cambio vigente al abrir el pago; nunca tomar el tipo de
  // cambio de un tratamiento antiguo como si fuera la tasa actual.
  useEffect(() => {
    if (!tratamientoPago) return;
    let activo = true;
    setTipoCambioEspecialista(null);
    setCargandoTipoCambioEspecialista(true);
    void (async () => {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("valor")
        .eq("clave", "tipo_cambio")
        .maybeSingle();
      if (!activo) return;
      const tasa = Number(data?.valor);
      setTipoCambioEspecialista(!error && data && Number.isFinite(tasa) && tasa > 0 ? tasa : null);
      setCargandoTipoCambioEspecialista(false);
    })();
    return () => { activo = false; };
  }, [tratamientoPago]);

  const monedaHonorariosEspecialista: MonedaPagoEspecialista =
    tratamientoPago?.moneda_especialista === "USD" ? "USD" : "MXN";
  const requiereConversionEspecialista =
    monedaPagoEspecialista !== monedaHonorariosEspecialista;

  const importePagoEspecialista = useMemo(() => {
    if (!tratamientoPago) return null;
    const honorarios = Number(tratamientoPago.especialista);
    if (!Number.isFinite(honorarios) || honorarios <= 0) return null;
    if (!requiereConversionEspecialista) return redondearImporte(honorarios);
    if (!tipoCambioEspecialista || !Number.isFinite(tipoCambioEspecialista)) return null;
    const convertido = monedaHonorariosEspecialista === "MXN"
      ? honorarios / tipoCambioEspecialista
      : honorarios * tipoCambioEspecialista;
    return Number.isFinite(convertido) ? redondearImporte(convertido) : null;
  }, [tratamientoPago, requiereConversionEspecialista, tipoCambioEspecialista, monedaHonorariosEspecialista]);

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

  const [tratamientosActualizados, setTratamientosActualizados] = useState<Record<number, any>>({});

  const [doctorRevisionId, setDoctorRevisionId] = useState<number | null>(null);
  const [estadosCostos, setEstadosCostos] = useState<Record<number, { laboratorio: string; especialista: string }>>({});

  useEffect(() => {
    if (doctorRevisionId === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !guardando) setDoctorRevisionId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [doctorRevisionId, guardando]);

  const estadoCosto = (tratamiento: any, tipo: "laboratorio" | "especialista") =>
    estadosCostos[Number(tratamiento.id)]?.[tipo] ??
    (tratamiento[`${tipo}_validacion`] === "aplica" || tratamiento[`${tipo}_validacion`] === "no_aplica"
      ? tratamiento[`${tipo}_validacion`]
      : Number(tratamiento[tipo] || 0) > 0 ? "aplica" : "no_aplica");

  const costosValidados = (tratamiento: any) =>
    Boolean(tratamiento.costos_validados_at) &&
    ["aplica", "no_aplica"].includes(tratamiento.laboratorio_validacion) &&
    ["aplica", "no_aplica"].includes(tratamiento.especialista_validacion);

  const comisionAutorizada = (tratamiento: any) =>
    costosValidados(tratamiento) && Boolean(tratamiento.comision_autorizada_at);

  async function ejecutarAutorizacion(
    accion: "validar" | "autorizar",
    tratamiento: any
  ) {
    if (!esAdmin || guardando || !tratamiento?.id) return;
    setGuardando(true);
    try {
      const { error } = accion === "validar"
        ? await supabase.rpc("mintos_validar_costos_tratamiento", {
            p_tratamiento_id: Number(tratamiento.id),
            p_laboratorio_estado: estadoCosto(tratamiento, "laboratorio"),
            p_especialista_estado: estadoCosto(tratamiento, "especialista"),
          })
        : await supabase.rpc("mintos_autorizar_comision", {
            p_tratamiento_id: Number(tratamiento.id),
          });
      if (error) throw error;
      try {
        await registrarBitacora({
          accion: accion === "validar" ? "Validar costos de comisión" : "Autorizar comisión",
          modulo: "Comisiones",
          detalle: `Tratamiento ID: ${tratamiento.id}`,
        });
      } catch (bitacoraError) {
        console.error("No se pudo registrar la bitácora:", bitacoraError);
      }
      // Consultar el estado confirmado en Supabase sin cerrar el modal.
      const { data: tratamientoActualizado, error: errorLectura } = await supabase
        .from("tratamientos")
        .select("*")
        .eq("id", Number(tratamiento.id))
        .single();

      if (errorLectura || !tratamientoActualizado) {
        throw new Error(tr(
          "La operación se ejecutó, pero no se pudo actualizar la vista. Cierra y vuelve a abrir la sección para verificar el estado antes de continuar.",
          "The operation was executed, but the view could not be refreshed. Close and reopen the section to verify the status before proceeding."
        ));
      }

      setTratamientosActualizados(prev => ({
        ...prev,
        [Number(tratamiento.id)]: tratamientoActualizado,
      }));
    } catch (error) {
      console.error("Error en autorización de comisión:", error);
      alert(tr("No se pudo completar la operación. ", "Could not complete the operation. ") +
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setGuardando(false);
    }
  }


  // Los pagos históricos conservan su moneda original; la configuración
  // únicamente afecta las opciones y los resúmenes visibles.
  useEffect(() => {
    if (formaPagoDoctor === "MXN" && !mostrarMXN) setFormaPagoDoctor("USD");
    if (formaPagoDoctor === "USD" && !mostrarUSD) setFormaPagoDoctor("MXN");
  }, [mostrarMXN, mostrarUSD, formaPagoDoctor]);


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

  const tratamientosAny = useMemo(
    () => (tratamientos as any[]).map(tratamiento =>
      tratamientosActualizados[Number(tratamiento.id)] ?? tratamiento
    ),
    [tratamientos, tratamientosActualizados]
  );

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
                    Number(tratamiento.doctor_id) === Number(doctor.id) ||
                    pagos.some(pago =>
                      pago.doctor_id != null &&
                      Number(pago.doctor_id) === Number(doctor.id) &&
                      Number(pago.tratamiento_id) === Number(tratamiento.id)
                    )
                );

              const finalizados =
                tratamientosDoctor.filter(
                  (tratamiento) =>
                    tratamiento.estado ===
                    "Finalizado"
                );

              // FIN-02F: incluir tratamientos en proceso sin alterar el conteo de finalizados.
              const tratamientosLiquidables = tratamientosDoctor.filter(
                (tratamiento) =>
                  tratamiento.estado === "Finalizado" || tratamiento.estado === "En proceso"
              );

              const ids =
                new Set(
                  tratamientosLiquidables.map(
                    (tratamiento) =>
                      Number(
                        tratamiento.id
                      )
                  )
                );

              const pagosDoctor =
                pagos.filter(
                  (pago) =>
                    pago.doctor_id != null &&
                    Number(pago.doctor_id) === Number(doctor.id) &&
                    ids.has(Number(pago.tratamiento_id))
                );

              const calcularComision = (pago: PagoComision) => {
                const tratamiento = tratamientosLiquidables.find(
                  (item) => Number(item.id) === Number(pago.tratamiento_id)
                );
                if (!tratamiento) return 0;
                // Las comisiones ya liquidadas conservan su importe histórico.
                if (pago.comision_doctor_pagada === true) {
                  return pago.comision_doctor_pago_moneda === pago.moneda
                    ? Number(pago.comision_doctor_pago_monto || 0) : 0;
                }
                return calcularComisionNeta(
                  pago, tratamiento, Number(doctor.porcentaje || 0)
                ) ?? 0;
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
                pagosMXN.filter(pago => !pago.comision_doctor_pagada).reduce(
                  (total, pago) => total + calcularComision(pago), 0
                );

              const comisionUSD =
                pagosUSD.filter(pago => !pago.comision_doctor_pagada).reduce(
                  (total, pago) => total + calcularComision(pago), 0
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

              const pagosPendientes = pagosDoctor.filter(pago => !pago.comision_doctor_pagada);
              const tratamientosPorRevisar = tratamientosLiquidables.filter(tratamiento =>
                pagosPendientes.some(pago => Number(pago.tratamiento_id) === Number(tratamiento.id))
              );
              // La RPC liquida todos los pagos elegibles de la moneda seleccionada;
              // nunca ofrecer una liquidación parcial si existe alguno sin autorizar.
              const monedaLista = (moneda: "MXN" | "USD") =>
                pagosPendientes.filter(pago => pago.moneda === moneda).every(pago => {
                  const tratamiento = tratamientosLiquidables.find(t => Number(t.id) === Number(pago.tratamiento_id));
                  return tratamiento && comisionAutorizada(tratamiento) &&
                    calcularComisionNeta(pago, tratamiento, Number(doctor.porcentaje || 0)) !== null;
                });
              const listoMXN = monedaLista("MXN");
              const listoUSD = monedaLista("USD");

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
                    comisionMXN,
                    0
                  ),
                pendienteUSD:
                  Math.max(
                    comisionUSD,
                    0
                  ),
                pagosDoctor,
                tratamientosPorRevisar,
                listoMXN,
                listoUSD,
              };

            }
          ),
      [
        doctores,
        pagos,
        tratamientosAny,
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
        tratamientosAny,
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

                  // Los pagos se contabilizan en la moneda e importe
                  // realmente entregados, no en la moneda del costo original.
                  const montoPagado = Number(tratamiento.especialista_pago_monto || 0);
                  if (tratamiento.especialista_pago_moneda === "USD") {
                    pagadoUSD += montoPagado;
                  } else if (tratamiento.especialista_pago_moneda === "MXN") {
                    pagadoMXN += montoPagado;
                  }

                  return;
                }

                if (
                  tratamiento.estado !== "Finalizado" ||
                  tratamiento.resta_original == null ||
                  Number(tratamiento.resta_original) !== 0 ||
                  tratamiento.pendiente !== false
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

  // Fase 1D: la liquidación se ejecuta exclusivamente en una RPC transaccional.
  // El servidor verifica permisos, costos, autorización, saldos e idempotencia.
  async function registrarPagoDoctor() {
    if (!doctorPago?.doctor?.id || guardando || liquidacionEnCursoRef.current) return;

    const monedaElegida = formaPagoDoctor === "USD" || (formaPagoDoctor === "Transferencia" && !mostrarMXN)
      ? "USD" : "MXN";
    if (monedaElegida === "USD" ? !doctorPago.listoUSD : !doctorPago.listoMXN) {
      alert(tr("Primero valida los costos y autoriza todas las comisiones de esta moneda.",
        "Validate costs and authorize all commissions in this currency first."));
      return;
    }
    const monto = Number(montoPagoDoctor);
    if (!Number.isFinite(monto) || monto <= 0) {
      alert(tr("Ingresa una cantidad válida.", "Enter a valid amount."));
      return;
    }

    const monedaPago =
      formaPagoDoctor === "USD" ||
      (formaPagoDoctor === "Transferencia" && !mostrarMXN)
        ? "USD"
        : "MXN";
    const metodoPago = formaPagoDoctor === "Transferencia"
      ? "Transferencia"
      : "Efectivo";

    // No calcular ni distribuir importes desde el navegador: el servidor
    // determina el neto real y rechaza cualquier discrepancia.
    const payloadLiquidacion = JSON.stringify({
      doctorId: Number(doctorPago.doctor.id),
      moneda: monedaPago,
      monto,
      metodoPago,
    });
    if (liquidacionPendienteRef.current?.payload !== payloadLiquidacion) {
      liquidacionPendienteRef.current = {
        payload: payloadLiquidacion,
        id: crypto.randomUUID(),
      };
    }
    const claveIdempotencia = liquidacionPendienteRef.current.id;
    liquidacionEnCursoRef.current = true;
    setGuardando(true);
    try {
      const { data, error } = await supabase.rpc(
        "mintos_liquidar_comision_doctor",
        {
          p_doctor_id: Number(doctorPago.doctor.id),
          p_moneda: monedaPago,
          p_monto: monto,
          p_metodo_pago: metodoPago,
          p_clave_idempotencia: claveIdempotencia,
        }
      );
      if (error) throw error;
      // La RPC confirmó la liquidación: nunca reintentar esta clave.
      liquidacionPendienteRef.current = null;
      // La bitácora del cliente no debe convertir una liquidación confirmada
      // en un supuesto error financiero ni provocar un segundo pago.
      try {
        await registrarBitacora({
          accion: "Pagar comisión a doctor",
          modulo: "Comisiones",
          detalle: `Liquidación ID: ${data} | Doctor ID: ${doctorPago.doctor.id} | ${monto} ${monedaPago} | ${metodoPago}`,
        });
      } catch (errorBitacora) {
        console.error("Liquidación confirmada; falló la bitácora del cliente:", errorBitacora);
      }
      setDoctorPago(null);
      setMontoPagoDoctor("");
      window.location.reload();
    } catch (error) {
      console.error("Error liquidando comisión:", error);
      alert(tr(
        "No se pudo confirmar la liquidación. Verifica su estado antes de reintentar; se conservará el identificador de solicitud. " +
          (error instanceof Error ? error.message : ""),
        "Settlement could not be confirmed. Check its status before retrying; the request ID will be preserved. " +
          (error instanceof Error ? error.message : "")
      ));
    } finally {
      liquidacionEnCursoRef.current = false;
      setGuardando(false);
    }
  }

  async function registrarPagoEspecialista() {
    if (!esAdmin || !tratamientoPago?.id || guardando || pagoEspecialistaEnCursoRef.current) return;

    if (
      tratamientoPago.especialista_pagado === true ||
      tratamientoPago.estado !== "Finalizado" ||
      tratamientoPago.resta_original == null ||
      Number(tratamientoPago.resta_original) !== 0 ||
      tratamientoPago.pendiente !== false
    ) {
      alert(tr(
        "El tratamiento debe estar finalizado y completamente liquidado. Actualiza la vista antes de continuar.",
        "The treatment must be completed and fully paid. Refresh the view before continuing."
      ));
      return;
    }

    const monto = importePagoEspecialista;
    if (monto === null || !Number.isFinite(monto) || monto <= 0) {
      alert(tr("No se pudo calcular un importe válido.", "Could not calculate a valid amount."));
      return;
    }

    const monedaPago = monedaPagoEspecialista;
    const metodoPago = formaPagoEspecialista;
    const tratamiento = tratamientoPago;
    pagoEspecialistaEnCursoRef.current = true;
    setGuardando(true);

    try {
      // Evitar liquidar con una cotización que haya cambiado desde que
      // se abrió el modal. El trigger FIN-02G vuelve a verificarla.
      if (requiereConversionEspecialista) {
        const { data: configuracion, error: errorCambio } = await supabase
          .from("configuracion_finanzas")
          .select("valor")
          .eq("clave", "tipo_cambio")
          .single();
        if (errorCambio) throw errorCambio;
        const cambioVigente = Number(configuracion?.valor);
        if (!Number.isFinite(cambioVigente) || cambioVigente <= 0) {
          throw new Error(tr("Tipo de cambio no disponible.", "Exchange rate unavailable."));
        }
        if (cambioVigente !== tipoCambioEspecialista) {
          setTipoCambioEspecialista(cambioVigente);
          throw new Error(tr(
            "El tipo de cambio cambió. Revisa el nuevo importe y confirma nuevamente.",
            "The exchange rate changed. Review the updated amount and confirm again."
          ));
        }
      }

      const { data, error } = await supabase
        .from("tratamientos")
        .update({
          especialista_pagado: true,
          especialista_fecha_pago: new Date().toISOString(),
          especialista_metodo_pago: metodoPago,
          especialista_pago_moneda: monedaPago,
          especialista_pago_monto: monto,
          especialista_pago_tipo_cambio: requiereConversionEspecialista ? tipoCambioEspecialista : null,
        })
        .eq("id", tratamiento.id)
        .eq("estado", "Finalizado")
        .eq("resta_original", 0)
        .eq("pendiente", false)
        .or("especialista_pagado.is.false,especialista_pagado.is.null")
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(tr(
          "No se confirmó ningún pago. Otro usuario pudo haberlo registrado o el tratamiento cambió. Actualiza la vista antes de reintentar.",
          "No payment was confirmed. Another user may have recorded it or the treatment changed. Refresh before retrying."
        ));
      }

      try {
        await registrarBitacora({
          accion: "Pagar especialista",
          modulo: "Comisiones",
          detalle:
            `Tratamiento ID: ${tratamiento.id} | Especialista ID: ${tratamiento.especialista_id || "-"} | Especialista: ${tratamiento.especialista_nombre || "-"} | Tratamiento: ${tratamiento.tratamiento || "-"} | Monto: ${monto} ${monedaPago} | Método: ${metodoPago} | Tipo de cambio: ${requiereConversionEspecialista ? tipoCambioEspecialista : "No aplica"}`,
        });
      } catch (errorBitacora) {
        console.error("Pago confirmado; no se pudo registrar la bitácora:", errorBitacora);
      }

      setTratamientoPago(null);
      window.location.reload();
    } catch (error) {
      console.error("No se pudo confirmar el pago al especialista:", error);
      alert(tr(
        "No se pudo confirmar el pago al especialista. Verifica su estado antes de reintentar. ",
        "Could not confirm the specialist payment. Verify its status before retrying. "
      ) + (error instanceof Error ? error.message : String(error)));
    } finally {
      pagoEspecialistaEnCursoRef.current = false;
      setGuardando(false);
    }
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
                                      (mostrarMXN && item.pendienteMXN > 0 && item.listoMXN) ||
                                      (mostrarUSD && item.pendienteUSD > 0 && item.listoUSD)
                                    )
                                    &&
                                    <button
                                      type="button"
                                      onClick={() => {

                                        const usarUSD =
                                          mostrarUSD && item.listoUSD && item.pendienteUSD > 0 &&
                                          (!mostrarMXN || !item.listoMXN || item.pendienteMXN <= 0);

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

                                  {esAdmin && item.tratamientosPorRevisar.length > 0 && (
                                    <button
                                      type="button"
                                      className="mint-btn mint-btn-secondary mint-btn-sm"
                                      onClick={() => setDoctorRevisionId(
                                        Number(item.doctor.id)
                                      )}
                                    >
                                      {tr("Revisar autorizaciones", "Review approvals")}
                                    </button>
                                  )}

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
                                        const liquidado =
                                          tratamiento.resta_original != null &&
                                          Number(tratamiento.resta_original) === 0 &&
                                          tratamiento.pendiente === false;

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
                                                        {traducirMetodo(tratamiento.especialista_metodo_pago || "—")}
                                                      </p>
                                                      <p className="text-xs font-semibold mint-text-primary mt-1">
                                                        ${formatoMonto(Number(tratamiento.especialista_pago_monto || 0))}
                                                        {" "}{tratamiento.especialista_pago_moneda || "—"}
                                                      </p>
                                                      {tratamiento.especialista_pago_tipo_cambio != null && (
                                                        <p className="text-[10px] mint-text-muted mt-1">
                                                          {tr("Tipo de cambio", "Exchange rate")}: {Number(tratamiento.especialista_pago_tipo_cambio).toFixed(4)}
                                                        </p>
                                                      )}
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
                                                              .toLocaleDateString(locale)
                                                          : tr("Registrado", "Recorded")
                                                      }
                                                    </span>

                                                  )

                                                  : finalizado &&
                                                    liquidado &&
                                                    esAdmin

                                                    ? (

                                                      <button
                                                        type="button"
                                                        onClick={() => {

                                                          setFormaPagoEspecialista("Efectivo");
                                                          setMonedaPagoEspecialista(
                                                            tratamiento.moneda_especialista === "USD" ? "USD" : "MXN"
                                                          );
                                                          setTratamientoPago(tratamiento);

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
                                                        {finalizado
                                                          ? tr("Saldo pendiente", "Balance pending")
                                                          : tr("Al finalizar", "When completed")}
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

            {esAdmin && doctorRevisionId !== null && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#071b2c]/75 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !guardando) {
              setDoctorRevisionId(null);
            }
          }}
        >
          <div className="mint-card flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden border border-[var(--mint-border)] shadow-2xl">
            <div className="shrink-0 bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)] px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#63c8b2]">
                    {tr("Control financiero", "Financial control")}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                    {tr("Revisión y autorización de comisiones", "Commission review and approval")}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    {resumenDoctores.find(item => Number(item.doctor.id) === doctorRevisionId)?.doctor.nombre || ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setDoctorRevisionId(null)}
                  className="rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  {tr("Cerrar", "Close")} ×
                </button>
              </div>
            </div>
            <div className="h-1 shrink-0 bg-[linear-gradient(90deg,#249884_0%,#63c8b2_58%,#d8bd72_100%)]" />

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <p className="mb-4 text-sm mint-text-secondary">
                {tr(
                  "Valida los costos de laboratorio y especialista antes de autorizar la comisión. La autorización queda protegida por las reglas financieras del servidor.",
                  "Validate laboratory and specialist costs before approving the commission. Approval is protected by server-side financial rules."
                )}
              </p>

              {(() => {
                const revision = resumenDoctores.find(item => Number(item.doctor.id) === doctorRevisionId);
                const pendientes = revision?.tratamientosPorRevisar ?? [];
                if (pendientes.length === 0) {
                  return (
                    <div className="rounded-xl border border-[var(--mint-border)] bg-[var(--mint-bg-soft)] p-8 text-center text-sm mint-text-secondary">
                      {tr("No hay tratamientos pendientes de revisión.", "There are no treatments pending review.")}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {pendientes.map(tratamiento => {
                      const validado = costosValidados(tratamiento);
                      const autorizado = comisionAutorizada(tratamiento);
                      const laboratorioEstado = estadoCosto(tratamiento, "laboratorio");
                      const especialistaEstado = estadoCosto(tratamiento, "especialista");

                      return (
                        <div
                          key={tratamiento.id}
                          className="overflow-hidden rounded-2xl border border-[var(--mint-border)] bg-white shadow-[0_6px_20px_rgba(15,42,65,0.04)]"
                        >
                          <div className="flex flex-col justify-between gap-3 border-b border-[var(--mint-border)] bg-[var(--mint-bg-soft)] px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide mint-text-muted">
                                {tr("Tratamiento", "Treatment")} #{tratamiento.id}
                              </p>
                              <p className="mt-1 font-bold mint-text-primary">
                                {tratamiento.tratamiento || "—"}
                              </p>
                              <p className="mt-1 text-xs mint-text-secondary">
                                {tr("Estado", "Status")}: {tratamiento.estado || "—"}
                              </p>
                            </div>
                            <span className={`inline-flex self-start rounded-full border px-3 py-1 text-xs font-bold ${
                              autorizado
                                ? "border-[var(--mint-success-border)] bg-[var(--mint-success-bg)] text-[var(--mint-success)]"
                                : validado
                                  ? "border-[var(--mint-warning-border)] bg-[var(--mint-warning-bg)] text-[var(--mint-warning)]"
                                  : "border-[var(--mint-border)] bg-white mint-text-secondary"
                            }`}>
                              {autorizado
                                ? tr("Comisión autorizada", "Commission approved")
                                : validado
                                  ? tr("Costos validados", "Costs validated")
                                  : tr("Pendiente de validación", "Pending validation")}
                            </span>
                          </div>

                          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="rounded-xl border border-[var(--mint-border)] p-4">
                              <p className="text-xs font-bold uppercase tracking-wide mint-text-muted">
                                {tr("Laboratorio", "Laboratory")}
                              </p>
                              <p className="mt-1 text-lg font-bold mint-text-primary">
                                ${formatoMonto(Number(tratamiento.laboratorio || 0))}
                                <span className="ml-2 text-xs font-medium mint-text-muted">
                                  {tratamiento.moneda_laboratorio === "USD" ? "USD" : "MXN"}
                                </span>
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {(["aplica", "no_aplica"] as const).map(opcion => (
                                  <button
                                    key={opcion}
                                    type="button"
                                    disabled={guardando || validado}
                                    onClick={() => setEstadosCostos(prev => ({
                                      ...prev,
                                      [Number(tratamiento.id)]: {
                                        laboratorio: opcion,
                                        especialista: estadoCosto(tratamiento, "especialista"),
                                      },
                                    }))}
                                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                      laboratorioEstado === opcion
                                        ? "border-[#0b8f80] bg-[#e8f7f3] text-[#08796c]"
                                        : "border-[var(--mint-border)] bg-white mint-text-secondary hover:border-[#0b8f80]"
                                    }`}
                                  >
                                    {opcion === "aplica"
                                      ? tr("Aplica", "Applies")
                                      : tr("No aplica", "Does not apply")}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-xl border border-[var(--mint-border)] p-4">
                              <p className="text-xs font-bold uppercase tracking-wide mint-text-muted">
                                {tr("Especialista", "Specialist")}
                              </p>
                              <p className="mt-1 text-lg font-bold mint-text-primary">
                                ${formatoMonto(Number(tratamiento.especialista || 0))}
                                <span className="ml-2 text-xs font-medium mint-text-muted">
                                  {tratamiento.moneda_especialista === "USD" ? "USD" : "MXN"}
                                </span>
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {(["aplica", "no_aplica"] as const).map(opcion => (
                                  <button
                                    key={opcion}
                                    type="button"
                                    disabled={guardando || validado}
                                    onClick={() => setEstadosCostos(prev => ({
                                      ...prev,
                                      [Number(tratamiento.id)]: {
                                        laboratorio: estadoCosto(tratamiento, "laboratorio"),
                                        especialista: opcion,
                                      },
                                    }))}
                                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                      especialistaEstado === opcion
                                        ? "border-[#0b8f80] bg-[#e8f7f3] text-[#08796c]"
                                        : "border-[var(--mint-border)] bg-white mint-text-secondary hover:border-[#0b8f80]"
                                    }`}
                                  >
                                    {opcion === "aplica"
                                      ? tr("Aplica", "Applies")
                                      : tr("No aplica", "Does not apply")}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--mint-border)] bg-[var(--mint-bg-soft)] px-4 py-4 sm:px-5">
                            {!validado && (
                              <button
                                type="button"
                                disabled={guardando}
                                onClick={() => void ejecutarAutorizacion("validar", tratamiento)}
                                className="mint-btn mint-btn-secondary mint-btn-sm disabled:opacity-50"
                              >
                                {tr("Validar costos", "Validate costs")}
                              </button>
                            )}
                            {validado && !autorizado && (
                              <button
                                type="button"
                                disabled={guardando}
                                onClick={() => void ejecutarAutorizacion("autorizar", tratamiento)}
                                className="mint-btn mint-btn-primary mint-btn-sm disabled:opacity-50"
                              >
                                {tr("Autorizar comisión", "Approve commission")}
                              </button>
                            )}
                            {autorizado && (
                              <span className="inline-flex items-center rounded-lg border border-[var(--mint-success-border)] bg-[var(--mint-success-bg)] px-3 py-2 text-xs font-bold text-[var(--mint-success)]">
                                ✓ {tr("Autorizada", "Approved")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {
        doctorPago &&
        (

          <div
            className="
              fixed
              inset-0
              z-[1000]
              flex
              items-center
              justify-center
              bg-black/60
              p-4
            "
          >

            <div
              className="
                mint-card
                w-full
                max-w-lg
                p-6
                shadow-2xl
              "
            >

              <h3 className="text-xl font-bold mint-text-primary">
                {tr("Pagar comisión a doctor", "Pay doctor commission")}
              </h3>

              <p className="text-sm mint-text-secondary mt-2">
                {
                  doctorPago.doctor.nombre
                }
              </p>

              <div className="mt-6">

                <label className="mint-label">
                  {tr("Forma de pago", "Payment method")}
                </label>

                <select
                  value={
                    formaPagoDoctor
                  }
                  onChange={(
                    e
                  ) => {

                    const forma = e.target.value as FormaPagoDoctor;
                    setFormaPagoDoctor(forma);
                    const moneda = forma === "USD" || (forma === "Transferencia" && !mostrarMXN)
                      ? "USD" : "MXN";
                    setMontoPagoDoctor(String(moneda === "USD" ? doctorPago.pendienteUSD : doctorPago.pendienteMXN));

                  }}
                  className="mint-input"
                >
                  {monedasActivas.map(moneda => (
                    <option key={moneda} value={moneda}>
                      {tr("Efectivo", "Cash")} {moneda}
                    </option>
                  ))}

                  <option value="Transferencia">
                    {tr("Transferencia", "Transfer")}
                  </option>
                </select>

              </div>

              <div className="mt-4">

                <label className="mint-label">
                  {tr("Monto", "Amount")}
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    montoPagoDoctor
                  }
                  onChange={(
                    e
                  ) =>
                    setMontoPagoDoctor(
                      e.target.value
                    )
                  }
                  className="mint-input"
                />

              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => {

                    setDoctorPago(
                      null
                    );

                    setMontoPagoDoctor(
                      ""
                    );

                  }}
                  className="mint-btn mint-btn-secondary"
                >
                  {tr("Cancelar", "Cancel")}
                </button>

                <button
                  type="button"
                  disabled={guardando}
                  onClick={
                    registrarPagoDoctor
                  }
                  className="mint-btn mint-btn-primary"
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

        )
      }

      {
        tratamientoPago &&
        (

          <div
            className="
              fixed
              inset-0
              z-[1000]
              flex
              items-center
              justify-center
              bg-black/60
              p-4
            "
          >

            <div
              className="
                mint-card
                w-full
                max-w-lg
                p-6
                shadow-2xl
              "
            >

              <h3 className="text-xl font-bold mint-text-primary">
                {tr("Pagar especialista", "Pay specialist")}
              </h3>

              <p className="text-sm mint-text-secondary mt-2">
                {
                  tratamientoPago.especialista_nombre ||
                  tr("Especialista", "Specialist")
                }
              </p>

              <p className="text-xs mint-text-muted mt-1">
                {
                  tratamientoPago.tratamiento ||
                  tr("Tratamiento", "Treatment")
                }
              </p>

              <div className="mt-5 rounded-xl border border-[var(--mint-border)] bg-[var(--mint-bg-soft)] p-4">
                <p className="text-xs mint-text-muted">{tr("Honorarios acordados", "Agreed specialist fee")}</p>
                <p className="mt-1 text-lg font-bold mint-text-primary">
                  ${formatoMonto(Number(tratamientoPago.especialista || 0))} {monedaHonorariosEspecialista}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mint-label">{tr("Método de pago", "Payment method")}</label>
                  <select
                    value={formaPagoEspecialista}
                    onChange={(event) => setFormaPagoEspecialista(event.target.value as FormaPagoEspecialista)}
                    className="mint-input"
                  >
                    <option value="Efectivo">{tr("Efectivo", "Cash")}</option>
                    <option value="Transferencia">{tr("Transferencia", "Bank transfer")}</option>
                  </select>
                </div>
                <div>
                  <label className="mint-label">{tr("Moneda de pago", "Payment currency")}</label>
                  <select
                    value={monedaPagoEspecialista}
                    onChange={(event) => setMonedaPagoEspecialista(event.target.value as MonedaPagoEspecialista)}
                    className="mint-input"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              {requiereConversionEspecialista && (
                <div className="mt-4 rounded-xl border border-[var(--mint-border)] bg-[var(--mint-bg-soft)] p-3 text-sm mint-text-secondary">
                  {tr("Tipo de cambio vigente", "Current exchange rate")}: {cargandoTipoCambioEspecialista
                    ? tr("Consultando...", "Loading...")
                    : tipoCambioEspecialista
                      ? `1 USD = ${tipoCambioEspecialista.toFixed(4)} MXN`
                      : tr("No disponible. Revisa Configuración → Finanzas.", "Unavailable. Check Settings → Finance.")}
                </div>
              )}

              <div className="mt-4">
                <label className="mint-label">{tr("Importe a liquidar", "Settlement amount")}</label>
                <input
                  type="text"
                  readOnly
                  value={importePagoEspecialista === null
                    ? tr("No disponible", "Unavailable")
                    : `$${formatoMonto(importePagoEspecialista)} ${monedaPagoEspecialista}`}
                  className="mint-input font-semibold"
                />
                <p className="mt-2 text-xs mint-text-muted">
                  {tr("Los honorarios se pagan completos, sin abonos parciales.",
                    "Specialist fees are paid in full, without partial installments.")}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => {

                    setTratamientoPago(
                      null
                    );


                  }}
                  className="mint-btn mint-btn-secondary"
                >
                  {tr("Cancelar", "Cancel")}
                </button>

                <button
                  type="button"
                  disabled={guardando || importePagoEspecialista === null || importePagoEspecialista <= 0}
                  onClick={
                    registrarPagoEspecialista
                  }
                  className="mint-btn mint-btn-primary"
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

        )
      }

    </div>

  );

}