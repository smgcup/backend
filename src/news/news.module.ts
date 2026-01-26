import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
import { News } from './entities/news.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageModule } from '../image/image.module';
import { ImageService } from '../image/image.service';
@Module({
  imports: [TypeOrmModule.forFeature([News]), ImageModule],
  providers: [NewsService, NewsResolver, ImageService],
  exports: [],
})
export class NewsModule {}
