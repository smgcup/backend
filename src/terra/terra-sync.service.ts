import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Athlete } from '../athlete/entities/athlete.entity';
import { TerraSyncStartedEvent, TerraSyncCompletedEvent, TERRA_SYNC_EVENTS } from './events/terra-sync.events';
import { TerraApiClient } from './client/terra-api-client';
import { NotFoundError } from '../exception/exceptions';
import { ATHLETE_TRANSLATION_CODES } from '../exception/translation-codes';
import {
  TerraDailyDataTransformer,
  TerraSleepDataTransformer,
  TerraActivityDataTransformer,
  TerraDailySleepActivityRelationsTransformer,
} from './transformers';
import { TerraDailyRecord } from './entities/terra-daily-record.entity';
import { isErrorResponse, isHistoricalDataResponse } from './responses/terra-responses';
import { TerraUploadService } from './terra-upload.service';
import { TerraSleepMetricsCalculatorService } from './terra-sleep-metrics-calculator.service';
import { AthleteDailyRecordService } from '../athlete/athlete-daily-record.service';
import { AcuteSymptomRuleService } from '../acute-symptom-rule/acute-symptom-rule.service';
import { MetricDeviationService } from '../metrics-deviation/metric-deviation.service';
import { getCurrentAthleteRecordDate } from '../shared/utils';
import { TriggeredAcuteSymptomService } from '../triggered-acute-symptom/triggered-acute-symptom.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TerraSyncService {
  private readonly logger = new Logger(TerraSyncService.name);

  constructor(
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly terraApiClient: TerraApiClient,
    private readonly terraDailyDataTransformer: TerraDailyDataTransformer,
    private readonly terraSleepDataTransformer: TerraSleepDataTransformer,
    private readonly terraActivityDataTransformer: TerraActivityDataTransformer,
    private readonly terraDailySleepActivityRelationsTransformer: TerraDailySleepActivityRelationsTransformer,
    private readonly terraUploadService: TerraUploadService,
    private readonly terraSleepMetricsCalculatorService: TerraSleepMetricsCalculatorService,
    private readonly athleteDailyRecordService: AthleteDailyRecordService,
    private readonly acuteSymptomRuleService: AcuteSymptomRuleService,
    private readonly metricDeviationService: MetricDeviationService,
    private readonly triggeredAcuteSymptomService: TriggeredAcuteSymptomService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Sync all athletes asynchronously
   */
  async syncAllAthletes(startDate: Date, endDate: Date): Promise<void> {
    this.logger.log('Starting sync for all athletes');

    // Emit sync started event
    this.eventEmitter.emit(TERRA_SYNC_EVENTS.STARTED, new TerraSyncStartedEvent(undefined, 'all'));

    try {
      // Get all athletes
      const athletes = await this.athleteRepository.find();
      this.logger.log(`Found ${athletes.length} athletes to sync`);

      // Process each athlete
      for (let i = 0; i < athletes.length; i++) {
        const athlete = athletes[i];

        // Simulate sync operation for each athlete
        await this.syncSingleAthlete(athlete.id, startDate, endDate);
      }

      // Emit completion event
      this.eventEmitter.emit(TERRA_SYNC_EVENTS.COMPLETED, new TerraSyncCompletedEvent(undefined, 'all', true));
      this.logger.log('Completed sync for all athletes');
    } catch (error) {
      this.logger.error('Error during sync all athletes', error);
      this.eventEmitter.emit(
        TERRA_SYNC_EVENTS.COMPLETED,
        new TerraSyncCompletedEvent(undefined, 'all', false, error instanceof Error ? error.message : String(error)),
      );
    }
  }

  /**
   *
   * @param athleteId - The ID of the athlete to sync
   * @returns void
   * @example
   * ```typescript
   * await this.terraSyncService.syncSingleAthlete('123e4567-e89b-12d3-a456-426614174000');
   * // Syncs the data for the athlete with ID '123e4567-e89b-12d3-a456-426614174000'
   * ```
   */
  async syncSingleAthlete(athleteId: string, startDate: Date, endDate: Date): Promise<void> {
    this.logger.log(`Starting sync for athlete ${athleteId}`);

    // Emit sync started event
    this.eventEmitter.emit(TERRA_SYNC_EVENTS.STARTED, new TerraSyncStartedEvent(athleteId, 'single'));

    try {
      // Check if athlete exists
      const athlete = await this.athleteRepository.findOne({ where: { id: athleteId } });
      if (!athlete) {
        throw new NotFoundError(ATHLETE_TRANSLATION_CODES.athleteNotFound, `Athlete with ID ${athleteId} not found`);
      }

      const athleteTerraId = athlete.terraId;
      if (!athleteTerraId) {
        throw new NotFoundError(
          ATHLETE_TRANSLATION_CODES.athleteTerraIdInvalid,
          `Athlete with ID ${athleteId} has no Terra ID`,
        );
      }
      this.logger.debug(`Retrieved athlete Terra ID: ${athleteTerraId}`);

      const [dailyDataResponse, sleepDataResponse, activityDataResponse] = await Promise.all([
        this.terraApiClient.getAthleteDailyData(athleteTerraId, startDate, endDate),
        this.terraApiClient.getAthleteSleepData(athleteTerraId, startDate, endDate),
        this.terraApiClient.getAthleteActivityData(athleteTerraId, startDate, endDate),
      ]);

      //?  Check if daily data is a valid TerraAthleteDailySuccessResponse

      if (isErrorResponse(dailyDataResponse)) {
        this.logger.error(
          `Error getting daily data for athlete ${athleteId} with code ${dailyDataResponse.statusCode} and message ${dailyDataResponse.message} and statusCode`,
        );
        this.eventEmitter.emit(
          TERRA_SYNC_EVENTS.COMPLETED,
          new TerraSyncCompletedEvent(athleteId, 'single', false, dailyDataResponse.message, startDate, endDate),
        );
        return;
      } else if (isHistoricalDataResponse(dailyDataResponse)) {
        this.logger.error('Historical data request submitted through the sync service - NOT ALLOWED!');
        this.eventEmitter.emit(
          TERRA_SYNC_EVENTS.COMPLETED,
          new TerraSyncCompletedEvent(
            athleteId,
            'single',
            false,
            'Historical data request submitted through the sync service - NOT ALLOWED!',
            startDate,
            endDate,
          ),
        );
        return;
      }

      this.logger.debug(`Retrieved daily data: ${JSON.stringify(dailyDataResponse)}`);

      //? Check if sleep data is a valid TerraAthleteSleepSuccessResponse

      if (isErrorResponse(sleepDataResponse)) {
        this.logger.error(
          `Error getting sleep data for athlete ${athleteId} with code ${sleepDataResponse.statusCode} and message ${sleepDataResponse.message} and statusCode`,
        );
        this.eventEmitter.emit(
          TERRA_SYNC_EVENTS.COMPLETED,
          new TerraSyncCompletedEvent(athleteId, 'single', false, sleepDataResponse.message, startDate, endDate),
        );
        return;
      } else if (isHistoricalDataResponse(sleepDataResponse)) {
        this.logger.error('Historical data request submitted through the sync service - NOT ALLOWED!');
        this.eventEmitter.emit(
          TERRA_SYNC_EVENTS.COMPLETED,
          new TerraSyncCompletedEvent(
            athleteId,
            'single',
            false,
            'Historical data request submitted through the sync service - NOT ALLOWED!',
            startDate,
            endDate,
          ),
        );
        return;
      }
      this.logger.debug(`Retrieved sleep data: ${JSON.stringify(sleepDataResponse)}`);

      //?  Check if activity data is a valid TerraAthleteActivitySuccessResponse

      if (isErrorResponse(activityDataResponse)) {
        this.logger.error(
          `Error getting activity data for athlete ${athleteId} with code ${activityDataResponse.statusCode} and message ${activityDataResponse.message} and statusCode`,
        );
        this.eventEmitter.emit(
          TERRA_SYNC_EVENTS.COMPLETED,
          new TerraSyncCompletedEvent(athleteId, 'single', false, activityDataResponse.message, startDate, endDate),
        );
        return;
      } else if (isHistoricalDataResponse(activityDataResponse)) {
        this.logger.error('Historical data request submitted through the sync service - NOT ALLOWED!');
        this.eventEmitter.emit(
          TERRA_SYNC_EVENTS.COMPLETED,
          new TerraSyncCompletedEvent(
            athleteId,
            'single',
            false,
            'Historical data request submitted through the sync service - NOT ALLOWED!',
            startDate,
            endDate,
          ),
        );
        return;
      }
      this.logger.debug(`Retrieved activity data: ${JSON.stringify(activityDataResponse)}`);

      const terraDailyRecords = this.terraDailyDataTransformer.transform(dailyDataResponse, athlete);
      const terraSleeps = this.terraSleepDataTransformer.transform(sleepDataResponse);
      const terraActivities = await this.terraActivityDataTransformer.transform(activityDataResponse);

      const terraDailySleepActivityRelations = this.terraDailySleepActivityRelationsTransformer.transform(
        terraDailyRecords,
        terraSleeps,
        terraActivities,
      );

      // Early return if no records to process
      if (terraDailySleepActivityRelations.length === 0) {
        this.logger.debug('No records to process');
        return;
      }

      // Deduplicate records by recordDate (keep the last one for each date)
      // This ensures we only have one record per athlete per date
      const recordsByDate = new Map<string, TerraDailyRecord>();
      for (const record of terraDailySleepActivityRelations) {
        recordsByDate.set(record.recordDate, record);
      }
      const uniqueRecords = Array.from(recordsByDate.values());

      // Log summary instead of full objects to avoid circular reference errors
      const summary = {
        dailyRecordsCount: uniqueRecords.length,
        totalSleeps: uniqueRecords.reduce((sum, record) => sum + (record.sleeps?.length ?? 0), 0),
        totalActivities: uniqueRecords.reduce((sum, record) => sum + (record.activities?.length ?? 0), 0),
      };

      await this.terraUploadService.batchSaveRecords(athleteId, uniqueRecords);

      this.logger.debug(`Transformed terra daily sleep activity relations: ${JSON.stringify(summary)}`);

      // Recalculate sleep metrics for all sleeps in the last 4 days
      // This ensures consistency scores are accurate even when syncing just today's data
      await this.terraSleepMetricsCalculatorService.calculateSleepMetrics(athleteId, startDate, endDate);

      // Reload uniqueRecords from the database to get updated sleep metrics
      const terraDailyRecordRepository = this.dataSource.getRepository(TerraDailyRecord);
      const normalizedStartDate = new Date(startDate);
      const normalizedEndDate = new Date(endDate);

      const updatedRecords = await terraDailyRecordRepository.find({
        where: {
          athlete: { id: athleteId },
          recordDate: Between(normalizedStartDate.toISOString(), normalizedEndDate.toISOString()),
        },
        relations: [
          'athlete',
          'dailyMetrics',
          'dailyActivity',
          'stressData',
          'sleeps',
          'sleeps.sleepPerfMetrics',
          'sleeps.sleepRespirationData',
          'sleeps.sleepHrMetrics',
          'sleeps.sleepStageMetrics',
          'activities',
        ],
      });

      // Deduplicate updated records by recordDate (keep the last one for each date)
      const updatedRecordsByDate = new Map<string, TerraDailyRecord>();
      for (const record of updatedRecords) {
        updatedRecordsByDate.set(record.recordDate, record);
      }
      const updatedUniqueRecords = Array.from(updatedRecordsByDate.values());

      // Create athlete daily records from terra daily records with updated sleep metrics
      const athleteDailyRecords =
        await this.athleteDailyRecordService.createAthleteDailyRecordsFromTerraDailyRecords(updatedUniqueRecords);

      this.logger.debug(`Created or updated ${athleteDailyRecords.length} athlete daily records`);

      await this.metricDeviationService.calculateAndSaveMetricDeviation({
        athleteId,
      });

      // Find the current athlete daily record
      const currentRecordDate = getCurrentAthleteRecordDate();
      const currentRecord = athleteDailyRecords.find((record) => {
        const recordDateStr = record.date.toISOString().split('T')[0];
        return recordDateStr === currentRecordDate;
      });
      if (!currentRecord) {
        return;
      }
      const metricKeyObject = await this.metricDeviationService.mapMetricKeyObjectToParameterIds(currentRecord);
      const triggeredSymptoms = await this.acuteSymptomRuleService.checkAcuteSymptomRules(metricKeyObject, athleteId);

      for (const triggeredSymptom of triggeredSymptoms) {
        // Create the triggered acute symptom
        const triggeredAcuteSymptom = await this.triggeredAcuteSymptomService.createAcuteSymptom({
          athleteId,
          symptomId: triggeredSymptom.symptomId,
          severityScore: triggeredSymptom.severityScore,
        });

        // Get the notification type
        const notificationType = await this.notificationService.getNotificationType('red');

        // Create the notification
        const notification = await this.notificationService.createNotification({
          type: notificationType,
          title: 'Acute Symptom Triggered',
          subTitle: 'Acute Symptom Triggered',
          body: 'Acute Symptom Triggered',
        });

        // Assign the notification to the triggered acute symptom
        await this.triggeredAcuteSymptomService.assignNotification(triggeredAcuteSymptom.id, notification.id);
      }

      // Emit completion event
      this.eventEmitter.emit(
        TERRA_SYNC_EVENTS.COMPLETED,
        new TerraSyncCompletedEvent(athleteId, 'single', true, undefined, startDate, endDate),
      );
    } catch (error) {
      this.logger.error(`Error during sync for athlete ${athleteId}`, error);

      this.eventEmitter.emit(
        TERRA_SYNC_EVENTS.COMPLETED,
        new TerraSyncCompletedEvent(
          athleteId,
          'single',
          false,
          error instanceof Error ? error.message : String(error),
          startDate,
          endDate,
        ),
      );
    }
  }
}
