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

  const [

  nombreDoctor,

  setNombreDoctor,

] = useState("");

const [

  especialidadDoctor,

  setEspecialidadDoctor,

] = useState("");

const [

  porcentajeDoctor,

  setPorcentajeDoctor,

] = useState("30");

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

async function guardarDoctor() {

  await finanzasService.guardarDoctor(

    nombreDoctor,

    especialidadDoctor,

    porcentajeDoctor

  );

  setNombreDoctor("");

  setEspecialidadDoctor("");

  setPorcentajeDoctor("30");

  await cargarDoctores();

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

    guardarDoctor,

    cargarTratamientos,

    cargarPacientes,

    cargarGastos,

    cargarDoctores,

    nombreDoctor,
setNombreDoctor,

especialidadDoctor,
setEspecialidadDoctor,

porcentajeDoctor,
setPorcentajeDoctor,

  };

}