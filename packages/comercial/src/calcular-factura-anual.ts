/** Segundos por año civil (365 días). */
export const SECONDS_PER_YEAR = 86_400 * 365;

/**
 * Volumen anual consuntivo a partir del caudal fijo (l/s).
 * volumen_m3_año = caudal_l_s × 86_400 × 365 ÷ 1_000
 */
export function volumenM3AnioDesdeCaudal(caudalLs: number): number {
  return caudalLs * (SECONDS_PER_YEAR / 1000);
}

/** Monto anual en USD. */
export function montoAnualUsd(caudalLs: number, tarifaUsdM3: number): number {
  return volumenM3AnioDesdeCaudal(caudalLs) * tarifaUsdM3;
}

/** Factura EPA en centavos de USD (columna Valor en extractos de deuda). */
export function facturaAnualCentavos(caudalLs: number, tarifaUsdM3: number): number {
  return Math.round(montoAnualUsd(caudalLs, tarifaUsdM3) * 100);
}
