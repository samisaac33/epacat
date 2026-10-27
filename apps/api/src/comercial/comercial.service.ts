import { Injectable } from '@nestjs/common';
import {
  CATALOGO_TARIFAS,
  loadAnalisisSnapshot,
  type AnalisisSnapshot,
} from '@epacat/comercial';

@Injectable()
export class ComercialService {
  getAnalisisPuntual(): AnalisisSnapshot {
    return loadAnalisisSnapshot();
  }

  listTarifas() {
    return CATALOGO_TARIFAS;
  }
}
