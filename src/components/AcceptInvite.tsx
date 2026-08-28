import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

export default function AcceptInvite() {

  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function continuar() {

    setError("");

    const params =
      new URLSearchParams(
        window.location.search
      );

    const tokenHash =
      params.get(
        "token_hash"
      );

    const type =
      params.get(
        "type"
      );

    if (
      !tokenHash ||
      type !== "invite"
    ) {

      setError(
        "La invitación no es válida o está incompleta."
      );

      return;
    }

    setLoading(
      true
    );

    const {
      error:
        verifyError,
    } = await supabase.auth
      .verifyOtp({
        token_hash:
          tokenHash,
        type:
          "invite",
      });

    if (
      verifyError
    ) {

      console.error(
        "Error verificando invitación:",
        verifyError
      );

      setLoading(
        false
      );

      setError(
        "La invitación no es válida o ha expirado."
      );

      return;
    }

    setLoading(
      false
    );

    navigate(
      "/reset-password",
      {
        replace: true,
      }
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
          text-center
        "
      >

        <h1
          className="
            text-3xl
            font-bold
            text-teal-700
            mb-3
          "
        >

          Bienvenido a MintOS

        </h1>

        <p
          className="
            text-slate-500
            mb-8
          "
        >

          Has sido invitado a crear una cuenta en MintOS.

        </p>

        {
          error && (

            <div
              className="
                bg-red-50
                border
                border-red-200
                text-red-700
                rounded-2xl
                p-4
                mb-5
                text-sm
              "
            >

              {error}

            </div>

          )
        }

        <button
          type="button"
          onClick={
            continuar
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
              ? "Verificando..."
              : "Continuar"
          }

        </button>

      </div>

    </div>

  );

}