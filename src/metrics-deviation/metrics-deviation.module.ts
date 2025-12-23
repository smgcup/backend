import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricDeviationService } from './metric-deviation.service';
import { ParameterDeviations } from './entities/parameter-deviations.entity';
import { AcuteSymptomRuleModule } from '../acute-symptom-rule/acute-symptom-rule.module';
import { AthleteDailyRecordModule } from '../athlete/athlete-daily-record.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParameterDeviations]), AcuteSymptomRuleModule, AthleteDailyRecordModule],
  controllers: [],
  providers: [MetricDeviationService],
  exports: [MetricDeviationService],
})
export class MetricsDeviationModule {}
