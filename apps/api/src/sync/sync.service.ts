import { Injectable } from '@nestjs/common';
import {
  abonadoInputSchema,
  lecturaInputSchema,
  medidorInputSchema,
  SyncBatchInput,
  SyncBatchResult,
  visitaCampoInputSchema,
} from '@epacat/shared';
import { User, SyncBatchStatus } from '@epacat/database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async getStatus(deviceId: string) {
    const last = await this.prisma.syncBatch.findFirst({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      deviceId,
      lastBatchId: last?.clientBatchId ?? null,
      lastProcessedAt: last?.processedAt ?? null,
    };
  }

  async processBatch(user: User, input: SyncBatchInput): Promise<SyncBatchResult> {
    const existing = await this.prisma.syncBatch.findUnique({
      where: { clientBatchId: input.clientBatchId },
    });
    if (existing?.resultJson) {
      return existing.resultJson as unknown as SyncBatchResult;
    }

    const clientIdMap: Record<string, string> = {};
    const conflicts: Array<{ opId: string; reason: string }> = [];
    let accepted = 0;
    let rejected = 0;

    const batch = await this.prisma.syncBatch.create({
      data: {
        clientBatchId: input.clientBatchId,
        deviceId: input.deviceId,
        tecnicoId: user.id,
        status: SyncBatchStatus.PENDING,
        operations: {
          create: input.operations.map((op) => ({
            opId: op.opId,
            type: op.type,
            entity: op.entity,
            clientEntityId: op.clientEntityId,
            payload: op.payload as object,
          })),
        },
      },
      include: { operations: true },
    });

    for (const op of input.operations) {
      try {
        const serverId = await this.processOperation(user, op, clientIdMap);
        clientIdMap[op.clientEntityId] = serverId;
        accepted++;
        await this.prisma.syncOperation.updateMany({
          where: { batchId: batch.id, opId: op.opId },
          data: { success: true },
        });
      } catch (err) {
        rejected++;
        const reason = err instanceof Error ? err.message : 'Error desconocido';
        conflicts.push({ opId: op.opId, reason });
        await this.prisma.syncOperation.updateMany({
          where: { batchId: batch.id, opId: op.opId },
          data: { success: false, errorMessage: reason },
        });
      }
    }

    const result: SyncBatchResult = {
      clientBatchId: input.clientBatchId,
      accepted,
      rejected,
      conflicts,
      serverIds: clientIdMap,
    };

    await this.prisma.syncBatch.update({
      where: { id: batch.id },
      data: {
        status: SyncBatchStatus.PROCESSED,
        resultJson: result as object,
        processedAt: new Date(),
      },
    });

    return result;
  }

  private async processOperation(
    user: User,
    op: SyncBatchInput['operations'][0],
    clientIdMap: Record<string, string>,
  ): Promise<string> {
    switch (op.entity) {
      case 'ABONADO': {
        const data = abonadoInputSchema.parse(op.payload);
        const existing = await this.prisma.abonado.findUnique({
          where: { clientId: data.clientId },
        });
        if (existing) return existing.id;
        const created = await this.prisma.abonado.create({ data });
        return created.id;
      }
      case 'MEDIDOR': {
        const data = medidorInputSchema.parse(op.payload);
        const abonado = await this.resolveAbonado(data.abonadoClientId, clientIdMap);
        const existing = await this.prisma.medidor.findUnique({
          where: { clientId: data.clientId },
        });
        if (existing) return existing.id;
        const created = await this.prisma.medidor.create({
          data: {
            clientId: data.clientId,
            numeroSerie: data.numeroSerie,
            marca: data.marca,
            ubicacion: data.ubicacion,
            abonadoId: abonado.id,
          },
        });
        return created.id;
      }
      case 'VISITA': {
        const data = visitaCampoInputSchema.parse(op.payload);
        const existing = await this.prisma.visitaCampo.findUnique({
          where: { clientId: data.clientId },
        });
        if (existing) return existing.id;
        let abonadoId: string | undefined;
        let medidorId: string | undefined;
        if (data.abonadoClientId) {
          const ab = await this.resolveAbonado(data.abonadoClientId, clientIdMap);
          abonadoId = ab.id;
        }
        if (data.medidorClientId) {
          const med = await this.prisma.medidor.findFirst({
            where: {
              OR: [
                { clientId: data.medidorClientId },
                { id: clientIdMap[data.medidorClientId] },
              ],
            },
          });
          if (med) medidorId = med.id;
        }
        const created = await this.prisma.visitaCampo.create({
          data: {
            clientId: data.clientId,
            lat: data.lat,
            lng: data.lng,
            observaciones: data.observaciones,
            status: 'SYNCED',
            tecnicoId: user.id,
            abonadoId,
            medidorId,
          },
        });
        await this.prisma.$executeRaw`
          UPDATE "VisitaCampo"
          SET location = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)::geography
          WHERE id = ${created.id}
        `;
        await this.prisma.validacion.create({
          data: { visitaId: created.id, status: 'PENDING' },
        });
        return created.id;
      }
      case 'LECTURA': {
        const data = lecturaInputSchema.parse(op.payload);
        const medidor = await this.prisma.medidor.findFirst({
          where: {
            OR: [
              { clientId: data.medidorClientId },
              { id: clientIdMap[data.medidorClientId] },
            ],
          },
        });
        if (!medidor) throw new Error('Medidor no encontrado');
        let fotoId: string | undefined;
        if (data.fotoLocalId) {
          const foto = await this.prisma.foto.findUnique({
            where: { localPhotoId: data.fotoLocalId },
          });
          if (foto) fotoId = foto.id;
        }
        const existing = await this.prisma.lectura.findUnique({
          where: { clientId: data.clientId },
        });
        if (existing) return existing.id;
        let visitaId: string | undefined;
        if (data.visitaClientId) {
          visitaId = clientIdMap[data.visitaClientId];
          if (!visitaId) {
            const visita = await this.prisma.visitaCampo.findUnique({
              where: { clientId: data.visitaClientId },
            });
            if (visita) visitaId = visita.id;
          }
        }
        const created = await this.prisma.lectura.create({
          data: {
            clientId: data.clientId,
            valor: data.valor,
            fecha: new Date(data.fecha),
            medidorId: medidor.id,
            visitaId,
            fotoId,
          },
        });
        return created.id;
      }
      default:
        throw new Error(`Entidad no soportada: ${op.entity}`);
    }
  }

  private async resolveAbonado(clientId: string, clientIdMap: Record<string, string>) {
    const abonado = await this.prisma.abonado.findFirst({
      where: {
        OR: [{ clientId }, { id: clientIdMap[clientId] }],
      },
    });
    if (!abonado) throw new Error(`Abonado no encontrado: ${clientId}`);
    return abonado;
  }
}
