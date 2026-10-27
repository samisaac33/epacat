import { scoreEstadoTramiteDesempate } from './estados-cobrable';
import type { EpaRow, MatchMethod, RuaaRow } from './types';

const CAUDAL_TOLERANCIA = 0.05;

export interface RuaaMatch {
  ruaa: RuaaRow;
  method: MatchMethod;
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

export function matchEpaToRuaa(
  epa: EpaRow,
  byCodigo: Map<string, RuaaRow[]>,
  byCedula: Map<string, RuaaRow[]>,
): RuaaMatch | null {
  const caudal = epa.caudalFijo || epa.caudalAplicable;

  if (epa.codigoUnicoNorm) {
    const list = byCodigo.get(epa.codigoUnicoNorm);
    if (list?.length) {
      const ruaa = pickClosestByCaudal(list, caudal);
      return { ruaa, method: 'codigo_unico' };
    }
  }

  const ced = epa.identificacion.trim();
  if (ced) {
    const list = byCedula.get(ced);
    if (list?.length) {
      const close = list.filter((r) => Math.abs(r.caudalAutorizadoLs - caudal) <= CAUDAL_TOLERANCIA);
      const pool = close.length ? close : list;
      const ruaa = pickClosestByCaudal(pool, caudal);
      return { ruaa, method: 'cedula_caudal' };
    }
  }

  return null;
}
