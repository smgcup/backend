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
    return await this.getMatchEventsCountByPlayerIds(playerIds, [
      MatchEventType.GOALKEEPER_SAVE,
      MatchEventType.PENALTY_SAVE,
    ]);
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
   * Get league points for a team from finished matches (win=3, draw=1, defeat=0).
   */
  async getPoints(teamId: Team['id']): Promise<number> {
    const asFirst = await this.matchRepository.find({
      where: { firstOpponent: { id: teamId }, status: MatchStatus.FINISHED },
    });
    const asSecond = await this.matchRepository.find({
      where: { secondOpponent: { id: teamId }, status: MatchStatus.FINISHED },
    });
    let points = 0;
    for (const m of asFirst) {
      if (m.status !== MatchStatus.FINISHED || m.score1 == null || m.score2 == null) continue;
      if (m.score1 > m.score2) points += 3;
      else if (m.score1 === m.score2) points += 1;
    }
    for (const m of asSecond) {
      if (m.status !== MatchStatus.FINISHED || m.score1 == null || m.score2 == null) continue;
      if (m.score2 > m.score1) points += 3;
      else if (m.score1 === m.score2) points += 1;
    }
    return points;
  }

  /**
   * Head-to-head between two teams: points earned by teamIdA in finished matches vs teamIdB.
   * Returns: 1 if A is ahead, -1 if B is ahead, 0 if tie or no match.
   */
  async getHeadToHeadResult(teamIdA: string, teamIdB: string): Promise<1 | -1 | 0> {
    const matches = await this.matchRepository.find({
      where: [
        { firstOpponent: { id: teamIdA }, secondOpponent: { id: teamIdB }, status: MatchStatus.FINISHED },
        { firstOpponent: { id: teamIdB }, secondOpponent: { id: teamIdA }, status: MatchStatus.FINISHED },
      ],
      relations: { firstOpponent: true, secondOpponent: true },
    });
    let pointsA = 0;
    let pointsB = 0;
    for (const m of matches) {
      if (m.score1 == null || m.score2 == null) continue;
      const isAFirst = m.firstOpponent?.id === teamIdA;
      const scoreA = isAFirst ? m.score1 : m.score2;
      const scoreB = isAFirst ? m.score2 : m.score1;
      if (scoreA > scoreB) {
        pointsA += 3;
      } else if (scoreA < scoreB) {
        pointsB += 3;
      } else {
        pointsA += 1;
        pointsB += 1;
      }
    }
    if (pointsA > pointsB) return 1;
    if (pointsB > pointsA) return -1;
    return 0;
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
  async getWLD(teamId: Team['id']) {
    const firstOpponentMatches = await this.matchRepository.find({
      where: { firstOpponent: { id: teamId }, status: MatchStatus.FINISHED },
    });
    const secondOpponentMatches = await this.matchRepository.find({
      where: { secondOpponent: { id: teamId }, status: MatchStatus.FINISHED },
    });
    const wins = this.getWins(firstOpponentMatches, secondOpponentMatches);
    const draws = this.getDraws(firstOpponentMatches, secondOpponentMatches);
    const losses = this.getLosses(firstOpponentMatches, secondOpponentMatches);

    return { wins, draws, losses };
  }
  private getWins(firstOpponentMatches: Match[], secondOpponentMatches: Match[]) {
    return (
      firstOpponentMatches.filter((match) => match.score1 && match.score2 && match.score1 > match.score2).length +
      secondOpponentMatches.filter((match) => match.score1 && match.score2 && match.score2 > match.score1).length
    );
  }

  private getDraws(firstOpponentMatches: Match[], secondOpponentMatches: Match[]) {
    return (
      firstOpponentMatches.filter((match) => match.score1 && match.score2 && match.score1 === match.score2).length +
      secondOpponentMatches.filter((match) => match.score1 && match.score2 && match.score2 === match.score1).length
    );
  }

  private getLosses(firstOpponentMatches: Match[], secondOpponentMatches: Match[]) {
    return (
      firstOpponentMatches.filter((match) => match.score1 && match.score2 && match.score1 < match.score2).length +
      secondOpponentMatches.filter((match) => match.score1 && match.score2 && match.score2 < match.score1).length
    );
  }

  async getMatchesPlayed(teamId: Team['id']) {
    const firstOpponentMatches = await this.matchRepository.find({
      where: { firstOpponent: { id: teamId }, status: MatchStatus.FINISHED },
    });
    const secondOpponentMatches = await this.matchRepository.find({
      where: { secondOpponent: { id: teamId }, status: MatchStatus.FINISHED },
    });
    return firstOpponentMatches.length + secondOpponentMatches.length;
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
