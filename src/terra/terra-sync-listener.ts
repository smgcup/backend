import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { TerraSyncStartedEvent, TerraSyncCompletedEvent, TERRA_SYNC_EVENTS } from './events/terra-sync.events';
import { SystemAlertsService } from '../system-alerts/system-alerts.service';
import {
  ACUTE_SYMPTOM_RULESET_CHECK_EVENTS,
  AcuteSymptomRulesetCheckRequestedEvent,
} from '../acute-symptom-rule/events/acute-symptom-ruleset-check.events';
@Injectable()
export class TerraSyncEventListener {
  private readonly logger = new Logger(TerraSyncEventListener.name);

  constructor(
    private readonly systemAlertsService: SystemAlertsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(TERRA_SYNC_EVENTS.STARTED)
  handleSyncStarted(event: TerraSyncStartedEvent) {
    if (event.syncType === 'all') {
      this.logger.log('🚀 Started syncing all athletes');
    } else {
      this.logger.log(`🚀 Started syncing athlete: ${event.athleteId}`);
    }
  }

  @OnEvent(TERRA_SYNC_EVENTS.COMPLETED)
  async handleSyncCompleted(event: TerraSyncCompletedEvent) {
    if (event.success) {
      if (event.syncType === 'all') {
        this.logger.log('✅ Completed syncing all athletes');
      } else {
        // if (event.athleteId) {
        //   this.eventEmitter.emit(
        //     ACUTE_SYMPTOM_RULESET_CHECK_EVENTS.CHECK_REQUESTED,
        //     new AcuteSymptomRulesetCheckRequestedEvent(
        //       {
        //         '019adc13-01e0-7c31-b2c4-d5e602c69e40': 10,
        //         '019adc13-33f6-7e58-b5ed-2519a655392b': 24,
        //       },
        //       event.athleteId,
        //     ),
        //   );
        // }

        this.logger.log(
          `✅ Completed syncing athlete: ${event.athleteId} from ${event.startDate?.toISOString()} to ${event.endDate?.toISOString()}`,
        );
      }
    } else {
      if (event.syncType === 'all') {
        this.logger.error(`❌ Failed to sync all athletes: ${event.error}`);
      } else {
        this.logger.error(`❌ Failed to sync athlete \`${event.athleteId}\`: ${event.error}`);
        try {
          await this.systemAlertsService.sendSystemAlert(
            `❌ Terra sync failed\nAthlete: \`${event.athleteId}\`\nReason: ${event.error}`,
          );
        } catch (error) {
          this.logger.error(`❌ Failed to send System Alert for athlete ${event.athleteId}: ${error}`);
        }
      }
    }
  }
}
