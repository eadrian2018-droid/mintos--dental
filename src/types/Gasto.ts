export interface Gasto {

  id: number;

  fecha: string;

  concepto: string;

  categoria: string;

  monto: number;

  moneda:
    | "MXN"
    | "USD";

  notas?: string;

}