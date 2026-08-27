import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

type RolUsuario =
  | "admin"
  | "doctor"
  | "recepcionista";

type PerfilUsuario = {
  id: string;
  nombre: string;
  rol: RolUsuario;
  doctor_id: number | null;
  activo: boolean;
  password_configurado: boolean;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  perfil: PerfilUsuario | null;
  loading: boolean;
  recargarPerfil: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [
    session,
    setSession,
  ] = useState<Session | null>(
    null
  );

  const [
    user,
    setUser,
  ] = useState<User | null>(
    null
  );

  const [
    perfil,
    setPerfil,
  ] = useState<PerfilUsuario | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  async function obtenerPerfil(
    usuario: User | null
  ): Promise<PerfilUsuario | null> {

    if (!usuario) {
      return null;
    }

    try {

      const {
        data,
        error,
      } = await supabase
        .from("perfiles")
        .select(`
          id,
          nombre,
          rol,
          doctor_id,
          activo,
          password_configurado
        `)
        .eq(
          "id",
          usuario.id
        )
        .maybeSingle();

      if (error) {

        console.error(
          "Error cargando perfil:",
          error
        );

        return null;
      }

      if (!data) {
        return null;
      }

      return data as PerfilUsuario;

    } catch (error) {

      console.error(
        "Error inesperado cargando perfil:",
        error
      );

      return null;
    }
  }

  async function cargarPerfil(
    usuario: User | null
  ) {

    const perfilNuevo =
      await obtenerPerfil(
        usuario
      );

    setPerfil(
      perfilNuevo
    );
  }

  async function recargarPerfil() {

    if (!user) {

      setPerfil(
        null
      );

      return;
    }

    await cargarPerfil(
      user
    );
  }

  useEffect(() => {

    let montado =
      true;

    async function iniciarAuth() {

      try {

        setLoading(
          true
        );

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
        }

        if (!montado) {
          return;
        }

        const sesionActual =
          data.session;

        const usuarioActual =
          sesionActual?.user ??
          null;

        setSession(
          sesionActual
        );

        setUser(
          usuarioActual
        );

        const perfilActual =
          await obtenerPerfil(
            usuarioActual
          );

        if (!montado) {
          return;
        }

        setPerfil(
          perfilActual
        );

      } catch (error) {

        console.error(
          "Error iniciando autenticación:",
          error
        );

        if (montado) {

          setSession(
            null
          );

          setUser(
            null
          );

          setPerfil(
            null
          );
        }

      } finally {

        if (montado) {

          setLoading(
            false
          );
        }
      }
    }

    iniciarAuth();

    const {
      data:
        authListener,
    } = supabase.auth
      .onAuthStateChange(
        (
          _event,
          nuevaSession
        ) => {

          if (!montado) {
            return;
          }

          const nuevoUsuario =
            nuevaSession?.user ??
            null;

          setLoading(
            true
          );

          setPerfil(
            null
          );

          setSession(
            nuevaSession
          );

          setUser(
            nuevoUsuario
          );

          setTimeout(
            async () => {

              const perfilNuevo =
                await obtenerPerfil(
                  nuevoUsuario
                );

              if (!montado) {
                return;
              }

              setPerfil(
                perfilNuevo
              );

              setLoading(
                false
              );

            },
            0
          );
        }
      );

    return () => {

      montado =
        false;

      authListener
        .subscription
        .unsubscribe();
    };

  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        perfil,
        loading,
        recargarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );

  if (!context) {

    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
}