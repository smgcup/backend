import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from '../team/entities/team.entity';
import { Match } from '../match/entities/match.entity';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { Player } from '../player/entities/player.entity';
import { News } from '../news/entities/news.entity';
import { MatchStatus } from '../match/enums/match-status.enum';
import { MatchEventType } from '../match-event/enums/match-event-type.enum';
import { StatisticsOutput } from './dto/statistics.output';
import { TopPlayerOutput } from './dto/top-player.output';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async getStatistics(): Promise<StatisticsOutput> {
    const [teamsCount, playersCount, matchesCount, matchesPlayedCount, newsCount, totalGoals] = await Promise.all([
      this.teamRepository.count(),
      this.playerRepository.count(),
      this.matchRepository.count(),
      this.matchRepository.count({ where: { status: MatchStatus.FINISHED } }),
      this.newsRepository.count(),
      this.matchEventRepository.count({
        where: { type: In([MatchEventType.GOAL, MatchEventType.OWN_GOAL, MatchEventType.PENALTY_SCORED]) },
      }),
    ]);

    return {
      teamsCount,
      playersCount,
      matchesCount,
      matchesPlayedCount,
      newsCount,
      totalGoals,
    };
  }

  async getTopPlayers(): Promise<TopPlayerOutput[]> {
    const players = await this.playerRepository
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.stats', 'stats')
      .leftJoinAndSelect('player.team', 'team')
      .orderBy('COALESCE(stats.goals, 0) + COALESCE(stats.penalties_scored, 0)', 'DESC')
      .addOrderBy('COALESCE(stats.assists, 0)', 'DESC')
      .addOrderBy('COALESCE(stats.red_cards, 0)', 'ASC')
      .addOrderBy('COALESCE(stats.yellow_cards, 0)', 'ASC')
      .addOrderBy('COALESCE(stats.own_goals, 0)', 'ASC')
      .limit(5)
      .getMany();

    return players.map((player) => ({
      id: player.id,
      name: `${player.firstName} ${player.lastName}`,
      teamId: player.team.id,
      teamName: player.team.name,
      position: player.position,
      goals: (player.stats?.goals ?? 0) + (player.stats?.penaltiesScored ?? 0),
      assists: player.stats?.assists ?? 0,
      redCards: player.stats?.redCards ?? 0,
      yellowCards: player.stats?.yellowCards ?? 0,
      ownGoals: player.stats?.ownGoals ?? 0,
    }));
  }
}
