import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DateRange } from '../shared/inputs/date-range';
import { Athlete } from '../athlete/entities/athlete.entity';
import { TerraHistoricalDataSessionService } from '../terra/terra-historical-data-session.service';
import { InternalServerError } from '../exception/exceptions';
import { ADMIN_TRANSLATION_CODES } from '../exception/translation-codes/admin.translation-codes';
import { CreateUserInput } from '../user/dto/create-user.input';
import { User } from '../user/entities/user.entity';
import { AccountService } from '../account/account.service';
import { AccountRole } from '../account/enums/role.enum';
import { UserService } from '../user/user.service';
import { TeamService } from '../team/team.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly terraHistoricalDataSessionService: TerraHistoricalDataSessionService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Sync athlete historical data
   * @param dateRange - The date range to sync the athlete historical data for
   * @returns True if the athlete historical data was synced successfully
   */
  async syncAthleteTerraHistoricalData(dateRange: DateRange, athleteId: Athlete['id']): Promise<void> {
    try {
      await this.terraHistoricalDataSessionService.initiateTerraHistoricalDataSession(athleteId, dateRange);
    } catch (error) {
      throw new InternalServerError(
        ADMIN_TRANSLATION_CODES.syncTerraHistoricalDataFailed,
        `Failed to sync terra historical data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a new account with role USER and creates a new user with the account ID
   * @param createUserInput - The input data for the user creation
   * @returns The created user
   */
  async createUser(createUserInput: CreateUserInput): Promise<User> {
    return await this.dataSource.transaction(async (manager) => {
      const userAccount = await this.accountService.createAccount(createUserInput, AccountRole.USER, manager);
      const user = await this.userService.createUser(createUserInput, userAccount.account, manager);
      return user;
    });
  }
}
