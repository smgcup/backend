import { Injectable, Logger } from '@nestjs/common';
import { TerraHistoricalDataSession } from './entities/terra-historical-data-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import { Athlete } from '../athlete/entities/athlete.entity';
import { DateRange } from '../shared/inputs/date-range';
import { TerraApiClient } from './client/terra-api-client';
import { AthleteService } from '../athlete/athlete.service';
import {
  isErrorResponse,
  isDailyDataResponse,
  isSleepDataResponse,
  isActivityDataResponse,
  isHistoricalDataResponse,
} from './responses/terra-responses';
import { NotFoundError } from '../exception/exceptions';
import { ATHLETE_TRANSLATION_CODES } from '../exception/translation-codes';
@Injectable()
export class TerraHistoricalDataSessionService {
  private readonly logger = new Logger(TerraHistoricalDataSessionService.name);
  constructor(
    @InjectRepository(TerraHistoricalDataSession)
    private readonly terraHistoricalDataSessionRepository: Repository<TerraHistoricalDataSession>,
    private readonly terraApiClient: TerraApiClient,
    private readonly athleteService: AthleteService,
  ) {}

  /**
   * **Steps**:
   * 1. Create a new historical data session
   * 2. Call Terra API to get the historical daily, sleep and activity data for the athlete within the date range
   * 3. Return the historical data session ID
   * @param athleteId - The ID of the athlete to initiate the historical data session for
   * @param dateRange - The date range of the historical data session
   * @returns The initiated historical data session
   */
  async initiateTerraHistoricalDataSession(athleteId: Athlete['id'], dateRange: DateRange): Promise<void> {
    try {
      this.logger.log(
        `Initiating terra historical data session for athlete ${athleteId} with date range ${dateRange.startDate.toISOString().split('T')[0]} to ${dateRange.endDate.toISOString().split('T')[0]}`,
      );

      const athlete = await this.athleteService.getAthlete(athleteId);
      const terraUserId = athlete.terraId;
      if (!terraUserId) {
        throw new NotFoundError(
          ATHLETE_TRANSLATION_CODES.athleteTerraIdInvalid,
          `Athlete with ID ${athleteId} has no Terra ID`,
        );
      }

      const terraHistoricalDataSession = await this.createTerraHistoricalDataSession(athleteId, terraUserId, dateRange);
      this.logger.log(
        `Terra historical data session created for athlete ${athleteId} with ID: ${terraHistoricalDataSession.id}`,
      );

      await this.requestTerraHistoricalData(terraUserId, dateRange);
      this.logger.log(
        `Terra historical data requested for athlete ${athleteId} with ID: ${terraHistoricalDataSession.id} and date range ${dateRange.startDate.toISOString().split('T')[0]} to ${dateRange.endDate.toISOString().split('T')[0]}`,
      );
    } catch (error) {
      throw new Error(`Failed to initiate terra historical data session: ${error}`);
    }
  }

  private async requestTerraHistoricalData(terraUserId: string, dateRange: DateRange): Promise<void> {
    try {
      const { startDate, endDate } = dateRange;
      const [dailyDataResponse, sleepDataResponse, activityDataResponse] = await Promise.all([
        this.terraApiClient.getAthleteDailyData(terraUserId, startDate, endDate),
        this.terraApiClient.getAthleteSleepData(terraUserId, startDate, endDate),
        this.terraApiClient.getAthleteActivityData(terraUserId, startDate, endDate),
      ]);

      if (isErrorResponse(dailyDataResponse)) {
        throw new Error(`Failed to get daily data: ${dailyDataResponse.message}`);
      }
      if (isDailyDataResponse(dailyDataResponse)) {
        throw new Error('The received daily response is not a TerraAthleteHistoricalDataResponse');
      }

      if (isErrorResponse(sleepDataResponse)) {
        throw new Error(`Failed to get sleep data: ${sleepDataResponse.message}`);
      }
      if (isSleepDataResponse(sleepDataResponse)) {
        throw new Error('The received sleep response is not a TerraAthleteHistoricalDataResponse');
      }

      if (isErrorResponse(activityDataResponse)) {
        throw new Error(`Failed to get activity data: ${activityDataResponse.message}`);
      }
      if (isActivityDataResponse(activityDataResponse)) {
        throw new Error('The received activity response is not a TerraAthleteHistoricalDataResponse');
      }

      // At this point, all responses should be historical data responses
      if (!isHistoricalDataResponse(dailyDataResponse)) {
        throw new Error('Daily data response is not a historical data response');
      }
      if (!isHistoricalDataResponse(sleepDataResponse)) {
        throw new Error('Sleep data response is not a historical data response');
      }
      if (!isHistoricalDataResponse(activityDataResponse)) {
        throw new Error('Activity data response is not a historical data response');
      }

      const terraDailyReference = dailyDataResponse.reference;
      const terraSleepReference = sleepDataResponse.reference;
      const terraActivityReference = activityDataResponse.reference;

      this.logger.debug('terraDailyReference', terraDailyReference);
      this.logger.debug('terraSleepReference', terraSleepReference);
      this.logger.debug('terraActivityReference', terraActivityReference);

      const terraHistoricalDataActiveSession = await this.getTerraHistoricalDataActiveSessionByTerraUserId(terraUserId);
      if (!terraHistoricalDataActiveSession) {
        throw new Error(`Terra historical data active session not found for terra user ${terraUserId}`);
      }
      terraHistoricalDataActiveSession.terraDailyReference = terraDailyReference;
      terraHistoricalDataActiveSession.terraSleepReference = terraSleepReference;
      terraHistoricalDataActiveSession.terraActivityReference = terraActivityReference;

      await this.updateTerraHistoricalDataSessionByTerraUserId(terraUserId, terraHistoricalDataActiveSession);
      this.logger.log(
        `Terra historical data session updated for athlete ${terraUserId} with ID: ${terraHistoricalDataActiveSession.id} and date range ${dateRange.startDate.toISOString().split('T')[0]} to ${dateRange.endDate.toISOString().split('T')[0]}`,
      );
    } catch (error) {
      throw new Error(`Failed to request historical data: ${error}`);
    }
  }
  /**
   * Create a new terra historical data session
   * @param athleteId - The ID of the athlete to create the terra historical data session for
   * @param dateRange - The date range of the terra historical data session
   * @returns The created terra historical data session
   */
  private async createTerraHistoricalDataSession(
    athleteId: Athlete['id'],
    terraUserId: Athlete['terraId'],
    dateRange: DateRange,
  ): Promise<TerraHistoricalDataSession> {
    try {
      const { startDate, endDate } = dateRange;
      if (!terraUserId) {
        throw new Error(`Terra user ID not provided for terra historical data session`);
      }
      const terraHistoricalDataSession = await this.terraHistoricalDataSessionRepository.save({
        id: generateUuidv7(),
        athleteId,
        terraUserId,
        startDate,
        endDate,
        startTimestamp: new Date(),
        terraDailyReference: '',
        terraSleepReference: '',
        terraActivityReference: '',
        expectedPayloadsDaily: null,
        expectedPayloadsSleep: null,
        expectedPayloadsActivity: null,
        receivedPayloadsDaily: 0,
        receivedPayloadsSleep: 0,
        receivedPayloadsActivity: 0,
        completed: false,
      });
      return terraHistoricalDataSession;
    } catch (error) {
      throw new Error(`Failed to create historical data session: ${error}`);
    }
  }

  /**
   * Get the active terra historical data session by terra user ID
   * @param terraUserId - The ID of the terra user to get the active terra historical data session for
   * @returns The active terra historical data session for the terra user
   */
  async getTerraHistoricalDataActiveSessionByTerraUserId(
    terraUserId: string,
  ): Promise<TerraHistoricalDataSession | null> {
    try {
      const terraHistoricalDataActiveSession = await this.terraHistoricalDataSessionRepository.findOne({
        where: { terraUserId, completed: false },
      });
      return terraHistoricalDataActiveSession;
    } catch (error) {
      throw new Error(`Failed to get active terra historical data session for terra user ${terraUserId}: ${error}`);
    }
  }

  /**
   * Update a terra historical data session by terra user ID
   * @param terraUserId - The ID of the terra user to update the terra historical data session for
   * @param terraHistoricalDataSession - The terra historical data session to update
   * @returns The updated terra historical data session
   */
  async updateTerraHistoricalDataSessionByTerraUserId(
    terraUserId: Athlete['terraId'],
    terraHistoricalDataSession: TerraHistoricalDataSession,
  ): Promise<TerraHistoricalDataSession> {
    try {
      const updatedTerraHistoricalDataSession =
        await this.terraHistoricalDataSessionRepository.save(terraHistoricalDataSession);
      return updatedTerraHistoricalDataSession;
    } catch (error) {
      throw new Error(`Failed to update terra historical data session for terra user ${terraUserId}: ${error}`);
    }
  }
}
