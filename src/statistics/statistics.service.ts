import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from '../team/entities/team.entity';
import { Match } from '../match/entities/match.entity';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { MatchStatus } from '../match/enums/match-status.enum';
import { MatchEventType } from '../match-event/enums/match-event-type.enum';
import { StatisticsOutput } from './dto/statistics.output';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
  ) {}

  async getStatistics(): Promise<StatisticsOutput> {
    const [teamsCount, matchesPlayedCount, totalGoals] = await Promise.all([
      this.teamRepository.count(),
      this.matchRepository.count({ where: { status: MatchStatus.FINISHED } }),
      this.matchEventRepository.count({
        where: { type: In([MatchEventType.GOAL, MatchEventType.OWN_GOAL, MatchEventType.PENALTY_SCORED]) },
      }),
    ]);

    return {
      teamsCount,
      matchesPlayedCount,
      totalGoals,
    };
  }
}
