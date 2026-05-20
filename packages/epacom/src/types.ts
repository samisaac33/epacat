export interface EpacomVisitaPayload {
  visitaId: string;
  clientId: string;
  lat: number;
  lng: number;
  observaciones: string | null;
  abonado: {
    cedula: string;
    nombre: string;
    direccion: string;
    sector: string;
  } | null;
  medidor: {
    numeroSerie: string;
    marca: string;
  } | null;
  lecturas: Array<{ valor: number; fecha: string }>;
  exportedAt: string;
}

export interface EpacomExportResult {
  success: boolean;
  outputPath: string;
  format: 'json' | 'csv';
}

export interface EpacomExporter {
  exportApproved(visita: EpacomVisitaPayload): Promise<EpacomExportResult>;
}
