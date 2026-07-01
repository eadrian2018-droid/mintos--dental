import { supabase } from "../lib/supabase";

export const finanzasService = {

  async cargarTratamientos() {

    const {
      data,
      error,
    } = await supabase
      .from("tratamientos")
      .select("*");

    if (error) {
      throw error;
    }

    return data ?? [];

  },

  async cargarPacientes() {

    const {
      data,
      error,
    } = await supabase
      .from("pacientes")
      .select("*");

    if (error) {
      throw error;
    }

    return data ?? [];

  },

  async cargarGastos() {

    const {
      data,
      error,
    } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data ?? [];

  },

  async cargarDoctores() {

    const {
      data,
      error,
    } = await supabase
      .from("doctores")
      .select("*")
      .order("nombre", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return data ?? [];

  },

  async guardarDoctor(
    nombre: string,
    especialidad: string,
    porcentaje: string
  ) {

    const { error } = await supabase

      .from("doctores")

      .insert([
        {
          nombre,
          especialidad,
          porcentaje: Number(
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
  ) {

    const { error } = await supabase

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
  ) {

    const { error } = await supabase

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