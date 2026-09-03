export interface Gasto {

  id: number;

  fecha: string;

  concepto: string;

  categoria: string;

  monto: number;

  moneda:

    | "MXN"

    | "USD";

  metodo_pago:

    | "Efectivo"

    | "Transferencia"

    | "Tarjeta";

  notas?: string;

}