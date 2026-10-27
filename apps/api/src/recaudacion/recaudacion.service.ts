import {
  Injectable,
} from '@nestjs/common';
import type { RecaudacionPagoInput, RecaudacionReversoInput } from '@epacat/shared';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class RecaudacionService {
  constructor(private billing: BillingService) {}

  consultarDeuda(identificacion: string) {
    return this.billing.consultarDeuda(identificacion);
  }

  async notificarPago(input: RecaudacionPagoInput) {
    return this.billing.procesarPagoBancario(input);
  }

  async reverso(input: RecaudacionReversoInput) {
    return this.billing.procesarReversoBancario(input);
  }
}
