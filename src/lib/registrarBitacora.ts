import {
  supabase,
} from "./supabase";

type RegistrarBitacoraParams = {
  accion: string;
  modulo: string;
  detalle?: string | null;
};

export async function registrarBitacora({
  accion,
  modulo,
  detalle = null,
}: RegistrarBitacoraParams) {

  try {

    const {
      data: {
        user,
      },
    } = await supabase.auth
      .getUser();

    let usuarioNombre:
      string | null = null;

    const usuarioEmail =
      user?.email || null;

    if (user?.id) {

      const {
        data: perfil,
      } = await supabase
        .from("perfiles")
        .select("nombre")
        .eq(
          "id",
          user.id
        )
        .maybeSingle();

      usuarioNombre =
        perfil?.nombre || null;

    }

    const {
      error,
    } = await supabase
      .from("bitacora")
      .insert([
        {
          usuario_id:
            user?.id || null,

          usuario_nombre:
            usuarioNombre,

          usuario_email:
            usuarioEmail,

          accion,

          modulo,

          detalle,
        },
      ]);

    if (error) {

      console.error(
        "Error registrando bitácora:",
        error
      );

      return false;

    }

    return true;

  } catch (error) {

    console.error(
      "Error inesperado registrando bitácora:",
      error
    );

    return false;

  }

}