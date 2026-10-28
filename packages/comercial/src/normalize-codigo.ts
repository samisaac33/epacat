export function normalizeCodigoUnico(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let c = raw.trim().toUpperCase();
  if (!c || c === 'NULL') return null;
  c = c.replace(/\//g, '-');
  c = c.replace(/PENDIENTE/gi, '');
  c = c.replace(/--+/g, '-');
  c = c.replace(/^-|-$/g, '');
  if (!c.startsWith('MA-')) return c.length > 0 ? c : null;
  return c;
}

/** Tronco MA-XX-###### común en EPA (PENDIENTE) y RUAA (codigo_proceso). */
export function codigoStem(raw: string | null | undefined): string | null {
  const n = normalizeCodigoUnico(raw);
  if (!n) return null;
  const m = n.match(/^(MA-[A-Z]{2})-(\d+)/);
  if (!m) return null;
  const seg = m[2].replace(/^0+/, '') || '0';
  return `${m[1]}-${seg.padStart(6, '0')}`;
}

export function parseNumeroLocale(value: string | null | undefined): number {
  if (value == null || value === '' || value === 'NULL') return 0;
  const n = parseFloat(String(value).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
