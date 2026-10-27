import type {
  ConsultaDeudaResponse,
  NotificarPagoRequest,
  NotificarPagoResponse,
  PacificoClientOptions,
  PacificoRecaudacionClient,
} from './types';

export class PacificoStubClient implements PacificoRecaudacionClient {
  constructor(private options: PacificoClientOptions) {}

  async consultarDeuda(identificacion: string): Promise<ConsultaDeudaResponse> {
    const res = await fetch(
      `${this.options.apiUrl}/recaudacion/v1/consulta?identificacion=${encodeURIComponent(identificacion)}`,
      { headers: { 'X-Banco-Api-Key': this.options.apiKey } },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message ?? 'Error en consulta de deuda');
    }
    return res.json();
  }

  async notificarPago(payload: NotificarPagoRequest): Promise<NotificarPagoResponse> {
    const res = await fetch(`${this.options.apiUrl}/recaudacion/v1/pago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Banco-Api-Key': this.options.apiKey,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message ?? 'Error al notificar pago');
    }
    return res.json();
  }
}

export function createPacificoClient(options: PacificoClientOptions): PacificoRecaudacionClient {
  return new PacificoStubClient(options);
}
