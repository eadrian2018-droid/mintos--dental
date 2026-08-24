export interface Tratamiento {
  id: number;

  fecha: string;

  paciente_id: number;

  tratamiento: string;

  total: number;

  pago: number;

  resta: number;

  laboratorio?: number;

  especialista?: number;

  comision_banco?: number;

  doctor_id?: number;

  metodo_pago?: string;

  moneda?: string;
}