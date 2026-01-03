import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
import { News } from './entities/news.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([News])],
  providers: [NewsService, NewsResolver],
  exports: [],
})
export class NewsModule {}
