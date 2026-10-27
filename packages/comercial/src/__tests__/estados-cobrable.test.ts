import { esEstadoTramiteCobrable } from '../estados-cobrable';
import { pickClosestByCaudal } from '../match-records';
import type { RuaaRow } from '../types';

function ruaaRow(partial: Partial<RuaaRow> & Pick<RuaaRow, 'estadoTramite' | 'caudalAutorizadoLs'>): RuaaRow {
  return {
    ruaaId: '1',
    codigoUnico: 'MA-TEST',
    codigoUnicoNorm: 'MA-TEST',
    codigoProceso: '',
    cedulaRuc: '',
    nombreUsuario: '',
    nomUsoAprovechamiento: 'INDUSTRIAL',
    nomSubUso: '',
    volumenAguaM3Anio: 0,
    cantonFuente: '',
    ...partial,
  };
}

describe('esEstadoTramiteCobrable', () => {
  it('acepta VIGENTE y RENOVADO', () => {
    expect(esEstadoTramiteCobrable('VIGENTE')).toBe(true);
    expect(esEstadoTramiteCobrable('RENOVADO')).toBe(true);
    expect(esEstadoTramiteCobrable('CANCELADO')).toBe(false);
  });
});

describe('pickClosestByCaudal desempate', () => {
  it('prefiere RENOVADO sobre CANCELADO con mismo caudal', () => {
    const cancelado = ruaaRow({ estadoTramite: 'CANCELADO', caudalAutorizadoLs: 2.6 });
    const renovado = ruaaRow({ estadoTramite: 'RENOVADO', caudalAutorizadoLs: 2.6 });
    const picked = pickClosestByCaudal([cancelado, renovado], 2.6);
    expect(picked.estadoTramite).toBe('RENOVADO');
  });

  it('prefiere VIGENTE sobre RENOVADO con mismo caudal', () => {
    const renovado = ruaaRow({ estadoTramite: 'RENOVADO', caudalAutorizadoLs: 2.6 });
    const vigente = ruaaRow({ estadoTramite: 'VIGENTE', caudalAutorizadoLs: 2.6 });
    const picked = pickClosestByCaudal([renovado, vigente], 2.6);
    expect(picked.estadoTramite).toBe('VIGENTE');
  });
});
