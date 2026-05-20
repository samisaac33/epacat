import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@epacat/database';
import type { GeoJsonFeatureCollection } from '@epacat/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GisService {
  constructor(private prisma: PrismaService) {}

  async getVisitasGeoJson(bbox?: string, status?: string): Promise<GeoJsonFeatureCollection> {
    let bboxFilter = Prisma.empty;
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      bboxFilter = Prisma.sql`
        AND location && ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)::geography
      `;
    }

    let statusFilter = Prisma.empty;
    if (status) {
      statusFilter = Prisma.sql`AND v.status = ${status}::"VisitaStatus"`;
    }

    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        clientId: string;
        lat: number;
        lng: number;
        status: string;
        observaciones: string | null;
        tecnicoNombre: string;
        abonadoNombre: string | null;
        validacionStatus: string | null;
      }>
    >`
      SELECT v.id, v."clientId", v.lat, v.lng, v.status::text, v.observaciones,
             u.nombre as "tecnicoNombre",
             a.nombre as "abonadoNombre",
             val.status::text as "validacionStatus"
      FROM "VisitaCampo" v
      JOIN "User" u ON u.id = v."tecnicoId"
      LEFT JOIN "Abonado" a ON a.id = v."abonadoId"
      LEFT JOIN "Validacion" val ON val."visitaId" = v.id
      WHERE v.location IS NOT NULL
      ${bboxFilter}
      ${statusFilter}
      LIMIT 500
    `;

    return {
      type: 'FeatureCollection',
      features: rows.map((r) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [r.lng, r.lat] as [number, number],
        },
        properties: {
          id: r.id,
          clientId: r.clientId,
          status: r.status,
          observaciones: r.observaciones,
          tecnicoNombre: r.tecnicoNombre,
          abonadoNombre: r.abonadoNombre,
          validacionStatus: r.validacionStatus,
        },
      })),
    };
  }

  async getVisitaDetail(id: string) {
    const visita = await this.prisma.visitaCampo.findUnique({
      where: { id },
      include: {
        tecnico: { select: { id: true, nombre: true, email: true } },
        abonado: true,
        medidor: true,
        lecturas: true,
        fotos: true,
        validacion: true,
      },
    });
    if (!visita) throw new NotFoundException();
    const apiBase = process.env.API_PUBLIC_URL ?? 'http://localhost:3001';
    return {
      ...visita,
      fotos: visita.fotos.map((f) => ({
        ...f,
        url: `${apiBase}/photos/${f.id}`,
      })),
    };
  }
}
