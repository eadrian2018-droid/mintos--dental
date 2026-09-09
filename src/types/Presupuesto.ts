export type EstadoPresupuesto =
  | "Borrador"
  | "Enviado"
  | "Convertido";

export type MonedaPresupuesto =
  | "MXN"
  | "USD";

export interface Presupuesto {
  id: number;
  paciente_id: number | null;
  nombre_paciente?: string | null;
  fecha: string;
  estado: EstadoPresupuesto;
  moneda: MonedaPresupuesto;
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
  tratamiento: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  created_at?: string;
}