import { Injectable } from '@nestjs/common';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { MatchEventType } from '../match-event/enums/match-event-type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Player } from '../player/entities/player.entity';
import { Match } from '../match/entities/match.entity';
import { Team } from './entities/team.entity';
import { MatchStatus } from '../match/enums/match-status.enum';

@Injectable()
export class TeamStatsService {
  constructor(
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  private async getMatchEventsCountByPlayerIds(playerIds: Player['id'][], types: MatchEventType[]) {
    return await this.matchEventRepository.count({
      where: {
        playerId: In(playerIds),
        type: In(types),
      },
    });
  }

  async getGoals(playerIds: Player['id'][]) {
    return await this.getMatchEventsCountByPlayerIds(playerIds, [MatchEventType.GOAL, MatchEventType.PENALTY_SCORED]);
  }

  async getPenaltiesScored(playerIds: Player['id'][]) {
    return await this.getMatchEventsCountByPlayerIds(playerIds, [MatchEventType.PENALTY_SCORED]);
  }

  async getPenaltiesMissed(playerIds: Player['id'][]) {
    return await this.getMatchEventsCountByPlayerIds(playerIds, [MatchEventType.PENALTY_MISSED]);
  }

  async getAssists(playerIds: Player['id'][]) {
    return await this.matchEventRepository.count({
      where: {
        assistPlayerId: In(playerIds),
        type: MatchEventType.GOAL,
      },
    });
  }

  async getYellowCards(playerIds: Player['id'][]) {
    return await this.getMatchEventsCountByPlayerIds(playerIds, [MatchEventType.YELLOW_CARD]);
  }

  async getRedCards(playerIds: Player['id'][]) {
    return await this.getMatchEventsCountByPlayerIds(playerIds, [MatchEventType.RED_CARD]);
  }

  async getGoalkeeperSaves(playerIds: Player['id'][]) {
    return await this.getMatchEventsCountByPlayerIds(playerIds, [MatchEventType.GOALKEEPER_SAVE]);
  }

  async getOwnGoals(playerIds: Player['id'][]) {
    return await this.getMatchEventsCountByPlayerIds(playerIds, [MatchEventType.OWN_GOAL]);
  }

  async getCleanSheets(teamId: Team['id']) {
    return await this.matchRepository.count({
      where: [
        {
          firstOpponent: { id: teamId },
          score2: 0,
          status: MatchStatus.FINISHED,
        },
        {
          secondOpponent: { id: teamId },
          score1: 0,
          status: MatchStatus.FINISHED,
        },
      ],
    });
  }

  /**
   * Method to get the number of goals conceded by a team
   * @param teamId - The ID of the team to get the goals conceded for
   * @returns The number of goals conceded by the team
   */
  async getGoalsConceded(teamId: Team['id']) {
    const matchesFirstOpponent = await this.matchRepository
      .find({
        where: {
          firstOpponent: { id: teamId },
          status: MatchStatus.FINISHED,
        },
      })
      .then((matches) => matches.filter(IsMatchFinished));
    const matchesSecondOpponent = await this.matchRepository
      .find({
        where: {
          secondOpponent: { id: teamId },
          status: MatchStatus.FINISHED,
        },
      })
      .then((matches) => matches.filter(IsMatchFinished));

    return (
      matchesFirstOpponent.reduce((acc, match) => acc + match.score2, 0) +
      matchesSecondOpponent.reduce((acc, match) => acc + match.score1, 0)
    );
  }
}

/**
 * Helper function to check if a match is finished
 * @param match - The match to check
 * @returns True if the match is finished, false otherwise
 */
function IsMatchFinished(match: Match): match is Match & { score1: number; score2: number } {
  return match.status === MatchStatus.FINISHED;
}
