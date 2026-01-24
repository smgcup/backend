import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PlayerStats } from './entities/player-stats.entity';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { MatchEventType } from '../match-event/enums/match-event-type.enum';

@Injectable()
export class PlayerStatsService {
  constructor(
    @InjectRepository(PlayerStats)
    private readonly statsRepository: Repository<PlayerStats>,
  ) {}

  async createEmptyStats(playerId: string): Promise<PlayerStats> {
    const stats = this.statsRepository.create({ playerId });
    return this.statsRepository.save(stats);
  }

  async getStatsByPlayerId(playerId: string): Promise<PlayerStats | null> {
    return this.statsRepository.findOne({ where: { playerId } });
  }

  async handleEventCreated(event: MatchEvent, manager?: EntityManager): Promise<void> {
    const repo = manager?.getRepository(PlayerStats) ?? this.statsRepository;

    // Update player stats
    if (event.playerId) {
      await this.updateStatForEvent(event.playerId, event.type, 'increment', repo);
    }

    // Update assist stats
    if (event.assistPlayerId && event.type === MatchEventType.GOAL) {
      await repo.increment({ playerId: event.assistPlayerId }, 'assists', 1);
    }
  }

  async handleEventDeleted(event: MatchEvent, manager?: EntityManager): Promise<void> {
    const repo = manager?.getRepository(PlayerStats) ?? this.statsRepository;

    // Decrement player stats
    if (event.playerId) {
      await this.updateStatForEvent(event.playerId, event.type, 'decrement', repo);
    }

    // Decrement assist stats
    if (event.assistPlayerId && event.type === MatchEventType.GOAL) {
      await repo.decrement({ playerId: event.assistPlayerId }, 'assists', 1);
    }
  }

  private async updateStatForEvent(
    playerId: string,
    eventType: MatchEventType,
    operation: 'increment' | 'decrement',
    repo: Repository<PlayerStats>,
  ): Promise<void> {
    const statField = this.mapEventTypeToStatField(eventType);
    if (!statField) return;

    if (operation === 'increment') {
      await repo.increment({ playerId }, statField, 1);
    } else {
      await repo.decrement({ playerId }, statField, 1);
    }
  }

  private mapEventTypeToStatField(type: MatchEventType): keyof PlayerStats | null {
    switch (type) {
      case MatchEventType.GOAL:
        return 'goals';
      case MatchEventType.PENALTY_SCORED:
        return 'penaltiesScored';
      case MatchEventType.PENALTY_MISSED:
        return 'penaltiesMissed';
      case MatchEventType.YELLOW_CARD:
        return 'yellowCards';
      case MatchEventType.RED_CARD:
        return 'redCards';
      case MatchEventType.GOALKEEPER_SAVE:
        return 'goalkeeperSaves';
      default:
        return null;
    }
  }
}
