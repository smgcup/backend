import { Module } from '@nestjs/common';
import { SystemAlertsService } from './system-alerts.service';

@Module({
  providers: [SystemAlertsService],
  exports: [SystemAlertsService],
})
export class SystemAlertsModule {}
