import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  TERRA_WEBHOOK_EVENTS,
  TerraWebhookSaveRequestedEvent,
  TerraWebhookSaveCompletedEvent,
  TerraWebhookSaveFailedEvent,
} from '../events/terra-webhook.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TerraUploadService } from '../../../terra/terra-upload.service';
@Injectable()
export class TerraWebhookSaveListener {
  private readonly logger = new Logger(TerraWebhookSaveListener.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly terraUploadService: TerraUploadService,
  ) {}

  @OnEvent(TERRA_WEBHOOK_EVENTS.SAVE_REQUESTED)
  async handleSaveRequested(event: TerraWebhookSaveRequestedEvent): Promise<void> {
    this.logger.log(
      `Starting database save for reference: ${event.reference}, records: ${event.terraDailyRecords.length}`,
    );

    try {
      // Early return if no records to process
      if (event.terraDailyRecords.length === 0) {
        this.logger.debug(`No records to save for reference ${event.reference}`);
        this.eventEmitter.emit(
          TERRA_WEBHOOK_EVENTS.SAVE_COMPLETED,
          new TerraWebhookSaveCompletedEvent(event.reference, event.user, 0),
        );
        return;
      }

      // Extract athleteId from first record
      const athleteId = event.terraDailyRecords[0].athlete.id;

      await this.terraUploadService.batchSaveRecords(athleteId, event.terraDailyRecords);

      this.logger.log(
        `Database save completed for reference ${event.reference}. Saved ${event.terraDailyRecords.length} records.`,
      );

      // Emit save completed event
      this.eventEmitter.emit(
        TERRA_WEBHOOK_EVENTS.SAVE_COMPLETED,
        new TerraWebhookSaveCompletedEvent(event.reference, event.user, event.terraDailyRecords.length),
      );
    } catch (error) {
      this.logger.error(`Database save failed for reference ${event.reference}:`, error);

      this.eventEmitter.emit(
        TERRA_WEBHOOK_EVENTS.SAVE_FAILED,
        new TerraWebhookSaveFailedEvent(
          event.reference,
          event.user,
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
  }
}
