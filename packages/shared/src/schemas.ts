import { z } from 'zod';
import {
  FOTO_TIPO,
  ROLES,
  SYNC_ENTITY,
  SYNC_OP_TYPE,
  VALIDATION_STATUS,
  VISITA_STATUS,
} from './constants';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const abonadoInputSchema = z.object({
  clientId: z.string().uuid(),
  cedula: z.string().min(5).max(20),
  nombre: z.string().min(2).max(200),
  direccion: z.string().min(3).max(500),
  sector: z.string().min(1).max(100),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  ruc: z.string().min(10).max(20).optional(),
});

export const medidorInputSchema = z.object({
  clientId: z.string().uuid(),
  abonadoClientId: z.string().uuid(),
  numeroSerie: z.string().min(1).max(50),
  marca: z.string().min(1).max(50),
  ubicacion: z.string().optional(),
});

export const lecturaInputSchema = z.object({
  clientId: z.string().uuid(),
  medidorClientId: z.string().uuid(),
  visitaClientId: z.string().uuid().optional(),
  valor: z.number().nonnegative(),
  fecha: z.string().datetime(),
  fotoLocalId: z.string().uuid().optional(),
});

export const visitaCampoInputSchema = z.object({
  clientId: z.string().uuid(),
  abonadoClientId: z.string().uuid().optional(),
  medidorClientId: z.string().uuid().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  observaciones: z.string().max(1000).optional(),
  status: z.enum(VISITA_STATUS).default('DRAFT'),
});

export const syncOperationSchema = z.object({
  opId: z.string().uuid(),
  type: z.enum(SYNC_OP_TYPE),
  entity: z.enum(SYNC_ENTITY),
  clientEntityId: z.string().uuid(),
  payload: z.record(z.unknown()),
});

export const syncBatchInputSchema = z.object({
  clientBatchId: z.string().uuid(),
  deviceId: z.string().min(1).max(100),
  operations: z.array(syncOperationSchema).min(1).max(100),
});

export const validationDecisionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comentario: z.string().max(500).optional(),
});

export const registrarPagoSchema = z.object({
  monto: z.number().positive(),
  metodo: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'OTRO']),
  referencia: z.string().max(200).optional(),
  fecha: z.string().datetime().optional(),
});

export const recaudacionPagoSchema = z.object({
  transaccionId: z.string().min(1).max(100),
  identificacion: z.string().min(5).max(20),
  referencia: z.string().min(1).max(50),
  monto: z.number().positive(),
  canal: z.enum(['VENTANILLA', 'BANCA_WEB', 'BANCA_MOVIL']),
  fechaPago: z.string().datetime().optional(),
});

export const recaudacionReversoSchema = z.object({
  transaccionId: z.string().min(1).max(100),
  motivo: z.string().max(500).optional(),
});

export const tarifaInputSchema = z.object({
  nombre: z.string().min(1).max(100),
  cargoFijo: z.number().nonnegative(),
  precioM3: z.number().nonnegative(),
});

export const photoUploadMetaSchema = z.object({
  localPhotoId: z.string().uuid(),
  visitaClientId: z.string().uuid().optional(),
  tipo: z.enum(FOTO_TIPO),
});

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  nombre: z.string(),
  role: z.enum(ROLES),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AbonadoInput = z.infer<typeof abonadoInputSchema>;
export type MedidorInput = z.infer<typeof medidorInputSchema>;
export type LecturaInput = z.infer<typeof lecturaInputSchema>;
export type VisitaCampoInput = z.infer<typeof visitaCampoInputSchema>;
export type SyncOperation = z.infer<typeof syncOperationSchema>;
export type SyncBatchInput = z.infer<typeof syncBatchInputSchema>;
export type ValidationDecision = z.infer<typeof validationDecisionSchema>;
export type RegistrarPagoInput = z.infer<typeof registrarPagoSchema>;
export type RecaudacionPagoInput = z.infer<typeof recaudacionPagoSchema>;
export type RecaudacionReversoInput = z.infer<typeof recaudacionReversoSchema>;
export type TarifaInput = z.infer<typeof tarifaInputSchema>;

export interface SyncBatchResult {
  clientBatchId: string;
  accepted: number;
  rejected: number;
  conflicts: Array<{ opId: string; reason: string }>;
  serverIds: Record<string, string>;
}

export interface ValidationQueueItem {
  id: string;
  status: (typeof VALIDATION_STATUS)[number];
  comentario: string | null;
  createdAt: string;
  visita: {
    id: string;
    clientId: string;
    lat: number;
    lng: number;
    observaciones: string | null;
    tecnico: { id: string; nombre: string };
    abonado: { nombre: string; cedula: string; sector: string } | null;
    medidor: { numeroSerie: string } | null;
    lecturas: Array<{ valor: number; fecha: string }>;
    fotos: Array<{ id: string; url: string; tipo: string }>;
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: Record<string, unknown>;
  }>;
}
