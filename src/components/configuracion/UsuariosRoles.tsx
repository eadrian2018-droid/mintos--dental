import {

  useEffect,

  useState,

} from "react";

import { supabase } from "../../lib/supabase";

import AdministrarUsuario from "./AdministrarUsuario";

type Perfil = {

  id: string;

  nombre: string;

  usuario:
    string | null;

  rol:
    "admin" |
    "doctor" |
    "recepcionista";

  doctor_id:
    number | null;

  activo: boolean;

};

type Doctor = {

  id: number;

  nombre: string;

};

export default function UsuariosRoles() {

  const [

    perfiles,

    setPerfiles,

  ] = useState<Perfil[]>([]);

  const [

    loading,

    setLoading,

  ] = useState(true);

  const [

    mostrarNuevoUsuario,

    setMostrarNuevoUsuario,

  ] = useState(false);

  const [

    nombreNuevoUsuario,

    setNombreNuevoUsuario,

  ] = useState("");

  const [

    correoNuevoUsuario,

    setCorreoNuevoUsuario,

  ] = useState("");

  const [

    rolNuevoUsuario,

    setRolNuevoUsuario,

  ] = useState<
    Perfil["rol"]
  >(
    "recepcionista"
  );

  const [

    doctorIdNuevoUsuario,

    setDoctorIdNuevoUsuario,

  ] = useState("");

  const [

    activoNuevoUsuario,

    setActivoNuevoUsuario,

  ] = useState(true);

  const [

    doctores,

    setDoctores,

  ] = useState<Doctor[]>([]);

  const [

    creandoUsuario,

    setCreandoUsuario,

  ] = useState(false);

  const [

    errorNuevoUsuario,

    setErrorNuevoUsuario,

  ] = useState("");

  const [

    mensajeExito,

    setMensajeExito,

  ] = useState("");

  useEffect(() => {

    cargarPerfiles();

    cargarDoctores();

  }, []);

  const [
    usuarioAdministrar,
    setUsuarioAdministrar,
  ] = useState<Perfil | null>(
    null
  );

  async function cargarPerfiles() {

    setLoading(
      true
    );

    const {

      data,

      error,

    } = await supabase

      .from(
        "perfiles"
      )

      .select(
        `
          id,
          nombre,
          usuario,
          rol,
          doctor_id,
          activo
        `
      )

      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (error) {

      console.error(
        "Error cargando usuarios:",
        error
      );

      setLoading(
        false
      );

      return;

    }

    setPerfiles(
      (data ?? []) as Perfil[]
    );

    setLoading(
      false
    );

  }

  async function cargarDoctores() {

    const {

      data,

      error,

    } = await supabase

      .from(
        "doctores"
      )

      .select(
        "id, nombre"
      )

      .eq(
        "activo",
        true
      )

      .order(
        "nombre",
        {
          ascending: true,
        }
      );

    if (error) {

      console.error(
        "Error cargando doctores:",
        error
      );

      return;

    }

    setDoctores(
      (data ?? []) as Doctor[]
    );

  }

  function nombreRol(
    rol: Perfil["rol"]
  ) {

    if (
      rol === "admin"
    ) {

      return "Administrador";

    }

    if (
      rol === "doctor"
    ) {

      return "Doctor";

    }

    return "Recepcionista";

  }

  function limpiarFormulario() {

    setNombreNuevoUsuario(
      ""
    );

    setCorreoNuevoUsuario(
      ""
    );

    setRolNuevoUsuario(
      "recepcionista"
    );

    setDoctorIdNuevoUsuario(
      ""
    );

    setActivoNuevoUsuario(
      true
    );

    setErrorNuevoUsuario(
      ""
    );

  }

  function cerrarModal() {

    if (
      creandoUsuario
    ) {

      return;

    }

    setMostrarNuevoUsuario(
      false
    );

    limpiarFormulario();

  }

  async function crearUsuario() {

    if (
      creandoUsuario
    ) {

      return;

    }

    setErrorNuevoUsuario(
      ""
    );

    setMensajeExito(
      ""
    );

    const nombre =
      nombreNuevoUsuario.trim();

    const email =
      correoNuevoUsuario
        .trim()
        .toLowerCase();

    if (!nombre) {

      setErrorNuevoUsuario(
        "Ingresa el nombre del usuario."
      );

      return;

    }

    if (!email) {

      setErrorNuevoUsuario(
        "Ingresa el correo electrónico."
      );

      return;

    }

    if (
      !email.includes("@")
    ) {

      setErrorNuevoUsuario(
        "Ingresa un correo electrónico válido."
      );

      return;

    }

    if (
      rolNuevoUsuario ===
        "doctor" &&
      !doctorIdNuevoUsuario
    ) {

      setErrorNuevoUsuario(
        "Selecciona el doctor que corresponde a esta cuenta."
      );

      return;

    }

    setCreandoUsuario(
      true
    );

    try {

      const {

        data: sessionData,

        error: sessionError,

      } = await supabase.auth
        .getSession();

      if (
        sessionError ||
        !sessionData.session
      ) {

        setErrorNuevoUsuario(
          "Tu sesión no es válida. Inicia sesión nuevamente."
        );

        return;

      }

      const {

        data,

        error,

      } = await supabase.functions
        .invoke(
          "crear-usuario",
          {
            body: {

              nombre,

              email,

              rol:
                rolNuevoUsuario,

              doctor_id:
                rolNuevoUsuario ===
                  "doctor"

                  ? Number(
                      doctorIdNuevoUsuario
                    )

                  : null,

              activo:
                activoNuevoUsuario,

            },

            headers: {

              Authorization:
                `Bearer ${sessionData.session.access_token}`,

            },

          }
        );

      if (error) {

        console.error(
          "Error llamando crear-usuario:",
          error
        );

        let mensaje =
          "No se pudo crear el usuario.";

        if (
          data &&
          typeof data === "object" &&
          "error" in data
        ) {

          mensaje =
            String(
              data.error
            );

        }

        setErrorNuevoUsuario(
          mensaje
        );

        return;

      }

      if (
        data?.error
      ) {

        setErrorNuevoUsuario(
          data.error
        );

        return;

      }

      await cargarPerfiles();

      setMostrarNuevoUsuario(
        false
      );

      limpiarFormulario();

      setMensajeExito(
        "Usuario creado correctamente. Se envió una invitación a su correo para establecer su contraseña."
      );

    } catch (error) {

      console.error(
        "Error creando usuario:",
        error
      );

      setErrorNuevoUsuario(
        "Ocurrió un error inesperado al crear el usuario."
      );

    } finally {

      setCreandoUsuario(
        false
      );

    }

  }

  return (

    <>

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            p-5
            border-b
            border-[var(--mint-border)]
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-bold
                mint-text-primary
              "
            >

              Usuarios y Roles

            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >

              Administra las cuentas y permisos de acceso a MintOS.

            </p>

          </div>

          <button
            type="button"
            onClick={() => {

              setMensajeExito(
                ""
              );

              setErrorNuevoUsuario(
                ""
              );

              setMostrarNuevoUsuario(
                true
              );

            }}
            className="
              mint-btn
              mint-btn-primary
              px-4
              py-2
              text-sm
            "
          >

            + Nuevo usuario

          </button>

        </div>

        {

          mensajeExito && (

            <div
              className="
                mx-5
                mt-4
                p-3
                mint-card-success
                text-sm
                font-medium
              "
            >

              {mensajeExito}

            </div>

          )

        }

        {

          loading

            ? (

              <div
                className="
                  p-6
                  text-sm
                  mint-text-secondary
                "
              >

                Cargando usuarios...

              </div>

            )

            : (

              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                    text-left
                  "
                >

                  <thead
                    className="
                      bg-[var(--mint-bg-soft)]
                      mint-text-secondary
                    "
                  >

                    <tr>

                      <th className="p-3">
                        Nombre
                      </th>

                      <th className="p-3">
                        Rol
                      </th>

                      <th className="p-3">
                        Estado
                      </th>

                      <th className="p-3">
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {

                      perfiles.map(
                        (
                          perfil
                        ) => (

                          <tr
                            key={
                              perfil.id
                            }
                            className="
                              border-t
                              border-[var(--mint-border)]
                              hover:bg-[var(--mint-bg-soft)]
                              transition-colors
                            "
                          >

                            <td
                              className="
                                p-3
                                font-semibold
                                mint-text-primary
                              "
                            >

                              {
                                perfil.nombre
                              }

                            </td>

                            <td
                              className="
                                p-3
                                mint-text-secondary
                              "
                            >

                              {
                                nombreRol(
                                  perfil.rol
                                )
                              }

                            </td>

                            <td className="p-3">

                              <span
                                className={`
                                  mint-badge

                                  ${
                                    perfil.activo

                                      ? "mint-badge-success"

                                      : "mint-badge-muted"
                                  }
                                `}
                              >

                                {
                                  perfil.activo

                                    ? "Activo"

                                    : "Inactivo"
                                }

                              </span>

                            </td>

                            <td className="p-3">

                              <button
                                type="button"
                                onClick={() =>
                                  setUsuarioAdministrar(
                                    perfil
                                  )
                                }
                                className="
                                  mint-btn
                                  mint-btn-action-soft
                                  px-3
                                  py-2
                                  text-sm
                                "
                              >
                                Administrar
                              </button>

                            </td>

                          </tr>

                        )
                      )

                    }

                  </tbody>

                </table>

              </div>

            )

        }

      </div>

            {

        mostrarNuevoUsuario && (

          <div
            className="
              fixed
              inset-0
              bg-black/50
              flex
              items-center
              justify-center
              z-50
              p-4
            "
          >

            <div
              className="
                mint-card
                w-full
                max-w-lg
                p-5
              "
            >

              <h3
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                  mb-5
                "
              >

                Nuevo usuario

              </h3>

              <div
                className="
                  grid
                  gap-4
                "
              >

                {

                  errorNuevoUsuario && (

                    <div
                      className="
                        p-3
                        mint-card-danger
                        text-sm
                      "
                    >

                      {errorNuevoUsuario}

                    </div>

                  )

                }

                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={
                    nombreNuevoUsuario
                  }
                  disabled={
                    creandoUsuario
                  }
                  onChange={(e) =>
                    setNombreNuevoUsuario(
                      e.target.value
                    )
                  }
                  className="
                    mint-input
                    w-full
                    p-3
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                />

                <input
                  type="email"
                  placeholder="Correo"
                  value={
                    correoNuevoUsuario
                  }
                  disabled={
                    creandoUsuario
                  }
                  onChange={(e) =>
                    setCorreoNuevoUsuario(
                      e.target.value
                    )
                  }
                  className="
                    mint-input
                    w-full
                    p-3
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                />

                <select
                  value={
                    rolNuevoUsuario
                  }
                  disabled={
                    creandoUsuario
                  }
                  onChange={(e) => {

                    const nuevoRol =
                      e.target.value as Perfil["rol"];

                    setRolNuevoUsuario(
                      nuevoRol
                    );

                    if (
                      nuevoRol !==
                        "doctor"
                    ) {

                      setDoctorIdNuevoUsuario(
                        ""
                      );

                    }

                  }}
                  className="
                    mint-input
                    w-full
                    p-3
                    disabled:opacity-60
                    disabled:cursor-not-allowed
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

                {

                  rolNuevoUsuario ===
                    "doctor"

                  &&

                  <select
                    value={
                      doctorIdNuevoUsuario
                    }
                    disabled={
                      creandoUsuario
                    }
                    onChange={(e) =>
                      setDoctorIdNuevoUsuario(
                        e.target.value
                      )
                    }
                    className="
                      mint-input
                      w-full
                      p-3
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                  >

                    <option value="">
                      Vincular doctor
                    </option>

                    {

                      doctores.map(
                        (
                          doctor
                        ) => (

                          <option
                            key={
                              doctor.id
                            }
                            value={
                              doctor.id
                            }
                          >

                            {
                              doctor.nombre
                            }

                          </option>

                        )
                      )

                    }

                  </select>

                }

                <label
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    mint-text-secondary
                  "
                >

                  <input
                    type="checkbox"
                    checked={
                      activoNuevoUsuario
                    }
                    disabled={
                      creandoUsuario
                    }
                    onChange={(e) =>
                      setActivoNuevoUsuario(
                        e.target.checked
                      )
                    }
                  />

                  Usuario activo

                </label>

              </div>

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  mt-6
                "
              >

                <button
                  type="button"
                  onClick={
                    cerrarModal
                  }
                  disabled={
                    creandoUsuario
                  }
                  className="
                    mint-btn
                    mint-btn-neutral
                    px-4
                    py-2
                    disabled:opacity-50
                  "
                >

                  Cancelar

                </button>

                <button
                  type="button"
                  onClick={
                    crearUsuario
                  }
                  disabled={
                    creandoUsuario
                  }
                  className="
                    mint-btn
                    mint-btn-primary
                    px-4
                    py-2
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {

                    creandoUsuario

                      ? "Creando..."

                      : "Crear usuario"

                  }

                </button>

              </div>

            </div>

          </div>

        )

      }

      {

        usuarioAdministrar && (

          <AdministrarUsuario
            perfil={
              usuarioAdministrar
            }
            doctores={
              doctores
            }
            onCerrar={() =>
              setUsuarioAdministrar(
                null
              )
            }
            onGuardado={
              cargarPerfiles
            }
          />

        )

      }

    </>

  );

}