import { useState } from "react";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {

  const {
    user,
    recargarPerfil,
  } = useAuth();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function guardarPassword() {

    if (
      !password ||
      !confirmarPassword
    ) {

      alert(
        "Completa ambos campos."
      );

      return;
    }

    if (
      password !==
      confirmarPassword
    ) {

      alert(
        "Las contraseñas no coinciden."
      );

      return;
    }

   if (
  password.length < 10
) {

  alert(
    "La contraseña debe tener al menos 10 caracteres."
  );

  return;
}

    if (
      !user?.id
    ) {

      alert(
        "No se encontró una sesión válida."
      );

      return;
    }

    setLoading(
      true
    );

    try {

      const {
        error: passwordError,
      } = await supabase.auth
        .updateUser({
          password,
        });

      if (
        passwordError
      ) {

        console.error(
          "Error actualizando contraseña:",
          passwordError
        );

        if (
          passwordError.message
            .toLowerCase()
            .includes(
              "different from the old password"
            )
        ) {

          alert(
            "La nueva contraseña debe ser diferente a la contraseña actual."
          );

        } else {

          alert(
            "No se pudo actualizar la contraseña."
          );
        }

        return;
      }

      const {
        error: perfilError,
      } = await supabase.rpc(
        "marcar_password_configurado"
      );

      if (
        perfilError
      ) {

        console.error(
          "Error marcando contraseña como configurada:",
          perfilError
        );

        alert(
          "La contraseña fue actualizada, pero no se pudo completar la configuración del usuario."
        );

        return;
      }

      await recargarPerfil();

      alert(
        "Contraseña actualizada correctamente."
      );

      window.location.href =
        "/dashboard";

    } catch (error) {

      console.error(
        "Error inesperado actualizando contraseña:",
        error
      );

      alert(
        "Ocurrió un error al actualizar la contraseña."
      );

    } finally {

      setLoading(
        false
      );
    }
  }

  return (

    <div
      className="
        min-h-screen
        bg-gray-100
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          p-10
          w-full
          max-w-md
        "
      >

        <h1
          className="
            text-3xl
            font-bold
            text-teal-700
            text-center
            mb-3
          "
        >

          Nueva contraseña

        </h1>

        <p
          className="
            text-slate-500
            text-center
            mb-8
          "
        >

          Ingresa tu nueva contraseña para MintOS.

        </p>

        <div
          className="
            space-y-5
          "
        >

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={
              password
            }
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            autoComplete="new-password"
            className="
              w-full
              border
              rounded-2xl
              p-4
            "
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={
              confirmarPassword
            }
            onChange={(e) =>
              setConfirmarPassword(
                e.target.value
              )
            }
            autoComplete="new-password"
            className="
              w-full
              border
              rounded-2xl
              p-4
            "
          />

          <button
            type="button"
            onClick={
              guardarPassword
            }
            disabled={
              loading
            }
            className="
              w-full
              bg-teal-600
              hover:bg-teal-700
              text-white
              py-4
              rounded-2xl
              font-bold
              disabled:opacity-50
            "
          >

            {
              loading

                ? "Guardando..."

                : "Guardar nueva contraseña"
            }

          </button>

        </div>

      </div>

    </div>
  );
}