export type TarifaOrigen = 'normativa' | 'inferida' | 'fallback_epa';

export type MatchMethod = 'codigo_unico' | 'cedula_caudal' | 'none';

export interface RuaaRow {
  ruaaId: string;
  codigoUnico: string;
  codigoUnicoNorm: string;
  codigoProceso: string;
  cedulaRuc: string;
  nombreUsuario: string;
  nomUsoAprovechamiento: string;
  nomSubUso: string;
  caudalAutorizadoLs: number;
  volumenAguaM3Anio: number;
  estadoTramite: string;
  cantonFuente: string;
}

export interface EpaRow {
  fechaRegistro: string;
  cuentaUsuario: string;
  tipoContrato: string;
  identificacion: string;
  razonSocial: string;
  estadoContrato: string;
  tipoFacturacion: string;
  codigoUnico: string;
  codigoUnicoNorm: string;
  planificacion: string;
  cantonContrato: string;
  caudalAplicable: number;
  caudalFijo: number;
  excluidoCatastro: boolean;
  excluidoManual: boolean;
  excluidoPeriodica: boolean;
}

export interface AnalisisFila {
  cuentaUsuario: string;
  razonSocial: string;
  identificacion: string;
  codigoUnico: string;
  codigoUnicoNorm: string;
  estadoContratoEpa: string;
  estadoTramiteRuaa: string | null;
  matchMethod: MatchMethod;
  nomUsoRuaa: string | null;
  caudalFijoLs: number;
  tarifaUsdM3: number;
  tarifaOrigen: TarifaOrigen;
  montoTeoricoAnualUsd: number;
  montoTeoricoAnualCentavos: number;
  debeCobrar: boolean;
  montoCobradoAsumidoUsd: number;
  sobreRecaudacionUsd: number;
  desalineacionEpaActivo: boolean;
  excluidoFacturacion: boolean;
}

export interface AnalisisResumen {
  totalFilasEpa: number;
  filasConCruce: number;
  filasSinCruce: number;
  cuentasEpaActivas: number;
  desalineacionesEpaActivoNoVigente: number;
  montoCobradoAsumidoTotalUsd: number;
  montoDebeCobrarTotalUsd: number;
  sobreRecaudacionTotalUsd: number;
}

export interface AnalisisPorEstado {
  estadoTramite: string;
  /** Cuentas EPA con match a este estado RUAA. */
  cantidad: number;
  /** Cuentas en las que aplica recaudación (debeCobrar). */
  cantidadDebeCobrar: number;
  montoDebeCobrarUsd: number;
  montoCobradoAsumidoUsd: number;
  /** Caudal × tarifa inferida (referencia; no es monto legal de cobro). */
  montoTeoricoAnualUsd: number;
  esEstadoCobrable: boolean;
}

/** Conteos para gráfico de cobertura (incluye fila sin cruce). */
export interface AnalisisDistribucionCruce {
  clave: string;
  etiqueta: string;
  cantidad: number;
  esEstadoCobrable: boolean;
}

/** Tabla de montos alineada con los KPI de recaudación. */
export interface AnalisisMontoRegla {
  clave: string;
  etiqueta: string;
  descripcion: string;
  cantidad: number;
  montoUsd: number;
}

export interface AnalisisResult {
  resumen: AnalisisResumen;
  filas: AnalisisFila[];
  sinCruce: AnalisisFila[];
  porEstadoTramite: AnalisisPorEstado[];
  distribucionCruce: AnalisisDistribucionCruce[];
  montosPorRegla: AnalisisMontoRegla[];
  parseWarnings: string[];
}

export interface AnalisisSnapshotMeta {
  id: string;
  titulo: string;
  descripcion: string;
  generatedAt: string;
  criterioCobro: string;
  fuenteRuaa: string;
  fuenteEpa: string;
  fechaReporteEpa: string | null;
}

export interface AnalisisSnapshot {
  meta: AnalisisSnapshotMeta;
  result: AnalisisResult;
}

export const SNAPSHOT_FILENAME = 'analisis-manabi.snapshot.json';
