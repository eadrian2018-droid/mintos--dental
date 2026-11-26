import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  | "recepcionista"
  | "tablet"
  | "registro";

export type PermisosUsuario = {
  ver_agenda: boolean;
  editar_citas: boolean;

  ver_pacientes: boolean;
  editar_pacientes: boolean;
  registrar_pacientes: boolean;

  ver_expediente: boolean;
  agregar_notas_clinicas: boolean;

  crear_tratamientos: boolean;
  cambiar_estado_tratamientos: boolean;
  anular_tratamientos: boolean;

  registrar_cobros: boolean;
  aplicar_descuentos: boolean;
  registrar_gastos: boolean;
  anular_cobros: boolean;
  anular_gastos: boolean;

  ver_resumen_financiero: boolean;
  ver_utilidades: boolean;
  ver_comisiones: boolean;

  configurar_precios_costos: boolean;
  configurar_tipo_cambio: boolean;
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

function conservarReferencia<T>(
  anterior: T | null,
  nuevo: T | null
): T | null {
  if (anterior === nuevo) return anterior;
  if (anterior === null || nuevo === null) return nuevo;

  return JSON.stringify(anterior) === JSON.stringify(nuevo)
    ? anterior
    : nuevo;
}

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

  const usuarioActualRef =
    useRef<string | null>(null);

  const generacionAuthRef =
    useRef(0);

  const solicitudPerfilRef =
    useRef(0);

  const solicitudPermisosRef =
    useRef(0);

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
          registrar_pacientes,
          ver_expediente,
          agregar_notas_clinicas,
          crear_tratamientos,
          cambiar_estado_tratamientos,
          anular_tratamientos,
          registrar_cobros,
          aplicar_descuentos,
          registrar_gastos,
          anular_cobros,
          anular_gastos,
          ver_resumen_financiero,
          ver_utilidades,
          ver_comisiones,
          configurar_precios_costos,
          configurar_tipo_cambio,
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

    const generacion =
      generacionAuthRef.current;

    const solicitud =
      ++solicitudPerfilRef.current;

    const perfilNuevo =
      await obtenerPerfil(
        usuario
      );

    if (
      generacion !== generacionAuthRef.current ||
      solicitud !== solicitudPerfilRef.current ||
      usuarioActualRef.current !== (usuario?.id ?? null)
    ) {
      return;
    }

    setPerfil(
      anterior => conservarReferencia(anterior, perfilNuevo)
    );
  }

  async function cargarPermisos(
    usuario: User | null
  ) {

    const generacion =
      generacionAuthRef.current;

    const solicitud =
      ++solicitudPermisosRef.current;

    const permisosNuevos =
      await obtenerPermisos(
        usuario
      );

    if (
      generacion !== generacionAuthRef.current ||
      solicitud !== solicitudPermisosRef.current ||
      usuarioActualRef.current !== (usuario?.id ?? null)
    ) {
      return;
    }

    setPermisos(
      anterior => conservarReferencia(anterior, permisosNuevos)
    );
  }

  async function recargarPerfil() {

    if (
      usuarioActualRef.current !==
      (user?.id ?? null)
    ) {
      return;
    }

    await cargarPerfil(
      user
    );
  }

  async function recargarPermisos() {

    if (
      usuarioActualRef.current !==
      (user?.id ?? null)
    ) {
      return;
    }

    await cargarPermisos(
      user
    );
  }

  useEffect(() => {

    let montado =
      true;

    let inicializado =
      false;

    let cargandoAutenticacion =
      false;

    let eventoRecibido =
      false;

    let temporizador:
      ReturnType<typeof setTimeout> | null =
      null;

    function cancelarCargaProgramada() {

      if (temporizador !== null) {

        clearTimeout(
          temporizador
        );

        temporizador =
          null;
      }
    }

    function procesarSesion(
      nuevaSession: Session | null,
      permitirActualizacionSilenciosa: boolean
    ) {

      if (!montado) {
        return;
      }

      const nuevoUsuario =
        nuevaSession?.user ??
        null;

      const nuevoUsuarioId =
        nuevoUsuario?.id ??
        null;

      const mismoUsuario =
        nuevoUsuarioId !== null &&
        usuarioActualRef.current === nuevoUsuarioId;

      const actualizacionSilenciosa =
        inicializado &&
        mismoUsuario &&
        permitirActualizacionSilenciosa &&
        !cargandoAutenticacion;

      cancelarCargaProgramada();

      const generacion =
        ++generacionAuthRef.current;

      usuarioActualRef.current =
        nuevoUsuarioId;

      setSession(
        nuevaSession
      );

      setUser(
        anterior => conservarReferencia(anterior, nuevoUsuario)
      );

      /*
       * Cierre de sesión:
       * invalidar las solicitudes anteriores
       * y eliminar el contexto autenticado.
       */

      if (!nuevoUsuario) {

        solicitudPerfilRef.current++;
        solicitudPermisosRef.current++;

        setPerfil(
          null
        );

        setPermisos(
          null
        );

        inicializado =
          true;

        cargandoAutenticacion =
          false;

        setLoading(
          false
        );

        return;
      }

      /*
       * Una renovación de sesión del mismo
       * usuario no debe desmontar MintOS.
       *
       * El perfil y los permisos se consultan
       * nuevamente sin reiniciar la interfaz.
       */

      if (!actualizacionSilenciosa) {

        cargandoAutenticacion =
          true;

        setLoading(
          true
        );

        setPerfil(
          null
        );

        setPermisos(
          null
        );
      }

      const solicitudPerfil =
        ++solicitudPerfilRef.current;

      const solicitudPermisos =
        ++solicitudPermisosRef.current;

      temporizador =
        setTimeout(
          async () => {

            temporizador =
              null;

            if (
              !montado ||
              generacion !== generacionAuthRef.current
            ) {
              return;
            }

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

            /*
             * Impedir que una respuesta anterior
             * restaure datos después de cerrar
             * sesión o cambiar de usuario.
             */

            if (
              !montado ||
              generacion !== generacionAuthRef.current ||
              usuarioActualRef.current !== nuevoUsuarioId
            ) {
              return;
            }

            if (
              solicitudPerfil ===
              solicitudPerfilRef.current
            ) {

              setPerfil(
                anterior => conservarReferencia(anterior, perfilNuevo)
              );
            }

            if (
              solicitudPermisos ===
              solicitudPermisosRef.current
            ) {

              setPermisos(
                anterior => conservarReferencia(anterior, permisosNuevos)
              );
            }

            inicializado =
              true;

            cargandoAutenticacion =
              false;

            setLoading(
              false
            );

          },
          0
        );
    }

    async function iniciarAuth() {

      try {

        const {
          data,
          error,
        } = await supabase.auth
          .getSession();

        if (
          !montado ||
          eventoRecibido
        ) {
          return;
        }

        if (error) {

          console.error(
            "Error cargando sesión:",
            error
          );

          procesarSesion(
            null,
            false
          );

          return;
        }

        procesarSesion(
          data.session,
          false
        );

      } catch (error) {

        console.error(
          "Error iniciando autenticación:",
          error
        );

        if (
          montado &&
          !eventoRecibido
        ) {

          procesarSesion(
            null,
            false
          );
        }
      }
    }

    const {
      data:
        authListener,
    } = supabase.auth
      .onAuthStateChange(
        (
          event,
          nuevaSession
        ) => {

          if (!montado) {
            return;
          }

          eventoRecibido =
            true;

          const permitirActualizacionSilenciosa =
            event === "TOKEN_REFRESHED" ||
            event === "SIGNED_IN";

          procesarSesion(
            nuevaSession,
            permitirActualizacionSilenciosa
          );
        }
      );

    iniciarAuth();

    return () => {

      montado =
        false;

      generacionAuthRef.current++;
      solicitudPerfilRef.current++;
      solicitudPermisosRef.current++;

      cancelarCargaProgramada();

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