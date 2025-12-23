import { Resolver, Query, Args } from '@nestjs/graphql';
import { TeamService } from './team.service';
import { Team } from './entities/team.entity';

@Resolver(() => Team)
export class TeamResolver {
  constructor(private readonly teamService: TeamService) {}

  @Query(() => Team, { name: 'teamById' })
  async teamById(@Args('id', { type: () => String }) id: string): Promise<Team> {
    return await this.teamService.getTeamById(id);
  }
}
