import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AthleteDailyRecord } from './entities/athlete-daily-record.entity';
import { AthleteDailyRecordService } from './athlete-daily-record.service';

@Module({
  imports: [TypeOrmModule.forFeature([AthleteDailyRecord])],
  providers: [AthleteDailyRecordService],
  exports: [AthleteDailyRecordService],
})
export class AthleteDailyRecordModule {}
