import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from '../team/entities/team.entity';
import { Match } from '../match/entities/match.entity';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { Player } from '../player/entities/player.entity';
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

  async getTopPlayers(): Promise<TopPlayerOutput[]> {
    const players = await this.playerRepository.find({
      relations: ['stats', 'team'],
    });

    const sorted = players.sort((a, b) => {
      const aGoals = (a.stats?.goals ?? 0) + (a.stats?.penaltiesScored ?? 0);
      const bGoals = (b.stats?.goals ?? 0) + (b.stats?.penaltiesScored ?? 0);
      if (bGoals !== aGoals) return bGoals - aGoals;

      const aAssists = a.stats?.assists ?? 0;
      const bAssists = b.stats?.assists ?? 0;
      if (bAssists !== aAssists) return bAssists - aAssists;

      const aRedCards = a.stats?.redCards ?? 0;
      const bRedCards = b.stats?.redCards ?? 0;
      if (aRedCards !== bRedCards) return aRedCards - bRedCards;

      const aYellowCards = a.stats?.yellowCards ?? 0;
      const bYellowCards = b.stats?.yellowCards ?? 0;
      if (aYellowCards !== bYellowCards) return aYellowCards - bYellowCards;

      const aOwnGoals = a.stats?.ownGoals ?? 0;
      const bOwnGoals = b.stats?.ownGoals ?? 0;
      return aOwnGoals - bOwnGoals;
    });

    return sorted.slice(0, 5).map((player) => ({
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
