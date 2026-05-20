import { Injectable, NotFoundException } from '@nestjs/common';
import { ValidationStatus, Role } from '@epacat/database';
import type { ValidationDecision } from '@epacat/shared';
import { PrismaService } from '../prisma/prisma.service';
import { EpacomService } from '../epacom/epacom.service';

@Injectable()
export class ValidationService {
  constructor(
    private prisma: PrismaService,
    private epacom: EpacomService,
  ) {}

  async getQueue(status: ValidationStatus = 'PENDING', page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.validacion.findMany({
        where: { status },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          visita: {
            include: {
              tecnico: { select: { id: true, nombre: true } },
              abonado: { select: { nombre: true, cedula: true, sector: true } },
              medidor: { select: { numeroSerie: true } },
              lecturas: { select: { valor: true, fecha: true } },
              fotos: { select: { id: true, path: true, tipo: true } },
            },
          },
        },
      }),
      this.prisma.validacion.count({ where: { status } }),
    ]);

    const apiBase = process.env.API_PUBLIC_URL ?? 'http://localhost:3001';

    return {
      items: items.map((v) => ({
        id: v.id,
        status: v.status,
        comentario: v.comentario,
        createdAt: v.createdAt.toISOString(),
        visita: {
          id: v.visita.id,
          clientId: v.visita.clientId,
          lat: v.visita.lat,
          lng: v.visita.lng,
          observaciones: v.visita.observaciones,
          tecnico: v.visita.tecnico,
          abonado: v.visita.abonado,
          medidor: v.visita.medidor,
          lecturas: v.visita.lecturas.map((l) => ({
            valor: l.valor,
            fecha: l.fecha.toISOString(),
          })),
          fotos: v.visita.fotos.map((f) => ({
            id: f.id,
            url: `${apiBase}/photos/${f.id}`,
            tipo: f.tipo,
          })),
        },
      })),
      total,
      page,
      limit,
    };
  }

  async decide(id: string, decision: ValidationDecision) {
    const validacion = await this.prisma.validacion.findUnique({
      where: { id },
      include: {
        visita: {
          include: {
            abonado: true,
            medidor: true,
            lecturas: true,
          },
        },
      },
    });
    if (!validacion) throw new NotFoundException('Validación no encontrada');

    const updated = await this.prisma.$transaction(async (tx) => {
      const val = await tx.validacion.update({
        where: { id },
        data: {
          status: decision.status,
          comentario: decision.comentario,
        },
      });
      await tx.visitaCampo.update({
        where: { id: validacion.visitaId },
        data: {
          status: decision.status === 'APPROVED' ? 'VALIDATED' : 'REJECTED',
        },
      });
      return val;
    });

    if (decision.status === 'APPROVED') {
      const job = await this.epacom.enqueueExport(validacion.visitaId);
      await this.epacom.processJob(job.id);
    }

    return updated;
  }
}
