import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { AthleteDailyRecord } from './entities/athlete-daily-record.entity';
import { TerraDailyRecord } from '../terra/entities/terra-daily-record.entity';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import { Athlete } from './entities/athlete.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AthleteDailyRecordService {
  constructor(private readonly dataSource: DataSource) {}
  @InjectRepository(AthleteDailyRecord)
  private readonly athleteDailyRecordRepository: Repository<AthleteDailyRecord>;

  /**
   * Gets the daily record for an athlete on the current date
   * @param athleteId - The ID of the athlete to get the daily record for
   * @returns The daily record for the athlete on the current date
   * @example
   * ```typescript
   * const dailyRecord = await this.athleteDailyRecordService.getAthleteDailyRecord('123e4567-e89b-12d3-a456-426614174000');
   * // Returns the daily record for the athlete on the current date
   * // { id: '123e4567-e89b-12d3-a456-426614174000', date: '2024-01-01', recovery: 0.5, strain: 0.3, ... }
   * ```
   */
  async getAthleteDailyRecords(athleteId: Athlete['id']): Promise<AthleteDailyRecord[]> {
    return await this.athleteDailyRecordRepository.find({
      where: { athleteId },
    });
  }

  /**
   * Gets the daily record for an athlete on a specific date
   * @param athleteId - The ID of the athlete to get the daily record for
   * @param date - The date to get the daily record for
   * @returns The daily record for the athlete on the specific date
   */
  async getAthleteDailyRecord(athleteId: Athlete['id'], date: Date): Promise<AthleteDailyRecord | null> {
    return await this.athleteDailyRecordRepository.findOne({
      where: { athleteId, date },
    });
  }

  /**
   * Creates athlete daily records from Terra daily records
   * @param terraDailyRecords - The Terra daily records to create the athlete daily records from
   * @returns The created athlete daily records or an empty array if no Terra daily records are provided
   */
  async createAthleteDailyRecordsFromTerraDailyRecords(
    terraDailyRecords: TerraDailyRecord[],
  ): Promise<AthleteDailyRecord[]> {
    if (terraDailyRecords.length === 0) {
      return [];
    }

    return await this.dataSource.transaction(async (manager) => {
      const recordsToSave: AthleteDailyRecord[] = [];

      // Get all unique athlete IDs and dates from the incoming records
      const athleteIds = [...new Set(terraDailyRecords.map((r) => r.athlete.id))];
      const dates = terraDailyRecords.map((r) => new Date(r.recordDate));

      // Find existing records for these athletes and dates
      const existingRecords = await manager.find(AthleteDailyRecord, {
        where: {
          athleteId: In(athleteIds),
          date: In(dates),
        },
      });

      // Create a map for quick lookup: key = `${athleteId}-${dateString}`
      const existingRecordsMap = new Map<string, AthleteDailyRecord>();
      for (const existingRecord of existingRecords) {
        // Handle date as either Date object or string
        const dateObj = existingRecord.date instanceof Date ? existingRecord.date : new Date(existingRecord.date);
        const dateString = dateObj.toISOString().split('T')[0];
        const key = `${existingRecord.athleteId}-${dateString}`;
        existingRecordsMap.set(key, existingRecord);
      }

      // Process each terra record
      for (const terraRecord of terraDailyRecords) {
        // Get the primary sleep record (first non-nap sleep, or first sleep if all are naps)
        const primarySleep = terraRecord.sleeps?.find((sleep) => !sleep.nap) || terraRecord.sleeps?.[0];

        // Get sleep metrics
        const sleepPerfMetrics = primarySleep?.sleepPerfMetrics;
        const sleepHrMetrics = primarySleep?.sleepHrMetrics;
        const sleepStageMetrics = primarySleep?.sleepStageMetrics;

        // Calculate restorative sleep duration (deep + REM sleep)
        const restorativeSleepDuration =
          sleepStageMetrics?.deepSleepSeconds && sleepStageMetrics?.remSleepSeconds
            ? sleepStageMetrics.deepSleepSeconds + sleepStageMetrics.remSleepSeconds
            : sleepStageMetrics?.deepSleepSeconds || null;

        // Calculate restorative sleep percentage if we have total sleep time
        const restorativeSleep =
          restorativeSleepDuration && sleepStageMetrics?.timeAsleepSeconds
            ? Math.round((restorativeSleepDuration / sleepStageMetrics.timeAsleepSeconds) * 100)
            : null;

        const athleteId = terraRecord.athlete.id;
        const recordDate = new Date(terraRecord.recordDate);
        const dateString = recordDate.toISOString().split('T')[0];
        const key = `${athleteId}-${dateString}`;

        const existingRecord = existingRecordsMap.get(key);

        // Prepare the record data
        const recordData = {
          athleteId,
          date: recordDate,
          // Recovery: from dailyMetrics.recovery (int) -> decimal
          recovery: terraRecord.dailyMetrics?.recovery ? Number(terraRecord.dailyMetrics.recovery) : null,
          // Strain: from dailyMetrics.strain (decimal)
          strain: terraRecord.dailyMetrics?.strain ?? null,
          // RHR: from sleepHrMetrics.restingHrBpm
          rhr: sleepHrMetrics?.restingHrBpm ?? null,
          // HRV: from sleepHrMetrics.avgHrv
          hrv: sleepHrMetrics?.avgHrv ?? null,
          // Sleep Performance: from sleepPerfMetrics.sleepPerformancePercentage
          sleepPerformance: sleepPerfMetrics?.sleepPerformancePercentage ?? null,
          // Sleep Consistency: from sleepPerfMetrics.sleepConsistencyPercentage
          sleepConsistency: sleepPerfMetrics?.sleepConsistencyPercentage ?? null,
          // Sleep Efficiency: from sleepPerfMetrics.sleepEfficiencyPercentage
          sleepEfficiency: sleepPerfMetrics?.sleepEfficiencyPercentage ?? null,
          // Sleep Duration: from sleepStageMetrics.timeAsleepSeconds
          sleepDuration: sleepStageMetrics?.timeAsleepSeconds ?? null,
          // Restorative Sleep Duration: deep + REM sleep seconds
          restorativeSleepDuration: restorativeSleepDuration,
          // Restorative Sleep: percentage of restorative sleep
          restorativeSleep: restorativeSleep,
          // Sleep Start: from sleep.startTime
          sleepStart: primarySleep?.startTime ?? null,
          // Sleep End: from sleep.endTime
          sleepEnd: primarySleep?.endTime ?? null,
          // Timezone Offset: from terraRecord or sleep
          timezoneOffset: terraRecord.timezoneOffset ?? primarySleep?.timezoneOffset ?? null,
        };

        if (existingRecord) {
          // Update existing record
          Object.assign(existingRecord, recordData);
          recordsToSave.push(existingRecord);
        } else {
          // Create new record
          const newRecord = manager.create(AthleteDailyRecord, {
            id: generateUuidv7(),
            ...recordData,
          });
          recordsToSave.push(newRecord);
        }
      }

      // Save all records in batch
      if (recordsToSave.length > 0) {
        return await manager.save(AthleteDailyRecord, recordsToSave);
      }

      return [];
    });
  }
}
