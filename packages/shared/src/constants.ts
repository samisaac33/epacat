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

export const EPACOM_JOB_STATUS = ['PENDING', 'DONE', 'FAILED'] as const;

export const MAX_BATCH_OPS = 100;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
