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

  doctor_id:
    number | null;

  activo: boolean;

  password_configurado: boolean;

};

type AuthContextType = {

  session:
    Session | null;

  user:
    User | null;

  perfil:
    PerfilUsuario | null;

  loading: boolean;

  recargarPerfil:
    () => Promise<void>;

};

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

type AuthProviderProps = {

  children:
    ReactNode;

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

  async function cargarPerfil(
    usuario:
      User | null
  ) {

    if (
      !usuario
    ) {

      setPerfil(
        null
      );

      return;

    }

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
    rol,
    doctor_id,
    activo,
    password_configurado
  `
)

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

      setPerfil(
        null
      );

      return;

    }

    if (
      !data
    ) {

      setPerfil(
        null
      );

      return;

    }

    setPerfil(
      data as PerfilUsuario
    );

  }

  async function recargarPerfil() {

    await cargarPerfil(
      user
    );

  }

  useEffect(() => {

    async function iniciarAuth() {

      const {

        data,

      } = await supabase.auth
        .getSession();

      const sesionActual =
        data.session;

      setSession(
        sesionActual
      );

      setUser(
        sesionActual?.user ??
        null
      );

      await cargarPerfil(
        sesionActual?.user ??
        null
      );

      setLoading(
        false
      );

    }

    iniciarAuth();

    const {

      data:
        authListener,

    } = supabase.auth
      .onAuthStateChange(

        async (
          _event,
          nuevaSession
        ) => {

          setSession(
            nuevaSession
          );

          setUser(
            nuevaSession?.user ??
            null
          );

          await cargarPerfil(
            nuevaSession?.user ??
            null
          );

          setLoading(
            false
          );

        }

      );

    return () => {

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

  if (
    !context
  ) {

    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );

  }

  return context;

}