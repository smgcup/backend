import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Player } from './entities/player.entity';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

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

  @Mutation(() => Player, { name: 'updatePlayer' })
  async updatePlayer(
    @Args('id', { type: () => String }) id: string,
    @Args('updatePlayerDto', { type: () => UpdatePlayerDto }) updatePlayerDto: UpdatePlayerDto,
  ): Promise<Player> {
    return await this.playerService.updatePlayer(id, updatePlayerDto);
  }

  @Mutation(() => Player, { name: 'deletePlayer' })
  async deletePlayer(@Args('id', { type: () => String }) id: string): Promise<Player> {
    return await this.playerService.deletePlayer(id);
  }
}
