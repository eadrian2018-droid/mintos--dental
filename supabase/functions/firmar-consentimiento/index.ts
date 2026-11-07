import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "mintos-consentimientos-firmas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_SIGNATURE_BYTES = 1024 * 1024;
const MAX_REQUEST_BYTES = 1_500_000;
const MAX_IMAGE_DIMENSION = 4096;
const MAX_IMAGE_PIXELS = 4_000_000;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY",
);

type FirmaRequest = {
  consentimiento_id?: unknown;
  firma_base64?: unknown;
};

type Consentimiento = {
  id: string;
  paciente_id: number;
  estado: string;
  firma_storage_path: string | null;
  firma_hash: string | null;
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function readUint32(
  bytes: Uint8Array,
  offset: number,
): number {
  return (
    (
      bytes[offset] * 0x1000000 +
      (bytes[offset + 1] << 16) +
      (bytes[offset + 2] << 8) +
      bytes[offset + 3]
    ) >>> 0
  );
}

function crc32(
  bytes: Uint8Array,
  start: number,
  end: number,
): number {
  let crc = 0xffffffff;

  for (let i = start; i < end; i++) {
    crc ^= bytes[i];

    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^
        ((crc & 1) ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function validatePng(bytes: Uint8Array): void {
  const signature = [
    137, 80, 78, 71, 13, 10, 26, 10,
  ];

  if (
    bytes.length < 57 ||
    !signature.every((byte, i) => bytes[i] === byte)
  ) {
    throw new Error("Firma PNG inválida.");
  }

  let offset = 8;
  let hasIHDR = false;
  let hasIDAT = false;
  let hasIEND = false;
  let chunkCount = 0;

  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      throw new Error("Estructura PNG incompleta.");
    }

    const length = readUint32(bytes, offset);
    const typeStart = offset + 4;
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;

    if (
      length > bytes.length ||
      dataEnd > bytes.length - 4 ||
      chunkEnd > bytes.length
    ) {
      throw new Error("Bloque PNG inválido.");
    }

    const type = String.fromCharCode(
      ...bytes.subarray(typeStart, typeStart + 4),
    );

    const expectedCrc = readUint32(bytes, dataEnd);
    const actualCrc = crc32(
      bytes,
      typeStart,
      dataEnd,
    );

    if (expectedCrc !== actualCrc) {
      throw new Error("Integridad PNG inválida.");
    }

    if (chunkCount === 0) {
      if (type !== "IHDR" || length !== 13) {
        throw new Error("Cabecera PNG inválida.");
      }

      const width = readUint32(bytes, dataStart);
      const height = readUint32(bytes, dataStart + 4);

      if (
        width === 0 ||
        height === 0 ||
        width > MAX_IMAGE_DIMENSION ||
        height > MAX_IMAGE_DIMENSION ||
        width * height > MAX_IMAGE_PIXELS
      ) {
        throw new Error(
          "Dimensiones de firma no permitidas.",
        );
      }

      const bitDepth = bytes[dataStart + 8];
      const colorType = bytes[dataStart + 9];
      const compression = bytes[dataStart + 10];
      const filter = bytes[dataStart + 11];
      const interlace = bytes[dataStart + 12];

      if (
        bitDepth !== 8 ||
        ![2, 6].includes(colorType) ||
        compression !== 0 ||
        filter !== 0 ||
        interlace !== 0
      ) {
        throw new Error(
          "Formato PNG no permitido.",
        );
      }

      hasIHDR = true;
    }

    if (type === "IDAT") {
      if (!hasIHDR || hasIEND || length === 0) {
        throw new Error("Datos PNG inválidos.");
      }

      hasIDAT = true;
    }

    if (type === "IEND") {
      if (
        !hasIDAT ||
        length !== 0 ||
        chunkEnd !== bytes.length
      ) {
        throw new Error("Final PNG inválido.");
      }

      hasIEND = true;
    }

    offset = chunkEnd;
    chunkCount++;

    if (chunkCount > 256) {
      throw new Error("PNG demasiado complejo.");
    }

    if (hasIEND) break;
  }

  if (!hasIHDR || !hasIDAT || !hasIEND) {
    throw new Error("Firma PNG incompleta.");
  }
}

function decodeSignature(
  value: unknown,
): Uint8Array {
  if (typeof value !== "string") {
    throw new Error("Firma inválida.");
  }

  const base64 = value
    .replace(/^data:image\/png;base64,/i, "")
    .trim();

  if (
    !base64 ||
    base64.length > MAX_REQUEST_BYTES ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)
  ) {
    throw new Error("Formato Base64 inválido.");
  }

  let binary: string;

  try {
    binary = atob(base64);
  } catch {
    throw new Error("No se pudo decodificar la firma.");
  }

  if (
    binary.length === 0 ||
    binary.length > MAX_SIGNATURE_BYTES
  ) {
    throw new Error(
      "La firma supera el tamaño permitido.",
    );
  }

  const bytes = Uint8Array.from(
    binary,
    (character) => character.charCodeAt(0),
  );

  validatePng(bytes);

  return bytes;
}

async function sha256(
  bytes: Uint8Array,
): Promise<string> {
  const buffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(buffer).set(bytes);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    buffer,
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (request: Request): Promise<Response> => {
  try {
    // CORS: permitir la verificación previa del navegador.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Únicamente POST puede procesar firmas.
    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Método no permitido." },
        405,
      );
    }

    const contentLength = request.headers.get(
      "Content-Length",
    );

    if (
      contentLength &&
      Number(contentLength) > MAX_REQUEST_BYTES
    ) {
      return jsonResponse(
        { error: "Solicitud demasiado grande." },
        413,
      );
    }

    if (
      !SUPABASE_URL ||
      !SUPABASE_ANON_KEY ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "Configuración Supabase incompleta.",
      );

      return jsonResponse(
        { error: "Servicio no configurado." },
        500,
      );
    }

    const authorization = request.headers.get(
      "Authorization",
    );

    const token = authorization?.match(
      /^Bearer\s+(.+)$/i,
    )?.[1];

    if (!token) {
      return jsonResponse(
        { error: "Sesión no válida." },
        401,
      );
    }

    const authClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const adminClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: authData,
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !authData.user) {
      return jsonResponse(
        { error: "Usuario no autenticado." },
        401,
      );
    }

    const usuarioId = authData.user.id;

    const {
      data: perfil,
      error: perfilError,
    } = await adminClient
      .from("perfiles")
      .select("id, rol, activo")
      .eq("id", usuarioId)
      .single();

    if (
      perfilError ||
      !perfil ||
      perfil.activo !== true
    ) {
      return jsonResponse(
        { error: "Usuario sin acceso activo." },
        403,
      );
    }

    if (perfil.rol !== "admin") {
      const {
        data: permisos,
        error: permisosError,
      } = await adminClient
        .from("permisos_usuarios")
        .select("registrar_firmas_consentimientos")
        .eq("usuario_id", usuarioId)
        .maybeSingle();

      if (
        permisosError ||
        permisos?.registrar_firmas_consentimientos !== true
      ) {
        return jsonResponse(
          {
            error:
              "No tienes permisos para registrar firmas.",
          },
          403,
        );
      }
    }

    let body: FirmaRequest;

    try {
      const rawBody = await request.text();

      if (rawBody.length > MAX_REQUEST_BYTES) {
        return jsonResponse(
          { error: "Solicitud demasiado grande." },
          413,
        );
      }

      body = JSON.parse(rawBody);
    } catch {
      return jsonResponse(
        { error: "Solicitud JSON inválida." },
        400,
      );
    }

    const consentimientoId = body?.consentimiento_id;

    if (!isUuid(consentimientoId)) {
      return jsonResponse(
        { error: "Identificador inválido." },
        400,
      );
    }

    let signatureBytes: Uint8Array;

    try {
      signatureBytes = decodeSignature(
        body.firma_base64,
      );
    } catch (error) {
      return jsonResponse(
        {
          error: error instanceof Error
            ? error.message
            : "Firma inválida.",
        },
        400,
      );
    }

    const {
      data: consentimiento,
      error: consentimientoError,
    } = await adminClient
      .from("mintos_consentimientos_pacientes")
      .select(
        "id, paciente_id, estado, firma_storage_path, firma_hash",
      )
      .eq("id", consentimientoId)
      .single();

    if (consentimientoError || !consentimiento) {
      return jsonResponse(
        { error: "Consentimiento no encontrado." },
        404,
      );
    }

    const registro = consentimiento as Consentimiento;

    if (registro.estado !== "pendiente") {
      return jsonResponse(
        { error: "El consentimiento ya fue firmado." },
        409,
      );
    }

    const firmaHash = await sha256(signatureBytes);

    const firmaPath = [
      String(registro.paciente_id),
      consentimientoId,
      `${crypto.randomUUID()}.png`,
    ].join("/");

    const {
      error: uploadError,
    } = await adminClient.storage
      .from(BUCKET)
      .upload(
        firmaPath,
        signatureBytes,
        {
          contentType: "image/png",
          cacheControl: "0",
          upsert: false,
        },
      );

    if (uploadError) {
      console.error(
        "Error al almacenar firma:",
        uploadError.message,
      );

      return jsonResponse(
        { error: "No se pudo almacenar la firma." },
        500,
      );
    }

    const {
      data: storedFile,
      error: downloadError,
    } = await adminClient.storage
      .from(BUCKET)
      .download(firmaPath);

    if (downloadError || !storedFile) {
      console.error(
        "Firma almacenada sin verificación:",
        firmaPath,
      );

      return jsonResponse(
        {
          error:
            "No se pudo verificar la firma almacenada.",
        },
        500,
      );
    }

    const storedBytes = new Uint8Array(
      await storedFile.arrayBuffer(),
    );

    const storedHash = await sha256(storedBytes);

    if (storedHash !== firmaHash) {
      console.error(
        "Error de integridad en Storage:",
        firmaPath,
      );

      return jsonResponse(
        {
          error:
            "Falló la verificación de integridad.",
        },
        500,
      );
    }

    const {
      error: firmaError,
    } = await adminClient.rpc(
      "mintos_registrar_firma_consentimiento",
      {
        p_consentimiento_id: consentimientoId,
        p_usuario_id: usuarioId,
        p_firma_storage_path: firmaPath,
        p_firma_hash: firmaHash,
      },
    );

    if (firmaError) {
      console.error(
        "Error RPC de firma:",
        firmaError.message,
      );

      // Verificar el estado real antes de responder.
      // Nunca eliminar automáticamente una firma
      // cuyo registro definitivo sea incierto.

      const {
        data: estadoActual,
        error: estadoError,
      } = await adminClient
        .from("mintos_consentimientos_pacientes")
        .select(
          "estado, firma_storage_path, firma_hash",
        )
        .eq("id", consentimientoId)
        .maybeSingle();

      if (
        !estadoError &&
        estadoActual?.estado === "firmado" &&
        estadoActual.firma_storage_path === firmaPath &&
        estadoActual.firma_hash === firmaHash
      ) {
        return jsonResponse({
          success: true,
          consentimiento_id: consentimientoId,
          estado: "firmado",
        });
      }

      console.error(
        "Firma pendiente de conciliación:",
        firmaPath,
      );

      return jsonResponse(
        {
          error:
            "No se pudo confirmar el registro de la firma.",
        },
        409,
      );
    }

    return jsonResponse({
      success: true,
      consentimiento_id: consentimientoId,
      estado: "firmado",
    });
  } catch (error) {
    console.error(
      "Error inesperado en firmar-consentimiento:",
      error instanceof Error
        ? error.message
        : "Error desconocido",
    );

    return jsonResponse(
      {
        error:
          "Ocurrió un error al procesar la firma.",
      },
      500,
    );
  }
});