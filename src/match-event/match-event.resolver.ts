import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MatchEvent } from './entities/match-event.entity';
import { MatchEventService } from './match-event.service';
import { CreateMatchEventDto } from './dto/create-match-event.dto';

@Resolver(() => MatchEvent)
export class MatchEventResolver {
  constructor(private readonly matchEventService: MatchEventService) {}

  @Query(() => [MatchEvent], { name: 'matchEvents' })
  async matchEvents(@Args('matchId', { type: () => String }) matchId: string) {
    return await this.matchEventService.getMatchEventsByMatchId(matchId);
  }

  @Mutation(() => MatchEvent, { name: 'createMatchEvent' })
  async createMatchEvent(
    @Args('createMatchEventDto', { type: () => CreateMatchEventDto }) createMatchEventDto: CreateMatchEventDto,
  ) {
    return await this.matchEventService.createMatchEvent(createMatchEventDto);
  }

  @Mutation(() => MatchEvent, { name: 'deleteMatchEvent' })
  async deleteMatchEvent(@Args('id', { type: () => String }) id: string) {
    return await this.matchEventService.deleteMatchEvent(id);
  }
}
