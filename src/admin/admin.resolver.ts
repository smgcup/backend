import { Resolver, Mutation, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DateRange } from '../shared/inputs/date-range';
import { Args } from '@nestjs/graphql';
import { UUIDValidationPipe } from '../shared/pipes/uuid-validation.pipe';
import { Athlete } from '../athlete/entities/athlete.entity';
import { Team } from '../team/entities/team.entity';
import { TeamRegistrationLinkService } from '../team-registration-link/team-registration-link.service';
import { TeamRegistrationLink } from '../team-registration-link/entities/team-registration-link.entity';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { RolesGuard } from '../account/guards/roles.guard';
import { Roles } from '../account/decorators/roles.decorator';
import { AccountRole } from '../account/enums/role.enum';
import { User } from '../user/entities/user.entity';
import { CreateUserInput } from '../user/dto/create-user.input';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountRole.ADMIN)
export class AdminResolver {
  constructor(
    private readonly adminService: AdminService,
    private readonly teamRegistrationLinkService: TeamRegistrationLinkService,
  ) {}

  /**
   * Sync athlete historical data
   * @param dateRange - The date range to sync the athlete historical data for
   * @param athleteId - The ID of the athlete to sync the terra historical data for
   * @returns True if the athlete historical data was synced successfully
   */
  @Mutation(() => Boolean, { name: 'adminSyncAthleteTerraHistoricalData', nullable: true })
  async syncAthleteTerraHistoricalData(
    @Args('dateRange') dateRange: DateRange,
    @Args('athleteId', { type: () => ID }, UUIDValidationPipe) athleteId: Athlete['id'],
  ): Promise<void> {
    await this.adminService.syncAthleteTerraHistoricalData(dateRange, athleteId);
  }

  /**
   * Create a team registration link for a team
   * @param teamId - The ID of the team to create a registration link for
   * @returns The created team registration link
   */
  @Mutation(() => TeamRegistrationLink, { name: 'adminCreateTeamRegistrationLink', nullable: false })
  async createTeamRegistrationLink(
    @Args('teamId', { type: () => ID }, UUIDValidationPipe) teamId: Team['id'],
  ): Promise<TeamRegistrationLink> {
    return await this.teamRegistrationLinkService.createTeamRegistrationLink(teamId);
  }

  /**
   * Create a new account with role USER and creates a new user with the account ID
   * @param createUserInput - The input data for the user creation
   * @returns The created user
   */
  @Mutation(() => User, { name: 'adminCreateUser', nullable: false })
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return await this.adminService.createUser(createUserInput);
  }
}
