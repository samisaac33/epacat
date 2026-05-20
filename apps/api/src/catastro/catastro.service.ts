import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatastroService {
  constructor(private prisma: PrismaService) {}

  listAbonados(sector?: string) {
    return this.prisma.abonado.findMany({
      where: sector ? { sector } : undefined,
      include: { medidores: true },
      orderBy: { nombre: 'asc' },
      take: 100,
    });
  }

  async getAbonado(id: string) {
    const abonado = await this.prisma.abonado.findUnique({
      where: { id },
      include: { medidores: true, visitas: true },
    });
    if (!abonado) throw new NotFoundException();
    return abonado;
  }

  async getMedidor(id: string) {
    const medidor = await this.prisma.medidor.findUnique({
      where: { id },
      include: { abonado: true, lecturas: { orderBy: { fecha: 'desc' }, take: 10 } },
    });
    if (!medidor) throw new NotFoundException();
    return medidor;
  }
}
