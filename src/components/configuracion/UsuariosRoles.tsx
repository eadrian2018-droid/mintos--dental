import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

import { registrarBitacora } from "../../lib/registrarBitacora";

import AdministrarUsuario from "./AdministrarUsuario";

import { useLanguage } from "../../context/LanguageContext";

type Perfil = {

  id: string;

  nombre: string;

  usuario:
    string | null;

  rol:
    "admin" |
    "doctor" |
    "recepcionista" |
    "tablet" |
    "registro";

  doctor_id:
    number | null;

  activo: boolean;

};

type Doctor = {

  id: number;

  nombre: string;

};

export default function UsuariosRoles() {

  const { language } = useLanguage();

  const es = language === "es";

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

      return es
        ? "Administrador"
        : "Administrator";

    }

    if (
      rol === "doctor"
    ) {

      return "Doctor";

    }

    if (
      rol === "tablet"
    ) {

      return es
        ? "Tablet de recepción"
        : "Reception tablet";

    }

    if (
      rol === "registro"
    ) {

      return es
        ? "Registro QR"
        : "QR registration";

    }

    return es
      ? "Recepcionista"
      : "Receptionist";

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
        es
          ? "Ingresa el nombre del usuario."
          : "Enter the user name."
      );

      return;

    }

    if (!email) {

      setErrorNuevoUsuario(
        es
          ? "Ingresa el correo electrónico."
          : "Enter the email address."
      );

      return;

    }

    if (
      !email.includes("@")
    ) {

      setErrorNuevoUsuario(
        es
          ? "Ingresa un correo electrónico válido."
          : "Enter a valid email address."
      );

      return;

    }

    if (
      rolNuevoUsuario ===
        "doctor" &&
      !doctorIdNuevoUsuario
    ) {

      setErrorNuevoUsuario(
        es
          ? "Selecciona el doctor que corresponde a esta cuenta."
          : "Select the doctor associated with this account."
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
          es
            ? "Tu sesión no es válida. Inicia sesión nuevamente."
            : "Your session is not valid. Please sign in again."
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
          es
            ? "No se pudo crear el usuario."
            : "The user could not be created.";

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

      await registrarBitacora({
        accion: "Crear usuario",
        modulo: "Usuarios y permisos",
        detalle:
          `Usuario: ${nombre} | Correo: ${email} | Rol: ${rolNuevoUsuario} | Doctor ID: ${rolNuevoUsuario === "doctor" ? doctorIdNuevoUsuario : "-"} | Estado: ${activoNuevoUsuario ? "Activo" : "Inactivo"}`,
      });

      await cargarPerfiles();

      setMostrarNuevoUsuario(
        false
      );

      limpiarFormulario();

      setMensajeExito(
        es
          ? "Usuario creado correctamente. Se envió una invitación a su correo para establecer su contraseña."
          : "User created successfully. An invitation was sent by email to set their password."
      );

    } catch (error) {

      console.error(
        "Error creando usuario:",
        error
      );

      setErrorNuevoUsuario(
        es
          ? "Ocurrió un error inesperado al crear el usuario."
          : "An unexpected error occurred while creating the user."
      );

    } finally {

      setCreandoUsuario(
        false
      );

    }

  }

  return (

    <>

      {/* HEADER PREMIUM */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-[rgba(255,255,255,0.12)]
          bg-[linear-gradient(120deg,var(--mint-navy)_0%,var(--mint-navy-soft)_52%,var(--mint-teal)_100%)]
          shadow-[0_18px_42px_rgba(15,42,65,0.16)]
        "
      >

        <div
          className="
            absolute
            left-0
            right-0
            bottom-0
            h-[3px]
            bg-[linear-gradient(90deg,var(--mint-teal-soft)_0%,var(--mint-gold)_100%)]
          "
        />

        <div
          className="
            absolute
            -right-20
            -top-24
            w-72
            h-72
            rounded-full
            bg-white/[0.05]
          "
        />

        <div
          className="
            relative
            px-7
            py-7
            flex
            items-center
            justify-between
            gap-6
            flex-wrap
          "
        >

          <div>

            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.18em]
                font-bold
                text-[var(--mint-teal-soft)]
                mb-2
              "
            >
              {
                es
                  ? "Configuración · Acceso al sistema"
                  : "Settings · System access"
              }
            </p>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-white
              "
            >
              {
                es
                  ? "Usuarios y Roles"
                  : "Users and Roles"
              }
            </h2>

            <p
              className="
                text-sm
                text-white/70
                mt-1.5
                max-w-2xl
              "
            >
              {
                es
                  ? "Administra las cuentas, roles y permisos de acceso a MintOS."
                  : "Manage MintOS user accounts, roles and access permissions."
              }
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
              inline-flex
              items-center
              justify-center
              gap-2
              min-h-[42px]
              px-5
              rounded-xl
              bg-white
              text-[var(--mint-navy)]
              text-sm
              font-bold
              border
              border-white/80
              shadow-[0_8px_20px_rgba(15,42,65,0.14)]
              hover:bg-[var(--mint-surface-teal)]
              transition-colors
            "
          >
            <span
              className="
                text-[var(--mint-teal)]
                text-lg
                leading-none
              "
            >
              +
            </span>

            {
              es
                ? "Nuevo usuario"
                : "New user"
            }
          </button>

        </div>

      </section>


      {/* MENSAJE DE ÉXITO */}

      {

        mensajeExito && (

          <div
            className="
              mt-5
              px-5
              py-4
              rounded-2xl
              border
              border-[var(--mint-success-border)]
              bg-[var(--mint-success-bg)]
              text-sm
              font-medium
              text-[var(--mint-success)]
            "
          >
            {mensajeExito}
          </div>

        )

      }


      {/* USUARIOS */}

      <section
        className="
          mt-6
        "
      >

        <div
          className="
            flex
            items-end
            justify-between
            gap-4
            mb-4
          "
        >

          <div>

            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.14em]
                font-bold
                text-[var(--mint-teal)]
                mb-1
              "
            >
              {
                es
                  ? "Control de acceso"
                  : "Access control"
              }
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {
                es
                  ? "Cuentas de usuario"
                  : "User accounts"
              }
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {
                es
                  ? "Personas y dispositivos autorizados para ingresar al sistema."
                  : "People and devices authorized to access the system."
              }
            </p>

          </div>

          {
            !loading && (

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3.5
                  py-2
                  rounded-full
                  bg-[var(--mint-surface-teal)]
                  border
                  border-[var(--mint-border-teal)]
                "
              >

                <span
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-[var(--mint-teal)]
                  "
                />

                <span
                  className="
                    text-xs
                    font-bold
                    text-[var(--mint-teal)]
                  "
                >
                  {perfiles.length}{" "}
                  {
                    es
                      ? perfiles.length === 1
                        ? "cuenta"
                        : "cuentas"
                      : perfiles.length === 1
                        ? "account"
                        : "accounts"
                  }
                </span>

              </div>

            )
          }

        </div>


        {

          loading

            ? (

              <div
                className="
                  min-h-[170px]
                  rounded-[22px]
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-surface)]
                  flex
                  items-center
                  justify-center
                  shadow-[0_8px_24px_rgba(15,42,65,0.045)]
                "
              >

                <p
                  className="
                    text-sm
                    mint-text-secondary
                  "
                >
                  {
                    es
                      ? "Cargando usuarios..."
                      : "Loading users..."
                  }
                </p>

              </div>

            )

            : perfiles.length === 0

              ? (

                <div
                  className="
                    min-h-[180px]
                    rounded-[22px]
                    border
                    border-[var(--mint-border)]
                    bg-[linear-gradient(135deg,var(--mint-surface)_0%,var(--mint-surface-teal)_100%)]
                    flex
                    flex-col
                    items-center
                    justify-center
                    px-6
                    text-center
                  "
                >

                  <div
                    className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-white
                      border
                      border-[var(--mint-border-teal)]
                      flex
                      items-center
                      justify-center
                      text-[var(--mint-teal)]
                      font-bold
                      shadow-sm
                    "
                  >
                    U
                  </div>

                  <p
                    className="
                      mt-3
                      font-bold
                      mint-text-primary
                    "
                  >
                    {
                      es
                        ? "No hay usuarios registrados"
                        : "No users registered"
                    }
                  </p>

                </div>

              )

              : (

                <div
                  className="
                    grid
                    grid-cols-1
                    xl:grid-cols-2
                    gap-4
                  "
                >

                  {

                    perfiles.map(
                      (
                        perfil
                      ) => (

                        <article
                          key={
                            perfil.id
                          }
                          className="
                            group
                            relative
                            overflow-hidden
                            rounded-[20px]
                            border
                            border-[var(--mint-border)]
                            bg-[var(--mint-surface)]
                            shadow-[0_8px_24px_rgba(15,42,65,0.045)]
                            hover:border-[var(--mint-border-teal)]
                            hover:shadow-[0_12px_30px_rgba(15,42,65,0.075)]
                            transition-all
                          "
                        >

                          <div
                            className="
                              absolute
                              left-0
                              top-0
                              bottom-0
                              w-[3px]
                              bg-[linear-gradient(180deg,var(--mint-teal)_0%,var(--mint-teal-soft)_72%,var(--mint-gold)_100%)]
                              opacity-70
                              group-hover:opacity-100
                              transition-opacity
                            "
                          />

                          <div
                            className="
                              p-5
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-4
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-3.5
                                  min-w-0
                                "
                              >

                                <div
                                  className="
                                    w-12
                                    h-12
                                    shrink-0
                                    rounded-2xl
                                    bg-[var(--mint-surface-teal)]
                                    border
                                    border-[var(--mint-border-teal)]
                                    text-[var(--mint-teal)]
                                    flex
                                    items-center
                                    justify-center
                                    text-base
                                    font-bold
                                  "
                                >
                                  {
                                    perfil.nombre
                                      ?.trim()
                                      .charAt(0)
                                      .toUpperCase() ||
                                    "U"
                                  }
                                </div>

                                <div
                                  className="
                                    min-w-0
                                  "
                                >

                                  <p
                                    className="
                                      text-base
                                      font-bold
                                      mint-text-primary
                                      truncate
                                    "
                                  >
                                    {perfil.nombre}
                                  </p>

                                  {
                                    perfil.usuario && (

                                      <p
                                        className="
                                          text-xs
                                          mint-text-muted
                                          mt-0.5
                                          truncate
                                        "
                                      >
                                        {perfil.usuario}
                                      </p>

                                    )
                                  }

                                </div>

                              </div>

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  shrink-0
                                  px-2.5
                                  py-1
                                  rounded-full
                                  text-[11px]
                                  font-bold
                                  border

                                  ${
                                    perfil.activo

                                      ? "bg-[var(--mint-success-bg)] border-[var(--mint-success-border)] text-[var(--mint-success)]"

                                      : "bg-[var(--mint-surface-soft)] border-[var(--mint-border)] mint-text-muted"
                                  }
                                `}
                              >

                                <span
                                  className={`
                                    w-1.5
                                    h-1.5
                                    rounded-full

                                    ${
                                      perfil.activo
                                        ? "bg-[var(--mint-success)]"
                                        : "bg-[var(--mint-text-muted)]"
                                    }
                                  `}
                                />

                                {
                                  perfil.activo

                                    ? es
                                      ? "Activo"
                                      : "Active"

                                    : es
                                      ? "Inactivo"
                                      : "Inactive"
                                }

                              </span>

                            </div>


                            <div
                              className="
                                mt-5
                                pt-4
                                border-t
                                border-[var(--mint-border-soft)]
                                flex
                                items-center
                                justify-between
                                gap-4
                              "
                            >

                              <div>

                                <p
                                  className="
                                    text-[9px]
                                    uppercase
                                    tracking-[0.1em]
                                    font-bold
                                    mint-text-muted
                                  "
                                >
                                  {
                                    es
                                      ? "Rol de acceso"
                                      : "Access role"
                                  }
                                </p>

                                <p
                                  className="
                                    text-sm
                                    font-semibold
                                    mint-text-primary
                                    mt-1
                                  "
                                >
                                  {
                                    nombreRol(
                                      perfil.rol
                                    )
                                  }
                                </p>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setUsuarioAdministrar(
                                    perfil
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  justify-center
                                  px-4
                                  py-2
                                  rounded-xl
                                  border
                                  border-[var(--mint-border-teal)]
                                  bg-[var(--mint-surface-teal)]
                                  text-[var(--mint-teal)]
                                  text-sm
                                  font-bold
                                  hover:bg-[var(--mint-teal)]
                                  hover:text-white
                                  hover:border-[var(--mint-teal)]
                                  transition-colors
                                "
                              >
                                {
                                  es
                                    ? "Administrar"
                                    : "Manage"
                                }
                              </button>

                            </div>

                          </div>

                        </article>

                      )
                    )

                  }

                </div>

              )

        }

      </section>

            {/* MODAL NUEVO USUARIO */}

      {

        mostrarNuevoUsuario && (

          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-[rgba(15,42,65,0.62)]
              backdrop-blur-[3px]
              p-4
            "
          >

            <div
              className="
                w-full
                max-w-lg
                overflow-hidden
                rounded-[24px]
                border
                border-white/20
                bg-[var(--mint-surface)]
                shadow-[0_28px_80px_rgba(15,42,65,0.30)]
              "
            >

              {/* MODAL HEADER */}

              <div
                className="
                  relative
                  overflow-hidden
                  bg-[linear-gradient(120deg,var(--mint-navy)_0%,var(--mint-navy-soft)_55%,var(--mint-teal)_100%)]
                  px-6
                  py-5
                "
              >

                <div
                  className="
                    absolute
                    left-0
                    right-0
                    bottom-0
                    h-[3px]
                    bg-[linear-gradient(90deg,var(--mint-teal-soft)_0%,var(--mint-gold)_100%)]
                  "
                />

                <div
                  className="
                    absolute
                    -right-10
                    -top-16
                    w-40
                    h-40
                    rounded-full
                    bg-white/[0.05]
                  "
                />

                <div
                  className="
                    relative
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.16em]
                        font-bold
                        text-[var(--mint-teal-soft)]
                        mb-1
                      "
                    >
                      {
                        es
                          ? "Acceso a MintOS"
                          : "MintOS access"
                      }
                    </p>

                    <h3
                      className="
                        text-xl
                        font-bold
                        text-white
                      "
                    >
                      {
                        es
                          ? "Nuevo usuario"
                          : "New user"
                      }
                    </h3>

                    <p
                      className="
                        text-sm
                        text-white/65
                        mt-1
                      "
                    >
                      {
                        es
                          ? "Crea una cuenta y define su nivel de acceso."
                          : "Create an account and define its access level."
                      }
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      cerrarModal
                    }
                    disabled={
                      creandoUsuario
                    }
                    className="
                      w-9
                      h-9
                      shrink-0
                      rounded-xl
                      border
                      border-white/20
                      bg-white/10
                      text-white
                      text-xl
                      leading-none
                      hover:bg-white/20
                      transition-colors
                      disabled:opacity-50
                    "
                    aria-label={
                      es
                        ? "Cerrar"
                        : "Close"
                    }
                  >
                    ×
                  </button>

                </div>

              </div>


              {/* MODAL BODY */}

              <div
                className="
                  px-6
                  py-6
                "
              >

                {

                  errorNuevoUsuario && (

                    <div
                      className="
                        mb-5
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-[var(--mint-danger-border)]
                        bg-[var(--mint-danger-bg)]
                        text-[var(--mint-danger)]
                        text-sm
                        font-medium
                      "
                    >
                      {errorNuevoUsuario}
                    </div>

                  )

                }


                <div
                  className="
                    space-y-5
                  "
                >

                  {/* NOMBRE */}

                  <div>

                    <label
                      className="
                        block
                        text-xs
                        font-bold
                        mint-text-primary
                        mb-2
                      "
                    >
                      {
                        es
                          ? "Nombre completo"
                          : "Full name"
                      }
                    </label>

                    <input
                      type="text"
                      placeholder={
                        es
                          ? "Nombre del usuario"
                          : "User name"
                      }
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

                  </div>


                  {/* CORREO */}

                  <div>

                    <label
                      className="
                        block
                        text-xs
                        font-bold
                        mint-text-primary
                        mb-2
                      "
                    >
                      {
                        es
                          ? "Correo electrónico"
                          : "Email address"
                      }
                    </label>

                    <input
                      type="email"
                      placeholder={
                        es
                          ? "correo@ejemplo.com"
                          : "email@example.com"
                      }
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

                  </div>


                  {/* ROL / DOCTOR */}

                  <div
                    className={`
                      grid
                      grid-cols-1
                      gap-4

                      ${
                        rolNuevoUsuario ===
                          "doctor"
                          ? "sm:grid-cols-2"
                          : ""
                      }
                    `}
                  >

                    <div>

                      <label
                        className="
                          block
                          text-xs
                          font-bold
                          mint-text-primary
                          mb-2
                        "
                      >
                        {
                          es
                            ? "Rol de acceso"
                            : "Access role"
                        }
                      </label>

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
                          {
                            es
                              ? "Administrador"
                              : "Administrator"
                          }
                        </option>

                        <option value="doctor">
                          Doctor
                        </option>

                        <option value="recepcionista">
                          {
                            es
                              ? "Recepcionista"
                              : "Receptionist"
                          }
                        </option>

                        <option value="tablet">
                          {
                            es
                              ? "Tablet de recepción"
                              : "Reception tablet"
                          }
                        </option>

                        <option value="registro">
                          {
                            es
                              ? "Registro QR"
                              : "QR registration"
                          }
                        </option>

                      </select>

                    </div>


                    {

                      rolNuevoUsuario ===
                        "doctor"

                      &&

                      <div>

                        <label
                          className="
                            block
                            text-xs
                            font-bold
                            mint-text-primary
                            mb-2
                          "
                        >
                          {
                            es
                              ? "Doctor vinculado"
                              : "Linked doctor"
                          }
                        </label>

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
                            {
                              es
                                ? "Seleccionar doctor"
                                : "Select doctor"
                            }
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

                      </div>

                    }

                  </div>


                  {/* ESTADO */}

                  <label
                    className="
                      flex
                      items-center
                      justify-between
                      gap-5
                      rounded-2xl
                      border
                      border-[var(--mint-border-teal)]
                      bg-[var(--mint-surface-teal)]
                      px-4
                      py-4
                      cursor-pointer
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          font-bold
                          mint-text-primary
                        "
                      >
                        {
                          es
                            ? "Usuario activo"
                            : "Active user"
                        }
                      </p>

                      <p
                        className="
                          text-xs
                          mint-text-secondary
                          mt-0.5
                        "
                      >
                        {
                          es
                            ? "La cuenta podrá iniciar sesión en MintOS."
                            : "The account will be able to sign in to MintOS."
                        }
                      </p>

                    </div>

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
                      className="
                        w-4
                        h-4
                        shrink-0
                        accent-[var(--mint-teal)]
                      "
                    />

                  </label>

                </div>

              </div>


              {/* MODAL FOOTER */}

              <div
                className="
                  flex
                  items-center
                  justify-end
                  gap-3
                  px-6
                  py-4
                  border-t
                  border-[var(--mint-border)]
                  bg-[var(--mint-surface-soft)]
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
                  {
                    es
                      ? "Cancelar"
                      : "Cancel"
                  }
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
                    px-5
                    py-2
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {

                    creandoUsuario

                      ? es
                        ? "Creando..."
                        : "Creating..."

                      : es
                        ? "Crear usuario"
                        : "Create user"

                  }

                </button>

              </div>

            </div>

          </div>

        )

      }


      {/* ADMINISTRAR USUARIO */}

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