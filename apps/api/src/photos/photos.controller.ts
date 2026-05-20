import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs/promises';
import { photoUploadMetaSchema } from '@epacat/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PhotosService } from './photos.service';

@ApiTags('photos')
@Controller('photos')
export class PhotosController {
  constructor(private photosService: PhotosService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { localPhotoId: string; visitaClientId?: string; tipo: string },
  ) {
    const meta = photoUploadMetaSchema.parse({
      localPhotoId: body.localPhotoId,
      visitaClientId: body.visitaClientId || undefined,
      tipo: body.tipo,
    });
    return this.photosService.upload(file, meta);
  }

  @Get(':id')
  async serve(@Param('id') id: string, @Res() res: Response) {
    const { path: filePath } = await this.photosService.getFile(id);
    const buffer = await fs.readFile(filePath);
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  }
}
