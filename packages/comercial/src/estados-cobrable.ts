export const ESTADOS_TRAMITE_COBRABLES = new Set(['VIGENTE', 'RENOVADO']);

export function esEstadoTramiteCobrable(estado: string | null | undefined): boolean {
  if (!estado) return false;
  return ESTADOS_TRAMITE_COBRABLES.has(estado.trim().toUpperCase());
}

/** Preferencia al desempatar filas RUAA con el mismo caudal (mayor = mejor). */
export function scoreEstadoTramiteDesempate(estado: string): number {
  const e = estado.toUpperCase();
  if (e === 'VIGENTE') return 2;
  if (e === 'RENOVADO') return 1;
  return 0;
}
