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
  descuento: number;
  notas: string;
  items: {
    id: number;
    diente: string;
    tratamiento: string;
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

  const puedeConvertirPresupuestos =
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

  const [
    convirtiendo,
    setConvirtiendo,
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
        `Presupuesto ID: ${presupuestoCreado.id} | Paciente ID: ${datos.paciente_id || "-"} | Paciente: ${datos.nombre_paciente} | Subtotal: ${subtotal} ${datos.moneda} | Descuento: ${descuento} ${datos.moneda} | Total: ${total} ${datos.moneda}`,
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

  async function convertirATratamiento() {

    if (!puedeConvertirPresupuestos) {
      return;
    }

    if (
      !presupuestoSeleccionado ||
      presupuestoSeleccionado.estado !==
        "Enviado" ||
      convirtiendo
    ) {

      return;

    }

    const items =
      presupuestoSeleccionado.items || [];

    if (
      items.length === 0
    ) {

      alert(
        "Este presupuesto no tiene tratamientos para convertir."
      );

      return;

    }

    let pacienteIdTratamiento =
      presupuestoSeleccionado
        .paciente_id;

    if (
      !pacienteIdTratamiento
    ) {

      const nombrePresupuesto =
        (
          presupuestoSeleccionado
            .paciente_nombre ||
          presupuestoSeleccionado
            .nombre_paciente ||
          ""
        )
          .trim()
          .toLocaleLowerCase(
            "es-MX"
          );

      const coincidencias =
        pacientes.filter(
          (paciente) =>
            paciente.nombre
              .trim()
              .toLocaleLowerCase(
                "es-MX"
              ) ===
            nombrePresupuesto
        );

      if (
        coincidencias.length ===
        0
      ) {

        const nombreNuevoPaciente =
          (
            presupuestoSeleccionado
              .paciente_nombre ||
            presupuestoSeleccionado
              .nombre_paciente ||
            ""
          ).trim();

        if (
          !nombreNuevoPaciente
        ) {

          alert(
            "No se encontró un nombre válido para crear el paciente."
          );

          return;

        }

        const {
          data: pacienteCreado,
          error: errorPaciente,
        } = await supabase
          .from(
            "pacientes"
          )
          .insert([
            {
              nombre:
                nombreNuevoPaciente,
            },
          ])
          .select(
            "id, nombre"
          )
          .single();

        if (
          errorPaciente ||
          !pacienteCreado
        ) {

          console.error(
            "Error creando paciente desde presupuesto:",
            errorPaciente
          );

          alert(
            "No se pudo crear el paciente automáticamente."
          );

          return;

        }

        pacienteIdTratamiento =
          pacienteCreado.id;

        await registrarBitacora({
          accion: "Crear paciente desde presupuesto",
          modulo: "Presupuestos",
          detalle:
            `Presupuesto ID: ${presupuestoSeleccionado.id} | Paciente ID: ${pacienteCreado.id} | Paciente: ${pacienteCreado.nombre}`,
        });

        setPacientes(
          (actuales) =>
            [
              ...actuales,
              pacienteCreado as Paciente,
            ].sort(
              (a, b) =>
                a.nombre.localeCompare(
                  b.nombre,
                  "es-MX"
                )
            )
        );

      }

      if (
        coincidencias.length >
        1
      ) {

        alert(
          "Hay más de un paciente registrado con este nombre. No se puede vincular automáticamente el presupuesto."
        );

        return;

      }

      if (
        coincidencias.length ===
        1
      ) {

        pacienteIdTratamiento =
          coincidencias[0].id;

      }

      const {
        error: errorVinculando,
      } = await supabase
        .from(
          "presupuestos"
        )
        .update({
          paciente_id:
            pacienteIdTratamiento,
          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          presupuestoSeleccionado.id
        );

      if (
        errorVinculando
      ) {

        console.error(
          "Error vinculando presupuesto con paciente:",
          errorVinculando
        );

        alert(
          "No se pudo vincular el presupuesto con el paciente registrado."
        );

        return;

      }

      setPresupuestoSeleccionado(
        (actual) =>
          actual
            ? {
                ...actual,
                paciente_id:
                  pacienteIdTratamiento,
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
                    paciente_id:
                      pacienteIdTratamiento,
                  }
                : presupuesto
          )
      );

    }

    const confirmar =
      window.confirm(
        "¿Convertir este presupuesto en tratamientos activos del paciente?"
      );

    if (
      !confirmar
    ) {

      return;

    }

    setConvirtiendo(
      true
    );

    let tipoCambioPresupuesto =
      1;

    if (
      presupuestoSeleccionado.moneda ===
      "USD"
    ) {

      const {
        data: tipoCambioData,
        error: errorTipoCambio,
      } = await supabase
        .from(
          "configuracion_finanzas"
        )
        .select(
          "valor"
        )
        .eq(
          "clave",
          "tipo_cambio_usd_mxn"
        )
        .maybeSingle();

      tipoCambioPresupuesto =
        Number(
          tipoCambioData?.valor ||
          0
        );

      if (
        errorTipoCambio ||
        tipoCambioPresupuesto <= 0
      ) {

        console.error(
          "Error cargando tipo de cambio para convertir presupuesto:",
          errorTipoCambio
        );

        alert(
          "No hay un tipo de cambio válido configurado para convertir este presupuesto en USD."
        );

        setConvirtiendo(
          false
        );

        return;

      }

    }

    const subtotalPresupuesto =
      Number(
        presupuestoSeleccionado.subtotal ||
        items.reduce(
          (
            acumulado,
            item
          ) =>
            acumulado +
            Number(
              item.total || 0
            ),
          0
        )
      );

    const totalFinalPresupuesto =
      Math.max(
        Number(
          presupuestoSeleccionado.total ||
          0
        ),
        0
      );

    const tratamientosInsertar =
      items.map(
        (
          item,
          index
        ) => {

          const totalItemOriginal =
            Number(
              item.total || 0
            );

          let totalOriginal =
            subtotalPresupuesto > 0
              ? totalFinalPresupuesto *
                (
                  totalItemOriginal /
                  subtotalPresupuesto
                )
              : 0;

          if (
            index ===
            items.length - 1
          ) {

            const totalAsignado =
              items
                .slice(
                  0,
                  -1
                )
                .reduce(
                  (
                    acumulado,
                    itemAnterior
                  ) =>
                    acumulado +
                    (
                      subtotalPresupuesto > 0
                        ? totalFinalPresupuesto *
                          (
                            Number(
                              itemAnterior.total ||
                              0
                            ) /
                            subtotalPresupuesto
                          )
                        : 0
                    ),
                  0
                );

            totalOriginal =
              Math.max(
                totalFinalPresupuesto -
                  totalAsignado,
                0
              );

          }

          totalOriginal =
            Number(
              totalOriginal.toFixed(
                2
              )
            );

          const totalContable =
            Number(
              (
                presupuestoSeleccionado.moneda ===
                "USD"
                  ? totalOriginal *
                    tipoCambioPresupuesto
                  : totalOriginal
              ).toFixed(
                2
              )
            );

          const nombreTratamiento =
            item.diente
              ? `${item.tratamiento} · Diente ${item.diente}`
              : item.tratamiento;

          return {
            paciente_id:
              pacienteIdTratamiento,
            tratamiento:
              nombreTratamiento,
            total:
              totalContable,
            pago:
              0,
            resta:
              totalContable,
            pendiente:
              totalContable > 0,
            moneda_precio:
              presupuestoSeleccionado.moneda,
            total_original:
              totalOriginal,
            pagado_original:
              0,
            resta_original:
              totalOriginal,
          };

        }
      );

    const {
      error: errorTratamientos,
    } = await supabase
      .from(
        "tratamientos"
      )
      .insert(
        tratamientosInsertar
      );

    if (
      errorTratamientos
    ) {

      console.error(
        "Error convirtiendo presupuesto a tratamientos:",
        errorTratamientos
      );

      alert(
        "No se pudieron crear los tratamientos."
      );

      setConvirtiendo(
        false
      );

      return;

    }

    const actualizadoEn =
      new Date()
        .toISOString();

    const {
      error: errorPresupuesto,
    } = await supabase
      .from(
        "presupuestos"
      )
      .update({
        estado:
          "Convertido",
        updated_at:
          actualizadoEn,
      })
      .eq(
        "id",
        presupuestoSeleccionado.id
      );

    if (
      errorPresupuesto
    ) {

      console.error(
        "Tratamientos creados, pero no se pudo marcar el presupuesto como convertido:",
        errorPresupuesto
      );

      alert(
        "Los tratamientos se crearon, pero no se pudo actualizar el estado del presupuesto. No vuelvas a convertirlo y avísame para corregirlo."
      );

      setConvirtiendo(
        false
      );

      return;

    }

    await registrarBitacora({
      accion: "Convertir presupuesto a tratamientos",
      modulo: "Presupuestos",
      detalle:
        `Presupuesto ID: ${presupuestoSeleccionado.id} | Paciente ID: ${pacienteIdTratamiento || "-"} | Paciente: ${presupuestoSeleccionado.paciente_nombre || presupuestoSeleccionado.nombre_paciente || "-"} | Tratamientos creados: ${items.length} | Total: ${presupuestoSeleccionado.total} ${presupuestoSeleccionado.moneda}`,
    });

    setPresupuestoSeleccionado(
      (actual) =>
        actual
          ? {
              ...actual,
              estado: "Convertido",
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
                  estado: "Convertido",
                  updated_at: actualizadoEn,
                }
              : presupuesto
        )
    );

    setConvirtiendo(
      false
    );

    alert(
      "Presupuesto convertido a tratamientos correctamente."
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

        onConvertirTratamiento={
          convertirATratamiento
        }

        convirtiendo={
          convirtiendo
        }

        puedeEnviar={
          puedeCrearPresupuestos
        }

        puedeConvertir={
          puedeConvertirPresupuestos
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