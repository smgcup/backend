import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TeamService } from '../team/team.service';
import { TriggeredAcuteSymptom } from './entities/triggered-acute-symptom.entity';
import { TriggeredAcuteSymptomService } from './triggered-acute-symptom.service';
import { AccountSession } from '../account/decorators/account-session.decorator';
import { Account } from '../account/entities/account.entity';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { NotFoundError } from '../exception/exceptions';
import { USER_TRANSLATION_CODES } from '../exception/translation-codes';
import { TriggeredAcuteSymptomStatus } from './enums/triggered-acute-symptom-status.enum';

@Resolver(() => TriggeredAcuteSymptom)
@UseGuards(JwtAuthGuard)
export class TriggeredAcuteSymptomResolver {
  constructor(
    private readonly triggeredAcuteSymptomService: TriggeredAcuteSymptomService,
    private readonly userService: UserService,
    private readonly teamService: TeamService,
  ) {}

  /**
   * Gets the triggered acute symptoms
   * @returns The triggered acute symptoms
   */
  @Query(() => [TriggeredAcuteSymptom], { name: 'myTeamTriggeredAcuteSymptoms', nullable: false })
  async getMyTeamTriggeredAcuteSymptoms(@AccountSession() account: Account): Promise<TriggeredAcuteSymptom[]> {
    const user = await this.userService.getUserByAccountId(account.id);

    if (!user) {
      throw new NotFoundError(USER_TRANSLATION_CODES.userNotFound, `User with account ID ${account.id} not found`);
    }

    const teamAthletes = await this.teamService.getTeamAthletes(user.team.id);
    const athleteIds = teamAthletes.map((athlete) => athlete.id);

    return await this.triggeredAcuteSymptomService.getMyTeamTriggeredAcuteSymptoms(athleteIds);
  }

  /**
   * Takes action on the triggered acute symptoms
   * @param ids - The IDs of the triggered acute symptoms to close
   * @param status - The status to take action on the triggered acute symptoms
   * @returns The triggered acute symptoms with the action taken
   */
  @Mutation(() => [TriggeredAcuteSymptom], { name: 'takeActionOnTriggeredAcuteSymptoms', nullable: false })
  async takeActionOnTriggeredAcuteSymptoms(
    @Args('ids', { type: () => [ID] }) ids: string[],
    @Args('status', { type: () => TriggeredAcuteSymptomStatus }) status: TriggeredAcuteSymptomStatus,
  ): Promise<TriggeredAcuteSymptom[]> {
    return await this.triggeredAcuteSymptomService.takeActionOnTriggeredAcuteSymptoms(ids, status);
  }
}
