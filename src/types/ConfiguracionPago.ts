export interface ConfiguracionPago {

  id: number;

  metodo: string;

  activo: boolean;

  comision_porcentaje: number;

  iva_comision_porcentaje: number;

  aplica_comision: boolean;

}