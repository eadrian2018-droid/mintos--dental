import { useState } from "react";

import { supabase } from "../lib/supabase";

export default function Login() {

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    recoveryLoading,
    setRecoveryLoading,
  ] = useState(false);

  async function iniciarSesion() {

    if (
      !email.trim() ||
      !password
    ) {

      alert(
        "Ingresa tu correo y contraseña."
      );

      return;

    }

    setLoading(true);

    const {
      error,
    } = await supabase.auth
      .signInWithPassword({

        email:
          email.trim(),

        password,

      });

    setLoading(false);

    if (error) {

      console.error(
        error
      );

      alert(
        "Correo o contraseña incorrectos."
      );

      return;

    }

  }

  async function recuperarContrasena() {

    const correo =
      email.trim();

    if (!correo) {

      alert(
        "Ingresa tu correo para recuperar tu contraseña."
      );

      return;

    }

    setRecoveryLoading(true);

    const {
      error,
    } = await supabase.auth
      .resetPasswordForEmail(
        correo,
        {
         redirectTo:
  `${window.location.origin}/#/reset-password`,
        }
      );

    setRecoveryLoading(false);

    if (error) {

      console.error(
        error
      );

      if (
        error.message
          .toLowerCase()
          .includes(
            "rate limit"
          )
      ) {

        alert(
          "Se han solicitado demasiados correos. Espera unos minutos e inténtalo nuevamente."
        );

        return;

      }

      alert(
        "No se pudo enviar el correo de recuperación."
      );

      return;

    }

    alert(
      "Te enviamos un correo para recuperar tu contraseña."
    );

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
            text-4xl
            font-bold
            text-teal-700
            mb-10
            text-center
          "
        >

          MintOS Dental

        </h1>

        <div
          className="
            space-y-5
          "
        >

          <input
            type="email"
            placeholder="Correo"
            value={
              email
            }
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            autoComplete="email"
            className="
              w-full
              border
              rounded-2xl
              p-4
            "
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={
              password
            }
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            onKeyDown={(e) => {

              if (
                e.key ===
                "Enter"
              ) {

                iniciarSesion();

              }

            }}
            autoComplete="current-password"
            className="
              w-full
              border
              rounded-2xl
              p-4
            "
          />

          <div
            className="
              flex
              justify-end
            "
          >

            <button
              type="button"
              onClick={
                recuperarContrasena
              }
              disabled={
                recoveryLoading
              }
              className="
                text-sm
                text-teal-700
                hover:text-teal-800
                hover:underline
                disabled:opacity-50
              "
            >

              {
                recoveryLoading

                  ? "Enviando..."

                  : "¿Olvidaste tu contraseña?"
              }

            </button>

          </div>

          <button
            type="button"
            onClick={
              iniciarSesion
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

                ? "Ingresando..."

                : "Iniciar Sesión"
            }

          </button>

        </div>

      </div>

    </div>

  );

}