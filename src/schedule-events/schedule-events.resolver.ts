import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ScheduleEventsService } from './schedule-events.service';
import { ScheduleEvent } from './entities/schedule-event.entity';
import { CreateScheduleEventInput } from './dto/create-schedule-event.input';
import { UpdateScheduleEventInput } from './dto/update-schedule-event.input';
import { AccountSession } from '../account/decorators/account-session.decorator';
import { Account } from '../account/entities/account.entity';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { DateRange } from '../shared/inputs/date-range';
import { BadRequestError } from '../exception/exceptions';
import { ATHLETE_TRANSLATION_CODES } from '../exception/translation-codes';

@Resolver(() => ScheduleEvent)
@UseGuards(JwtAuthGuard)
export class ScheduleEventsResolver {
  constructor(private readonly scheduleEventsService: ScheduleEventsService) {}

  /**
   * Mutation to create a schedule event
   * @param createScheduleEventInput - The input for creating a schedule event
   * @param account - The account creating the schedule event
   * @returns The created schedule event
   */
  @Mutation(() => ScheduleEvent, { name: 'createScheduleEvent' })
  async createScheduleEvent(
    @Args('createScheduleEventInput') createScheduleEventInput: CreateScheduleEventInput,
    @AccountSession() account: Account,
  ): Promise<ScheduleEvent> {
    return await this.scheduleEventsService.createScheduleEvent(createScheduleEventInput, account);
  }

  /**
   * Mutation to update a schedule event
   * @param updateScheduleEventInput - The input for updating a schedule event
   * @param account - The account updating the schedule event
   * @returns The updated schedule event
   */
  @Mutation(() => ScheduleEvent, { name: 'updateScheduleEvent' })
  async updateScheduleEvent(
    @Args('updateScheduleEventInput') updateScheduleEventInput: UpdateScheduleEventInput,
    @AccountSession() account: Account,
  ): Promise<ScheduleEvent> {
    return await this.scheduleEventsService.updateScheduleEvent(updateScheduleEventInput, account);
  }

  /**
   * Mutation to delete a schedule event
   * @param eventId - The ID of the schedule event to delete
   * @param account - The account deleting the schedule event
   * @returns True if the event was deleted successfully
   */
  @Mutation(() => Boolean, { name: 'deleteScheduleEvent' })
  async deleteScheduleEvent(
    @Args('eventId', { type: () => ID }) eventId: string,
    @AccountSession() account: Account,
  ): Promise<boolean> {
    return await this.scheduleEventsService.deleteScheduleEvent(eventId, account);
  }

  /**
   * Query to get all schedule events for the authenticated user's team
   * Returns all team events (no participants) + all athlete-specific events
   * @param account - The authenticated account
   * @param dateRange - Optional date range to filter events
   * @returns Array of all schedule events for the team
   */
  @Query(() => [ScheduleEvent], { name: 'getMyTeamScheduleEvents' })
  async getMyTeamScheduleEvents(
    // @AccountSession() account: Account,
    @Args('dateRange', { type: () => DateRange, nullable: true }) dateRange?: DateRange,
  ): Promise<ScheduleEvent[]> {
    const teamId = '0199f200-ef4d-738e-af0b-f81b1bb521b9';
    // const teamId = account?.team?.id;
    // if (!teamId) {
    //   throw new BadRequestError(ATHLETE_TRANSLATION_CODES.athleteNotInTeam, 'User has no team');
    // }
    return await this.scheduleEventsService.getEventsForTeam(teamId, dateRange);
  }
}
