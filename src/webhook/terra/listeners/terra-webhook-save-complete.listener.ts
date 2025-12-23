import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TERRA_WEBHOOK_EVENTS, TerraWebhookSaveCompletedEvent } from '../events/terra-webhook.events';
import { TerraHistoricalDataSession } from '../../../terra/entities/terra-historical-data-session.entity';

@Injectable()
export class TerraWebhookSaveCompleteListener {
  private readonly logger = new Logger(TerraWebhookSaveCompleteListener.name);

  constructor(
    @InjectRepository(TerraHistoricalDataSession)
    private readonly terraHistoricalDataSessionRepository: Repository<TerraHistoricalDataSession>,
  ) {}

  @OnEvent(TERRA_WEBHOOK_EVENTS.SAVE_COMPLETED)
  async handleSaveCompleted(event: TerraWebhookSaveCompletedEvent): Promise<void> {
    this.logger.log(`Marking session as completed for reference: ${event.reference}`);

    try {
      const session = await this.terraHistoricalDataSessionRepository.findOne({
        where: { id: event.reference },
      });

      if (!session) {
        this.logger.warn(`Session not found for reference: ${event.reference}`);
        return;
      }

      session.completed = true;
      await this.terraHistoricalDataSessionRepository.save(session);

      this.logger.log(`Session ${event.reference} marked as completed. Saved ${event.recordCount} records.`);
    } catch (error) {
      this.logger.error(`Failed to mark session as completed for reference ${event.reference}:`, error);
    }
  }
}
