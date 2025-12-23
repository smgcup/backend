import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Athlete } from './entities/athlete.entity';
import { Team } from '../team/entities/team.entity';
import { AthleteDailyRecord } from './entities/athlete-daily-record.entity';
import { RegisterAthleteInput } from './dto/register-athlete.input';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import { TeamRegistrationLinkService } from '../team-registration-link/team-registration-link.service';
import { NotFoundError, ConflictError } from '../exception/exceptions';
import { AthleteActionType } from './enums/athlete-action-type.enum';
import { constructAthleteActionLog } from './helpers/create-athlete-action-log.helper';
import { AthleteActionLogService } from './athlete-action-log.service';
import { AccountService } from '../account/account.service';
import { AccountRole } from '../account/enums/role.enum';
import { Account } from '../account/entities/account.entity';
import { TEAM_TRANSLATION_CODES, ATHLETE_TRANSLATION_CODES } from '../exception/translation-codes';
import { WearableProvider } from '../wearable-provider/entities/wearable-provider.entity';
import { WearableProviderService } from '../wearable-provider/wearable-provider.service';
import { WearableProviderEnum } from '../wearable-provider/enums/wearable-provider.enum';

@Injectable()
export class AthleteService {
  constructor(
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(WearableProvider)
    private wearableProviderRepository: Repository<WearableProvider>,
    private wearableProviderService: WearableProviderService,
    @InjectRepository(AthleteDailyRecord)
    private dailyRecordRepository: Repository<AthleteDailyRecord>,
    private teamRegistrationLinkService: TeamRegistrationLinkService,
    private athleteActionLogService: AthleteActionLogService,
    private accountService: AccountService,
  ) {}

  async getAthlete(id: string): Promise<Athlete> {
    const athlete = await this.athleteRepository.findOne({
      where: { id },
    });
    if (!athlete) {
      throw new NotFoundError(ATHLETE_TRANSLATION_CODES.athleteNotFound, `Athlete with ID ${id} not found`);
    }
    return athlete;
  }

  async getAthleteTeam(athleteId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { athletes: { id: athleteId } },
    });
    if (!team) {
      throw new NotFoundError(TEAM_TRANSLATION_CODES.teamNotFoundForAthlete, `Team not found for athlete ${athleteId}`);
    }
    return team;
  }

  /**
   * Gets the daily records for multiple athletes within a given date range.
   * @param athleteIds - Array of athlete IDs to get the daily records for
   * @param startDate - The start date of the date range
   * @param endDate - The end date of the date range
   * @returns The daily records for all athletes within the given date range
   * @example
   * ```typescript
   * const dailyRecords = await this.athleteService.getAthletesDailyRecords(['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'], new Date('2024-01-01'), new Date('2024-01-31'));
   * // Returns the daily records for the two athletes within the given date range
   * // [
   * //   { date: '2024-01-01', recovery: 0.5, strain: 0.3, ... },
   * //   { date: '2024-01-02', recovery: 0.6, strain: 0.4, ... },
   * //   ...
   * // ]
   * ```
   */
  async getAthletesDailyRecords(athleteIds: string[], startDate: Date, endDate: Date): Promise<AthleteDailyRecord[]> {
    // Normalize dates to start of day to ensure proper comparison
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);

    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    const result = await this.dailyRecordRepository.find({
      where: {
        athleteId: In(athleteIds),
        date: Between(normalizedStartDate, normalizedEndDate),
      },
      order: {
        date: 'ASC',
      },
    });

    return result.map((record) => ({
      ...record,
      recovery: record.recovery ? parseFloat(record.recovery.toString()) : null,
      strain: record.strain ? parseFloat(record.strain.toString()) : null,
    }));
  }

  /**
   * Gets the daily records for an athlete within a given date range.
   * @param athleteId - The ID of the athlete to get the daily records for
   * @param startDate - The start date of the date range
   * @param endDate - The end date of the date range
   * @returns The daily records for the athlete within the given date range
   * @example
   * ```typescript
   * const dailyRecords = await this.athleteService.getAthleteDailyRecords('123e4567-e89b-12d3-a456-426614174000', new Date('2024-01-01'), new Date('2024-01-31'));
   * // Returns the daily records for the athlete within the given date range
   * // [
   * //   { date: '2024-01-01', recovery: 0.5, strain: 0.3, ... },
   * //   { date: '2024-01-02', recovery: 0.6, strain: 0.4, ... },
   * //   ...
   */
  async getAthleteDailyRecords(athleteId: string, startDate: Date, endDate: Date): Promise<AthleteDailyRecord[]> {
    // Normalize dates to start of day to ensure proper comparison
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);

    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    const result = await this.dailyRecordRepository.find({
      where: {
        athleteId,
        date: Between(normalizedStartDate, normalizedEndDate),
      },
      order: {
        date: 'ASC',
      },
    });
    return result.map((record) => ({
      ...record,
      recovery: record.recovery ? parseFloat(record.recovery.toString()) : null, //? Typeorm returns a string becasue it's a decimal field
      strain: record.strain ? parseFloat(record.strain.toString()) : null, //? Typeorm returns a string becasue it's a decimal field
    }));
  }

  /** Creates a new athlete and creates a new athlete account
   *
   * @param input - The input data for the athlete registration
   * @returns The registered athlete
   * @example
   */
  async registerAthlete(registerAthleteInput: RegisterAthleteInput): Promise<Athlete> {
    const registrationToken = registerAthleteInput.token;
    const team = await this.teamRegistrationLinkService.getTeamByRegistrationLinkToken(registrationToken);

    // Check for duplicates in parallel (email and phoneNumber in both tables)
    const [existingAthleteByEmail, existingAthleteByPhone] = await Promise.all([
      this.athleteRepository.findOne({
        where: { email: registerAthleteInput.email },
      }),
      this.athleteRepository.findOne({
        where: { phoneNumber: registerAthleteInput.phoneNumber },
      }),
    ]);

    // TODO: Figure out what the logic should be if the provided email or phone number is already in in the athlete-registration-in-process table
    if (existingAthleteByEmail) {
      throw new ConflictError(
        ATHLETE_TRANSLATION_CODES.athleteEmailAlreadyInUse,
        `Email ${registerAthleteInput.email} is already in use`,
      );
    }

    if (existingAthleteByPhone) {
      throw new ConflictError(
        ATHLETE_TRANSLATION_CODES.athletePhoneNumberAlreadyInUse,
        `Phone number ${registerAthleteInput.phoneNumber} is already in use`,
      );
    }

    const createdAccountResponse = await this.accountService.createAccount(
      {
        email: registerAthleteInput.email,
        password: registerAthleteInput.password,
      },
      AccountRole.ATHLETE,
    );

    const wearableProvider = await this.wearableProviderService.createWearableProvider(WearableProviderEnum.WHOOP);

    const athlete = {
      id: generateUuidv7(),
      account: createdAccountResponse.account,
      firstName: registerAthleteInput.firstName,
      lastName: registerAthleteInput.lastName,
      email: registerAthleteInput.email,
      phoneNumber: registerAthleteInput.phoneNumber,
      gender: registerAthleteInput.gender,
      dateOfBirth: registerAthleteInput.dateOfBirth,
      team: team,
      terraId: null,
      createdAt: new Date(),
      wearableProvider: wearableProvider,
    };

    const newAthlete = this.athleteRepository.create({ ...athlete });
    await this.athleteRepository.save(newAthlete);

    const actionLog = constructAthleteActionLog(athlete.id, AthleteActionType.ATHLETE_REGISTRATION, {
      registrationToken,
    });
    await this.athleteActionLogService.createAthleteActionLog(actionLog);

    return athlete;
  }

  async getAthleteByAccountId(accountId: Account['id']): Promise<Athlete> {
    const athlete = await this.athleteRepository.findOne({
      where: { account: { id: accountId } },
    });
    if (!athlete) {
      throw new NotFoundError(ATHLETE_TRANSLATION_CODES.athleteNotFound, `Athlete not found for account ${accountId}`);
    }
    return athlete;
  }

  async getAthleteWearableProvider(athleteId: Athlete['id']): Promise<WearableProvider> {
    const athlete = await this.athleteRepository.findOne({
      where: { id: athleteId },
      relations: ['wearableProvider'],
    });
    if (!athlete) {
      throw new NotFoundError(ATHLETE_TRANSLATION_CODES.athleteNotFound, `Athlete not found for athlete ${athleteId}`);
    }
    const wearableProvider = await this.wearableProviderRepository.findOne({
      where: { id: athlete.wearableProvider.id },
    });
    if (!wearableProvider) {
      throw new NotFoundError(
        ATHLETE_TRANSLATION_CODES.athleteWearableProviderNotFound,
        `Wearable provider not found for athlete ${athleteId}`,
      );
    }
    return wearableProvider;
  }
}
