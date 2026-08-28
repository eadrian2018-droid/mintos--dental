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

export type PermisosUsuario = {
  ver_agenda: boolean;
  editar_citas: boolean;

  ver_pacientes: boolean;
  editar_pacientes: boolean;

  ver_expediente: boolean;
  agregar_notas_clinicas: boolean;

  crear_tratamientos: boolean;
  cambiar_estado_tratamientos: boolean;
  anular_tratamientos: boolean;

  registrar_cobros: boolean;
  registrar_gastos: boolean;
  anular_cobros: boolean;
  anular_gastos: boolean;

  ver_resumen_financiero: boolean;
  ver_utilidades: boolean;
  ver_comisiones: boolean;

  configurar_precios_costos: boolean;
  configurar_comisiones: boolean;

  administrar_usuarios: boolean;
  ver_bitacora: boolean;
};

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
  permisos: PermisosUsuario | null;
  loading: boolean;
  recargarPerfil: () => Promise<void>;
  recargarPermisos: () => Promise<void>;
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
    permisos,
    setPermisos,
  ] = useState<PermisosUsuario | null>(
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

  async function obtenerPermisos(
    usuario: User | null
  ): Promise<PermisosUsuario | null> {

    if (!usuario) {
      return null;
    }

    try {

      const {
        data,
        error,
      } = await supabase
        .from("permisos_usuarios")
        .select(`
          ver_agenda,
          editar_citas,
          ver_pacientes,
          editar_pacientes,
          ver_expediente,
          agregar_notas_clinicas,
          crear_tratamientos,
          cambiar_estado_tratamientos,
          anular_tratamientos,
          registrar_cobros,
          registrar_gastos,
          anular_cobros,
          anular_gastos,
          ver_resumen_financiero,
          ver_utilidades,
          ver_comisiones,
          configurar_precios_costos,
          configurar_comisiones,
          administrar_usuarios,
          ver_bitacora
        `)
        .eq(
          "usuario_id",
          usuario.id
        )
        .maybeSingle();

      if (error) {

        console.error(
          "Error cargando permisos:",
          error
        );

        return null;
      }

      if (!data) {
        return null;
      }

      return data as PermisosUsuario;

    } catch (error) {

      console.error(
        "Error inesperado cargando permisos:",
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

  async function cargarPermisos(
    usuario: User | null
  ) {

    const permisosNuevos =
      await obtenerPermisos(
        usuario
      );

    setPermisos(
      permisosNuevos
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

  async function recargarPermisos() {

    if (!user) {

      setPermisos(
        null
      );

      return;
    }

    await cargarPermisos(
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

        const [
          perfilActual,
          permisosActuales,
        ] = await Promise.all([
          obtenerPerfil(
            usuarioActual
          ),
          obtenerPermisos(
            usuarioActual
          ),
        ]);

        if (!montado) {
          return;
        }

        setPerfil(
          perfilActual
        );

        setPermisos(
          permisosActuales
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

          setPermisos(
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

          setPermisos(
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

              const [
                perfilNuevo,
                permisosNuevos,
              ] = await Promise.all([
                obtenerPerfil(
                  nuevoUsuario
                ),
                obtenerPermisos(
                  nuevoUsuario
                ),
              ]);

              if (!montado) {
                return;
              }

              setPerfil(
                perfilNuevo
              );

              setPermisos(
                permisosNuevos
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
        permisos,
        loading,
        recargarPerfil,
        recargarPermisos,
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