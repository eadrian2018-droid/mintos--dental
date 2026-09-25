import { supabase } from "./supabase";

export type ConfiguracionClinica = {
  id: number;

  nombre: string | null;

  responsable: string | null;

  telefono: string | null;

  whatsapp: string | null;

  email: string | null;

  sitio_web: string | null;

  direccion: string | null;

  ciudad: string | null;

  estado: string | null;

  pais: string | null;

  horario: string | null;

  zona_horaria: string | null;
};

export async function obtenerConfiguracionClinica():
  Promise<ConfiguracionClinica | null> {

  const {
    data,
    error,
  } = await supabase
    .from("configuracion_clinica")
    .select(`
      id,
      nombre,
      responsable,
      telefono,
      whatsapp,
      email,
      sitio_web,
      direccion,
      ciudad,
      estado,
      pais,
      horario,
      zona_horaria
    `)
    .limit(1)
    .maybeSingle();

  if (error) {

    console.error(
      "Error obteniendo configuración de clínica:",
      error
    );

    return null;

  }

  return data as ConfiguracionClinica | null;
}

export function obtenerDireccionCompleta(
  clinica: ConfiguracionClinica
) {

  return [
    clinica.direccion,
    clinica.ciudad,
    clinica.estado,
    clinica.pais,
  ]
    .filter(Boolean)
    .join(", ");
}