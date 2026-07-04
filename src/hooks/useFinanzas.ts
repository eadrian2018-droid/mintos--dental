import { useEffect, useState } from "react";

import { finanzasService } from "../services/finanzas.service";

export default function useFinanzas() {

  const [

    tratamientos,

    setTratamientos,

  ] = useState<any[]>([]);

  const [

    pacientes,

    setPacientes,

  ] = useState<any[]>([]);

  const [

    gastos,

    setGastos,

  ] = useState<any[]>([]);

  const [

    doctores,

    setDoctores,

  ] = useState<any[]>([]);

  useEffect(() => {

    cargarTodo();

  }, []);

  async function cargarTodo() {

    await Promise.all([

      cargarTratamientos(),

      cargarPacientes(),

      cargarGastos(),

      cargarDoctores(),

    ]);

  }

  async function cargarTratamientos() {

    const data =

      await finanzasService
        .cargarTratamientos();

    setTratamientos(
      data
    );

  }

  async function cargarPacientes() {

    const data =

      await finanzasService
        .cargarPacientes();

    setPacientes(
      data
    );

  }

  async function cargarGastos() {

    const data =

      await finanzasService
        .cargarGastos();

    setGastos(
      data
    );

  }

  async function cargarDoctores() {

    const data =

      await finanzasService
        .cargarDoctores();

    setDoctores(
      data
    );

  }

  return {

    tratamientos,
    setTratamientos,

    pacientes,
    setPacientes,

    gastos,
    setGastos,

    doctores,
    setDoctores,

    cargarTratamientos,

    cargarPacientes,

    cargarGastos,

    cargarDoctores,

  };

}