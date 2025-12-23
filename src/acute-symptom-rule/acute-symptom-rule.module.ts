import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcuteSymptomRuleset } from './entities/acute-symptom-ruleset.entity';
import { AcuteSymptomRule } from './entities/acute-symptom-rule.entity';
import { AcuteSymptomParameter } from './entities/acute-symptom-parameter.entity';
import { ParameterDeviations } from '../metrics-deviation/entities/parameter-deviations.entity';
import { AcuteSymptomRuleService } from './acute-symptom-rule.service';
import { AcuteSymptomParameterService } from './acute-symptom-parameter.service';
import { AcuteSymptomRulesetCheckListener } from './listeners/acute-symptom-ruleset-check.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcuteSymptomRuleset, AcuteSymptomRule, AcuteSymptomParameter, ParameterDeviations]),
  ],
  controllers: [],
  providers: [AcuteSymptomRuleService, AcuteSymptomParameterService, AcuteSymptomRulesetCheckListener],
  exports: [AcuteSymptomRuleService, AcuteSymptomParameterService],
})
export class AcuteSymptomRuleModule {}
