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
      password.length < 8
    ) {

      alert(
        "La contraseña debe tener al menos 8 caracteres."
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

    const {
      error:
        passwordError,
    } = await supabase.auth
      .updateUser({

        password,

      });

    if (
      passwordError
    ) {

      setLoading(
        false
      );

      console.error(
        passwordError
      );

      alert(
        "No se pudo actualizar la contraseña."
      );

      return;

    }

    const {
      error:
        perfilError,
    } = await supabase

      .from(
        "perfiles"
      )

      .update({

        password_configurado:
          true,

      })

      .eq(
        "id",
        user.id
      );

    if (
      perfilError
    ) {

      setLoading(
        false
      );

      console.error(
        perfilError
      );

      alert(
        "La contraseña fue actualizada, pero no se pudo actualizar el perfil."
      );

      return;

    }

    await recargarPerfil();

    setLoading(
      false
    );

    alert(
      "Contraseña actualizada correctamente."
    );

    window.location.hash =
      "#/dashboard";

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