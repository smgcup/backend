import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Player } from './entities/player.entity';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@Resolver(() => Player)
export class PlayerResolver {
  constructor(private readonly playerService: PlayerService) {}

  /**
   * Query to get a player by its ID
   * @param id - The ID of the player to get
   * @returns The player with the given ID
   */
  @Query(() => Player, { name: 'playerById' })
  async playerById(@Args('id', { type: () => String }) id: string): Promise<Player> {
    return await this.playerService.getPlayerById(id);
  }

  /**
   * Mutation to create a new player
   * @param createPlayerDto - The data for the new player
   * @returns The newly created player
   */
  @Mutation(() => Player, { name: 'createPlayer' })
  async createPlayer(
    @Args('createPlayerDto', { type: () => CreatePlayerDto }) createPlayerDto: CreatePlayerDto,
  ): Promise<Player> {
    return await this.playerService.createPlayer(createPlayerDto);
  }
}
