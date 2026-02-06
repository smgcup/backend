import { Resolver, Query, Args, Mutation, ResolveField, Parent, Int } from '@nestjs/graphql';
import { Player } from './entities/player.entity';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerStatsService } from './player-stats.service';
import { Stats } from '../statistics/entities/stats.entity';
import { LeaderboardSortType } from './enums/leaderboard-sort-type.enum';
import { PaginatedPlayersResponse } from './dto/paginated-players-response.dto';

@Resolver(() => Player)
export class PlayerResolver {
  constructor(
    private readonly playerService: PlayerService,
    private readonly playerStatsService: PlayerStatsService,
  ) {}

  /**
   * Query to get a player by its ID
   * @param id - The ID of the player to get
   * @returns The player with the given ID
   */
  @Query(() => Player, { name: 'playerById' })
  async playerById(@Args('id', { type: () => String }) id: string): Promise<Player> {
    return await this.playerService.getPlayerById(id, { relations: ['team'] });
  }

  /**
   * Query to get players leaderboard with pagination
   * @param sortBy - The stat to sort by
   * @param page - The page number (1-indexed, defaults to 1)
   * @param limit - The number of players per page (defaults to 20)
   * @returns Paginated players response
   */
  @Query(() => PaginatedPlayersResponse, { name: 'playersLeaderboard' })
  async playersLeaderboard(
    @Args('sortBy', { type: () => LeaderboardSortType }) sortBy: LeaderboardSortType,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<PaginatedPlayersResponse> {
    return await this.playerService.getPlayersLeaderboard(sortBy, page, limit);
  }

  @ResolveField(() => Stats, { name: 'stats' })
  async stats(@Parent() player: Player) {
    return await this.playerStatsService.getAllStatsForPlayer(player);
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

  @Query(() => [Player], { name: 'topPlayers', nullable: false })
  async topPlayers() {
    return await this.playerService.getTopPlayers();
  }
}
