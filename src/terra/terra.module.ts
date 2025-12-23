import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Athlete } from '../athlete/entities/athlete.entity';
import { TerraActivityType } from './entities/terra-activity-type.entity';
import { TerraDailyRecord } from './entities/terra-daily-record.entity';
import { TerraSleep } from './entities/terra-sleep.entity';
import { TerraSleepPerfMetrics } from './entities/terra-sleep-perf-metrics.entity';
import { TerraSyncResolver } from './terra-sync.resolver';
import { TerraSyncService } from './terra-sync.service';
import { TerraSyncEventListener } from './terra-sync-listener';
import { TerraSyncScheduler } from './terra-sync.scheduler';
import { TerraApiClient } from './client/terra-api-client';
import {
  TerraDailyDataTransformer,
  TerraSleepDataTransformer,
  TerraActivityDataTransformer,
  TerraDailySleepActivityRelationsTransformer,
} from './transformers';

import { SystemAlertsService } from '../system-alerts/system-alerts.service';
import { TerraHistoricalDataSessionService } from './terra-historical-data-session.service';
import { TerraHistoricalDataSession } from './entities/terra-historical-data-session.entity';
import { TerraUploadService } from './terra-upload.service';
import { TerraSleepMetricsCalculatorService } from './terra-sleep-metrics-calculator.service';
import { AthleteModule } from '../athlete/athlete.module';
import { AthleteDailyRecordModule } from '../athlete/athlete-daily-record.module';
import { UserModule } from '../user/user.module';
import { TeamModule } from '../team/team.module';
import { AcuteSymptomRuleModule } from '../acute-symptom-rule/acute-symptom-rule.module';
import { MetricsDeviationModule } from '../metrics-deviation/metrics-deviation.module';
import { TriggeredAcuteSymptomModule } from '../triggered-acute-symptom/triggered-acute-symptom.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => TeamModule),
    forwardRef(() => AthleteModule),
    TypeOrmModule.forFeature([
      Athlete,
      TerraActivityType,
      TerraDailyRecord,
      TerraHistoricalDataSession,
      TerraSleep,
      TerraSleepPerfMetrics,
    ]),
    HttpModule,
    AthleteDailyRecordModule,
    AcuteSymptomRuleModule,
    MetricsDeviationModule,
    TriggeredAcuteSymptomModule,
    NotificationModule,
  ],
  providers: [
    TerraSyncResolver,
    TerraSyncService,
    TerraSyncEventListener,
    TerraSyncScheduler,
    TerraApiClient,
    TerraDailyDataTransformer,
    TerraSleepDataTransformer,
    TerraActivityDataTransformer,
    TerraDailySleepActivityRelationsTransformer,
    SystemAlertsService,
    TerraHistoricalDataSessionService,
    TerraUploadService,
    TerraSleepMetricsCalculatorService,
  ],
  exports: [
    TerraSyncService,
    TerraDailyDataTransformer,
    TerraSleepDataTransformer,
    TerraActivityDataTransformer,
    TerraDailySleepActivityRelationsTransformer,
    TerraHistoricalDataSessionService,
    TerraUploadService,
    TerraApiClient,
  ],
})
export class TerraModule {}
