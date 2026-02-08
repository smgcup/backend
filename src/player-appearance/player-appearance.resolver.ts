import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PlayerAppearance } from './entities/player-appearance.entity';
import { PlayerAppearanceService } from './player-appearance.service';
import { UpdatePlayerAppearanceDto } from './dto/update-player-appearance.dto';
import { CreateAllPlayerAppearancesDto } from './dto/create-all-player-appearances.dto';
import { AdminAuthGuard } from '../admin/auth/guards/admin-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => PlayerAppearance)
export class PlayerAppearanceResolver {
  constructor(private readonly playerAppearanceService: PlayerAppearanceService) {}

  @Query(() => [PlayerAppearance], { name: 'playerAppearancesByMatch' })
  async playerAppearancesByMatch(@Args('matchId', { type: () => String }) matchId: string) {
    return await this.playerAppearanceService.getAppearancesByMatchId(matchId);
  }

  @Query(() => [PlayerAppearance], { name: 'playerAppearancesByPlayer' })
  async playerAppearancesByPlayer(@Args('playerId', { type: () => String }) playerId: string) {
    return await this.playerAppearanceService.getAppearancesByPlayerId(playerId);
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => [PlayerAppearance], { name: 'createAllPlayerAppearances' })
  async createAllPlayerAppearances(
    @Args('input', { type: () => CreateAllPlayerAppearancesDto }) input: CreateAllPlayerAppearancesDto,
  ) {
    return await this.playerAppearanceService.createAllAppearances(input);
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => PlayerAppearance, { name: 'updatePlayerAppearance' })
  async updatePlayerAppearance(
    @Args('input', { type: () => UpdatePlayerAppearanceDto }) input: UpdatePlayerAppearanceDto,
  ) {
    return await this.playerAppearanceService.updateAppearance(input);
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => Boolean, { name: 'deletePlayerAppearance' })
  async deletePlayerAppearance(
    @Args('matchId', { type: () => String }) matchId: string,
    @Args('playerId', { type: () => String }) playerId: string,
  ) {
    return await this.playerAppearanceService.deleteAppearance(matchId, playerId);
  }
}
