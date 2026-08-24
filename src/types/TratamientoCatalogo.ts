export type TipoTratamiento =
  | "clinica"
  | "especialista";

export interface TratamientoCatalogo {
  id: number;

  nombre: string;

  categoria: string;

  tipo: TipoTratamiento;

  precio_mxn: number;

  precio_usd: number;

  costo_especialista_mxn: number;

  costo_especialista_usd: number;

  doctor_id?: number | null;

  activo: boolean;
}