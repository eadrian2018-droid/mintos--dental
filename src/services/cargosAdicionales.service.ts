import { supabase } from '../lib/supabase'

export type MonedaCargo = 'MXN' | 'USD'

export type EstadoCargo =
  | 'Pendiente'
  | 'Parcial'
  | 'Pagado'
  | 'Cancelado'

export interface CargoAdicional {
  cargo_id: number
  paciente_id: number
  tratamiento_id: number
  concepto: string
  moneda: MonedaCargo
  total_cargo: number
  total_pagado: number
  saldo_pendiente: number
  estado: EstadoCargo
  creado_at: string
  creado_por: string
}

export interface RegistrarCargoAdicional {
  solicitudId: string
  tratamientoId: number
  pacienteId: number
  concepto: string
  monto: number
  moneda: MonedaCargo
}

export interface CobrarCargoAdicional {
  solicitudId: string
  cargoId: number
  monto: number
  moneda: MonedaCargo
  metodoPago: string
  tipoCambioConfirmado?: number | null
}

// ======================================================
// RPC DE CARGOS ADICIONALES
// ======================================================

export const RPC_CARGOS_ADICIONALES = {
  registrar: 'mintos_registrar_cargo_adicional_v2',
  consultar: 'mintos_consultar_cargos_adicionales_v1',
  cobrar: 'mintos_cobrar_cargo_adicional_v1',
  anular: 'mintos_anular_cargo_adicional_v1',
  cancelar: 'mintos_cancelar_cargo_adicional_v1',
} as const

// ======================================================
// VALIDACIONES Y PREPARACIÓN DE PARÁMETROS
// ======================================================

export function prepararRegistroCargo(
  cargo: RegistrarCargoAdicional
) {
  const concepto = cargo.concepto.trim()

  if (concepto.length < 3 || concepto.length > 250) {
    throw new Error(
      'Concepto inválido / Invalid description'
    )
  }

  if (
    !Number.isFinite(cargo.monto) ||
    cargo.monto <= 0 ||
    cargo.monto > 999999999999.99
  ) {
    throw new Error(
      'Importe inválido / Invalid amount'
    )
  }

  if (
    !Number.isSafeInteger(cargo.pacienteId) ||
    cargo.pacienteId <= 0 ||
    !Number.isSafeInteger(cargo.tratamientoId) ||
    cargo.tratamientoId <= 0
  ) {
    throw new Error(
      'Referencia inválida / Invalid reference'
    )
  }

  if (
    cargo.moneda !== 'MXN' &&
    cargo.moneda !== 'USD'
  ) {
    throw new Error(
      'Moneda inválida / Invalid currency'
    )
  }

  return {
    p_solicitud_id: cargo.solicitudId,
    p_tratamiento_id: cargo.tratamientoId,
    p_paciente_id: cargo.pacienteId,
    p_concepto: concepto,
    p_monto: cargo.monto,
    p_moneda: cargo.moneda,
  }
}

export function prepararCobroCargo(
  cobro: CobrarCargoAdicional
) {
  if (
    !Number.isSafeInteger(cobro.cargoId) ||
    cobro.cargoId <= 0
  ) {
    throw new Error(
      'Cargo inválido / Invalid charge'
    )
  }

  if (
    !Number.isFinite(cobro.monto) ||
    cobro.monto <= 0 ||
    cobro.monto > 999999999999.99
  ) {
    throw new Error(
      'Importe inválido / Invalid amount'
    )
  }

  if (
    cobro.moneda !== 'MXN' &&
    cobro.moneda !== 'USD'
  ) {
    throw new Error(
      'Moneda inválida / Invalid currency'
    )
  }

  if (!cobro.metodoPago.trim()) {
    throw new Error(
      'Método de pago inválido / Invalid payment method'
    )
  }

  const tipoCambio =
    cobro.tipoCambioConfirmado ?? null

  if (
    tipoCambio !== null &&
    (
      !Number.isFinite(tipoCambio) ||
      tipoCambio <= 0 ||
      tipoCambio > 1000000
    )
  ) {
    throw new Error(
      'Tipo de cambio inválido / Invalid exchange rate'
    )
  }

  return {
    p_solicitud_id: cobro.solicitudId,
    p_cargo_id: cobro.cargoId,
    p_monto: cobro.monto,
    p_moneda: cobro.moneda,
    p_metodo_pago: cobro.metodoPago,
    p_tipo_cambio_confirmado: tipoCambio,
  }
}

export function prepararConsultaCargos(
  pacienteId: number
) {
  if (
    !Number.isSafeInteger(pacienteId) ||
    pacienteId <= 0
  ) {
    throw new Error(
      'Paciente inválido / Invalid patient'
    )
  }

  return {
    p_paciente_id: pacienteId,
  }
}

export function prepararCancelacionCargo(
  solicitudId: string,
  cargoId: number,
  motivo: string
) {
  const motivoValidado = motivo.trim()

  if (
    !Number.isSafeInteger(cargoId) ||
    cargoId <= 0
  ) {
    throw new Error(
      'Cargo inválido / Invalid charge'
    )
  }

  if (
    motivoValidado.length < 10 ||
    motivoValidado.length > 1000
  ) {
    throw new Error(
      'Motivo inválido / Invalid reason'
    )
  }

  return {
    p_solicitud_id: solicitudId,
    p_cargo_id: cargoId,
    p_motivo: motivoValidado,
  }
}

export function prepararAnulacionCargo(
  pagoId: number,
  motivo: string
) {
  const motivoValidado = motivo.trim()

  if (
    !Number.isSafeInteger(pagoId) ||
    pagoId <= 0
  ) {
    throw new Error(
      'Pago inválido / Invalid payment'
    )
  }

  if (
    motivoValidado.length < 10 ||
    motivoValidado.length > 1000
  ) {
    throw new Error(
      'Motivo inválido / Invalid reason'
    )
  }

  return {
    p_pago_id: pagoId,
    p_motivo: motivoValidado,
  }
}

// ======================================================
// CONSULTAR CARGOS ADICIONALES
// ======================================================

export async function consultarCargosAdicionales(
  pacienteId: number
): Promise<CargoAdicional[]> {
  const { data, error } = await supabase.rpc(
    RPC_CARGOS_ADICIONALES.consultar,
    prepararConsultaCargos(pacienteId)
  )

  if (error) throw error

  if (!Array.isArray(data)) {
    throw new Error(
      'Respuesta inválida / Invalid response'
    )
  }

  return data.map((cargo) => ({
    ...cargo,
    cargo_id: Number(cargo.cargo_id),
    paciente_id: Number(cargo.paciente_id),
    tratamiento_id: Number(cargo.tratamiento_id),
    total_cargo: Number(cargo.total_cargo),
    total_pagado: Number(cargo.total_pagado),
    saldo_pendiente: Number(cargo.saldo_pendiente),
  }))
}

// ======================================================
// REGISTRAR CARGO ADICIONAL
// ======================================================

export async function registrarCargoAdicional(
  cargo: RegistrarCargoAdicional
): Promise<number> {
  const { data, error } = await supabase.rpc(
    RPC_CARGOS_ADICIONALES.registrar,
    prepararRegistroCargo(cargo)
  )

  if (error) throw error

  const cargoId = Number(data)

  if (
    !Number.isSafeInteger(cargoId) ||
    cargoId <= 0
  ) {
    throw new Error(
      'Respuesta de registro inválida / Invalid registration response'
    )
  }

  return cargoId
}

// ======================================================
// COBRAR CARGO ADICIONAL
// ======================================================

export async function cobrarCargoAdicional(
  cobro: CobrarCargoAdicional
) {
  const { data, error } = await supabase.rpc(
    RPC_CARGOS_ADICIONALES.cobrar,
    prepararCobroCargo(cobro)
  )

  if (error) throw error

  return data
}

// ======================================================
// CANCELAR CARGO ADICIONAL
// ======================================================

export async function cancelarCargoAdicional(
  solicitudId: string,
  cargoId: number,
  motivo: string
) {
  const { data, error } = await supabase.rpc(
    RPC_CARGOS_ADICIONALES.cancelar,
    prepararCancelacionCargo(
      solicitudId,
      cargoId,
      motivo
    )
  )

  if (error) throw error

  return data
}

// ======================================================
// ANULAR PAGO DE CARGO ADICIONAL
// ======================================================

export async function anularPagoCargoAdicional(
  pagoId: number,
  motivo: string
) {
  const { data, error } = await supabase.rpc(
    RPC_CARGOS_ADICIONALES.anular,
    prepararAnulacionCargo(
      pagoId,
      motivo
    )
  )

  if (error) throw error

  return data
}