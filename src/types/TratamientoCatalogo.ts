export type TipoTratamiento =
  | "clinica"
  | "especialista";

export interface TratamientoCatalogo {
  id: number;

  nombre: string;

  nombre_en?: string | null;

  categoria: string;

  tipo: TipoTratamiento;

  precio_mxn: number;

  precio_usd: number;

  costo_especialista_mxn: number;

  costo_especialista_usd: number;

  doctor_id?: number | null;

  tratamiento_maestro_id?: number | null;

  activo: boolean;
}

export interface TratamientoMaestro {
  id: number;

  codigo: string;

  nombre_es: string;

  nombre_en: string;

  categoria: string;

  activo: boolean;

  creado_en?: string;
}