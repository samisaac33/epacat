export type PacificoCanal = 'VENTANILLA' | 'BANCA_WEB' | 'BANCA_MOVIL';

export interface DeudaItem {
  referencia: string;
  concepto: string;
  monto: number;
  vencimiento: string;
}

export interface ConsultaDeudaResponse {
  institucion: string;
  identificacion: string;
  nombre: string;
  deudas: DeudaItem[];
  totalPendiente: number;
}

export interface NotificarPagoRequest {
  transaccionId: string;
  identificacion: string;
  referencia: string;
  monto: number;
  canal: PacificoCanal;
  fechaPago?: string;
}

export interface NotificarPagoResponse {
  ok: boolean;
  transaccionId: string;
  referencia: string;
  facturaStatus: string;
}

export interface PacificoRecaudacionClient {
  consultarDeuda(identificacion: string): Promise<ConsultaDeudaResponse>;
  notificarPago(payload: NotificarPagoRequest): Promise<NotificarPagoResponse>;
}

export interface PacificoClientOptions {
  apiUrl: string;
  apiKey: string;
}
