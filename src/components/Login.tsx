import { useState } from "react";

import { supabase } from "../lib/supabase";

export default function Login() {

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  async function iniciarSesion() {

    setLoading(true);

    const { error } =

      await supabase.auth.signInWithPassword({

        email,

        password,

      });

    setLoading(false);

    if (error) {

      alert(
        "Credenciales incorrectas"
      );

      return;

    }

    window.location.reload();

  }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      flex
      items-center
      justify-center
      p-6
    ">

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-10
        w-full
        max-w-md
      ">

        <h1 className="
          text-4xl
          font-bold
          text-teal-700
          mb-10
          text-center
        ">
          MintOS Dental
        </h1>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e)=>
              setEmail(
                e.target.value
              )
            }
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
            value={password}
            onChange={(e)=>
              setPassword(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded-2xl
              p-4
            "
          />

          <button
            onClick={
              iniciarSesion
            }
            disabled={loading}
            className="
              w-full
              bg-teal-600
              hover:bg-teal-700
              text-white
              py-4
              rounded-2xl
              font-bold
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