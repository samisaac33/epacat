import { buildMatchIndexes, matchEpaToRuaa } from './match-records';
import { normalizeCodigoUnico } from './normalize-codigo';
import { parseEpaReporteCsv } from './parse-epa-reporte';
import { parseRuaaCsv } from './parse-ruaa';
import type { CruceEstadisticas, EpaResumen } from './types';

export type { CruceEstadisticas, EpaResumen };

export function buildEpaResumen(epaCsv: string): EpaResumen {
  const { rows } = parseEpaReporteCsv(epaCsv);
  const codigosLiterales = new Set<string>();
  const codigosNormalizados = new Set<string>();
  let cuentasActivas = 0;
  let sinCodigoNormalizado = 0;

  for (const r of rows) {
    const lit = r.codigoUnico.trim();
    if (lit) codigosLiterales.add(lit);
    if (r.codigoUnicoNorm) codigosNormalizados.add(r.codigoUnicoNorm);
    else sinCodigoNormalizado += 1;
    if (r.estadoContrato.trim().toLowerCase() === 'activo') cuentasActivas += 1;
  }

  return {
    totalFilas: rows.length,
    cuentasActivas,
    codigosUnicosLiterales: codigosLiterales.size,
    codigosUnicosNormalizados: codigosNormalizados.size,
    sinCodigoNormalizado,
  };
}

export function buildCruceEstadisticas(epaCsv: string, ruaaCsv: string): CruceEstadisticas {
  const { rows: epaRows } = parseEpaReporteCsv(epaCsv);
  const { rows: ruaaRows } = parseRuaaCsv(ruaaCsv);

  const ruaaNorm = new Set<string>();
  for (const r of ruaaRows) {
    if (r.codigoUnicoNorm) ruaaNorm.add(r.codigoUnicoNorm);
  }

  const epaNorm = new Set<string>();
  let filasEpaConCodigoPresenteEnRuaa = 0;
  for (const e of epaRows) {
    if (e.codigoUnicoNorm) {
      epaNorm.add(e.codigoUnicoNorm);
      if (ruaaNorm.has(e.codigoUnicoNorm)) filasEpaConCodigoPresenteEnRuaa += 1;
    }
  }

  let codigosNormalizadosEnAmbos = 0;
  for (const c of epaNorm) {
    if (ruaaNorm.has(c)) codigosNormalizadosEnAmbos += 1;
  }

  const indexes = buildMatchIndexes(ruaaRows, true);
  let matchPorCodigo = 0;
  let matchPorCedula = 0;
  let matchPorCedulaNormalizada = 0;
  let matchPorCodigoEstema = 0;
  let matchBajaConfianza = 0;
  let sinMatch = 0;

  for (const epa of epaRows) {
    const m = matchEpaToRuaa(epa, indexes, undefined, true);
    if (!m) sinMatch += 1;
    else {
      if (m.method === 'codigo_unico') matchPorCodigo += 1;
      else if (m.method === 'cedula_caudal') matchPorCedula += 1;
      else if (m.method === 'cedula_normalizada') matchPorCedulaNormalizada += 1;
      else if (m.method === 'codigo_estema') matchPorCodigoEstema += 1;
      if (m.confianza === 'baja') matchBajaConfianza += 1;
    }
  }

  return {
    filasEpaConMatch: epaRows.length - sinMatch,
    matchPorCodigo,
    matchPorCedula,
    matchPorCedulaNormalizada,
    matchPorCodigoEstema,
    matchBajaConfianza,
    filasSinMatch: sinMatch,
    codigosNormalizadosEnAmbosFuentes: codigosNormalizadosEnAmbos,
    filasEpaConCodigoPresenteEnRuaa,
  };
}

/** Utilidad para comparar códigos sin parsear CSV completos. */
export function codigoNormFromLiteral(raw: string): string | null {
  return normalizeCodigoUnico(raw);
}
