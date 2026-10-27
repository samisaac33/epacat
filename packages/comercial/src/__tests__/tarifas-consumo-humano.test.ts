import {
  aplicaRecaudacionPorUso,
  tarifaDesdeUsoRuaa,
} from '../tarifas';

describe('consumo humano sin recaudación', () => {
  it('consumo humano en general → tarifa 0', () => {
    expect(tarifaDesdeUsoRuaa('CONSUMO HUMANO', 1).tarifa).toBe(0);
    expect(aplicaRecaudacionPorUso('CONSUMO HUMANO', 'CONSUMO HUMANO EN GENERAL')).toBe(false);
  });

  it('excedente consumo humano → tarifa excedente', () => {
    expect(
      tarifaDesdeUsoRuaa('CONSUMO HUMANO', 1, 'EXCEDENTE DE CONSUMO HUMANO').tarifa,
    ).toBe(0.0039);
    expect(aplicaRecaudacionPorUso('CONSUMO HUMANO', 'EXCEDENTE DE CONSUMO HUMANO')).toBe(true);
  });
});
