import { loadAnalisisSnapshot } from '../load-snapshot';

describe('loadAnalisisSnapshot', () => {
  it('carga el snapshot Manabí versionado', () => {
    const snap = loadAnalisisSnapshot();
    expect(snap.meta.id).toBe('manabi-cruce-ruaa-epa');
    expect(snap.result.resumen.totalFilasEpa).toBe(849);
    expect(snap.result.resumen.filasConCruce).toBe(757);
    expect(snap.result.resumen.filasSinCruce).toBe(92);
    expect(snap.result.resumen.filasMatchBajaConfianza).toBe(118);
  });
});
