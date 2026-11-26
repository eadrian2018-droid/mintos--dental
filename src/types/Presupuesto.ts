import type { UnidadCobro } from "./TratamientoCatalogo";

export type EstadoPresupuesto = "Borrador" | "Enviado";

export type MonedaPresupuesto = "MXN" | "USD";

export type IdiomaPresupuesto = "es" | "en";

export type ArcadaPresupuesto = "superior" | "inferior";

export type CuadrantePresupuesto = 1 | 2 | 3 | 4;

export type SuperficieDental =
  | "vestibular"
  | "lingual"
  | "palatina"
  | "mesial"
  | "distal"
  | "oclusal"
  | "incisal";

export type SuperficiesPresupuesto = Record<
  string,
  SuperficieDental[]
>;

export interface Presupuesto {
  id: number;
  paciente_id: number | null;
  nombre_paciente?: string | null;
  fecha: string;
  estado: EstadoPresupuesto;
  moneda: MonedaPresupuesto;
  idioma: IdiomaPresupuesto;
  subtotal: number;
  descuento: number;
  total: number;
  notas?: string | null;
  fecha_aprobacion?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: PresupuestoItem[];
}

export interface PresupuestoItem {
  id: number;
  presupuesto_id: number;
  diente?: string | null;
  catalogo_tratamiento_id?: number | null;
  dientes: number[];
  arcada?: ArcadaPresupuesto | null;

  unidad_cobro?: UnidadCobro | null;
  cuadrantes?: CuadrantePresupuesto[];
  arcadas?: ArcadaPresupuesto[];
  superficies?: SuperficiesPresupuesto;
  boca_completa?: boolean;

  tratamiento: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  created_at?: string;
}