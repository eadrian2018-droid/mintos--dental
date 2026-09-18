import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

type AdminMFAProps = {
  onVerified: () => void;
};

export default function AdminMFA({
  onVerified,
}: AdminMFAProps) {

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  const [
    factorId,
    setFactorId,
  ] = useState("");

  const [
    qrCode,
    setQrCode,
  ] = useState("");

  const [
    secret,
    setSecret,
  ] = useState("");

  const [
    code,
    setCode,
  ] = useState("");

  const [
    modo,
    setModo,
  ] = useState<
    "setup" | "enroll" | "verify"
  >("setup");

  const [
    preparing,
    setPreparing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {

    let mounted = true;

    async function prepararMFA() {

      try {

        setLoading(true);
        setErrorMessage("");

        const {
          data: aalData,
          error: aalError,
        } =
          await supabase.auth.mfa
            .getAuthenticatorAssuranceLevel();

        if (aalError) {
          throw aalError;
        }

        if (
          aalData.currentLevel === "aal2"
        ) {

          if (mounted) {
            onVerified();
          }

          return;
        }

        if (
          aalData.currentLevel === "aal1" &&
          aalData.nextLevel === "aal2"
        ) {

          const {
            data: factorsData,
            error: factorsError,
          } =
            await supabase.auth.mfa
              .listFactors();

          if (factorsError) {
            throw factorsError;
          }

          const verifiedFactor =
            factorsData.totp.find(
              (factor) =>
                factor.status === "verified"
            );

          if (!verifiedFactor) {
            throw new Error(
              "No se encontró un factor TOTP verificado."
            );
          }

          if (!mounted) {
            return;
          }

          setFactorId(
            verifiedFactor.id
          );

          setModo("verify");
          return;

        }

        if (mounted) {
          setFactorId("");
          setQrCode("");
          setSecret("");
          setModo("setup");
        }

      } catch (error) {

        console.error(
          "Error preparando MFA:",
          error
        );

        if (mounted) {

          setErrorMessage(
            "No se pudo preparar la autenticación de dos factores."
          );

        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }

    prepararMFA();

    return () => {
      mounted = false;
    };

  }, [onVerified]);

  async function iniciarConfiguracionMFA() {

    if (preparing) {
      return;
    }

    try {

      setPreparing(true);
      setErrorMessage("");

      const {
        data: enrollData,
        error: enrollError,
      } =
        await supabase.auth.mfa
          .enroll({
            factorType: "totp",
          });

      if (enrollError) {
        throw enrollError;
      }

      if (
        enrollData.type !== "totp"
      ) {
        throw new Error(
          "El factor MFA creado no es TOTP."
        );
      }

      setFactorId(
        enrollData.id
      );

      setQrCode(
        enrollData.totp.qr_code
      );

      setSecret(
        enrollData.totp.secret
      );

      setModo("enroll");

    } catch (error) {

      console.error(
        "Error preparando MFA:",
        error
      );

      setErrorMessage(
        "No se pudo preparar la autenticación de dos factores."
      );

    } finally {

      setPreparing(false);

    }

  }

  async function verificarCodigo() {

    const codigo =
      code
        .replace(/\s/g, "")
        .trim();

    if (
      !factorId ||
      codigo.length !== 6
    ) {

      setErrorMessage(
        "Ingresa el código de 6 dígitos de tu aplicación Authenticator."
      );

      return;
    }

    try {

      setVerifying(true);
      setErrorMessage("");

      const {
        error,
      } =
        await supabase.auth.mfa
          .challengeAndVerify({
            factorId,
            code: codigo,
          });

      if (error) {
        throw error;
      }

      const {
        data: aalData,
        error: aalError,
      } =
        await supabase.auth.mfa
          .getAuthenticatorAssuranceLevel();

      if (aalError) {
        throw aalError;
      }

      if (
        aalData.currentLevel !==
        "aal2"
      ) {

        throw new Error(
          "La sesión no alcanzó AAL2."
        );

      }

      onVerified();

    } catch (error) {

      console.error(
        "Error verificando MFA:",
        error
      );

      setErrorMessage(
        "El código no es válido o ya expiró. Inténtalo nuevamente."
      );

    } finally {

      setVerifying(false);

    }

  }

  async function cerrarSesion() {

    await supabase.auth.signOut();

  }

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-slate-100
          flex
          items-center
          justify-center
          p-6
        "
      >

        <div
          className="
            text-sm
            text-slate-500
          "
        >
          Preparando seguridad de MintOS...
        </div>

      </div>

    );

  }

  return (

    <div
      className="
        min-h-screen
        bg-slate-100
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          w-full
          max-w-md
          bg-white
          border
          border-slate-200
          rounded-3xl
          shadow-xl
          p-8
        "
      >

        <div
          className="
            text-center
            mb-7
          "
        >

          <div
            className="
              inline-flex
              items-center
              justify-center
              px-3
              py-1
              rounded-full
              bg-teal-50
              text-teal-700
              text-xs
              font-bold
              uppercase
              tracking-wide
              mb-4
            "
          >
            Seguridad de administrador
          </div>

          <h1
            className="
              text-2xl
              font-bold
              text-slate-900
            "
          >
            Verificación en dos pasos
          </h1>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
              leading-6
            "
          >

            {
              modo === "verify"
                ? "Ingresa el código generado por tu aplicación Authenticator."
                : "Configura una aplicación Authenticator para proteger tu cuenta administrativa."
            }

          </p>

        </div>

        {
          modo === "setup" && (

            <div
              className="
                space-y-4
                mb-6
              "
            >

              <div
                className="
                  bg-slate-50
                  border
                  border-slate-200
                  rounded-2xl
                  px-4
                  py-4
                  text-sm
                  text-slate-600
                  leading-6
                "
              >
                Genera un código QR y escanéalo con tu
                aplicación Authenticator. El código QR se
                crea una sola vez al presionar el botón.
              </div>

              {
                errorMessage && (

                  <div
                    className="
                      bg-red-50
                      border
                      border-red-200
                      text-red-700
                      text-sm
                      rounded-2xl
                      px-4
                      py-3
                    "
                  >
                    {errorMessage}
                  </div>

                )
              }

              <button
                type="button"
                onClick={
                  iniciarConfiguracionMFA
                }
                disabled={preparing}
                className="
                  w-full
                  bg-teal-600
                  hover:bg-teal-700
                  text-white
                  py-4
                  rounded-2xl
                  font-bold
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {
                  preparing
                    ? "Generando código QR..."
                    : "Configurar Authenticator"
                }
              </button>

            </div>

          )
        }

        {
          modo === "enroll" && (

            <div
              className="
                mb-6
              "
            >

              {
                qrCode && (

                  <div
                    className="
                      flex
                      justify-center
                      mb-5
                    "
                  >

                    <img
                      src={qrCode}
                      alt="Código QR para configurar Authenticator"
                      className="
                        w-52
                        h-52
                        border
                        border-slate-200
                        rounded-2xl
                        p-3
                        bg-white
                      "
                    />

                  </div>

                )
              }

              <p
                className="
                  text-sm
                  text-slate-600
                  text-center
                  leading-6
                "
              >
                Escanea el código QR con Google Authenticator,
                Microsoft Authenticator u otra aplicación TOTP.
              </p>

              {
                secret && (

                  <div
                    className="
                      mt-4
                      bg-slate-50
                      border
                      border-slate-200
                      rounded-2xl
                      p-4
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-slate-500
                        mb-2
                      "
                    >
                      Clave manual
                    </p>

                    <p
                      className="
                        text-sm
                        font-mono
                        text-slate-800
                        break-all
                      "
                    >
                      {secret}
                    </p>

                  </div>

                )
              }

            </div>

          )
        }

        {
          modo !== "setup" && (

        <div
          className="
            space-y-4
          "
        >

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Código de 6 dígitos"
            value={code}
            onChange={(event) => {

              const value =
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

              setCode(value);
              setErrorMessage("");

            }}
            onKeyDown={(event) => {

              if (
                event.key ===
                "Enter"
              ) {

                verificarCodigo();

              }

            }}
            className="
              w-full
              border
              border-slate-300
              rounded-2xl
              px-4
              py-4
              text-center
              text-xl
              tracking-[0.35em]
              font-semibold
              outline-none
              focus:ring-2
              focus:ring-teal-500
              focus:border-teal-500
            "
          />

          {
            errorMessage && (

              <div
                className="
                  bg-red-50
                  border
                  border-red-200
                  text-red-700
                  text-sm
                  rounded-2xl
                  px-4
                  py-3
                "
              >
                {errorMessage}
              </div>

            )
          }

          <button
            type="button"
            onClick={
              verificarCodigo
            }
            disabled={
              verifying ||
              code.length !== 6
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
              disabled:cursor-not-allowed
            "
          >

            {
              verifying
                ? "Verificando..."
                : (
                    modo === "enroll"
                      ? "Activar y continuar"
                      : "Verificar y continuar"
                  )
            }

          </button>

          <button
            type="button"
            onClick={
              cerrarSesion
            }
            disabled={
              verifying
            }
            className="
              w-full
              border
              border-slate-200
              hover:bg-slate-50
              text-slate-600
              py-3
              rounded-2xl
              text-sm
              font-semibold
              disabled:opacity-50
            "
          >
            Cerrar sesión
          </button>

        </div>

          )
        }

        {
          modo === "setup" && (

            <button
              type="button"
              onClick={
                cerrarSesion
              }
              disabled={preparing}
              className="
                w-full
                border
                border-slate-200
                hover:bg-slate-50
                text-slate-600
                py-3
                rounded-2xl
                text-sm
                font-semibold
                disabled:opacity-50
              "
            >
              Cerrar sesión
            </button>

          )
        }

      </div>

    </div>

  );

}