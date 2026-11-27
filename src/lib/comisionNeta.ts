/** Proyección de la fórmula instalada en mintos_liquidar_comision_doctor.
 * No autoriza pagos: la RPC valida permisos y datos en la base de datos.
 * null indica datos insuficientes; nunca sustituir por una comisión bruta.
 */

export type PagoComisionNeta = {
  moneda?: string | null;
  monto_mxn?: number | null;
  monto_original?: number | null;
  monto_aplicado_moneda_tratamiento?: number | null;
  tipo_cambio?: number | null;
  comision_banco?: number | null;
  comision_doctor_porcentaje?: number | null;
  es_cargo_adicional?: boolean | null;
  cargo_adicional_id?: number | null;
};

export type TratamientoComisionNeta = {
  total_original?: number | null;
  moneda_precio?: string | null;
  tipo_cambio?: number | null;
  laboratorio?: number | null;
  especialista?: number | null;
  moneda_laboratorio?: string | null;
  moneda_especialista?: string | null;
};

const n = (v: unknown) => Number(v);

const redondear = (v: number) =>
  Math.round((v + Number.EPSILON) * 100) / 100;

export function calcularComisionNeta(
  pago: PagoComisionNeta,
  tratamiento: TratamientoComisionNeta,
  porcentajeDoctor: number
): number | null {

  const moneda = pago.moneda;
  const monedaPrecio = tratamiento.moneda_precio;

  const tcPago =
    moneda === "USD" ? n(pago.tipo_cambio) : 1;

  const tcTratamiento = n(tratamiento.tipo_cambio);
  const precio = n(tratamiento.total_original);
  const cobroMxn = n(pago.monto_mxn);

  const porcentaje =
    pago.comision_doctor_porcentaje == null
      ? porcentajeDoctor
      : n(pago.comision_doctor_porcentaje);

  const banco = n(pago.comision_banco ?? 0);

  if (
    !["MXN", "USD"].includes(moneda ?? "") ||
    !Number.isFinite(tcPago) ||
    tcPago <= 0 ||
    !Number.isFinite(cobroMxn) ||
    cobroMxn <= 0 ||
    !Number.isFinite(porcentaje) ||
    porcentaje < 0 ||
    porcentaje > 100 ||
    !Number.isFinite(banco) ||
    banco < 0
  ) {
    return null;
  }

  // CARGOS ADICIONALES:
  // No volver a descontar laboratorio ni especialista.
  // Se conserva el porcentaje histórico del doctor.

  if (pago.es_cargo_adicional === true) {

    if (pago.comision_doctor_porcentaje == null) {
      return null;
    }

    const netoMxn = Math.max(
      0,
      cobroMxn - banco
    );

    const comisionMxn = redondear(
      netoMxn * porcentaje / 100
    );

    return moneda === "USD"
      ? redondear(comisionMxn / tcPago)
      : comisionMxn;
  }

  // TRATAMIENTOS ORIGINALES

  if (
    !["MXN", "USD"].includes(monedaPrecio ?? "") ||
    !Number.isFinite(precio) ||
    precio <= 0
  ) {
    return null;
  }

  const costoLabMoneda =
    tratamiento.moneda_laboratorio;

  const costoEspMoneda =
    tratamiento.moneda_especialista;

  if (
    !["MXN", "USD"].includes(costoLabMoneda ?? "") ||
    !["MXN", "USD"].includes(costoEspMoneda ?? "")
  ) {
    return null;
  }

  const requiereTc =
    monedaPrecio === "USD" ||
    costoLabMoneda === "USD" ||
    costoEspMoneda === "USD";

  if (
    requiereTc &&
    (
      !Number.isFinite(tcTratamiento) ||
      tcTratamiento <= 0
    )
  ) {
    return null;
  }

  const lab = n(tratamiento.laboratorio ?? 0);
  const esp = n(tratamiento.especialista ?? 0);

  if (
    ![lab, esp, banco].every(
      v => Number.isFinite(v) && v >= 0
    )
  ) {
    return null;
  }

  // FIN04: proporcionalidad contractual.
  // Utilizar exclusivamente el importe aplicado al tratamiento,
  // independientemente de la moneda y del tipo de cambio del cobro.

  const montoAplicado =
    n(pago.monto_aplicado_moneda_tratamiento);

  if (
    pago.monto_aplicado_moneda_tratamiento == null ||
    !Number.isFinite(montoAplicado) ||
    montoAplicado <= 0
  ) {
    return null;
  }

  const proporcion = Math.min(
    montoAplicado / precio,
    1
  );

  const costosMxn =
    lab *
      (costoLabMoneda === "USD" ? tcTratamiento : 1) +
    esp *
      (costoEspMoneda === "USD" ? tcTratamiento : 1);

  const netoMxn = Math.max(
    0,
    cobroMxn -
      costosMxn * proporcion -
      banco
  );

  const comisionMxn = redondear(
    netoMxn * porcentaje / 100
  );

  return moneda === "USD"
    ? redondear(comisionMxn / tcPago)
    : comisionMxn;
}