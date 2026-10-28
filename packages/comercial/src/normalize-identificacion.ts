/** Normaliza cédula/RUC para cruce (solo dígitos; cédula 10, RUC 13). */
export function normalizeIdentificacion(raw: string | null | undefined): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 13) return digits;
  if (digits.length === 10) return digits;
  if (digits.length > 13) return digits.slice(-13);
  return digits.replace(/^0+/, '') || digits;
}
