import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { TerraSyncService } from './terra-sync.service';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { RolesGuard } from '../account/guards/roles.guard';
import { Roles } from '../account/decorators/roles.decorator';
import { AccountRole } from '../account/enums/role.enum';
import { AccountSession } from '../account/decorators/account-session.decorator';
import { Account } from '../account/entities/account.entity';
import { UserService } from '../user/user.service';
import { NotFoundError } from '../exception/exceptions';
import { USER_TRANSLATION_CODES, ATHLETE_TRANSLATION_CODES } from '../exception/translation-codes';
import { TeamService } from '../team/team.service';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(AccountRole.ADMIN, AccountRole.USER)
@Resolver()
export class TerraSyncResolver {
  constructor(
    private readonly terraSyncService: TerraSyncService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    private readonly configService: ConfigService,
  ) {}

  get endDate(): Date {
    return new Date();
  }

  get startDate(): Date {
    const periodDays = this.configService.get<string>('TERRA_CONTINUES_SYNC_PERIOD_DAYS');
    if (!periodDays) {
      throw new Error('TERRA_CONTINUES_SYNC_PERIOD_DAYS is not set in the .env');
    }
    const periodDaysInt = parseInt(periodDays, 10);
    const date = new Date();
    date.setDate(date.getDate() - periodDaysInt);
    return date;
  }

  /**
   * Manual full sync for all athletes (use for the admin "Sync now" button).
   * This method triggers an async sync process and returns immediately.
   */

  // @Mutation(() => Boolean, { name: 'syncAllAthletes' })
  // syncAllAthletes(): boolean {
  //   // Start the async sync process without waiting for completion

  //   this.terraSyncService.syncAllAthletes(this.startDate, this.endDate).catch((error) => {
  //     console.error('Error in syncAllAthletes:', error);
  //   });

  //   return true; // Return immediately to indicate the sync process has started
  // }

  /**
   * Manual sync for a single athlete (useful for per-athlete action).
   * This method triggers an async sync process and returns immediately.
   */
  @Mutation(() => Boolean, { name: 'syncAthlete' })
  async syncAthlete(
    @Args('athleteId', { type: () => String }) athleteId: string,
    // @AccountSession() account: Account,
  ): Promise<boolean> {
    // const user = await this.userService.getUserByAccountId(account.id);

    // if (!user) {
    //   throw new NotFoundError(USER_TRANSLATION_CODES.userNotFound, `User with account ID ${account.id} not found`);
    // }
    // const teamAthletes = await this.teamService.getTeamAthletes(user.team.id);
    // if (!teamAthletes.some((athlete) => athlete.id === athleteId)) {
    //   throw new NotFoundError(
    //     ATHLETE_TRANSLATION_CODES.athleteNotInTeam,
    //     `Athlete with ID ${athleteId} not in team ${user.team.id}`,
    //   );
    // }
    // Start the async sync process without waiting for completion
    this.terraSyncService.syncSingleAthlete(athleteId, this.startDate, this.endDate).catch((error) => {
      console.error(`Error in syncAthlete for ${athleteId}:`, error);
    });

    return true; // Return immediately to indicate the sync process has started
  }

  /**
   * Manual sync for all athletes in a team (useful for team-wide sync action).
   * This method triggers async sync processes for each athlete and returns immediately.
   */
  @Mutation(() => Boolean, { name: 'syncTeamAthletes' })
  async syncTeamAthletes(@AccountSession() account: Account): Promise<boolean> {
    const user = await this.userService.getUserByAccountId(account.id);

    if (!user) {
      throw new NotFoundError(USER_TRANSLATION_CODES.userNotFound, `User with account ID ${account.id} not found`);
    }

    const teamAthletes = await this.teamService.getTeamAthletes(user.team.id);

    // Start the async sync process for each athlete without waiting for completion
    teamAthletes
      .filter((athlete) => athlete.terraId)
      .forEach((athlete) => {
        this.terraSyncService.syncSingleAthlete(athlete.id, this.startDate, this.endDate).catch((error) => {
          console.error(`Error in syncTeamAthletes for athlete ${athlete.id}:`, error);
        });
      });

    return true; // Return immediately to indicate the sync process has started
  }
}
