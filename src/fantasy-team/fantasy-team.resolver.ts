import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FantasyTeam } from './entities/fantasy-team.entity';
import { FantasyTeamService } from './fantasy-team.service';
import { SaveFantasyTeamDto } from './dto/save-fantasy-team.dto';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { UserSession } from '../user/decorators/user-session.decorator';
import { User } from '../user/entities/user.entity';

@Resolver(() => FantasyTeam)
export class FantasyTeamResolver {
  constructor(private readonly fantasyTeamService: FantasyTeamService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => FantasyTeam, { name: 'myFantasyTeam', nullable: true })
  async myFantasyTeam(@UserSession() user: User): Promise<FantasyTeam | null> {
    return await this.fantasyTeamService.getFantasyTeamByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => FantasyTeam, { name: 'saveFantasyTeam' })
  async saveFantasyTeam(
    @UserSession() user: User,
    @Args('input', { type: () => SaveFantasyTeamDto }) input: SaveFantasyTeamDto,
  ): Promise<FantasyTeam> {
    return await this.fantasyTeamService.saveFantasyTeam(user.id, input);
  }
}
