import { facturaAnualCentavos } from '../calcular-factura-anual';
import { tarifaRiegoProductivo } from '../tarifas';

describe('factura anual EPA (centavos USD)', () => {
  it('turismo MA-PD-000006-128507 — 0.17 l/s', () => {
    expect(facturaAnualCentavos(0.17, 0.0163)).toBe(8739);
  });

  it('riego productivo 5.92 l/s (tramo 5–20)', () => {
    expect(facturaAnualCentavos(5.92, tarifaRiegoProductivo(5.92))).toBe(1494);
  });

  it('acuicultura 4.38 l/s con tarifa Otros inferida', () => {
    expect(facturaAnualCentavos(4.38, 0.0007)).toBe(9669);
  });
});
