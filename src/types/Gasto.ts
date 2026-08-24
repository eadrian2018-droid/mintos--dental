export interface Gasto {

  id: number;

  fecha: string;

  concepto: string;

  categoria: string;

  monto: number;

  notas?: string;

}