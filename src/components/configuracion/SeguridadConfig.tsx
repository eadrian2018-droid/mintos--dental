import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { supabase }
  from "../../lib/supabase";

type DatosSesion = {
  email: string;
  expiracion: string;
};

export default function SeguridadConfig() {

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    cerrandoSesiones,
    setCerrandoSesiones,
  ] = useState(false);

  const [
    guardandoPassword,
    setGuardandoPassword,
  ] = useState(false);

  const [
    datosSesion,
    setDatosSesion,
  ] = useState<DatosSesion>({
    email: "",
    expiracion: "",
  });

  const [
    nuevaPassword,
    setNuevaPassword,
  ] = useState("");

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState("");

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false);

  const [
    mostrarConfirmacion,
    setMostrarConfirmacion,
  ] = useState(false);

  useEffect(() => {

    cargarSesion();

  }, []);

  async function cargarSesion() {

    setCargando(true);

    const {
      data,
      error,
    } = await supabase.auth
      .getSession();

    if (error) {

      console.error(
        "Error cargando sesión:",
        error
      );

      setCargando(false);

      return;

    }

    const session =
      data.session;

    if (!session) {

      setCargando(false);

      return;

    }

    let expiracion = "";

    if (
      session.expires_at
    ) {

      expiracion =
        new Date(
          session.expires_at * 1000
        ).toLocaleString(
          "es-MX",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        );

    }

    setDatosSesion({
      email:
        session.user.email || "",
      expiracion,
    });

    setCargando(false);

  }

  async function cerrarOtrasSesiones() {

    const confirmar =
      window.confirm(
        "¿Quieres cerrar las sesiones abiertas en otros dispositivos?"
      );

    if (!confirmar) {

      return;

    }

    setCerrandoSesiones(
      true
    );

    const {
      error,
    } = await supabase.auth
      .signOut({
        scope: "others",
      });

    setCerrandoSesiones(
      false
    );

    if (error) {

      console.error(
        "Error cerrando otras sesiones:",
        error
      );

      alert(
        "No se pudieron cerrar las otras sesiones."
      );

      return;

    }

    alert(
      "Las demás sesiones fueron cerradas correctamente."
    );

  }

  async function cambiarPassword() {

    const password =
      nuevaPassword.trim();

    const confirmacion =
      confirmarPassword.trim();

    if (
      password.length < 8
    ) {

      alert(
        "La contraseña debe tener al menos 8 caracteres."
      );

      return;

    }

    if (
      password !== confirmacion
    ) {

      alert(
        "Las contraseñas no coinciden."
      );

      return;

    }

    const confirmar =
      window.confirm(
        "¿Quieres cambiar la contraseña de tu cuenta?"
      );

    if (!confirmar) {

      return;

    }

    setGuardandoPassword(
      true
    );

    const {
      error,
    } = await supabase.auth
      .updateUser({
        password,
      });

    setGuardandoPassword(
      false
    );

    if (error) {

      console.error(
        "Error cambiando contraseña:",
        error
      );

      alert(
        "No se pudo cambiar la contraseña."
      );

      return;

    }

    setNuevaPassword("");
    setConfirmarPassword("");

    alert(
      "Contraseña actualizada correctamente."
    );

  }

  if (cargando) {

    return (

      <div
        className="
          mint-card
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            mint-text-secondary
          "
        >

          <Loader2
            size={17}
            className="animate-spin"
          />

          Cargando seguridad...

        </div>

      </div>

    );

  }

  return (

    <div
      className="
        space-y-5
      "
    >

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
            p-6
            border-b
            border-[var(--mint-border)]
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-[var(--mint-primary-soft)]
              text-[var(--mint-primary)]
              border
              border-[var(--mint-border-primary)]
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >

            <ShieldCheck
              size={23}
            />

          </div>

          <div>

            <h1
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Seguridad
            </h1>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Administra la seguridad
              y las sesiones de tu cuenta.
            </p>

          </div>

        </div>

        <div
          className="
            p-6
            space-y-5
          "
        >

          <div
            className="
              mint-card
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
                  items-start
                  gap-3
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-[var(--mint-bg-muted)]
                    mint-text-secondary
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  "
                >

                  <Laptop
                    size={20}
                  />

                </div>

                <div>

                  <h2
                    className="
                      font-bold
                      mint-text-primary
                    "
                  >
                    Sesión actual
                  </h2>

                  <p
                    className="
                      text-sm
                      mint-text-secondary
                      mt-1
                    "
                  >
                    {datosSesion.email}
                  </p>

                  {
                    datosSesion.expiracion && (

                      <p
                        className="
                          text-xs
                          mint-text-muted
                          mt-2
                        "
                      >
                        Expiración de sesión:{" "}
                        {
                          datosSesion.expiracion
                        }
                      </p>

                    )
                  }

                </div>

              </div>

              <div
                className="
                  mint-badge
                  mint-badge-success
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                "
              >

                <CheckCircle2
                  size={14}
                />

                Activa

              </div>

            </div>

          </div>

          <div
            className="
              mint-card
              p-5
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-[var(--mint-warning-bg)]
                    text-[var(--mint-warning)]
                    border
                    border-[var(--mint-warning-border)]
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  "
                >

                  <KeyRound
                    size={20}
                  />

                </div>

                <div>

                  <h2
                    className="
                      font-bold
                      mint-text-primary
                    "
                  >
                    Otras sesiones
                  </h2>

                  <p
                    className="
                      text-sm
                      mint-text-secondary
                      mt-1
                      max-w-xl
                    "
                  >
                    Si tu cuenta quedó abierta
                    en otra computadora o
                    dispositivo, puedes cerrar
                    esas sesiones desde aquí.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  cerrarOtrasSesiones
                }
                disabled={
                  cerrandoSesiones
                }
                className="
                  mint-btn
                  mint-btn-neutral
                  flex-shrink-0
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  text-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {
                  cerrandoSesiones && (

                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                  )
                }

                {
                  cerrandoSesiones
                    ? "Cerrando..."
                    : "Cerrar otras sesiones"
                }

              </button>

            </div>

          </div>

          <div
            className="
              mint-card
              p-5
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
                mb-5
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-[var(--mint-primary-soft)]
                  text-[var(--mint-primary)]
                  border
                  border-[var(--mint-border-primary)]
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                "
              >

                <LockKeyhole
                  size={20}
                />

              </div>

              <div>

                <h2
                  className="
                    font-bold
                    mint-text-primary
                  "
                >
                  Cambiar contraseña
                </h2>

                <p
                  className="
                    text-sm
                    mint-text-secondary
                    mt-1
                  "
                >
                  Actualiza la contraseña
                  de tu cuenta de MintOS.
                </p>

              </div>

            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
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
                  Nueva contraseña
                </label>

                <div
                  className="
                    relative
                  "
                >

                  <input
                    type={
                      mostrarPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      nuevaPassword
                    }
                    onChange={(e) =>
                      setNuevaPassword(
                        e.target.value
                      )
                    }
                    placeholder="Mínimo 8 caracteres"
                    className="
                      mint-input
                      w-full
                      px-3
                      pr-11
                      py-2.5
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarPassword(
                        !mostrarPassword
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      mint-text-muted
                      hover:text-[var(--mint-text-primary)]
                      transition-colors
                    "
                  >

                    {
                      mostrarPassword
                        ? (
                          <EyeOff
                            size={17}
                          />
                        )
                        : (
                          <Eye
                            size={17}
                          />
                        )
                    }

                  </button>

                </div>

              </div>

              <div>

                <label
                  className="
                    mint-label
                    block
                    mb-2
                  "
                >
                  Confirmar contraseña
                </label>

                <div
                  className="
                    relative
                  "
                >

                  <input
                    type={
                      mostrarConfirmacion
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmarPassword
                    }
                    onChange={(e) =>
                      setConfirmarPassword(
                        e.target.value
                      )
                    }
                    placeholder="Repite la contraseña"
                    className="
                      mint-input
                      w-full
                      px-3
                      pr-11
                      py-2.5
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarConfirmacion(
                        !mostrarConfirmacion
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      mint-text-muted
                      hover:text-[var(--mint-text-primary)]
                      transition-colors
                    "
                  >

                    {
                      mostrarConfirmacion
                        ? (
                          <EyeOff
                            size={17}
                          />
                        )
                        : (
                          <Eye
                            size={17}
                          />
                        )
                    }

                  </button>

                </div>

              </div>

            </div>

            <div
              className="
                flex
                justify-end
                mt-5
              "
            >

              <button
                type="button"
                onClick={
                  cambiarPassword
                }
                disabled={
                  guardandoPassword
                }
                className="
                  mint-btn
                  mint-btn-primary
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  text-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {
                  guardandoPassword && (

                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                  )
                }

                {
                  guardandoPassword
                    ? "Actualizando..."
                    : "Cambiar contraseña"
                }

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}