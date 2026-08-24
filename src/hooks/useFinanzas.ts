import { useEffect, useState } from "react";

import { finanzasService } from "../services/finanzas.service";

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

export default function useFinanzas() {

  const [
    tratamientos,
    setTratamientos,
  ] = useState<Tratamiento[]>([]);

  const [
    pacientes,
    setPacientes,
  ] = useState<Paciente[]>([]);

  const [
    gastos,
    setGastos,
  ] = useState<Gasto[]>([]);

  const [
    doctores,
    setDoctores,
  ] = useState<Doctor[]>([]);

  const [
    catalogoTratamientos,
    setCatalogoTratamientos,
  ] = useState<TratamientoCatalogo[]>([]);

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

      cargarCatalogoTratamientos(),

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

  async function cargarCatalogoTratamientos() {

    const data =
      await finanzasService
        .cargarCatalogoTratamientos();

    setCatalogoTratamientos(
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

  async function actualizarDoctor(
    id: number,
    nombre: string,
    especialidad: string,
    porcentaje: number
  ) {

    await finanzasService
      .actualizarDoctor(

        id,

        nombre,

        especialidad,

        porcentaje

      );

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

  async function guardarTratamientoCatalogo(
    tratamiento:
      Omit<
        TratamientoCatalogo,
        "id"
      >
  ) {

    await finanzasService
      .guardarTratamientoCatalogo(
        tratamiento
      );

    await cargarCatalogoTratamientos();

  }

  async function actualizarTratamientoCatalogo(
    id: number,
    cambios:
      Partial<
        Omit<
          TratamientoCatalogo,
          "id"
        >
      >
  ) {

    await finanzasService
      .actualizarTratamientoCatalogo(
        id,
        cambios
      );

    await cargarCatalogoTratamientos();

  }

  async function cambiarEstadoTratamientoCatalogo(
    id: number,
    activo: boolean
  ) {

    await finanzasService
      .cambiarEstadoTratamientoCatalogo(
        id,
        activo
      );

    await cargarCatalogoTratamientos();

  }

  return {

    tratamientos,

    pacientes,

    gastos,

    doctores,

    catalogoTratamientos,

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

    actualizarDoctor,

    guardarGasto,

    eliminarGasto,

    guardarTratamientoCatalogo,

    actualizarTratamientoCatalogo,

    cambiarEstadoTratamientoCatalogo,

    cargarTratamientos,

    cargarPacientes,

    cargarGastos,

    cargarDoctores,

    cargarCatalogoTratamientos,

  };

}