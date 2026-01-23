import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageResolver } from './image.resolver';

@Module({
  providers: [ImageService, ImageResolver],
  exports: [ImageService],
})
export class ImageModule {}
