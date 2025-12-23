import { Resolver, Query, Args, ResolveField, Parent, ID, Mutation } from '@nestjs/graphql';
import { AthleteService } from './athlete.service';
import { Athlete } from './entities/athlete.entity';
import { Team } from '../team/entities/team.entity';
import { DateRange } from '../shared/inputs/date-range';
import { WindowScalar, WindowType } from '../shared/inputs/window';
import { WindowInstance } from '../window-instance/entities/window-instance';
import { WindowInstanceService } from '../window-instance/window-instance.service';
import { UUIDValidationPipe } from '../shared/pipes/uuid-validation.pipe';
import { RegisterAthleteInput } from './dto/register-athlete.input';
import { WearableProvider } from '../wearable-provider/entities/wearable-provider.entity';

@Resolver(() => Athlete)
export class AthleteResolver {
  constructor(
    private readonly athleteService: AthleteService,
    private readonly windowInstanceService: WindowInstanceService,
  ) {}

  @Query(() => Athlete, { name: 'athlete', nullable: true })
  async getAthlete(@Args('id', { type: () => ID }, UUIDValidationPipe) id: string) {
    return await this.athleteService.getAthlete(id);
  }

  @ResolveField(() => Team, { nullable: false })
  async team(@Parent() athlete: Athlete): Promise<Team> {
    //? This will only be called if 'team' field is requested in the GraphQL query
    return await this.athleteService.getAthleteTeam(athlete.id);
  }

  @ResolveField(() => [WindowInstance], { nullable: false })
  async windowInstances(
    @Parent() athlete: Athlete,
    @Args('dateRange', { type: () => DateRange }) dateRange: DateRange,
    @Args('window', { type: () => WindowScalar }) window: WindowType,
  ): Promise<WindowInstance[]> {
    const startDate = dateRange.startDate,
      endDate = dateRange.endDate;

    //? Get the daily records for the athlete
    const dailyRecords = await this.athleteService.getAthleteDailyRecords(athlete.id, startDate, endDate);

    //? Define the window instances periods
    const windowInstancesPeriods = this.windowInstanceService.defineWindowInstancesPeriods(window, dateRange);

    //? Create and calculate the window instances
    return this.windowInstanceService.createWindowInstances(windowInstancesPeriods, dailyRecords);
  }

  @ResolveField(() => WearableProvider, { nullable: false })
  async wearableProvider(@Parent() athlete: Athlete): Promise<WearableProvider> {
    return await this.athleteService.getAthleteWearableProvider(athlete.id);
  }

  @Mutation(() => Athlete, { name: 'registerAthlete', nullable: false })
  async registerAthlete(@Args('registerAthleteInput') registerAthleteInput: RegisterAthleteInput): Promise<Athlete> {
    return await this.athleteService.registerAthlete(registerAthleteInput);
  }
}
