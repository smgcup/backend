import { Query, Resolver } from '@nestjs/graphql';
import { StatisticsService } from './statistics.service';
import { StatisticsOutput } from './dto/statistics.output';

@Resolver()
export class StatisticsResolver {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Query(() => StatisticsOutput, { name: 'statistics' })
  getStatistics(): Promise<StatisticsOutput> {
    return this.statisticsService.getStatistics();
  }
}
