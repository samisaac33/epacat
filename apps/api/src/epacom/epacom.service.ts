import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StubEpacomExporter } from '@epacat/epacom';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EpacomService {
  private exporter: StubEpacomExporter;

  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    const outbox = config.get<string>('EPACOM_OUTBOX_PATH', './storage/epacom-outbox');
    this.exporter = new StubEpacomExporter(outbox);
  }

  async enqueueExport(visitaId: string) {
    return this.prisma.epacomExportJob.create({
      data: { visitaId, status: 'PENDING' },
    });
  }

  async processJob(jobId: string) {
    const job = await this.prisma.epacomExportJob.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'PENDING') return;

    const visita = await this.prisma.visitaCampo.findUnique({
      where: { id: job.visitaId },
      include: { abonado: true, medidor: true, lecturas: true },
    });
    if (!visita) {
      await this.prisma.epacomExportJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', error: 'Visita no encontrada' },
      });
      return;
    }

    try {
      const result = await this.exporter.exportApproved({
        visitaId: visita.id,
        clientId: visita.clientId,
        lat: visita.lat,
        lng: visita.lng,
        observaciones: visita.observaciones,
        abonado: visita.abonado
          ? {
              cedula: visita.abonado.cedula,
              nombre: visita.abonado.nombre,
              direccion: visita.abonado.direccion,
              sector: visita.abonado.sector,
            }
          : null,
        medidor: visita.medidor
          ? { numeroSerie: visita.medidor.numeroSerie, marca: visita.medidor.marca }
          : null,
        lecturas: visita.lecturas.map((l) => ({
          valor: l.valor,
          fecha: l.fecha.toISOString(),
        })),
        exportedAt: new Date().toISOString(),
      });

      await this.prisma.epacomExportJob.update({
        where: { id: jobId },
        data: {
          status: 'DONE',
          outputPath: result.outputPath,
          processedAt: new Date(),
        },
      });
    } catch (err) {
      await this.prisma.epacomExportJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: err instanceof Error ? err.message : 'Error',
          processedAt: new Date(),
        },
      });
    }
  }

  async processPendingJobs() {
    const jobs = await this.prisma.epacomExportJob.findMany({
      where: { status: 'PENDING' },
      take: 10,
    });
    for (const job of jobs) {
      await this.processJob(job.id);
    }
  }
}
