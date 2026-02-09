import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NewsService } from './news.service';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { AdminAuthGuard } from '../admin/auth/guards/admin-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class NewsResolver {
  constructor(private readonly newsService: NewsService) {}

  @Query(() => [News], { name: 'news' })
  async news(): Promise<News[]> {
    return await this.newsService.getNews();
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => News, { name: 'createNews' })
  async createNews(@Args('createNewsDto', { type: () => CreateNewsDto }) createNewsDto: CreateNewsDto): Promise<News> {
    return await this.newsService.createNews(createNewsDto);
  }

  @Query(() => News, { name: 'newsById' })
  async newsById(@Args('id', { type: () => String }) id: string): Promise<News> {
    return await this.newsService.getNewsById(id);
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => Boolean, { name: 'updateNews' })
  async updateNews(
    @Args('id', { type: () => String }) id: string,
    @Args('updateNewsDto') updateNewsDto: UpdateNewsDto,
  ) {
    return await this.newsService.updateNews(id, updateNewsDto);
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => News, { name: 'deleteNews' })
  async deleteNews(@Args('id', { type: () => String }) id: string): Promise<News> {
    return await this.newsService.deleteNews(id);
  }
}
