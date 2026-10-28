import { parseRuaaCsv } from './parse-ruaa';
import type { RuaaResumen, RuaaResumenEstado } from './types';

export type { RuaaResumen, RuaaResumenEstado };

export function buildRuaaResumen(ruaaCsv: string): RuaaResumen {
  const { rows } = parseRuaaCsv(ruaaCsv);
  const estados = new Map<string, number>();
  const byCod = new Map<string, number>();
  const byCed = new Map<string, number>();

  for (const r of rows) {
    const e = r.estadoTramite.trim().toUpperCase() || '(vacío)';
    estados.set(e, (estados.get(e) ?? 0) + 1);
    const cod = r.codigoUnico.trim() || r.codigoUnicoNorm;
    if (cod) byCod.set(cod, (byCod.get(cod) ?? 0) + 1);
    const ced = r.cedulaRuc.trim();
    if (ced) byCed.set(ced, (byCed.get(ced) ?? 0) + 1);
  }

  let filasEnCodigosRepetidos = 0;
  let codigosConMasDeUnaFila = 0;
  for (const n of byCod.values()) {
    if (n > 1) {
      codigosConMasDeUnaFila += 1;
      filasEnCodigosRepetidos += n;
    }
  }

  let cedulasConMasDeUnaFila = 0;
  for (const n of byCed.values()) {
    if (n > 1) cedulasConMasDeUnaFila += 1;
  }

  const porEstadoTramite = [...estados.entries()]
    .map(([estadoTramite, cantidad]) => ({ estadoTramite, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  return {
    totalFilas: rows.length,
    porEstadoTramite,
    codigosUnicosDistintos: byCod.size,
    codigosConMasDeUnaFila,
    filasEnCodigosRepetidos,
    cedulasConMasDeUnaFila,
  };
}
