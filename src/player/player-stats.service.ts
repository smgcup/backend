import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Stats } from '../statistics/entities/stats.entity';
import { Player } from './entities/player.entity';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { MatchEventType } from '../match-event/enums/match-event-type.enum';
import { PlayerPosition } from './enums/player-position.enum';
import { PlayerAppearance } from '../player-appearance/entities/player-appearance.entity';
import { Match } from '../match/entities/match.entity';
import { MatchStatus } from '../match/enums/match-status.enum';
import { NotFoundError } from '../exception/exceptions';
import { PLAYER_TRANSLATION_CODES } from '../exception/translation-codes/player.translation-codes';

export interface PlayerStats {
  goals: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  goalkeeperSaves: number;
  ownGoals: number;
  cleanSheets: number;
}

@Injectable()
export class PlayerStatsService {
  private readonly matchEventsCache = new Map<
    string,
    {
      result: MatchEvent[];
      timestamp: number;
    }
  >();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectRepository(Stats)
    private readonly statsRepository: Repository<Stats>,
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
    @InjectRepository(PlayerAppearance)
    private readonly playerAppearanceRepository: Repository<PlayerAppearance>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  private async getMatchEvents(): Promise<MatchEvent[]> {
    const cached = this.matchEventsCache.get('all');
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    const allEvents = await this.matchEventRepository.find();
    this.matchEventsCache.set('all', {
      result: allEvents,
      timestamp: now,
    });
    return allEvents;
  }

  /**
   * Optimized method to get all stats for a player in a single pass
   * @param player - The player to get the stats for
   * @returns All stats for the player
   */
  async getAllStatsForPlayer(player: Player): Promise<PlayerStats> {
    const matchEvents = await this.getMatchEvents();

    let goals = 0;
    let penaltiesScored = 0;
    let penaltiesMissed = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    let goalkeeperSaves = 0;
    let ownGoals = 0;

    for (const event of matchEvents) {
      if (event.playerId === player.id) {
        switch (event.type) {
          case MatchEventType.GOAL:
            goals++;
            break;
          case MatchEventType.PENALTY_SCORED:
            goals++;
            penaltiesScored++;
            break;
          case MatchEventType.PENALTY_MISSED:
            penaltiesMissed++;
            break;
          case MatchEventType.YELLOW_CARD:
            yellowCards++;
            break;
          case MatchEventType.RED_CARD:
            redCards++;
            break;
          case MatchEventType.GOALKEEPER_SAVE:
            goalkeeperSaves++;
            break;
          case MatchEventType.OWN_GOAL:
            ownGoals++;
            break;
        }
      }

      if (event.assistPlayerId === player.id && event.type === MatchEventType.GOAL) {
        assists++;
      }
    }

    const cleanSheets = await this.getCleanSheets(player);

    return {
      goals,
      penaltiesScored,
      penaltiesMissed,
      assists,
      yellowCards,
      redCards,
      goalkeeperSaves,
      ownGoals,
      cleanSheets,
    };
  }

  private async getMatchEventsCountByPlayerId(playerId: Player['id'], types: MatchEventType[]) {
    return await this.matchEventRepository.count({
      where: {
        playerId,
        type: In(types),
      },
    });
  }

  /**
   * Method to get the number of goals a player has scored
   * @param playerId - The ID of the player to get the goals for
   * @returns The number of goals the player has scored
   */
  async getGoals(playerId: Player['id']) {
    const matchEvents = await this.getMatchEvents();
    if (matchEvents) {
      return matchEvents.filter(
        (event) =>
          event.playerId === playerId &&
          (event.type === MatchEventType.GOAL || event.type === MatchEventType.PENALTY_SCORED),
      ).length;
    }
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.GOAL, MatchEventType.PENALTY_SCORED]);
  }

  /**
   * Method to get the number of penalties scored a player has scored
   * @param playerId - The ID of the player to get the penalties scored for
   * @returns The number of penalties scored the player has scored
   */
  async getPenaltiesScored(playerId: Player['id']) {
    const matchEvents = await this.getMatchEvents();
    if (matchEvents) {
      return matchEvents.filter((event) => event.playerId === playerId && event.type === MatchEventType.PENALTY_SCORED)
        .length;
    }
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.PENALTY_SCORED]);
  }

  /**
   * Method to get the number of penalties missed a player has missed
   * @param playerId - The ID of the player to get the penalties missed for
   * @returns The number of penalties missed the player has missed
   */
  async getPenaltiesMissed(playerId: Player['id']) {
    const matchEvents = await this.getMatchEvents();
    if (matchEvents) {
      return matchEvents.filter((event) => event.playerId === playerId && event.type === MatchEventType.PENALTY_MISSED)
        .length;
    }
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.PENALTY_MISSED]);
  }

  /**
   * Method to get the number of assists a player has made
   * @param playerId - The ID of the player to get the assists for
   * @returns The number of assists the player has made
   */
  async getAssists(playerId: Player['id']) {
    const matchEvents = await this.getMatchEvents();
    if (matchEvents) {
      return matchEvents.filter((event) => event.assistPlayerId === playerId && event.type === MatchEventType.GOAL)
        .length;
    }
    return await this.matchEventRepository.count({
      where: {
        assistPlayerId: playerId,
        type: In([MatchEventType.GOAL]),
      },
    });
  }

  /**
   * Method to get the number of yellow cards a player has received
   * @param playerId - The ID of the player to get the yellow cards for
   * @returns The number of yellow cards the player has received
   */
  async getYellowCards(playerId: Player['id']) {
    const matchEvents = await this.getMatchEvents();
    if (matchEvents) {
      return matchEvents.filter((event) => event.playerId === playerId && event.type === MatchEventType.YELLOW_CARD)
        .length;
    }
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.YELLOW_CARD]);
  }

  /**
   * Method to get the number of red cards a player has received
   * @param playerId - The ID of the player to get the red cards for
   * @returns The number of red cards the player has received
   */
  async getRedCards(playerId: Player['id']) {
    const matchEvents = await this.getMatchEvents();
    if (matchEvents) {
      return matchEvents.filter((event) => event.playerId === playerId && event.type === MatchEventType.RED_CARD)
        .length;
    }
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.RED_CARD]);
  }

  /**
   * Method to get the number of goalkeeper saves a player has made
   * @param playerId - The ID of the player to get the goalkeeper saves for
   * @returns The number of goalkeeper saves the player has made
   */
  async getGoalkeeperSaves(playerId: Player['id']) {
    const matchEvents = await this.getMatchEvents();
    if (matchEvents) {
      return matchEvents.filter((event) => event.playerId === playerId && event.type === MatchEventType.GOALKEEPER_SAVE)
        .length;
    }
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.GOALKEEPER_SAVE]);
  }

  /**
   * Method to get the number of own goals a player has scored
   * @param playerId - The ID of the player to get the own goals for
   * @returns The number of own goals the player has scored
   */
  async getOwnGoals(playerId: Player['id']) {
    const matchEvents = await this.getMatchEvents();
    if (matchEvents) {
      return matchEvents.filter((event) => event.playerId === playerId && event.type === MatchEventType.OWN_GOAL)
        .length;
    }
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.OWN_GOAL]);
  }

  /**
   * Method to get the number of clean sheets a player has kept
   * @param playerId - The ID of the player to get the clean sheets for
   * @returns The number of clean sheets the player has kept
   */
  async getCleanSheets(player: Player) {
    if (player.position !== PlayerPosition.GOALKEEPER && player.position !== PlayerPosition.DEFENDER) {
      return 0;
    }
    const matchIds = await this.playerAppearanceRepository
      .find({
        where: {
          playerId: player.id,
        },
      })
      .then((playerAppearances) => playerAppearances.map((playerAppearance) => playerAppearance.matchId));

    const teamId = player.team?.id;
    if (!teamId) {
      throw new NotFoundError(PLAYER_TRANSLATION_CODES.playerNotFound);
    }

    return await this.matchRepository.count({
      where: [
        {
          id: In(matchIds),
          firstOpponent: { id: teamId },
          score2: 0,
          status: MatchStatus.FINISHED,
        },
        {
          id: In(matchIds),
          secondOpponent: { id: teamId },
          score1: 0,
          status: MatchStatus.FINISHED,
        },
      ],
    });
  }
}
