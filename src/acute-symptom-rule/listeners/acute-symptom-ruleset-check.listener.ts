import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ACUTE_SYMPTOM_RULESET_CHECK_EVENTS,
  AcuteSymptomRulesetCheckRequestedEvent,
} from '../events/acute-symptom-ruleset-check.events';
import { AcuteSymptomRuleService } from '../acute-symptom-rule.service';

@Injectable()
export class AcuteSymptomRulesetCheckListener {
  private readonly logger = new Logger(AcuteSymptomRulesetCheckListener.name);

  constructor(private readonly acuteSymptomRuleService: AcuteSymptomRuleService) {}

  @OnEvent(ACUTE_SYMPTOM_RULESET_CHECK_EVENTS.CHECK_REQUESTED)
  async handleCheckRequested(event: AcuteSymptomRulesetCheckRequestedEvent): Promise<void> {
    this.logger.debug(
      `Checking acute symptom rulesets with ${Object.keys(event.values).length} parameter values for athlete ${event.athleteId}`,
    );

    try {
      if (!event.athleteId) {
        this.logger.error('Athlete ID is required');
        return;
      }
      const triggeredSymptoms = await this.acuteSymptomRuleService.checkAcuteSymptomRules(
        event.values,
        event.athleteId,
      );

      if (triggeredSymptoms.length > 0) {
        this.logger.log(
          `Triggered ${triggeredSymptoms.length} acute symptom(s): ${triggeredSymptoms.map((symptom) => symptom.symptomId).join(', ')}`,
        );
      } else {
        this.logger.debug('No acute symptoms triggered');
      }
    } catch (error) {
      this.logger.error(`Failed to check acute symptom rulesets:`, error);
      throw error;
    }
  }
}
