import { Injectable } from '@nestjs/common';
import { News } from './entities/news.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { generateUuidv7 } from '../shared/utils';
import { NotFoundError } from '../exception/exceptions';
import { NEWS_TRANSLATION_CODES } from '../exception/translation-codes';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async getNews(): Promise<News[]> {
    return await this.newsRepository.find();
  }

  async createNews(createNewsDto: CreateNewsDto): Promise<News> {
    const news = this.newsRepository.create({
      id: generateUuidv7(),
      createdAt: new Date(),
      ...createNewsDto,
    });
    return await this.newsRepository.save(news);
  }

  async getNewsById(id: string): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundError(NEWS_TRANSLATION_CODES.newsNotFound);
    }
    return news;
  }

  async updateNews(id: string, updateNewsDto: UpdateNewsDto): Promise<News> {
    const news = await this.getNewsById(id);
    Object.assign(news, updateNewsDto);
    return await this.newsRepository.save(news);
  }

  async deleteNews(id: string): Promise<News> {
    const news = await this.getNewsById(id);
    await this.newsRepository.remove(news);
    return { ...news, id };
  }
}
