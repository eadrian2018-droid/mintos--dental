import { useEffect, useState } from "react";

import { finanzasService } from "../services/finanzas.service";

import { registrarBitacora } from "../lib/registrarBitacora";

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

import type {
  ConfiguracionPago,
} from "../types/ConfiguracionPago";

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
    pagos,
    setPagos,
  ] = useState<any[]>([]);

  const [
    doctores,
    setDoctores,
  ] = useState<Doctor[]>([]);

  const [
    catalogoTratamientos,
    setCatalogoTratamientos,
  ] = useState<TratamientoCatalogo[]>([]);

  const [
    configuracionPagos,
    setConfiguracionPagos,
  ] = useState<ConfiguracionPago[]>([]);

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
    monedaGasto,
    setMonedaGasto,
  ] = useState<
    "MXN" |
    "USD"
  >("MXN");

  const [
    metodoPagoGasto,
    setMetodoPagoGasto,
  ] = useState<
    "Efectivo" |
    "Transferencia" |
    "Tarjeta"
  >("Efectivo");

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

      cargarPagos(),

      cargarDoctores(),

      cargarCatalogoTratamientos(),

      cargarConfiguracionPagos(),

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

  async function cargarPagos() {

    const data =
      await finanzasService
        .cargarPagos();

    setPagos(
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

  async function cargarConfiguracionPagos() {

    const data =
      await finanzasService
        .cargarConfiguracionPagos();

    setConfiguracionPagos(
      data
    );

  }

  async function guardarDoctor() {

    await finanzasService.guardarDoctor(

      nombreDoctor,

      especialidadDoctor,

      porcentajeDoctor

    );

    await registrarBitacora({
      accion: "Crear doctor",
      modulo: "Finanzas",
      detalle:
        `Doctor: ${nombreDoctor} | Especialidad: ${especialidadDoctor || "-"} | Comisión: ${porcentajeDoctor}%`,
    });

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

    await registrarBitacora({
      accion: "Editar doctor",
      modulo: "Finanzas",
      detalle:
        `Doctor ID: ${id} | Doctor: ${nombre} | Especialidad: ${especialidad || "-"} | Comisión: ${porcentaje}%`,
    });

    await cargarDoctores();

  }

  async function guardarGasto() {

    const fecha =
      fechaGasto;

    const concepto =
      conceptoGasto;

    const categoria =
      categoriaGasto;

    const monto =
      Number(
        montoGasto
      );

    const moneda =
      monedaGasto;

    const metodoPago =
      metodoPagoGasto;

    await finanzasService.guardarGasto(

      fecha,

      concepto,

      categoria,

      monto,

      moneda,

      metodoPago,

      notasGasto

    );

    await registrarBitacora({
      accion: "Registrar gasto",
      modulo: "Finanzas",
      detalle:
        `Fecha: ${fecha || "-"} | Concepto: ${concepto || "-"} | Categoría: ${categoria || "-"} | Monto: ${monto} ${moneda} | Método: ${metodoPago}`,
    });

    setFechaGasto("");

    setConceptoGasto("");

    setCategoriaGasto("");

    setMontoGasto("");

    setMonedaGasto("MXN");

    setMetodoPagoGasto("Efectivo");

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

    const gasto =
      gastos.find(
        (registro) =>
          registro.id === id
      );

    await finanzasService.eliminarGasto(
      id
    );

    await registrarBitacora({
      accion: "Eliminar gasto",
      modulo: "Finanzas",
      detalle:
        `Gasto ID: ${id} | Concepto: ${gasto?.concepto || "-"} | Categoría: ${gasto?.categoria || "-"} | Monto: ${Number(gasto?.monto || 0)} ${gasto?.moneda || "MXN"}`,
    });

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

    await registrarBitacora({
      accion: "Crear tratamiento de catálogo",
      modulo: "Configuración financiera",
      detalle:
        `Tratamiento: ${tratamiento.nombre || "-"}`,
    });

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

    await registrarBitacora({
      accion: "Editar tratamiento de catálogo",
      modulo: "Configuración financiera",
      detalle:
        `Tratamiento catálogo ID: ${id}`,
    });

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

    await registrarBitacora({
      accion: activo
        ? "Activar tratamiento de catálogo"
        : "Desactivar tratamiento de catálogo",
      modulo: "Configuración financiera",
      detalle:
        `Tratamiento catálogo ID: ${id}`,
    });

    await cargarCatalogoTratamientos();

  }

  async function actualizarConfiguracionPago(
    id: number,
    cambios:
      Partial<
        Omit<
          ConfiguracionPago,
          "id"
        >
      >
  ) {

    await finanzasService
      .actualizarConfiguracionPago(
        id,
        cambios
      );

    await registrarBitacora({
      accion: "Editar configuración de pago",
      modulo: "Configuración financiera",
      detalle:
        `Configuración de pago ID: ${id}`,
    });

    await cargarConfiguracionPagos();

  }

  return {

    tratamientos,

    pacientes,

    gastos,

    pagos,

    doctores,

    catalogoTratamientos,

    configuracionPagos,

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

    monedaGasto,
    setMonedaGasto,

    metodoPagoGasto,
    setMetodoPagoGasto,

    notasGasto,
    setNotasGasto,

    guardarDoctor,

    actualizarDoctor,

    guardarGasto,

    eliminarGasto,

    guardarTratamientoCatalogo,

    actualizarTratamientoCatalogo,

    cambiarEstadoTratamientoCatalogo,

    actualizarConfiguracionPago,

    cargarTratamientos,

    cargarPacientes,

    cargarGastos,

    cargarPagos,

    cargarDoctores,

    cargarCatalogoTratamientos,

    cargarConfiguracionPagos,

  };

}
