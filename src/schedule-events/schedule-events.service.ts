import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { ScheduleEvent } from './entities/schedule-event.entity';
import { ScheduleEventFieldValue } from './entities/schedule-event-field-value.entity';
import { ScheduleEventParticipant } from './entities/schedule-event-participant.entity';
import { ScheduleEventTypeField } from './entities/schedule-event-type-field.entity';
import { CreateScheduleEventInput } from './dto/create-schedule-event.input';
import { UpdateScheduleEventInput } from './dto/update-schedule-event.input';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import { Account } from '../account/entities/account.entity';
import { ScheduleEventsTypesService } from './schedule-events-types.service';
import { ScheduleEventFieldsService } from './schedule-events-fields.service';
import { Athlete } from '../athlete/entities/athlete.entity';
import { BadRequestError } from '../exception/exceptions';
import { ATHLETE_TRANSLATION_CODES } from '../exception/translation-codes';
import { DateRange } from '../shared/inputs/date-range';

@Injectable()
export class ScheduleEventsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly scheduleEventsTypesService: ScheduleEventsTypesService,
    private readonly scheduleEventFieldsService: ScheduleEventFieldsService,
  ) {}

  async createScheduleEvent(input: CreateScheduleEventInput, account: Account): Promise<ScheduleEvent> {
    // 1. Find eventType by key
    const eventType = await this.scheduleEventsTypesService.findEventTypeByKey(input.eventTypeKey);

    // 2. Load the fields that belong to the eventType and map them by key
    const eventTypeFields = await this.scheduleEventFieldsService.loadEventTypeFields(eventType.id);
    const typeFields = Array.from(eventTypeFields.values());
    const providedFields = input.fields ?? [];

    // 3. Validate the required fields
    this.scheduleEventFieldsService.validateRequiredFields(typeFields, providedFields);

    // 4. Validate and normalize field inputs
    const normalizedFieldInputs = this.scheduleEventFieldsService.validateAndNormalizeFieldInputs(
      providedFields,
      eventTypeFields,
    );

    // 5. Validate participants if provided
    const teamId = account?.team?.id;
    if (input.participantAthleteIds && input.participantAthleteIds.length > 0) {
      if (!teamId) {
        throw new BadRequestError(
          ATHLETE_TRANSLATION_CODES.athleteNotInTeam,
          'Cannot assign participants: account has no team',
        );
      }

      // Validate that all athletes belong to the team
      const athletes = await this.dataSource.getRepository(Athlete).find({
        where: { id: In(input.participantAthleteIds), team: { id: teamId } },
      });

      if (athletes.length !== input.participantAthleteIds.length) {
        const foundIds = new Set(athletes.map((a) => a.id));
        const missingIds = input.participantAthleteIds.filter((id) => !foundIds.has(id));
        throw new BadRequestError(
          ATHLETE_TRANSLATION_CODES.athleteNotInTeam,
          `Athletes not found or not in team: ${missingIds.join(', ')}`,
        );
      }
    }

    // 6. Create event, field values, and participants in transaction
    return this.dataSource.transaction(async (manager) => {
      const event = manager.create(ScheduleEvent, {
        id: generateUuidv7(),
        teamId,
        typeId: eventType.id,
        title: input.title,
        description: input.description,
        startAt: input.startAt,
        endAt: input.endAt,
        locationText: input.locationText,
        teamEvent: input.teamEvent,
      });

      await manager.save(ScheduleEvent, event);

      if (normalizedFieldInputs.length > 0) {
        const valueEntities = normalizedFieldInputs.map(({ typeField, value }) =>
          manager.create(ScheduleEventFieldValue, {
            id: generateUuidv7(),
            eventId: event.id,
            fieldId: typeField.fieldId,
            ...value,
          }),
        );
        await manager.save(ScheduleEventFieldValue, valueEntities);
      }

      // Create participants if provided
      if (input.participantAthleteIds && input.participantAthleteIds.length > 0) {
        const participantEntities = input.participantAthleteIds.map((athleteId) =>
          manager.create(ScheduleEventParticipant, {
            eventId: event.id,
            athleteId,
          }),
        );
        await manager.save(ScheduleEventParticipant, participantEntities);
      }

      return manager.findOneOrFail(ScheduleEvent, {
        where: { id: event.id },
        relations: ['team', 'type', 'fieldValues', 'fieldValues.field', 'participants', 'participants.athlete'],
      });
    });
  }

  /**
   * Get all schedule events for a team
   * Returns: all team events (no participants) + all athlete-specific events
   * @param teamId - The team ID
   * @param dateRange - Optional date range to filter events by startAt/endAt
   * @returns Array of schedule events
   */
  async getEventsForTeam(teamId: string, dateRange?: DateRange): Promise<ScheduleEvent[]> {
    const queryBuilder = this.dataSource
      .getRepository(ScheduleEvent)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.team', 'team')
      .leftJoinAndSelect('event.type', 'type')
      .leftJoinAndSelect('event.fieldValues', 'fieldValues')
      .leftJoinAndSelect('fieldValues.field', 'field')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('participants.athlete', 'athlete')
      .where('event.teamId = :teamId', { teamId });

    // Apply date range filter if provided
    // Events that overlap with the date range (event.startAt <= dateRange.endDate AND event.endAt >= dateRange.startDate)
    if (dateRange) {
      queryBuilder.andWhere('event.startAt <= :endDate AND event.endAt >= :startDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }

    queryBuilder.orderBy('event.startAt', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Update a schedule event
   * @param input - The input for updating a schedule event
   * @param account - The account updating the schedule event
   * @returns The updated schedule event
   */
  async updateScheduleEvent(input: UpdateScheduleEventInput, account: Account): Promise<ScheduleEvent> {
    const teamId = account?.team?.id;
    if (!teamId) {
      throw new BadRequestError(ATHLETE_TRANSLATION_CODES.athleteNotInTeam, 'Account has no team');
    }

    // Find the event and verify it belongs to the team
    const existingEvent = await this.dataSource.getRepository(ScheduleEvent).findOne({
      where: { id: input.id, teamId },
      relations: ['type', 'fieldValues', 'fieldValues.field', 'participants'],
    });

    if (!existingEvent) {
      throw new BadRequestError(
        ATHLETE_TRANSLATION_CODES.athleteNotInTeam,
        'Schedule event not found or does not belong to your team',
      );
    }

    // Determine the event type (use existing if not provided)
    let eventType = existingEvent.type;
    if (input.eventTypeKey) {
      eventType = await this.scheduleEventsTypesService.findEventTypeByKey(input.eventTypeKey);
    }

    // Load the fields that belong to the eventType
    const eventTypeFields = await this.scheduleEventFieldsService.loadEventTypeFields(eventType.id);
    const typeFields = Array.from(eventTypeFields.values());
    const providedFields = input.fields ?? [];

    // Validate the required fields if fields are being updated
    if (input.fields !== undefined) {
      this.scheduleEventFieldsService.validateRequiredFields(typeFields, providedFields);
    }

    // Validate and normalize field inputs if provided
    let normalizedFieldInputs: Array<{
      typeField: ScheduleEventTypeField;
      value: Partial<ScheduleEventFieldValue>;
    }> = [];
    if (input.fields !== undefined) {
      normalizedFieldInputs = this.scheduleEventFieldsService.validateAndNormalizeFieldInputs(
        providedFields,
        eventTypeFields,
      );
    }

    // Validate participants if provided
    if (input.participantAthleteIds !== undefined && input.participantAthleteIds.length > 0) {
      const athletes = await this.dataSource.getRepository(Athlete).find({
        where: { id: In(input.participantAthleteIds), team: { id: teamId } },
      });

      if (athletes.length !== input.participantAthleteIds.length) {
        const foundIds = new Set(athletes.map((a) => a.id));
        const missingIds = input.participantAthleteIds.filter((id) => !foundIds.has(id));
        throw new BadRequestError(
          ATHLETE_TRANSLATION_CODES.athleteNotInTeam,
          `Athletes not found or not in team: ${missingIds.join(', ')}`,
        );
      }
    }

    // Update event, field values, and participants in transaction
    return this.dataSource.transaction(async (manager) => {
      // Update basic event fields
      const updateData: Partial<ScheduleEvent> = {};
      if (input.eventTypeKey !== undefined) {
        updateData.typeId = eventType.id;
      }
      if (input.title !== undefined) {
        updateData.title = input.title;
      }
      if (input.description !== undefined) {
        updateData.description = input.description;
      }
      if (input.startAt !== undefined) {
        updateData.startAt = input.startAt;
      }
      if (input.endAt !== undefined) {
        updateData.endAt = input.endAt;
      }
      if (input.locationText !== undefined) {
        updateData.locationText = input.locationText;
      }

      if (Object.keys(updateData).length > 0) {
        await manager.update(ScheduleEvent, { id: input.id }, updateData);
      }

      // Replace field values if provided
      if (input.fields !== undefined) {
        // Delete existing field values
        await manager.delete(ScheduleEventFieldValue, { eventId: input.id });

        // Create new field values
        if (normalizedFieldInputs.length > 0) {
          const valueEntities = normalizedFieldInputs.map(({ typeField, value }) =>
            manager.create(ScheduleEventFieldValue, {
              id: generateUuidv7(),
              eventId: input.id,
              fieldId: typeField.fieldId,
              ...value,
            }),
          );
          await manager.save(ScheduleEventFieldValue, valueEntities);
        }
      }

      // Replace participants if provided
      if (input.participantAthleteIds !== undefined) {
        // Delete existing participants
        await manager.delete(ScheduleEventParticipant, { eventId: input.id });

        // Create new participants
        if (input.participantAthleteIds.length > 0) {
          const participantEntities = input.participantAthleteIds.map((athleteId) =>
            manager.create(ScheduleEventParticipant, {
              eventId: input.id,
              athleteId,
            }),
          );
          await manager.save(ScheduleEventParticipant, participantEntities);
        }
      }

      return manager.findOneOrFail(ScheduleEvent, {
        where: { id: input.id },
        relations: ['team', 'type', 'fieldValues', 'fieldValues.field', 'participants', 'participants.athlete'],
      });
    });
  }

  /**
   * Delete a schedule event
   * @param eventId - The ID of the schedule event to delete
   * @param account - The account deleting the schedule event
   * @returns True if the event was deleted successfully
   */
  async deleteScheduleEvent(eventId: string, account: Account): Promise<boolean> {
    const teamId = account?.team?.id;
    if (!teamId) {
      throw new BadRequestError(ATHLETE_TRANSLATION_CODES.athleteNotInTeam, 'Account has no team');
    }

    // Find the event and verify it belongs to the team
    const existingEvent = await this.dataSource.getRepository(ScheduleEvent).findOne({
      where: { id: eventId, teamId },
    });

    if (!existingEvent) {
      throw new BadRequestError(
        ATHLETE_TRANSLATION_CODES.athleteNotInTeam,
        'Schedule event not found or does not belong to your team',
      );
    }

    // Delete event and all related data in transaction
    await this.dataSource.transaction(async (manager) => {
      // Delete field values
      await manager.delete(ScheduleEventFieldValue, { eventId });

      // Delete participants
      await manager.delete(ScheduleEventParticipant, { eventId });

      // Delete the event itself
      await manager.delete(ScheduleEvent, { id: eventId });
    });

    return true;
  }
}
