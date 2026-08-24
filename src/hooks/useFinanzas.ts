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

  const [
    fechaGasto,
    setFechaGasto,
  ] = useState("");

  const [
    conceptoGasto,
    setConceptoGasto,
  ] = useState("");

  const [
    categoriaGasto,
    setCategoriaGasto,
  ] = useState("");

  const [
    montoGasto,
    setMontoGasto,
  ] = useState("");

  const [
    notasGasto,
    setNotasGasto,
  ] = useState("");

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

  async function guardarGasto() {

    await finanzasService.guardarGasto(

      fechaGasto,

      conceptoGasto,

      categoriaGasto,

      Number(
        montoGasto
      ),

      notasGasto

    );

    setFechaGasto("");

    setConceptoGasto("");

    setCategoriaGasto("");

    setMontoGasto("");

    setNotasGasto("");

    await cargarGastos();

  }

  async function eliminarGasto(
    id: number
  ) {

    const confirmar =
      window.confirm(
        "¿Eliminar este gasto?"
      );

    if (!confirmar) {

      return;

    }

    await finanzasService.eliminarGasto(
      id
    );

    await cargarGastos();

  }

  return {

    tratamientos,

    pacientes,

    gastos,

    doctores,

    nombreDoctor,
    setNombreDoctor,

    especialidadDoctor,
    setEspecialidadDoctor,

    porcentajeDoctor,
    setPorcentajeDoctor,

    fechaGasto,
    setFechaGasto,

    conceptoGasto,
    setConceptoGasto,

    categoriaGasto,
    setCategoriaGasto,

    montoGasto,
    setMontoGasto,

    notasGasto,
    setNotasGasto,

    guardarDoctor,

    guardarGasto,

    eliminarGasto,

    cargarTratamientos,

    cargarPacientes,

    cargarGastos,

    cargarDoctores,

  };

}