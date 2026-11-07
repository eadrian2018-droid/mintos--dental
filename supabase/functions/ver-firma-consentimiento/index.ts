import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "mintos-consentimientos-firmas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY"
);

type Solicitud = {
  consentimiento_id?: unknown;
};

function responder(
  contenido: Record<string, unknown>,
  estado = 200
): Response {
  return new Response(JSON.stringify(contenido), {
    status: estado,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function esUuid(valor: unknown): valor is string {
  return (
    typeof valor === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      valor
    )
  );
}

Deno.serve(async (request: Request): Promise<Response> => {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return responder(
        { error: "Método no permitido." },
        405
      );
    }

    if (
      !SUPABASE_URL ||
      !SUPABASE_ANON_KEY ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      return responder(
        { error: "Servicio no configurado." },
        500
      );
    }

    const authorization = request.headers.get("Authorization");

    const token = authorization?.match(
      /^Bearer\s+(.+)$/i
    )?.[1];

    if (!token) {
      return responder(
        { error: "Sesión no válida." },
        401
      );
    }

    const clienteUsuario = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: autenticacion,
      error: errorAutenticacion,
    } = await clienteUsuario.auth.getUser(token);

    if (
      errorAutenticacion ||
      !autenticacion.user
    ) {
      return responder(
        { error: "Usuario no autenticado." },
        401
      );
    }

    let cuerpo: Solicitud;

    try {
      const texto = await request.text();

      if (texto.length > 2048) {
        return responder(
          { error: "Solicitud demasiado grande." },
          413
        );
      }

      cuerpo = JSON.parse(texto);
    } catch {
      return responder(
        { error: "Solicitud JSON inválida." },
        400
      );
    }

    const consentimientoId = cuerpo?.consentimiento_id;

    if (!esUuid(consentimientoId)) {
      return responder(
        { error: "Identificador inválido." },
        400
      );
    }

    // Esta consulta utiliza el JWT del usuario.
    // PostgreSQL aplica las políticas RLS existentes.

    const {
      data: consentimiento,
      error: errorConsentimiento,
    } = await clienteUsuario
      .from("mintos_consentimientos_pacientes")
      .select(
        "id,paciente_id,estado,firma_storage_path"
      )
      .eq("id", consentimientoId)
      .maybeSingle();

    if (errorConsentimiento || !consentimiento) {
      return responder(
        {
          error:
            "Consentimiento no encontrado o acceso denegado.",
        },
        403
      );
    }

    if (
      consentimiento.estado !== "firmado" ||
      !consentimiento.firma_storage_path
    ) {
      return responder(
        { error: "El consentimiento no tiene firma registrada." },
        409
      );
    }

    const ruta = consentimiento.firma_storage_path;

    const rutaEsperada = [
      String(consentimiento.paciente_id),
      consentimiento.id,
    ].join("/") + "/";

    if (
      !ruta.startsWith(rutaEsperada) ||
      !/^[0-9a-f-]{36}\.png$/i.test(
        ruta.substring(rutaEsperada.length)
      )
    ) {
      return responder(
        { error: "Ruta de firma inválida." },
        500
      );
    }

    // La clave de servicio permanece exclusivamente
    // dentro de la Edge Function.

    const clienteAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: firma,
      error: errorFirma,
    } = await clienteAdmin.storage
      .from(BUCKET)
      .createSignedUrl(ruta, 60);

    if (errorFirma || !firma?.signedUrl) {
      console.error(
        "Error generando URL de firma:",
        errorFirma?.message
      );

      return responder(
        { error: "No se pudo recuperar la firma." },
        500
      );
    }

    return responder({
      success: true,
      consentimiento_id: consentimientoId,
      url: firma.signedUrl,
      expires_in: 60,
    });
  } catch (error) {
    console.error(
      "Error en ver-firma-consentimiento:",
      error instanceof Error
        ? error.message
        : "Error desconocido"
    );

    return responder(
      { error: "Error al consultar la firma." },
      500
    );
  }
});