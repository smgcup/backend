import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TERRA_WEBHOOK_EVENTS,
  TerraWebhookChunksCompleteEvent,
  TerraWebhookTransformRequestedEvent,
} from '../events/terra-webhook.events';

@Injectable()
export class TerraWebhookChunksCompleteListener {
  private readonly logger = new Logger(TerraWebhookChunksCompleteListener.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent(TERRA_WEBHOOK_EVENTS.CHUNKS_COMPLETE)
  handleChunksComplete(event: TerraWebhookChunksCompleteEvent): void {
    this.logger.log(
      `All chunks complete for reference ${event.reference}. Triggering transformation. Daily: ${!!event.dailyData}, Sleep: ${!!event.sleepData}, Activity: ${!!event.activityData}`,
    );

    // Emit transform requested event
    this.eventEmitter.emit(
      TERRA_WEBHOOK_EVENTS.TRANSFORM_REQUESTED,
      new TerraWebhookTransformRequestedEvent(
        event.reference,
        event.user,
        event.dailyData,
        event.sleepData,
        event.activityData,
      ),
    );
  }
}
