import type { TerraUser } from '../../../terra/types';
import type {
  TerraDailyDataWebhookPayload,
  TerraSleepDataWebhookPayload,
  TerraActivityDataWebhookPayload,
} from '../webhook-types';
import type { TerraDailyRecord } from '../../../terra/entities/terra-daily-record.entity';
import type {
  TerraAthleteDailyDataResponse,
  TerraAthleteSleepDataResponse,
  TerraAthleteActivityDataResponse,
} from '../../../terra/responses/terra-responses';
export const TERRA_WEBHOOK_EVENTS = {
  CHUNK_RECEIVED: 'terra.webhook.chunk.received',
  CHUNKS_COMPLETE: 'terra.webhook.chunks.complete',
  TRANSFORM_REQUESTED: 'terra.webhook.transform.requested',
  TRANSFORM_COMPLETED: 'terra.webhook.transform.completed',
  TRANSFORM_FAILED: 'terra.webhook.transform.failed',
  SAVE_REQUESTED: 'terra.webhook.save.requested',
  SAVE_COMPLETED: 'terra.webhook.save.completed',
  SAVE_FAILED: 'terra.webhook.save.failed',
} as const;

export class TerraWebhookChunkReceivedEvent {
  constructor(
    public readonly reference: string,
    public readonly payload:
      | TerraDailyDataWebhookPayload
      | TerraSleepDataWebhookPayload
      | TerraActivityDataWebhookPayload,
    public readonly user: TerraUser,
  ) {}
}

export class TerraWebhookChunksCompleteEvent {
  constructor(
    public readonly reference: string,
    public readonly user: TerraUser,
    public readonly dailyData: TerraAthleteDailyDataResponse | null,
    public readonly sleepData: TerraAthleteSleepDataResponse | null,
    public readonly activityData: TerraAthleteActivityDataResponse | null,
  ) {}
}

export class TerraWebhookTransformRequestedEvent {
  constructor(
    public readonly reference: string,
    public readonly user: TerraUser,
    public readonly dailyData: TerraAthleteDailyDataResponse | null,
    public readonly sleepData: TerraAthleteSleepDataResponse | null,
    public readonly activityData: TerraAthleteActivityDataResponse | null,
  ) {}
}

export class TerraWebhookTransformCompletedEvent {
  constructor(
    public readonly reference: string,
    public readonly user: TerraUser,
    public readonly terraDailyRecords: TerraDailyRecord[],
  ) {}
}

export class TerraWebhookTransformFailedEvent {
  constructor(
    public readonly reference: string,
    public readonly user: TerraUser,
    public readonly error: string,
  ) {}
}

export class TerraWebhookSaveRequestedEvent {
  constructor(
    public readonly reference: string,
    public readonly user: TerraUser,
    public readonly terraDailyRecords: TerraDailyRecord[],
  ) {}
}

export class TerraWebhookSaveCompletedEvent {
  constructor(
    public readonly reference: string,
    public readonly user: TerraUser,
    public readonly recordCount: number,
  ) {}
}

export class TerraWebhookSaveFailedEvent {
  constructor(
    public readonly reference: string,
    public readonly user: TerraUser,
    public readonly error: string,
  ) {}
}
