import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { MatchService } from './match.service';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Resolver(() => Match)
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}

  @Query(() => [Match], { name: 'matches' })
  async matches(): Promise<Match[]> {
    return await this.matchService.getMatches();
  }

  @Query(() => Match, { name: 'matchById', nullable: false })
  async matchById(@Args('id', { type: () => String }) id: string): Promise<Match> {
    return await this.matchService.getMatchById(id);
  }

  @Mutation(() => Match, { name: 'createMatch' })
  async createMatch(
    @Args('createMatchDto', { type: () => CreateMatchDto }) createMatchDto: CreateMatchDto,
  ): Promise<Match> {
    return await this.matchService.createMatch(createMatchDto);
  }

  @Mutation(() => Match, { name: 'updateMatch' })
  async updateMatch(
    @Args('id', { type: () => String }) id: string,
    @Args('updateMatchDto', { type: () => UpdateMatchDto }) updateMatchDto: UpdateMatchDto,
  ): Promise<Match> {
    return await this.matchService.updateMatch(id, updateMatchDto);
  }

  @Mutation(() => Match, { name: 'deleteMatch' })
  async deleteMatch(@Args('id', { type: () => String }) id: string): Promise<Match> {
    return await this.matchService.deleteMatch(id);
  }
}
