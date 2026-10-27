export const ROLES = ['TECHNICIAN', 'MANAGER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const SYNC_BATCH_STATUS = ['PENDING', 'PROCESSED', 'FAILED'] as const;
export const SYNC_OP_TYPE = ['CREATE', 'UPDATE'] as const;
export const SYNC_ENTITY = ['ABONADO', 'MEDIDOR', 'VISITA', 'LECTURA'] as const;

export const VALIDATION_STATUS = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type ValidationStatus = (typeof VALIDATION_STATUS)[number];

export const VISITA_STATUS = ['DRAFT', 'SYNCED', 'VALIDATED', 'REJECTED'] as const;

export const FOTO_TIPO = ['MEDIDOR', 'FACHADA', 'LECTURA'] as const;
export type FotoTipo = (typeof FOTO_TIPO)[number];

export const PERIODO_STATUS = ['ABIERTO', 'CERRADO'] as const;
export const FACTURA_STATUS = ['EMITIDA', 'PAGADA', 'VENCIDA', 'ANULADA'] as const;
export const METODO_PAGO = [
  'EFECTIVO',
  'TRANSFERENCIA',
  'OTRO',
  'PACIFICO_VENTANILLA',
  'PACIFICO_BANCA_WEB',
  'PACIFICO_BANCA_MOVIL',
] as const;
export const PAGO_CANAL = ['VENTANILLA', 'BANCA_WEB', 'BANCA_MOVIL', 'MANUAL'] as const;
export const COBRANZA_EMAIL_TIPO = [
  'FACTURA_EMITIDA',
  'RECORDATORIO',
  'COMPROBANTE_PAGO',
  'VENCIMIENTO',
] as const;

export const MAX_BATCH_OPS = 100;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
