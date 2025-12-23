import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TERRA_WEBHOOK_EVENTS,
  TerraWebhookTransformCompletedEvent,
  TerraWebhookSaveRequestedEvent,
} from '../events/terra-webhook.events';

@Injectable()
export class TerraWebhookTransformCompleteListener {
  private readonly logger = new Logger(TerraWebhookTransformCompleteListener.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent(TERRA_WEBHOOK_EVENTS.TRANSFORM_COMPLETED)
  handleTransformCompleted(event: TerraWebhookTransformCompletedEvent): void {
    this.logger.log(
      `Transformation complete for reference ${event.reference}. Records: ${event.terraDailyRecords.length}. Triggering database save.`,
    );

    // Emit save requested event
    this.eventEmitter.emit(
      TERRA_WEBHOOK_EVENTS.SAVE_REQUESTED,
      new TerraWebhookSaveRequestedEvent(event.reference, event.user, event.terraDailyRecords),
    );
  }
}
