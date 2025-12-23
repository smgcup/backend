import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { Team } from './entities/team.entity';
import { User } from '../user/entities/user.entity';
import { Athlete } from '../athlete/entities/athlete.entity';
import { WindowInstance } from '../window-instance/entities/window-instance';
import { DateRange } from '../shared/inputs/date-range';
import { WindowType } from '../shared/inputs/window';
import { WindowScalar } from '../shared/inputs/window';
import { AthleteService } from '../athlete/athlete.service';
import { WindowInstanceService } from '../window-instance/window-instance.service';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { Account } from '../account/entities/account.entity';
import { AccountSession } from '../account/decorators/account-session.decorator';
import { UserService } from '../user/user.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Team)
export class TeamResolver {
  constructor(
    private readonly teamService: TeamService,
    private readonly athleteService: AthleteService,
    private readonly windowInstanceService: WindowInstanceService,
    private readonly userService: UserService,
  ) {}

  @Query(() => Team, { name: 'myTeam', nullable: true })
  async myTeam(@AccountSession() account: Account): Promise<Team> {
    const user = await this.userService.getUserByAccountId(account.id);
    return await this.teamService.getTeam(user.team.id);
  }
  @Query(() => Team, { name: 'team', nullable: true })
  async getTeam(@Args('id', { type: () => ID }) id: string) {
    return await this.teamService.getTeam(id);
  }

  @ResolveField(() => [User], { nullable: true })
  async users(@Parent() team: Team): Promise<User[]> {
    //? This will only be called if 'users' field is requested in the GraphQL query

    return await this.teamService.getTeamUsers(team.id);
  }
  @ResolveField(() => [Athlete], { nullable: true })
  async athletes(@Parent() team: Team): Promise<Athlete[]> {
    //? This will only be called if 'athletes' field is requested in the GraphQL query
    return await this.teamService.getTeamAthletes(team.id);
  }
  @ResolveField(() => [WindowInstance], { nullable: false })
  async windowInstances(
    @Parent() team: Team,
    @Args('dateRange', { type: () => DateRange }) dateRange: DateRange,
    @Args('window', { type: () => WindowScalar }) window: WindowType,
  ): Promise<WindowInstance[]> {
    //? Get all athletes for the team
    const athletes = await this.teamService.getTeamAthletes(team.id);
    const athleteIds = athletes.map((athlete) => athlete.id);

    //? Get daily records for all athletes in the team
    const dailyRecords = await this.athleteService.getAthletesDailyRecords(
      athleteIds,
      dateRange.startDate,
      dateRange.endDate,
    );

    //? Define the window instances periods
    const windowInstancesPeriods = this.windowInstanceService.defineWindowInstancesPeriods(window, dateRange);

    //? Create and calculate the window instances (team averages)
    return this.windowInstanceService.createWindowInstances(windowInstancesPeriods, dailyRecords);
  }
}
