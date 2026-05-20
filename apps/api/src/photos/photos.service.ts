import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FotoTipo } from '@epacat/database';
import { PrismaService } from '../prisma/prisma.service';
import { MAX_PHOTO_BYTES } from '@epacat/shared';

@Injectable()
export class PhotosService {
  private storagePath: string;

  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    this.storagePath = config.get<string>('STORAGE_PATH', './storage/uploads');
  }

  async upload(
    file: Express.Multer.File,
    meta: { localPhotoId: string; visitaClientId?: string; tipo: FotoTipo },
  ) {
    if (!file) throw new BadRequestException('Archivo requerido');
    if (file.size > MAX_PHOTO_BYTES) {
      throw new BadRequestException('Foto excede 5MB');
    }

    let visitaId: string | undefined;
    if (meta.visitaClientId) {
      const visita = await this.prisma.visitaCampo.findUnique({
        where: { clientId: meta.visitaClientId },
      });
      if (!visita) throw new NotFoundException('Visita no encontrada');
      visitaId = visita.id;
    }

    if (!visitaId) {
      const placeholder = await this.prisma.visitaCampo.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (!placeholder) throw new BadRequestException('No hay visita para asociar la foto');
      visitaId = placeholder.id;
    }

    await fs.mkdir(this.storagePath, { recursive: true });
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${meta.localPhotoId}${ext}`;
    const filePath = path.join(this.storagePath, filename);
    await fs.writeFile(filePath, file.buffer);

    const foto = await this.prisma.foto.upsert({
      where: { localPhotoId: meta.localPhotoId },
      update: { path: filePath, tipo: meta.tipo },
      create: {
        localPhotoId: meta.localPhotoId,
        path: filePath,
        tipo: meta.tipo,
        visitaId,
      },
    });

    return {
      id: foto.id,
      localPhotoId: foto.localPhotoId,
      url: `/photos/${foto.id}`,
    };
  }

  async getFile(id: string) {
    const foto = await this.prisma.foto.findUnique({ where: { id } });
    if (!foto) throw new NotFoundException();
    return { path: foto.path, foto };
  }
}
