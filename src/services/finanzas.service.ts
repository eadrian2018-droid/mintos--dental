import { supabase } from "../lib/supabase";

import type {
  Tratamiento,
} from "../types/Tratamiento";

import type {
  Paciente,
} from "../types/Paciente";

import type {
  Gasto,
} from "../types/Gasto";

import type {
  Doctor,
} from "../types/Doctor";

import type {
  TratamientoCatalogo,
} from "../types/TratamientoCatalogo";

export const finanzasService = {

  async cargarTratamientos():
    Promise<Tratamiento[]> {

    const {
      data,
      error,
    } = await supabase
      .from("tratamientos")
      .select("*");

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ) as Tratamiento[];

  },

  async cargarPacientes():
    Promise<Paciente[]> {

    const {
      data,
      error,
    } = await supabase
      .from("pacientes")
      .select("*");

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ) as Paciente[];

  },

  async cargarGastos():
    Promise<Gasto[]> {

    const {
      data,
      error,
    } = await supabase
      .from("gastos")
      .select("*")
      .order(
        "fecha",
        {
          ascending: false,
        }
      );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ) as Gasto[];

  },

  async cargarDoctores():
    Promise<Doctor[]> {

    const {
      data,
      error,
    } = await supabase
      .from("doctores")
      .select("*")
      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ) as Doctor[];

  },

  async guardarDoctor(
    nombre: string,
    especialidad: string,
    porcentaje: string
  ): Promise<void> {

    const {
      error,
    } = await supabase
      .from("doctores")
      .insert([
        {
          nombre,
          especialidad,

          porcentaje:
            Number(
              porcentaje
            ),
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

    const {
      error,
    } = await supabase
      .from("doctores")
      .update({
        nombre,
        especialidad,
        porcentaje,
      })
      .eq(
        "id",
        id
      );

    if (error) {
      throw error;
    }

  },

  async guardarGasto(
    fecha: string,
    concepto: string,
    categoria: string,
    monto: number,
    notas: string
  ): Promise<void> {

    const {
      error,
    } = await supabase
      .from("gastos")
      .insert([
        {
          fecha,
          concepto,
          categoria,
          monto,
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

    const {
      error,
    } = await supabase
      .from("gastos")
      .delete()
      .eq(
        "id",
        id
      );

    if (error) {
      throw error;
    }

  },

  async cargarCatalogoTratamientos():
    Promise<TratamientoCatalogo[]> {

    const {
      data,
      error,
    } = await supabase
      .from(
        "catalogo_tratamientos"
      )
      .select("*")
      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ) as TratamientoCatalogo[];

  },

  async guardarTratamientoCatalogo(
    tratamiento:
      Omit<
        TratamientoCatalogo,
        "id"
      >
  ): Promise<void> {

    const {
      error,
    } = await supabase
      .from(
        "catalogo_tratamientos"
      )
      .insert([
        {
          nombre:
            tratamiento.nombre,

          categoria:
            tratamiento.categoria,

          tipo:
            tratamiento.tipo,

          precio_mxn:
            Number(
              tratamiento.precio_mxn
            ),

          precio_usd:
            Number(
              tratamiento.precio_usd
            ),

          costo_especialista_mxn:
            Number(
              tratamiento
                .costo_especialista_mxn
            ),

          costo_especialista_usd:
            Number(
              tratamiento
                .costo_especialista_usd
            ),

          doctor_id:
            tratamiento.doctor_id ??
            null,

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

    cambios:
      Partial<
        Omit<
          TratamientoCatalogo,
          "id"
        >
      >
  ): Promise<void> {

    const {
      error,
    } = await supabase
      .from(
        "catalogo_tratamientos"
      )
      .update(
        cambios
      )
      .eq(
        "id",
        id
      );

    if (error) {
      throw error;
    }

  },

  async cambiarEstadoTratamientoCatalogo(
    id: number,
    activo: boolean
  ): Promise<void> {

    const {
      error,
    } = await supabase
      .from(
        "catalogo_tratamientos"
      )
      .update({
        activo,
      })
      .eq(
        "id",
        id
      );

    if (error) {
      throw error;
    }

  },

};