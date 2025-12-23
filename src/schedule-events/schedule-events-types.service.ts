import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEventType } from './entities/schedule-event-type.entity';
import { NotFoundError } from '../exception/exceptions';
import { SCHEDULE_EVENTS_TRANSLATION_CODES } from '../exception/translation-codes';

@Injectable()
export class ScheduleEventsTypesService {
  constructor(
    @InjectRepository(ScheduleEventType)
    private readonly scheduleEventTypeRepository: Repository<ScheduleEventType>,
  ) {}

  async validateEventTypeExists(id: string): Promise<void> {
    const eventType = await this.scheduleEventTypeRepository.findOne({ where: { id } });
    if (!eventType) {
      throw new NotFoundError(
        SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventTypeNotFound,
        `Schedule event type with ID ${id} not found`,
      );
    }
  }

  async findEventTypeByKey(key: string): Promise<ScheduleEventType> {
    const eventType = await this.scheduleEventTypeRepository.findOne({ where: { key } });
    if (!eventType) {
      throw new NotFoundError(
        SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventTypeNotFound,
        `Schedule event type with key "${key}" not found`,
      );
    }
    return eventType;
  }

  /**
   * Get all event types available for a team
   * Returns system-wide types (teamId is null) + team-specific types (if any)
   * @param teamId - Optional team ID to filter team-specific types
   * @returns Array of schedule event types
   */
  async getEventTypes(teamId?: string): Promise<ScheduleEventType[]> {
    const queryBuilder = this.scheduleEventTypeRepository.createQueryBuilder('eventType');

    if (teamId) {
      // Get system-wide types (teamId is null) OR team-specific types
      queryBuilder.where('eventType.teamId IS NULL OR eventType.teamId = :teamId', { teamId });
    } else {
      // Get only system-wide types if no teamId provided
      queryBuilder.where('eventType.teamId IS NULL');
    }

    queryBuilder.orderBy('eventType.isSystem', 'DESC').addOrderBy('eventType.name', 'ASC');

    return await queryBuilder.getMany();
  }
}
