import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FantasyPlayer } from './entities/fantasy-player.entity';
import { FantasyPlayerService } from './fantasy-player.service';
import { CreateFantasyPlayerDto } from './dto/create-fantasy-player.dto';
import { UpdateFantasyPlayerDto } from './dto/update-fantasy-player.dto';
import { AdminAuthGuard } from '../admin/auth/guards/admin-auth.guard';

@Resolver(() => FantasyPlayer)
export class FantasyPlayerResolver {
  constructor(private readonly fantasyPlayerService: FantasyPlayerService) {}

  @Query(() => FantasyPlayer, { name: 'fantasyPlayerByPlayerId' })
  async fantasyPlayerByPlayerId(@Args('playerId', { type: () => String }) playerId: string): Promise<FantasyPlayer> {
    return await this.fantasyPlayerService.getFantasyPlayerByPlayerId(playerId);
  }

  @Query(() => [FantasyPlayer], { name: 'fantasyPlayers' })
  async fantasyPlayers(): Promise<FantasyPlayer[]> {
    return await this.fantasyPlayerService.getAllFantasyPlayers();
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => FantasyPlayer, { name: 'createFantasyPlayer' })
  async createFantasyPlayer(
    @Args('createFantasyPlayerDto', { type: () => CreateFantasyPlayerDto })
    createFantasyPlayerDto: CreateFantasyPlayerDto,
  ): Promise<FantasyPlayer> {
    return await this.fantasyPlayerService.createFantasyPlayer(createFantasyPlayerDto);
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => FantasyPlayer, { name: 'updateFantasyPlayer' })
  async updateFantasyPlayer(
    @Args('playerId', { type: () => String }) playerId: string,
    @Args('updateFantasyPlayerDto', { type: () => UpdateFantasyPlayerDto })
    updateFantasyPlayerDto: UpdateFantasyPlayerDto,
  ): Promise<FantasyPlayer> {
    return await this.fantasyPlayerService.updateFantasyPlayer(playerId, updateFantasyPlayerDto);
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => FantasyPlayer, { name: 'deleteFantasyPlayer' })
  async deleteFantasyPlayer(@Args('playerId', { type: () => String }) playerId: string): Promise<FantasyPlayer> {
    return await this.fantasyPlayerService.deleteFantasyPlayer(playerId);
  }
}
