import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import { registrarBitacora } from "../../lib/registrarBitacora";

import { useLanguage } from "../../context/LanguageContext";

type RolUsuario =
  | "admin"
  | "doctor"
  | "recepcionista"
  | "tablet"
  | "registro";

type Perfil = {
  id: string;
  nombre: string;
  rol: RolUsuario;
  doctor_id: number | null;
  activo: boolean;
};

type Doctor = {
  id: number;
  nombre: string;
};

type Permisos = {
  registrar_pacientes: boolean;

  ver_agenda: boolean;
  editar_citas: boolean;

  ver_pacientes: boolean;
  editar_pacientes: boolean;

  ver_expediente: boolean;
  agregar_notas_clinicas: boolean;

  crear_tratamientos: boolean;
  cambiar_estado_tratamientos: boolean;
  anular_tratamientos: boolean;

  registrar_cobros: boolean;
  aplicar_descuentos: boolean;
  registrar_gastos: boolean;
  anular_cobros: boolean;
  anular_gastos: boolean;

  ver_resumen_financiero: boolean;
  ver_utilidades: boolean;
  ver_comisiones: boolean;

  configurar_precios_costos: boolean;
  configurar_comisiones: boolean;

  administrar_usuarios: boolean;
  ver_bitacora: boolean;
};

type Props = {
  perfil: Perfil;
  doctores: Doctor[];
  onCerrar: () => void;
  onGuardado: () => Promise<void>;
};

const permisosVacios: Permisos = {
  registrar_pacientes: false,

  ver_agenda: false,
  editar_citas: false,

  ver_pacientes: false,
  editar_pacientes: false,

  ver_expediente: false,
  agregar_notas_clinicas: false,

  crear_tratamientos: false,
  cambiar_estado_tratamientos: false,
  anular_tratamientos: false,

  registrar_cobros: false,
  aplicar_descuentos: false,
  registrar_gastos: false,
  anular_cobros: false,
  anular_gastos: false,

  ver_resumen_financiero: false,
  ver_utilidades: false,
  ver_comisiones: false,

  configurar_precios_costos: false,
  configurar_comisiones: false,

  administrar_usuarios: false,
  ver_bitacora: false,
};

const gruposPermisos = [
  {
    titulo: "Agenda",
    permisos: [
      ["ver_agenda", "Ver agenda"],
      ["editar_citas", "Crear y editar citas"],
    ],
  },

  {
    titulo: "Pacientes",
    permisos: [
      ["registrar_pacientes", "Registrar nuevos pacientes"],
      ["ver_pacientes", "Ver pacientes"],
      ["editar_pacientes", "Editar datos de pacientes"],
      ["ver_expediente", "Ver expediente clínico"],
      ["agregar_notas_clinicas", "Agregar notas clínicas"],
    ],
  },

  {
    titulo: "Tratamientos",
    permisos: [
      ["crear_tratamientos", "Crear tratamientos"],
      [
        "cambiar_estado_tratamientos",
        "Cambiar estado de tratamientos",
      ],
      [
        "anular_tratamientos",
        "Anular tratamientos",
      ],
    ],
  },

  {
    titulo: "Cobros y gastos",
    permisos: [
      ["registrar_cobros", "Registrar cobros y abonos"],
      ["aplicar_descuentos", "Aplicar descuentos"],
      ["registrar_gastos", "Registrar gastos"],
      ["anular_cobros", "Anular cobros"],
      ["anular_gastos", "Anular gastos"],
    ],
  },

  {
    titulo: "Finanzas",
    permisos: [
      [
        "ver_resumen_financiero",
        "Ver resumen financiero",
      ],
      ["ver_utilidades", "Ver utilidades"],
      ["ver_comisiones", "Ver comisiones"],
    ],
  },

  {
    titulo: "Configuración",
    permisos: [
      [
        "configurar_precios_costos",
        "Configurar precios y costos",
      ],
      [
        "configurar_comisiones",
        "Configurar comisiones",
      ],
      [
        "administrar_usuarios",
        "Administrar usuarios",
      ],
      ["ver_bitacora", "Ver bitácora"],
    ],
  },
] as const;

const traducciones: Record<string, string> = {
  "Agenda": "Schedule",
  "Ver agenda": "View schedule",
  "Crear y editar citas": "Create and edit appointments",
  "Pacientes": "Patients",
  "Registrar nuevos pacientes": "Register new patients",
  "Ver pacientes": "View patients",
  "Editar datos de pacientes": "Edit patient information",
  "Ver expediente clínico": "View clinical records",
  "Agregar notas clínicas": "Add clinical notes",
  "Tratamientos": "Treatments",
  "Crear tratamientos": "Create treatments",
  "Cambiar estado de tratamientos": "Change treatment status",
  "Anular tratamientos": "Void treatments",
  "Cobros y gastos": "Payments and expenses",
  "Registrar cobros y abonos": "Record payments and installments",
  "Aplicar descuentos": "Apply discounts",
  "Registrar gastos": "Record expenses",
  "Anular cobros": "Void payments",
  "Anular gastos": "Void expenses",
  "Finanzas": "Finances",
  "Ver resumen financiero": "View financial summary",
  "Ver utilidades": "View profits",
  "Ver comisiones": "View commissions",
  "Configuración": "Settings",
  "Configurar precios y costos": "Configure prices and costs",
  "Configurar comisiones": "Configure commissions",
  "Administrar usuarios": "Manage users",
  "Ver bitácora": "View audit log",
  "No se pudieron cargar los permisos.": "Could not load permissions.",
  "Ingresa el nombre del usuario.": "Enter the user name.",
  "Selecciona el doctor que corresponde a esta cuenta.": "Select the doctor associated with this account.",
  "No se pudo actualizar el usuario.": "Could not update the user.",
  "El usuario fue actualizado, pero no se pudieron guardar sus permisos.": "The user was updated, but their permissions could not be saved.",
  "Ocurrió un error inesperado.": "An unexpected error occurred.",
  "Administrar usuario": "Manage user",
  "Configura la cuenta y los permisos individuales.": "Configure the account and individual permissions.",
  "Nombre": "Name",
  "Rol": "Role",
  "Administrador": "Administrator",
  "Recepcionista": "Receptionist",
  "Tablet de recepción": "Reception tablet",
  "Registro QR": "QR registration",
  "Doctor vinculado": "Linked doctor",
  "Seleccionar doctor": "Select doctor",
  "Usuario activo": "Active user",
  "Permisos": "Permissions",
  "Selecciona exactamente qué puede hacer este usuario en MintOS.": "Choose exactly what this user can do in MintOS.",
  "Acceso exclusivo de Tablet": "Tablet-only access",
  "Acceso exclusivo de Registro QR": "QR registration-only access",
  "Esta cuenta únicamente puede registrar nuevos pacientes. No tiene acceso a pacientes existentes, expedientes, agenda, finanzas, configuración ni bitácora.": "This account can only register new patients. It cannot access existing patients, clinical records, appointments, finances, settings, or the audit log.",
  "Cargando permisos...": "Loading permissions...",
  "Cancelar": "Cancel",
  "Guardando...": "Saving...",
  "Guardar cambios": "Save changes"
};

export default function AdministrarUsuario({
  perfil,
  doctores,
  onCerrar,
  onGuardado,
}: Props) {

  const { language } = useLanguage();
  const es = language === "es";
  const traducir = (texto: string) => es ? texto : (traducciones[texto] ?? texto);

  const [
    nombre,
    setNombre,
  ] = useState(
    perfil.nombre
  );

  const [
    rol,
    setRol,
  ] = useState<RolUsuario>(
    perfil.rol
  );

  const [
    doctorId,
    setDoctorId,
  ] = useState(
    perfil.doctor_id
      ? String(perfil.doctor_id)
      : ""
  );

  const [
    activo,
    setActivo,
  ] = useState(
    perfil.activo
  );

  const [
    permisos,
    setPermisos,
  ] = useState<Permisos>(
    permisosVacios
  );

  const [
    permisosOriginales,
    setPermisosOriginales,
  ] = useState<Permisos>(
    permisosVacios
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {

    cargarPermisos();

  }, [perfil.id]);

  async function cargarPermisos() {

    setLoading(
      true
    );

    setError(
      ""
    );

    const {
      data,
      error,
    } = await supabase
      .from(
        "permisos_usuarios"
      )
      .select(`
        registrar_pacientes,
        ver_agenda,
        editar_citas,
        ver_pacientes,
        editar_pacientes,
        ver_expediente,
        agregar_notas_clinicas,
        crear_tratamientos,
        cambiar_estado_tratamientos,
        anular_tratamientos,
        registrar_cobros,
        aplicar_descuentos,
        registrar_gastos,
        anular_cobros,
        anular_gastos,
        ver_resumen_financiero,
        ver_utilidades,
        ver_comisiones,
        configurar_precios_costos,
        configurar_comisiones,
        administrar_usuarios,
        ver_bitacora
      `)
      .eq(
        "usuario_id",
        perfil.id
      )
      .maybeSingle();

    if (error) {

      console.error(
        "Error cargando permisos:",
        error
      );

      setError(
        traducir("No se pudieron cargar los permisos.")
      );

      setLoading(
        false
      );

      return;
    }

    if (data) {

      setPermisos(
        data as Permisos
      );

      setPermisosOriginales(
        data as Permisos
      );
    }

    setLoading(
      false
    );
  }

  function cambiarPermiso(
    permiso: keyof Permisos
  ) {

    setPermisos(
      (actuales) => ({
        ...actuales,
        [permiso]:
          !actuales[permiso],
      })
    );
  }

  async function guardar() {

    if (guardando) {
      return;
    }

    const nombreLimpio =
      nombre.trim();

    if (!nombreLimpio) {

      setError(
        traducir("Ingresa el nombre del usuario.")
      );

      return;
    }

    if (
      rol === "doctor" &&
      !doctorId
    ) {

      setError(
        traducir("Selecciona el doctor que corresponde a esta cuenta.")
      );

      return;
    }

    setGuardando(
      true
    );

    setError(
      ""
    );

    try {

      const {
        error: perfilError,
      } = await supabase
        .from(
          "perfiles"
        )
        .update({
          nombre:
            nombreLimpio,

          rol,

          doctor_id:
            rol === "doctor"
              ? Number(doctorId)
              : null,

          activo,
        })
        .eq(
          "id",
          perfil.id
        );

      if (perfilError) {

        console.error(
          "Error actualizando perfil:",
          perfilError
        );

        setError(
          "No se pudo actualizar el usuario."
        );

        return;
      }

      const permisosGuardar: Permisos =
        rol === "tablet" ||
        rol === "registro"
          ? {
              ...permisosVacios,
              registrar_pacientes:
                true,
            }
          : permisos;

      const {
        error: permisosError,
      } = await supabase
        .from(
          "permisos_usuarios"
        )
        .upsert(
          {
            usuario_id:
              perfil.id,

            ...permisosGuardar,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "usuario_id",
          }
        );

      if (permisosError) {

        console.error(
          "Error guardando permisos:",
          permisosError
        );

        setError(
          "El usuario fue actualizado, pero no se pudieron guardar sus permisos."
        );

        return;
      }

      const permisosModificados =
        (
          Object.keys(
            permisosGuardar
          ) as Array<
            keyof Permisos
          >
        )
          .filter(
            (clave) =>
              permisosGuardar[clave] !==
              permisosOriginales[clave]
          )
          .map(
            (clave) =>
              `${clave}: ${permisosOriginales[clave] ? "Sí" : "No"} → ${permisosGuardar[clave] ? "Sí" : "No"}`
          );

      const cambiosPerfil: string[] = [];

      if (
        nombreLimpio !==
        perfil.nombre
      ) {
        cambiosPerfil.push(
          `Nombre: ${perfil.nombre} → ${nombreLimpio}`
        );
      }

      if (
        rol !==
        perfil.rol
      ) {
        cambiosPerfil.push(
          `Rol: ${perfil.rol} → ${rol}`
        );
      }

      const doctorIdOriginal =
        perfil.doctor_id
          ? String(
              perfil.doctor_id
            )
          : "";

      const doctorIdNuevo =
        rol === "doctor"
          ? doctorId
          : "";

      if (
        doctorIdNuevo !==
        doctorIdOriginal
      ) {
        cambiosPerfil.push(
          `Doctor ID: ${doctorIdOriginal || "-"} → ${doctorIdNuevo || "-"}`
        );
      }

      if (
        activo !==
        perfil.activo
      ) {
        cambiosPerfil.push(
          `Estado: ${perfil.activo ? "Activo" : "Inactivo"} → ${activo ? "Activo" : "Inactivo"}`
        );
      }

      const cambios =
        [
          ...cambiosPerfil,
          ...permisosModificados,
        ];

      await registrarBitacora({
        accion: "Administrar usuario",
        modulo: "Usuarios y permisos",
        detalle:
          `Usuario ID: ${perfil.id} | Usuario: ${nombreLimpio} | Cambios: ${cambios.length > 0 ? cambios.join(" | ") : "Sin cambios efectivos"}`,
      });

      await onGuardado();

      onCerrar();

    } catch (error) {

      console.error(
        "Error administrando usuario:",
        error
      );

      setError(
        traducir("Ocurrió un error inesperado.")
      );

    } finally {

      setGuardando(
        false
      );
    }
  }

  return (

    <div
      className="
        mint-modal-backdrop
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-4
      "
    >

      <div
        className="
          mint-modal
          w-full
          max-w-4xl
          max-h-[90vh]
          overflow-y-auto
          overflow-x-hidden
          rounded-[24px]
          border
          border-[var(--mint-border)]
          shadow-[0_28px_80px_rgba(15,42,65,0.30)]
        "
      >

        <div className="relative overflow-hidden bg-[#102f4f] px-6 py-5" style={{ background: "linear-gradient(120deg, #102f4f 0%, #1b4f68 55%, #0b8f80 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,#63c8b2_0%,#d8bd72_100%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#63c8b2]">
                {es ? "CONFIGURACIÓN · ACCESOS" : "SETTINGS · ACCESS"}
              </p>
              <h3 className="text-xl font-bold text-white">{traducir("Administrar usuario")}</h3>
              <p className="mt-1 text-sm text-white/75">
                {traducir("Configura la cuenta y los permisos individuales.")}
              </p>
            </div>
            <button type="button" onClick={onCerrar} disabled={guardando}
              aria-label={es ? "Cerrar" : "Close"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-xl text-white transition hover:bg-white/20 disabled:opacity-50">
              ×
            </button>
          </div>
        </div>

        <div className="p-5">

          {
            error && (

              <div
                className="
                  mb-5
                  p-3
                  rounded-xl
                  bg-[var(--mint-danger-bg)]
                  border
                  border-[var(--mint-danger-border)]
                  text-[var(--mint-danger)]
                  text-sm
                "
              >
                {error}
              </div>

            )
          }

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
              mb-7
            "
          >

            <div>

              <label
                className="
                  mint-label
                  block
                  mb-2
                "
              >
                {traducir("Nombre")}
              </label>

              <input
                type="text"
                value={nombre}
                disabled={guardando}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                className="
                  mint-input
                  w-full
                  p-3
                "
              />

            </div>

            <div>

              <label
                className="
                  mint-label
                  block
                  mb-2
                "
              >
                {traducir("Rol")}
              </label>

              <select
                value={rol}
                disabled={guardando}
                onChange={(e) => {

                  const nuevoRol =
                    e.target.value as RolUsuario;

                  setRol(
                    nuevoRol
                  );

                  if (
                    nuevoRol !==
                    "doctor"
                  ) {

                    setDoctorId(
                      ""
                    );
                  }

                }}
                className="
                  mint-input
                  w-full
                  p-3
                "
              >

                <option value="admin">
                  {traducir("Administrador")}
                </option>

                <option value="doctor">
                  Doctor
                </option>

                <option value="recepcionista">
                  {traducir("Recepcionista")}
                </option>

                <option value="tablet">
                  {traducir("Tablet de recepción")}
                </option>

                <option value="registro">
                  {traducir("Registro QR")}
                </option>

              </select>

            </div>

            {
              rol === "doctor" && (

                <div>

                  <label
                    className="
                      mint-label
                      block
                      mb-2
                    "
                  >
                    {traducir("Doctor vinculado")}
                  </label>

                  <select
                    value={doctorId}
                    disabled={guardando}
                    onChange={(e) =>
                      setDoctorId(
                        e.target.value
                      )
                    }
                    className="
                      mint-input
                      w-full
                      p-3
                    "
                  >

                    <option value="">
                      {traducir("Seleccionar doctor")}
                    </option>

                    {
                      doctores.map(
                        (doctor) => (

                          <option
                            key={doctor.id}
                            value={doctor.id}
                          >
                            {doctor.nombre}
                          </option>

                        )
                      )
                    }

                  </select>

                </div>

              )
            }

            <div
              className="
                flex
                items-end
              "
            >

              <label
                className="
                  flex
                  items-center
                  gap-3
                  border
                  border-[var(--mint-border)]
                  rounded-xl
                  p-3
                  w-full
                  cursor-pointer
                  bg-[var(--mint-bg-soft)]
                  transition
                  hover:border-[var(--mint-border-strong)]
                "
              >

                <input
                  type="checkbox"
                  checked={activo}
                  disabled={guardando}
                  onChange={(e) =>
                    setActivo(
                      e.target.checked
                    )
                  }
                />

                <span
                  className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  "
                >
                  {traducir("Usuario activo")}
                </span>

              </label>

            </div>

          </div>

          <div
            className="
              border-t
              border-[var(--mint-border)]
              pt-6
            "
          >

            <h4
              className="
                text-lg
                font-bold
                mint-text-primary
                mb-1
              "
            >
              {traducir("Permisos")}
            </h4>

            <p
              className="
                text-sm
                mint-text-secondary
                mb-5
              "
            >
              {traducir("Selecciona exactamente qué puede hacer este usuario en MintOS.")}
            </p>

            {
              rol === "tablet" ||
              rol === "registro"

                ? (

                  <div
                    className="
                      mint-card
                      p-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        mint-text-primary
                      "
                    >
                      {rol === "tablet"
                        ? traducir("Acceso exclusivo de Tablet")
                        : traducir("Acceso exclusivo de Registro QR")}
                    </p>

                    <p
                      className="
                        text-sm
                        mint-text-secondary
                        mt-2
                      "
                    >
                      {traducir("Esta cuenta únicamente puede registrar nuevos pacientes. No tiene acceso a pacientes existentes, expedientes, agenda, finanzas, configuración ni bitácora.")}
                    </p>
                  </div>

                )

                : loading

                ? (

                  <p
                    className="
                      text-sm
                      mint-text-secondary
                    "
                  >
                    {traducir("Cargando permisos...")}
                  </p>

                )

                : (

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-4
                    "
                  >

                    {
                      gruposPermisos.map(
                        (grupo) => (

                          <div
                            key={traducir(grupo.titulo)}
                            className="
                              mint-card
                              p-4
                              rounded-2xl
                              border-[var(--mint-border)]
                            "
                          >

                            <h5
                              className="
                                font-bold
                                mint-text-primary
                                mb-3
                              "
                            >
                              {traducir(grupo.titulo)}
                            </h5>

                            <div
                              className="
                                space-y-3
                              "
                            >

                              {
                                grupo.permisos.map(
                                  ([
                                    clave,
                                    etiqueta,
                                  ]) => (

                                    <label
                                      key={clave}
                                      className="
                                        flex
                                        items-center
                                        gap-3
                                        text-sm
                                        mint-text-secondary
                                        cursor-pointer
                                      "
                                    >

                                      <input
                                        type="checkbox"
                                        checked={
                                          permisos[
                                            clave as keyof Permisos
                                          ]
                                        }
                                        disabled={guardando}
                                        onChange={() =>
                                          cambiarPermiso(
                                            clave as keyof Permisos
                                          )
                                        }
                                      />

                                      <span>
                                        {traducir(etiqueta)}
                                      </span>

                                    </label>

                                  )
                                )
                              }

                            </div>

                          </div>

                        )
                      )
                    }

                  </div>

                )
            }

          </div>

        </div>

        <div
          className="
            p-5
            border-t
            border-[var(--mint-border)]
            flex
            justify-end
            gap-3
          "
        >

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="
              mint-btn
              mint-btn-neutral
              disabled:opacity-50
            "
          >
            {traducir("Cancelar")}
          </button>

          <button
            type="button"
            onClick={guardar}
            disabled={
              guardando ||
              loading
            }
            className="
              mint-btn
              mint-btn-primary
              disabled:opacity-50
            "
          >
            {
              guardando
                ? traducir("Guardando...")
                : traducir("Guardar cambios")
            }
          </button>

        </div>

      </div>

    </div>

  );
}