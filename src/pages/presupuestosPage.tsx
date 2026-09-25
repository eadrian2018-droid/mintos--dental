import {
  useEffect,
  useState,
} from "react";

import Presupuestos
  from "../components/finanzas/Presupuestos";

import PresupuestoForm
  from "../components/presupuestos/PresupuestoForm";

import PresupuestoDetalle
  from "../components/presupuestos/PresupuestoDetalle";

import { supabase }
  from "../lib/supabase";

import { useAuth }
  from "../context/AuthContext";

import { registrarBitacora }
  from "../lib/registrarBitacora";

import type {
  Presupuesto,
  PresupuestoItem,
} from "../types/Presupuesto";

type Paciente = {
  id: number;
  nombre: string;
};

type PresupuestoConPaciente =
  Presupuesto & {
    paciente_nombre?: string;
  };

type DatosNuevoPresupuesto = {
  paciente_id: number | null;
  nombre_paciente: string;
  moneda: "MXN" | "USD";
  idioma: "es" | "en";
  descuento: number;
  notas: string;
  items: {
    id: number;
    diente: string;
    tratamiento: string;
    catalogo_tratamiento_id: number | null;
    dientes: number[];
    arcada: "superior" | "inferior" | null;
    cantidad: number;
    precio_unitario: number;
  }[];
};

export default function PresupuestosPage() {

  const { perfil, permisos } =
    useAuth();

  const esAdmin =
    perfil?.rol === "admin";

  const puedeVerPresupuestos =
    esAdmin ||
    permisos?.ver_expediente === true;

  const puedeCrearPresupuestos =
    esAdmin ||
    permisos?.crear_tratamientos === true;


  const [
    presupuestos,
    setPresupuestos,
  ] = useState<
    PresupuestoConPaciente[]
  >(
    []
  );

  const [
    pacientes,
    setPacientes,
  ] = useState<Paciente[]>(
    []
  );

  const [
    cargando,
    setCargando,
  ] = useState(
    true
  );

  const [
    mostrandoFormulario,
    setMostrandoFormulario,
  ] = useState(
    false
  );

  const [
    presupuestoSeleccionado,
    setPresupuestoSeleccionado,
  ] = useState<
    PresupuestoConPaciente | null
  >(
    null
  );

  const [
    cargandoDetalle,
    setCargandoDetalle,
  ] = useState(
    false
  );


  useEffect(() => {

    cargarDatos();

  }, []);

  async function cargarDatos() {

    setCargando(
      true
    );

    await Promise.all([
      cargarPresupuestos(),
      cargarPacientes(),
    ]);

    setCargando(
      false
    );

  }

  async function cargarPresupuestos() {

    if (!puedeVerPresupuestos) {
      setPresupuestos([]);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        "presupuestos"
      )
      .select(`
        *,
        paciente:pacientes (
          nombre
        )
      `)
      .order(
        "fecha",
        {
          ascending: false,
        }
      );

    if (error) {

      console.error(
        "Error cargando presupuestos:",
        error
      );

      setPresupuestos(
        []
      );

      return;

    }

    const presupuestosPreparados =
      (data || []).map(
        (
          presupuesto: any
        ) => ({
          id:
            presupuesto.id,

          paciente_id:
            presupuesto.paciente_id,

          nombre_paciente:
            presupuesto.nombre_paciente,

          paciente_nombre:
            presupuesto.paciente
              ?.nombre ||
            presupuesto.nombre_paciente ||
            (
              presupuesto.paciente_id
                ? `Paciente #${presupuesto.paciente_id}`
                : "Paciente sin nombre"
            ),

          fecha:
            presupuesto.fecha,

          estado:
            presupuesto.estado,

          moneda:
            presupuesto.moneda,

        idioma:
  presupuesto.idioma === "en"
    ? ("en" as const)
    : ("es" as const),

          subtotal:
            Number(
              presupuesto.subtotal ||
              0
            ),

          descuento:
            Number(
              presupuesto.descuento ||
              0
            ),

          total:
            Number(
              presupuesto.total ||
              0
            ),

          notas:
            presupuesto.notas,

          fecha_aprobacion:
            presupuesto.fecha_aprobacion,

          created_at:
            presupuesto.created_at,

          updated_at:
            presupuesto.updated_at,
        })
      );

    setPresupuestos(
      presupuestosPreparados
    );

  }

  async function cargarPacientes() {

    const {
      data,
      error,
    } = await supabase
      .from(
        "pacientes"
      )
      .select(
        "id, nombre"
      )
      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (error) {

      console.error(
        "Error cargando pacientes:",
        error
      );

      setPacientes(
        []
      );

      return;

    }

    setPacientes(
      (data || []) as Paciente[]
    );

  }

  async function guardarPresupuesto(
    datos: DatosNuevoPresupuesto
  ) {

    if (!puedeCrearPresupuestos) {
      return;
    }

    const subtotal =
      datos.items.reduce(
        (
          acumulado,
          item
        ) =>
          acumulado +
          (
            Number(
              item.cantidad
            ) *
            Number(
              item.precio_unitario
            )
          ),
        0
      );

    const descuento =
      Math.min(
        Math.max(
          Number(
            datos.descuento || 0
          ),
          0
        ),
        subtotal
      );

    const total =
      Math.max(
        subtotal - descuento,
        0
      );

    const {
      data: presupuestoCreado,
      error: errorPresupuesto,
    } = await supabase
      .from(
        "presupuestos"
      )
      .insert([
        {
          paciente_id:
            datos.paciente_id,

          nombre_paciente:
            datos.nombre_paciente,

          estado:
            "Borrador",

          moneda:
            datos.moneda,

          idioma:
            datos.idioma,

          subtotal,

          descuento,

          total,

          notas:
            datos.notas || null,

          updated_at:
            new Date()
              .toISOString(),
        },
      ])
      .select("*")
      .single();

    if (
      errorPresupuesto ||
      !presupuestoCreado
    ) {

      console.error(
        "Error creando presupuesto:",
        errorPresupuesto
      );

      alert(
        "No se pudo guardar el presupuesto."
      );

      throw errorPresupuesto;

    }

    const itemsInsertar =
      datos.items.map(
        (
          item
        ) => ({
          presupuesto_id:
            presupuestoCreado.id,

          diente:
            item.diente
              .trim() ||
            null,

          tratamiento:
            item.tratamiento
              .trim(),

          catalogo_tratamiento_id:
            item.catalogo_tratamiento_id,

          dientes:
            item.dientes,

          arcada:
            item.arcada,

          cantidad:
            Number(
              item.cantidad
            ),

          precio_unitario:
            Number(
              item.precio_unitario
            ),

          total:
            Number(
              item.cantidad
            ) *
            Number(
              item.precio_unitario
            ),
        })
      );

    const {
      error: errorItems,
    } = await supabase
      .from(
        "presupuesto_items"
      )
      .insert(
        itemsInsertar
      );

    if (
      errorItems
    ) {

      console.error(
        "Error guardando tratamientos del presupuesto:",
        errorItems
      );

      await supabase
        .from(
          "presupuestos"
        )
        .delete()
        .eq(
          "id",
          presupuestoCreado.id
        );

      alert(
        "No se pudieron guardar los tratamientos del presupuesto."
      );

      throw errorItems;

    }

    await registrarBitacora({
      accion: "Crear presupuesto",
      modulo: "Presupuestos",
      detalle:
        `Presupuesto ID: ${presupuestoCreado.id} | Paciente ID: ${datos.paciente_id || "-"} | Paciente: ${datos.nombre_paciente} | Idioma: ${datos.idioma} | Subtotal: ${subtotal} ${datos.moneda} | Descuento: ${descuento} ${datos.moneda} | Total: ${total} ${datos.moneda}`,
    });

    await cargarPresupuestos();

    setMostrandoFormulario(
      false
    );

  }

  async function abrirPresupuesto(
    presupuesto:
      PresupuestoConPaciente
  ) {

    setCargandoDetalle(
      true
    );

    const {
      data,
      error,
    } = await supabase
      .from(
        "presupuesto_items"
      )
      .select("*")
      .eq(
        "presupuesto_id",
        presupuesto.id
      )
      .order(
        "id",
        {
          ascending: true,
        }
      );

    if (error) {

      console.error(
        "Error cargando detalle del presupuesto:",
        error
      );

      alert(
        "No se pudo cargar el detalle del presupuesto."
      );

      setCargandoDetalle(
        false
      );

      return;

    }

    const items =
      (data || []).map(
        (
          item
        ) => ({
          id:
            item.id,

          presupuesto_id:
            item.presupuesto_id,

          diente:
            item.diente,

          tratamiento:
            item.tratamiento,

          catalogo_tratamiento_id:
            item.catalogo_tratamiento_id ?? null,

          dientes:
            Array.isArray(item.dientes)
              ? item.dientes.map(
                  (diente: unknown) =>
                    Number(diente)
                )
              : [],

          arcada:
            item.arcada === "superior" ||
            item.arcada === "inferior"
              ? item.arcada
              : null,

          cantidad:
            Number(
              item.cantidad ||
              0
            ),

          precio_unitario:
            Number(
              item.precio_unitario ||
              0
            ),

          total:
            Number(
              item.total ||
              0
            ),

          created_at:
            item.created_at,
        })
      ) as PresupuestoItem[];

    setPresupuestoSeleccionado({
      ...presupuesto,
      items,
    });

    await registrarBitacora({
      accion: "Abrir presupuesto",
      modulo: "Presupuestos",
      detalle:
        `Presupuesto ID: ${presupuesto.id} | Paciente ID: ${presupuesto.paciente_id || "-"} | Paciente: ${presupuesto.paciente_nombre || presupuesto.nombre_paciente || "-"}`,
    });

    setCargandoDetalle(
      false
    );

  }

  async function marcarComoEnviado() {

    if (!puedeCrearPresupuestos) {
      return;
    }

    if (
      !presupuestoSeleccionado
    ) {

      return;

    }

    if (
      presupuestoSeleccionado.estado !==
      "Borrador"
    ) {

      return;

    }

    const actualizadoEn =
      new Date()
        .toISOString();

    const {
      error,
    } = await supabase
      .from(
        "presupuestos"
      )
      .update({
        estado:
          "Enviado",
        updated_at:
          actualizadoEn,
      })
      .eq(
        "id",
        presupuestoSeleccionado.id
      );

    if (error) {

      console.error(
        "Error marcando presupuesto como enviado:",
        error
      );

      alert(
        "No se pudo actualizar el presupuesto."
      );

      return;

    }

    await registrarBitacora({
      accion: "Enviar presupuesto",
      modulo: "Presupuestos",
      detalle:
        `Presupuesto ID: ${presupuestoSeleccionado.id} | Paciente ID: ${presupuestoSeleccionado.paciente_id || "-"} | Paciente: ${presupuestoSeleccionado.paciente_nombre || presupuestoSeleccionado.nombre_paciente || "-"} | Total: ${presupuestoSeleccionado.total} ${presupuestoSeleccionado.moneda}`,
    });

    setPresupuestoSeleccionado(
      (actual) =>
        actual
          ? {
              ...actual,
              estado: "Enviado",
              updated_at: actualizadoEn,
            }
          : null
    );

    setPresupuestos(
      (actuales) =>
        actuales.map(
          (presupuesto) =>
            presupuesto.id ===
            presupuestoSeleccionado.id
              ? {
                  ...presupuesto,
                  estado: "Enviado",
                  updated_at: actualizadoEn,
                }
              : presupuesto
        )
    );

  }


  function nuevoPresupuesto() {

    if (!puedeCrearPresupuestos) {
      return;
    }

    setPresupuestoSeleccionado(
      null
    );

    setMostrandoFormulario(
      true
    );

  }

  function cancelarNuevoPresupuesto() {

    setMostrandoFormulario(
      false
    );

  }

  function volverDesdeDetalle() {

    setPresupuestoSeleccionado(
      null
    );

  }

  if (
    cargando
  ) {

    return (

      <div
        className="
          w-full
          min-h-[300px]
          flex
          items-center
          justify-center
        "
      >

        <p
          className="
            text-sm
            mint-text-muted
          "
        >

          Cargando presupuestos...

        </p>

      </div>

    );

  }

  if (
    cargandoDetalle
  ) {

    return (

      <div
        className="
          w-full
          min-h-[300px]
          flex
          items-center
          justify-center
        "
      >

        <p
          className="
            text-sm
            mint-text-muted
          "
        >

          Cargando detalle...

        </p>

      </div>

    );

  }

  if (
    presupuestoSeleccionado
  ) {

    return (

      <PresupuestoDetalle

        presupuesto={
          presupuestoSeleccionado
        }

        onVolver={
          volverDesdeDetalle
        }

        onMarcarEnviado={
          marcarComoEnviado
        }

        puedeEnviar={
          puedeCrearPresupuestos
        }

      />

    );

  }

  if (
    mostrandoFormulario
  ) {

    return (

      <PresupuestoForm

        pacientes={
          pacientes
        }

        onCancelar={
          cancelarNuevoPresupuesto
        }

        onGuardar={
          guardarPresupuesto
        }

      />

    );

  }

  return (

    <Presupuestos

      presupuestos={
        presupuestos
      }

      onNuevoPresupuesto={
        nuevoPresupuesto
      }

      onAbrirPresupuesto={
        abrirPresupuesto
      }

      puedeCrear={
        puedeCrearPresupuestos
      }

    />

  );

}