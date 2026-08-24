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

};