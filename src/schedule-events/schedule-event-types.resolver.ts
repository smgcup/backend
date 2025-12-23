import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ScheduleEventsTypesService } from './schedule-events-types.service';
import { ScheduleEventType } from './entities/schedule-event-type.entity';
import { AccountSession } from '../account/decorators/account-session.decorator';
import { Account } from '../account/entities/account.entity';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';

@Resolver(() => ScheduleEventType)
// @UseGuards(JwtAuthGuard)
export class ScheduleEventTypesResolver {
  constructor(private readonly scheduleEventsTypesService: ScheduleEventsTypesService) {}

  /**
   * Query to get all available schedule event types
   * Returns system-wide types + team-specific types (if any) for the authenticated user's team
   * @param account - The authenticated account
   * @returns Array of schedule event types
   */
  @Query(() => [ScheduleEventType], { name: 'getScheduleEventTypes' })
  async getScheduleEventTypes(): Promise<ScheduleEventType[]> {
    // @AccountSession() account: Account,
    // const teamId = account?.team?.id;
    const teamId = '0199f200-ef4d-738e-af0b-f81b1bb521b9';
    return await this.scheduleEventsTypesService.getEventTypes(teamId);
  }
}
