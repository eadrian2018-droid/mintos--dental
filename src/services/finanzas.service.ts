import { supabase } from "../lib/supabase";

import type { Tratamiento } from "../types/Tratamiento";
import type { Paciente } from "../types/Paciente";
import type { Gasto } from "../types/Gasto";
import type { Doctor } from "../types/Doctor";

import type {
  TratamientoCatalogo,
  TratamientoMaestro,
} from "../types/TratamientoCatalogo";

import type {
  ConfiguracionPago,
} from "../types/ConfiguracionPago";

export type CargoAdicionalFinanzas = {
  cargo_id: number;
  paciente_id: number;
  tratamiento_id: number;
  concepto: string;
  moneda: "MXN" | "USD";
  total_cargo: number;
  total_pagado: number;
  saldo_pendiente: number;
  creado_at: string;
};

export const finanzasService = {

  async cargarTratamientos():
    Promise<Tratamiento[]> {

    const { data, error } = await supabase
      .from("tratamientos")
      .select("*");

    if (error) {
      throw error;
    }

    return (data ?? []) as Tratamiento[];

  },

  async cargarPacientes():
    Promise<Paciente[]> {

    const { data, error } = await supabase
      .from("pacientes")
      .select("*");

    if (error) {
      throw error;
    }

    return (data ?? []) as Paciente[];

  },

  async cargarGastos():
    Promise<Gasto[]> {

    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return (data ?? []) as Gasto[];

  },

  async cargarPagos():
    Promise<any[]> {

    const { data, error } = await supabase
      .from("mintos_pagos_vigentes")
      .select("*")
      .order("fecha", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data ?? [];

  },

  // =====================================================
  // CARGOS ADICIONALES - CONSULTA FINANCIERA GLOBAL
  // =====================================================

  async cargarCargosAdicionales():
    Promise<CargoAdicionalFinanzas[]> {

    const cargos: CargoAdicionalFinanzas[] = [];

    const limite = 500;

    let desde = 0;

    while (true) {

      const { data, error } = await supabase
        .rpc("mintos_consultar_cargos_finanzas_v1")
        .order("cargo_id", {
          ascending: true,
        })
        .range(
          desde,
          desde + limite - 1
        );

      if (error) {
        throw error;
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Respuesta inválida de cargos adicionales financieros"
        );
      }

      for (const item of data) {

        const cargo: CargoAdicionalFinanzas = {
          cargo_id: Number(item.cargo_id),
          paciente_id: Number(item.paciente_id),
          tratamiento_id: Number(item.tratamiento_id),
          concepto: String(item.concepto ?? ""),
          moneda: item.moneda,
          total_cargo: Number(item.total_cargo),
          total_pagado: Number(item.total_pagado),
          saldo_pendiente: Number(item.saldo_pendiente),
          creado_at: String(item.creado_at ?? ""),
        };

        if (
          !Number.isSafeInteger(cargo.cargo_id) ||
          cargo.cargo_id <= 0 ||

          !Number.isSafeInteger(cargo.paciente_id) ||
          cargo.paciente_id <= 0 ||

          !Number.isSafeInteger(cargo.tratamiento_id) ||
          cargo.tratamiento_id <= 0 ||

          (
            cargo.moneda !== "MXN" &&
            cargo.moneda !== "USD"
          ) ||

          item.total_cargo == null ||
          item.total_pagado == null ||
          item.saldo_pendiente == null ||

          !Number.isFinite(cargo.total_cargo) ||
          !Number.isFinite(cargo.total_pagado) ||
          !Number.isFinite(cargo.saldo_pendiente) ||

          cargo.total_cargo <= 0 ||
          cargo.total_pagado < 0 ||
          cargo.saldo_pendiente < 0 ||

          Math.abs(
            cargo.total_cargo -
            cargo.total_pagado -
            cargo.saldo_pendiente
          ) > 0.005 ||

          Number.isNaN(
            Date.parse(cargo.creado_at)
          )
        ) {
          throw new Error(
            `Datos financieros inconsistentes en cargo adicional ${cargo.cargo_id}`
          );
        }

        cargos.push(cargo);

      }

      if (data.length === 0) {
        break;
      }

      desde += data.length;

    }

    return cargos;

  },

  async cargarDoctores():
    Promise<Doctor[]> {

    const { data, error } = await supabase
      .from("doctores")
      .select("*")
      .order("nombre", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return (data ?? []) as Doctor[];

  },

  async guardarDoctor(
    nombre: string,
    especialidad: string,
    porcentaje: string
  ): Promise<void> {

    const { error } = await supabase
      .from("doctores")
      .insert([
        {
          nombre,
          especialidad,
          porcentaje: Number(porcentaje),
        },
      ]);

    if (error) {
      throw error;
    }

  },

  async actualizarDoctor(
    id: number,
    nombre: string,
    especialidad: string,
    porcentaje: number
  ): Promise<void> {

    const { error } = await supabase
      .from("doctores")
      .update({
        nombre,
        especialidad,
        porcentaje,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

  },

  async guardarGasto(
    fecha: string,
    concepto: string,
    categoria: string,
    monto: number,
    moneda: "MXN" | "USD",
    metodo_pago:
      | "Efectivo"
      | "Transferencia"
      | "Tarjeta",
    notas: string
  ): Promise<void> {

    const { error } = await supabase
      .from("gastos")
      .insert([
        {
          fecha,
          concepto,
          categoria,
          monto,
          moneda,
          metodo_pago,
          notas,
        },
      ]);

    if (error) {
      throw error;
    }

  },

  async eliminarGasto(
    id: number
  ): Promise<void> {

    const { error } = await supabase
      .from("gastos")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

  },

  async cargarCatalogoMaestroTratamientos():
    Promise<TratamientoMaestro[]> {

    const { data, error } = await supabase
      .from("catalogo_maestro_tratamientos")
      .select(`
        id,
        codigo,
        nombre_es,
        nombre_en,
        categoria,
        activo,
        creado_en
      `)
      .eq("activo", true)
      .order("categoria", {
        ascending: true,
      })
      .order("nombre_es", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return (data ?? []) as TratamientoMaestro[];

  },

  async cargarCatalogoTratamientos():
    Promise<TratamientoCatalogo[]> {

    const { data, error } = await supabase
      .from("catalogo_tratamientos")
      .select("*")
      .order("nombre", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return (data ?? []) as TratamientoCatalogo[];

  },

  async guardarTratamientoCatalogo(
    tratamiento: Omit<TratamientoCatalogo, "id">
  ): Promise<void> {

    const { error } = await supabase
      .from("catalogo_tratamientos")
      .insert([
        {
          nombre:
            tratamiento.nombre,

          nombre_en:
            tratamiento.nombre_en ?? null,

          categoria:
            tratamiento.categoria,

          tipo:
            tratamiento.tipo,

          precio_mxn:
            Number(tratamiento.precio_mxn),

          precio_usd:
            Number(tratamiento.precio_usd),

          costo_especialista_mxn:
            Number(
              tratamiento.costo_especialista_mxn
            ),

          costo_especialista_usd:
            Number(
              tratamiento.costo_especialista_usd
            ),

          doctor_id:
            tratamiento.doctor_id ?? null,

          tratamiento_maestro_id:
            tratamiento.tratamiento_maestro_id ?? null,

          activo:
            tratamiento.activo,
        },
      ]);

    if (error) {
      throw error;
    }

  },

  async actualizarTratamientoCatalogo(
    id: number,
    cambios: Partial<
      Omit<TratamientoCatalogo, "id">
    >
  ): Promise<void> {

    const { error } = await supabase
      .from("catalogo_tratamientos")
      .update(cambios)
      .eq("id", id);

    if (error) {
      throw error;
    }

  },

  async cambiarEstadoTratamientoCatalogo(
    id: number,
    activo: boolean
  ): Promise<void> {

    const { error } = await supabase
      .from("catalogo_tratamientos")
      .update({
        activo,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

  },

  async cargarConfiguracionPagos():
    Promise<ConfiguracionPago[]> {

    const { data, error } = await supabase
      .from("configuracion_pagos")
      .select("*")
      .order("id", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return (data ?? []) as ConfiguracionPago[];

  },

  async actualizarConfiguracionPago(
    id: number,
    cambios: Partial<
      Omit<ConfiguracionPago, "id">
    >
  ): Promise<void> {

    const { error } = await supabase
      .from("configuracion_pagos")
      .update(cambios)
      .eq("id", id);

    if (error) {
      throw error;
    }

  },

};