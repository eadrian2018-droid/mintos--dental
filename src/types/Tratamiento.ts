export interface Tratamiento {

  id: number;

  fecha: string;

  paciente_id: number;

  tratamiento: string;

  total: number;

  pago: number;

  resta: number;

  laboratorio?: number;

  moneda_laboratorio?: "MXN" | "USD";

  especialista?: number;

  moneda_especialista?: "MXN" | "USD";

  comision_banco?: number;

  doctor_id?: number;

  metodo_pago?: string;

  moneda?: string;

  moneda_precio?: "MXN" | "USD";

  total_original?: number;

  pagado_original?: number;

  resta_original?: number;

  estado?:
    | "En proceso"
    | "Finalizado";

}