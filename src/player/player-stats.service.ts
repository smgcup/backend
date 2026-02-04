import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PlayerStats } from './entities/player-stats.entity';
import { Player } from './entities/player.entity';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { MatchEventType } from '../match-event/enums/match-event-type.enum';

@Injectable()
export class PlayerStatsService {
  constructor(
    @InjectRepository(PlayerStats)
    private readonly statsRepository: Repository<PlayerStats>,
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
  ) {}

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
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.GOAL, MatchEventType.PENALTY_SCORED]);
  }

  /**
   * Method to get the number of penalties scored a player has scored
   * @param playerId - The ID of the player to get the penalties scored for
   * @returns The number of penalties scored the player has scored
   */
  async getPenaltiesScored(playerId: Player['id']) {
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.PENALTY_SCORED]);
  }

  /**
   * Method to get the number of penalties missed a player has missed
   * @param playerId - The ID of the player to get the penalties missed for
   * @returns The number of penalties missed the player has missed
   */
  async getPenaltiesMissed(playerId: Player['id']) {
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.PENALTY_MISSED]);
  }

  /**
   * Method to get the number of assists a player has made
   * @param playerId - The ID of the player to get the assists for
   * @returns The number of assists the player has made
   */
  async getAssists(playerId: Player['id']) {
    return await this.matchEventRepository.count({
      where: {
        assistPlayerId: playerId,
        type: In([MatchEventType.GOAL, MatchEventType.PENALTY_SCORED]),
      },
    });
  }

  /**
   * Method to get the number of yellow cards a player has received
   * @param playerId - The ID of the player to get the yellow cards for
   * @returns The number of yellow cards the player has received
   */
  async getYellowCards(playerId: Player['id']) {
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.YELLOW_CARD]);
  }

  /**
   * Method to get the number of red cards a player has received
   * @param playerId - The ID of the player to get the red cards for
   * @returns The number of red cards the player has received
   */
  async getRedCards(playerId: Player['id']) {
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.RED_CARD]);
  }

  /**
   * Method to get the number of goalkeeper saves a player has made
   * @param playerId - The ID of the player to get the goalkeeper saves for
   * @returns The number of goalkeeper saves the player has made
   */
  async getGoalkeeperSaves(playerId: Player['id']) {
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.GOALKEEPER_SAVE]);
  }

  /**
   * Method to get the number of own goals a player has scored
   * @param playerId - The ID of the player to get the own goals for
   * @returns The number of own goals the player has scored
   */
  async getOwnGoals(playerId: Player['id']) {
    return await this.getMatchEventsCountByPlayerId(playerId, [MatchEventType.OWN_GOAL]);
  }
}
