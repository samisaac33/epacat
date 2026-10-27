import { normalizeCodigoUnico, parseNumeroLocale } from './normalize-codigo';
import type { RuaaRow } from './types';

export function parseRuaaCsv(text: string): { rows: RuaaRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (lines.length < 2) {
    warnings.push('RUAA: archivo vacío o sin datos');
    return { rows: [], warnings };
  }

  const headers = lines[0].split('|').map((h) => h.trim());
  const idx = (name: string) => headers.indexOf(name);

  const required = ['codigo_unico', 'estado_tramite', 'caudal_autorizado_ls', 'nom_uso_aprovechamiento'];
  for (const col of required) {
    if (idx(col) < 0) warnings.push(`RUAA: falta columna "${col}"`);
  }

  const rows: RuaaRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('|');
    if (parts.length < headers.length) {
      warnings.push(`RUAA: fila ${i + 1} con columnas incompletas`);
    }
    const get = (col: string) => (idx(col) >= 0 ? parts[idx(col)] ?? '' : '');

    const codigoUnico = get('codigo_unico').trim();
    const codigoNorm = normalizeCodigoUnico(codigoUnico);
    if (!codigoNorm && !get('cedula_ruc').trim()) continue;

    rows.push({
      ruaaId: get('ruaa_id').trim(),
      codigoUnico,
      codigoUnicoNorm: codigoNorm ?? '',
      codigoProceso: get('codigo_proceso').trim(),
      cedulaRuc: get('cedula_ruc').trim(),
      nombreUsuario: get('nom_usuario_autorizado').trim(),
      nomUsoAprovechamiento: get('nom_uso_aprovechamiento').trim(),
      nomSubUso: get('nom_sub_uso_aprovechamiento').trim(),
      caudalAutorizadoLs: parseNumeroLocale(get('caudal_autorizado_ls')),
      volumenAguaM3Anio: parseNumeroLocale(get('volumen_agua_m3_anio')),
      estadoTramite: get('estado_tramite').trim().toUpperCase(),
      cantonFuente: get('canton_fuente').trim(),
    });
  }

  return { rows, warnings };
}
