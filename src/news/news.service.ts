import { Injectable } from '@nestjs/common';
import { News } from './entities/news.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { generateUuidv7 } from '../shared/utils';
import { BadRequestError, NotFoundError } from '../exception/exceptions';
import { IMAGE_TRANSLATION_CODES, NEWS_TRANSLATION_CODES } from '../exception/translation-codes';
import { ImageService } from '../image/image.service';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    private imageService: ImageService,
  ) {}

  async getNews(): Promise<News[]> {
    return await this.newsRepository.find();
  }

  async createNews(createNewsDto: CreateNewsDto): Promise<News> {
    const newsId = generateUuidv7();

    const { mimeType } = createNewsDto.image;

    const extension = mimeType?.split('/')[1];

    if (!mimeType || !extension) {
      throw new BadRequestError(IMAGE_TRANSLATION_CODES.invalidFileType);
    }
    const uploadedImage = await this.imageService.uploadFile({
      fileBase64: createNewsDto.image.fileBase64,
      fileName: `${newsId}.${extension}`,
      mimeType,
      bucket: 'bucket',
    });

    const news = this.newsRepository.create({
      id: newsId,
      createdAt: new Date(),
      imageUrl: uploadedImage.signedUrl,
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

  async updateNews(id: string, updateNewsDto: UpdateNewsDto) {
    const news = await this.getNewsById(id);
    Object.assign(news, updateNewsDto);
    if (updateNewsDto.image) {
      const { mimeType } = updateNewsDto.image;
      const extension = mimeType?.split('/')[1];
      if (!mimeType || !extension) {
        throw new BadRequestError(IMAGE_TRANSLATION_CODES.invalidFileType);
      }
      const uploadedImage = await this.imageService.uploadFile({
        fileBase64: updateNewsDto.image.fileBase64,
        fileName: `${news.id}.${extension}`,
        mimeType,
        bucket: 'bucket',
      });
      news.imageUrl = uploadedImage.signedUrl;
    }
    await this.newsRepository.save(news);
    return true;
  }

  async deleteNews(id: string): Promise<News> {
    const news = await this.getNewsById(id);
    await this.newsRepository.remove(news);
    return { ...news, id };
  }
}
