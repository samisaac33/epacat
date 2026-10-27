export interface TarifaCatalogoItem {
  id: string;
  uso: string;
  detalle: string;
  tarifaUsdM3: number;
  notas?: string;
}

/** Tabla tarifaria US$/m³ según normativa de usos y aprovechamiento (EPA). */
export const CATALOGO_TARIFAS: TarifaCatalogoItem[] = [
  { id: 'riego_lt5', uso: 'Riego productivo', detalle: '< 5 l/s', tarifaUsdM3: 0.00007 },
  { id: 'riego_5_20', uso: 'Riego productivo', detalle: '≥ 5 y < 20 l/s', tarifaUsdM3: 0.00008 },
  { id: 'riego_20_50', uso: 'Riego productivo', detalle: '≥ 20 y < 50 l/s', tarifaUsdM3: 0.00009 },
  { id: 'riego_gt50', uso: 'Riego productivo', detalle: '≥ 50 l/s', tarifaUsdM3: 0.00011 },
  { id: 'turismo', uso: 'Turismo', detalle: 'General', tarifaUsdM3: 0.0163 },
  { id: 'hidro', uso: 'Hidroelectricidad', detalle: 'General', tarifaUsdM3: 0.0049 },
  { id: 'industrial', uso: 'Industrial', detalle: 'General', tarifaUsdM3: 0.001 },
  { id: 'envasado', uso: 'Envasado de agua', detalle: 'General', tarifaUsdM3: 0.4 },
  { id: 'otros', uso: 'Otros', detalle: 'General', tarifaUsdM3: 0.0007 },
  { id: 'mineria', uso: 'Minería y petróleos', detalle: 'General', tarifaUsdM3: 0.0039 },
  {
    id: 'consumo_humano',
    uso: 'Consumo humano',
    detalle: 'Autorización de consumo humano',
    tarifaUsdM3: 0,
    notas: 'No aplica recaudación por este concepto en EPA',
  },
  {
    id: 'consumo_excedente',
    uso: 'Excedente consumo humano',
    detalle: 'General',
    tarifaUsdM3: 0.0039,
  },
  {
    id: 'riego_soberania_gt5',
    uso: 'Riego soberanía alimentaria',
    detalle: '≥ 5 l/s',
    tarifaUsdM3: 0.00004,
  },
  {
    id: 'riego_soberania_lt5',
    uso: 'Riego soberanía alimentaria',
    detalle: '< 5 l/s (exento)',
    tarifaUsdM3: 0,
    notas: 'Exento de pago por ley',
  },
];

export function tarifaRiegoProductivo(caudalLs: number): number {
  if (caudalLs < 5) return 0.00007;
  if (caudalLs < 20) return 0.00008;
  if (caudalLs < 50) return 0.00009;
  return 0.00011;
}

export function esExcedenteConsumoHumano(nomUso: string, nomSubUso?: string): boolean {
  const text = `${nomUso} ${nomSubUso ?? ''}`.toUpperCase();
  return text.includes('EXCEDENTE') && text.includes('CONSUMO HUMANO');
}

/** Consumo humano (JAAP, doméstico, etc.): EPA no recauda; sí aplica excedente explícito. */
export function aplicaRecaudacionPorUso(nomUso: string, nomSubUso?: string): boolean {
  const u = (nomUso || '').toUpperCase();
  const sub = (nomSubUso || '').toUpperCase();
  if (esExcedenteConsumoHumano(nomUso, nomSubUso)) return true;
  if (u.includes('CONSUMO HUMANO') || sub.includes('CONSUMO HUMANO')) return false;
  if (u.includes('ABASTECIMIENTO') && (sub.includes('DOMEST') || sub.includes('HUMANO'))) return false;
  return true;
}

export function aplicaRecaudacionPorEpa(tipoContrato: string, tipoFacturacion: string): boolean {
  const c = (tipoContrato || '').toUpperCase();
  const f = (tipoFacturacion || '').toUpperCase();
  if (c.includes('EXCEDENTE') && c.includes('CONSUMO')) return true;
  if (c.includes('CONSUMO HUMANO') || c.includes('ABASTECIMIENTO DE AGUA POTABLE')) return false;
  if (f.includes('CONSUMO HUMANO') && !f.includes('EXCEDENTE')) return false;
  return true;
}

export function tarifaDesdeUsoRuaa(
  nomUso: string,
  caudalLs: number,
  nomSubUso?: string,
): { tarifa: number; origen: 'normativa' | 'inferida' } {
  const u = (nomUso || '').toUpperCase();

  if (esExcedenteConsumoHumano(nomUso, nomSubUso)) {
    return { tarifa: 0.0039, origen: 'normativa' };
  }
  if (u.includes('CONSUMO HUMANO')) {
    return { tarifa: 0, origen: 'normativa' };
  }

  if (u.includes('TURIST') || u.includes('RECREAT')) {
    return { tarifa: 0.0163, origen: 'normativa' };
  }
  if (u.includes('HIDROELECT')) {
    return { tarifa: 0.0049, origen: 'normativa' };
  }
  if (u.includes('ENVASADO') || u.includes('AGUA DE MESA')) {
    return { tarifa: 0.4, origen: 'normativa' };
  }
  if (u.includes('INDUSTRIAL') || u.includes('VENTA DE AGUA')) {
    return { tarifa: 0.001, origen: 'normativa' };
  }
  if (u.includes('MINER') || u.includes('PETR')) {
    return { tarifa: 0.0039, origen: 'normativa' };
  }
  if (u.includes('SOBERAN') && u.includes('RIEGO')) {
    if (caudalLs < 5) return { tarifa: 0, origen: 'normativa' };
    return { tarifa: 0.00004, origen: 'normativa' };
  }
  if (u.includes('RIEGO')) {
    return { tarifa: tarifaRiegoProductivo(caudalLs), origen: 'normativa' };
  }
  if (u.includes('ACUICULTURA') || u.includes('CAMARON')) {
    return { tarifa: 0.0007, origen: 'inferida' };
  }

  return { tarifa: 0.0007, origen: 'inferida' };
}

/** Respaldo según código de plan EPA (N010, N002, …). */
export function tarifaDesdeTipoFacturacionEpa(
  tipoFacturacion: string,
  caudalLs: number,
  tipoContrato?: string,
): { tarifa: number; origen: 'fallback_epa' } {
  const t = (tipoFacturacion || '').toUpperCase();
  if (tipoContrato && !aplicaRecaudacionPorEpa(tipoContrato, tipoFacturacion)) {
    return { tarifa: 0, origen: 'fallback_epa' };
  }
  if (t.includes('N002') || t.includes('TURISMO')) return { tarifa: 0.0163, origen: 'fallback_epa' };
  if (t.includes('N001') || t.includes('ENVASADA')) return { tarifa: 0.4, origen: 'fallback_epa' };
  if (t.includes('N008') || t.includes('INDUSTRIAL')) return { tarifa: 0.001, origen: 'fallback_epa' };
  if (t.includes('N003') || t.includes('ACUACULTURA')) return { tarifa: 0.0007, origen: 'fallback_epa' };
  if (t.includes('N010') || t.includes('RIEGO')) {
    return { tarifa: tarifaRiegoProductivo(caudalLs), origen: 'fallback_epa' };
  }
  if (t.includes('N004') || t.includes('HIDRO')) return { tarifa: 0.0049, origen: 'fallback_epa' };
  return { tarifa: 0.0007, origen: 'fallback_epa' };
}
