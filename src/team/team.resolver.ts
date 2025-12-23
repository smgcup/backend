import { Resolver, Query, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql';
import { TeamService } from './team.service';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { Player } from '../player/entities/player.entity';
import { PlayerService } from '../player/player.service';

@Resolver(() => Team)
export class TeamResolver {
  constructor(
    private readonly teamService: TeamService,
    private readonly playerService: PlayerService,
  ) {}

  /**
   * Query to get a team by its ID
   * @param id - The ID of the team to get
   * @returns The team with the given ID
   */
  @Query(() => Team, { name: 'teamById' })
  async teamById(@Args('id', { type: () => String }) id: string): Promise<Team> {
    return await this.teamService.getTeamById(id);
  }

  @ResolveField(() => [Player], { name: 'players' })
  async players(@Parent() team: Team): Promise<Player[]> {
    return await this.playerService.getPlayersByTeamId(team.id);
  }

  /**
   * Mutation to create a new team
   * @param createTeamDto - The data for the new team
   * @returns The newly created team
   */
  @Mutation(() => Team, { name: 'createTeam' })
  async createTeam(@Args('createTeamDto', { type: () => CreateTeamDto }) createTeamDto: CreateTeamDto): Promise<Team> {
    return await this.teamService.createTeam(createTeamDto);
  }
}
