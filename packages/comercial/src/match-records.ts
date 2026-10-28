import { scoreEstadoTramiteDesempate } from './estados-cobrable';
import { codigoStem, normalizeCodigoUnico } from './normalize-codigo';
import { normalizeIdentificacion } from './normalize-identificacion';
import type { EpaRow, MatchConfianza, MatchMethod, RuaaRow } from './types';

const CAUDAL_TOLERANCIA = 0.05;

export interface RuaaMatch {
  ruaa: RuaaRow;
  method: MatchMethod;
  confianza: MatchConfianza;
}

export function confianzaFromMethod(method: MatchMethod): MatchConfianza {
  switch (method) {
    case 'codigo_unico':
      return 'alta';
    case 'cedula_caudal':
      return 'media';
    case 'cedula_normalizada':
    case 'codigo_estema':
      return 'baja';
    default:
      return 'baja';
  }
}

export function indexRuaaByCodigo(ruaaRows: RuaaRow[]): Map<string, RuaaRow[]> {
  const map = new Map<string, RuaaRow[]>();
  for (const r of ruaaRows) {
    if (!r.codigoUnicoNorm) continue;
    const list = map.get(r.codigoUnicoNorm) ?? [];
    list.push(r);
    map.set(r.codigoUnicoNorm, list);
  }
  return map;
}

export function indexRuaaByCodigoEstema(ruaaRows: RuaaRow[]): Map<string, RuaaRow[]> {
  const map = new Map<string, RuaaRow[]>();
  for (const r of ruaaRows) {
    for (const raw of [r.codigoUnico, r.codigoProceso]) {
      const stem = codigoStem(raw);
      if (!stem) continue;
      const list = map.get(stem) ?? [];
      list.push(r);
      map.set(stem, list);
    }
  }
  return map;
}

export function indexRuaaByCedula(ruaaRows: RuaaRow[]): Map<string, RuaaRow[]> {
  const map = new Map<string, RuaaRow[]>();
  for (const r of ruaaRows) {
    const ced = r.cedulaRuc.trim();
    if (!ced) continue;
    const list = map.get(ced) ?? [];
    list.push(r);
    map.set(ced, list);
  }
  return map;
}

export function indexRuaaByCedulaNormalizada(ruaaRows: RuaaRow[]): Map<string, RuaaRow[]> {
  const map = new Map<string, RuaaRow[]>();
  for (const r of ruaaRows) {
    const ced = normalizeIdentificacion(r.cedulaRuc);
    if (!ced) continue;
    const list = map.get(ced) ?? [];
    list.push(r);
    map.set(ced, list);
  }
  return map;
}

export function pickClosestByCaudal(candidates: RuaaRow[], caudalEpa: number): RuaaRow {
  if (candidates.length === 1) return candidates[0];
  let best = candidates[0];
  let bestDiff = Math.abs(best.caudalAutorizadoLs - caudalEpa);
  for (let i = 1; i < candidates.length; i++) {
    const cand = candidates[i];
    const diff = Math.abs(cand.caudalAutorizadoLs - caudalEpa);
    if (diff < bestDiff) {
      best = cand;
      bestDiff = diff;
    } else if (diff === bestDiff) {
      const scoreCand = scoreEstadoTramiteDesempate(cand.estadoTramite);
      const scoreBest = scoreEstadoTramiteDesempate(best.estadoTramite);
      if (scoreCand > scoreBest) {
        best = cand;
      }
    }
  }
  return best;
}

function matchFromCedulaList(
  list: RuaaRow[],
  caudal: number,
  method: MatchMethod,
): RuaaMatch {
  const close = list.filter((r) => Math.abs(r.caudalAutorizadoLs - caudal) <= CAUDAL_TOLERANCIA);
  const pool = close.length ? close : list;
  const ruaa = pickClosestByCaudal(pool, caudal);
  return { ruaa, method, confianza: confianzaFromMethod(method) };
}

export interface MatchIndexes {
  byCodigo: Map<string, RuaaRow[]>;
  byCedula: Map<string, RuaaRow[]>;
  byCedulaNorm?: Map<string, RuaaRow[]>;
  byCodigoEstema?: Map<string, RuaaRow[]>;
}

export function buildMatchIndexes(ruaaRows: RuaaRow[], matchAmpliado: boolean): MatchIndexes {
  const indexes: MatchIndexes = {
    byCodigo: indexRuaaByCodigo(ruaaRows),
    byCedula: indexRuaaByCedula(ruaaRows),
  };
  if (matchAmpliado) {
    indexes.byCedulaNorm = indexRuaaByCedulaNormalizada(ruaaRows);
    indexes.byCodigoEstema = indexRuaaByCodigoEstema(ruaaRows);
  }
  return indexes;
}

export function matchEpaToRuaa(
  epa: EpaRow,
  indexes: MatchIndexes | Map<string, RuaaRow[]>,
  byCedulaLegacy?: Map<string, RuaaRow[]>,
  matchAmpliado = true,
): RuaaMatch | null {
  const idx: MatchIndexes =
    indexes instanceof Map
      ? { byCodigo: indexes, byCedula: byCedulaLegacy ?? new Map() }
      : indexes;

  const caudal = epa.caudalFijo || epa.caudalAplicable;

  if (epa.codigoUnicoNorm) {
    const list = idx.byCodigo.get(epa.codigoUnicoNorm);
    if (list?.length) {
      const ruaa = pickClosestByCaudal(list, caudal);
      return { ruaa, method: 'codigo_unico', confianza: 'alta' };
    }
  }

  const ced = epa.identificacion.trim();
  if (ced) {
    const list = idx.byCedula.get(ced);
    if (list?.length) {
      return matchFromCedulaList(list, caudal, 'cedula_caudal');
    }
  }

  if (matchAmpliado && idx.byCedulaNorm) {
    const cedNorm = normalizeIdentificacion(epa.identificacion);
    if (cedNorm) {
      const list = idx.byCedulaNorm.get(cedNorm);
      if (list?.length) {
        return matchFromCedulaList(list, caudal, 'cedula_normalizada');
      }
    }
  }

  if (matchAmpliado && idx.byCodigoEstema) {
    const stem = codigoStem(epa.codigoUnico);
    if (stem) {
      const list = idx.byCodigoEstema.get(stem);
      if (list?.length) {
        const ruaa = pickClosestByCaudal(list, caudal);
        return { ruaa, method: 'codigo_estema', confianza: 'baja' };
      }
    }
  }

  return null;
}

/** Re-normaliza código EPA por si el parser dejó variantes sin unificar. */
export function refreshEpaCodigoNorm(epa: EpaRow): void {
  const n = normalizeCodigoUnico(epa.codigoUnico);
  if (n) epa.codigoUnicoNorm = n;
}
