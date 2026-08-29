import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

type RolUsuario =
  | "admin"
  | "doctor"
  | "recepcionista";

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

export default function AdministrarUsuario({
  perfil,
  doctores,
  onCerrar,
  onGuardado,
}: Props) {

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
        "No se pudieron cargar los permisos."
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
        "Ingresa el nombre del usuario."
      );

      return;
    }

    if (
      rol === "doctor" &&
      !doctorId
    ) {

      setError(
        "Selecciona el doctor que corresponde a esta cuenta."
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

            ...permisos,

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

      await onGuardado();

      onCerrar();

    } catch (error) {

      console.error(
        "Error administrando usuario:",
        error
      );

      setError(
        "Ocurrió un error inesperado."
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
        "
      >

        <div
          className="
            p-5
            border-b
            border-[var(--mint-border)]
          "
        >

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            Administrar usuario
          </h3>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >
            Configura la cuenta y los permisos individuales.
          </p>

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
                Nombre
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
                Rol
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
                  Administrador
                </option>

                <option value="doctor">
                  Doctor
                </option>

                <option value="recepcionista">
                  Recepcionista
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
                    Doctor vinculado
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
                      Seleccionar doctor
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
                  Usuario activo
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
              Permisos
            </h4>

            <p
              className="
                text-sm
                mint-text-secondary
                mb-5
              "
            >
              Selecciona exactamente qué puede hacer este usuario en MintOS.
            </p>

            {
              loading

                ? (

                  <p
                    className="
                      text-sm
                      mint-text-secondary
                    "
                  >
                    Cargando permisos...
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
                            key={grupo.titulo}
                            className="
                              mint-card
                              p-4
                            "
                          >

                            <h5
                              className="
                                font-bold
                                mint-text-primary
                                mb-3
                              "
                            >
                              {grupo.titulo}
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
                                        {etiqueta}
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
            Cancelar
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
                ? "Guardando..."
                : "Guardar cambios"
            }
          </button>

        </div>

      </div>

    </div>

  );
}