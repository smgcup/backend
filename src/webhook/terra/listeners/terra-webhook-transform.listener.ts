import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Athlete } from '../../../athlete/entities/athlete.entity';
import { NotFoundError } from '../../../exception/exceptions';
import { ATHLETE_TRANSLATION_CODES } from '../../../exception/translation-codes';
import {
  TERRA_WEBHOOK_EVENTS,
  TerraWebhookTransformRequestedEvent,
  TerraWebhookTransformCompletedEvent,
  TerraWebhookTransformFailedEvent,
} from '../events/terra-webhook.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TerraDailyDataTransformer,
  TerraSleepDataTransformer,
  TerraActivityDataTransformer,
  TerraDailySleepActivityRelationsTransformer,
} from '../../../terra/transformers';
import type {
  TerraAthleteDailyDataResponse,
  TerraAthleteSleepDataResponse,
  TerraAthleteActivityDataResponse,
} from '../../../terra/responses/terra-responses';

@Injectable()
export class TerraWebhookTransformListener {
  private readonly logger = new Logger(TerraWebhookTransformListener.name);

  constructor(
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
    private readonly eventEmitter: EventEmitter2,
    private readonly terraDailyDataTransformer: TerraDailyDataTransformer,
    private readonly terraSleepDataTransformer: TerraSleepDataTransformer,
    private readonly terraActivityDataTransformer: TerraActivityDataTransformer,
    private readonly terraDailySleepActivityRelationsTransformer: TerraDailySleepActivityRelationsTransformer,
  ) {}

  @OnEvent(TERRA_WEBHOOK_EVENTS.TRANSFORM_REQUESTED)
  async handleTransformRequested(event: TerraWebhookTransformRequestedEvent): Promise<void> {
    this.logger.log(`Starting transformation for reference: ${event.reference}`);

    try {
      // Find athlete by terra user_id
      const athlete = await this.athleteRepository.findOne({
        where: { terraId: event.user.user_id },
      });

      if (!athlete) {
        throw new NotFoundError(
          ATHLETE_TRANSLATION_CODES.athleteNotFound,
          `Athlete not found for Terra user_id: ${event.user.user_id}`,
        );
      }

      const dailyDataResponse = event.dailyData;
      const sleepDataResponse = event.sleepData;
      const activityDataResponse = event.activityData;

      // Transform using existing transformers
      const terraDailyRecords = dailyDataResponse
        ? this.terraDailyDataTransformer.transform(dailyDataResponse, athlete)
        : [];

      const terraSleeps = sleepDataResponse ? this.terraSleepDataTransformer.transform(sleepDataResponse) : [];

      const terraActivities = activityDataResponse
        ? await this.terraActivityDataTransformer.transform(activityDataResponse)
        : [];

      // Combine relations (this is critical - matches sleeps and activities to daily records)
      const terraDailySleepActivityRelations = this.terraDailySleepActivityRelationsTransformer.transform(
        terraDailyRecords,
        terraSleeps,
        terraActivities,
      );

      // Deduplicate records by recordDate (keep the last one for each date)
      // This ensures we only have one record per athlete per date
      const recordsByDate = new Map<string, (typeof terraDailySleepActivityRelations)[0]>();
      for (const record of terraDailySleepActivityRelations) {
        recordsByDate.set(record.recordDate, record);
      }
      const uniqueRecords = Array.from(recordsByDate.values());

      this.logger.debug(`Transformation complete for reference ${event.reference}. Records: ${uniqueRecords.length}`);

      // Emit transform completed event
      this.eventEmitter.emit(
        TERRA_WEBHOOK_EVENTS.TRANSFORM_COMPLETED,
        new TerraWebhookTransformCompletedEvent(event.reference, event.user, uniqueRecords),
      );
    } catch (error) {
      this.logger.error(`Transform failed for reference ${event.reference}:`, error);

      this.eventEmitter.emit(
        TERRA_WEBHOOK_EVENTS.TRANSFORM_FAILED,
        new TerraWebhookTransformFailedEvent(
          event.reference,
          event.user,
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
  }

  /**
   * Convert webhook daily payload to API response format
   */
  private webhookPayloadToDailyResponse(payload: TerraAthleteDailyDataResponse): TerraAthleteDailyDataResponse {
    return {
      status: 'success',
      user: payload.user,
      data: payload.data,
      type: 'daily',
    };
  }

  /**
   * Convert webhook sleep payload to API response format
   */
  private webhookPayloadToSleepResponse(payload: TerraAthleteSleepDataResponse): TerraAthleteSleepDataResponse {
    return {
      status: 'success',
      user: payload.user,
      data: payload.data,
      type: 'sleep',
    };
  }

  /**
   * Convert webhook activity payload to API response format
   */
  private webhookPayloadToActivityResponse(
    payload: TerraAthleteActivityDataResponse,
  ): TerraAthleteActivityDataResponse {
    return {
      status: 'success',
      user: payload.user,
      data: payload.data,
      type: 'activity',
    };
  }
}
