import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { TerraDailyRecord } from './entities/terra-daily-record.entity';
import { TerraSleep } from './entities/terra-sleep.entity';
import { TerraActivity } from './entities/terra-activity.entity';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';

@Injectable()
export class TerraUploadService {
  private readonly logger = new Logger(TerraUploadService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Batch save terra daily records with proper ID preservation for updates
   * Handles both insert and update operations, preserving all nested entity IDs
   *
   * @param athleteId - The ID of the athlete
   * @param uniqueRecords - Array of TerraDailyRecord to save
   * @returns Promise<void>
   */
  async batchSaveRecords(athleteId: string, uniqueRecords: TerraDailyRecord[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Fetch all existing records for this athlete and date range in one batch query
      const recordDates = uniqueRecords.map((r) => r.recordDate);
      const existingRecords = await manager.find(TerraDailyRecord, {
        where: {
          recordDate: In(recordDates),
          athlete: { id: athleteId },
        },
        relations: [
          'dailyMetrics',
          'dailyActivity',
          'stressData',
          'sleeps',
          'sleeps.sleepPerfMetrics',
          'sleeps.sleepRespirationData',
          'sleeps.sleepHrMetrics',
          'sleeps.sleepStageMetrics',
          'activities',
          'activities.activityMetrics',
          'activities.activityMetrics.activityMovement',
        ],
      });

      // Create a map for quick lookup: key = recordDate
      const existingRecordsMap = new Map<string, TerraDailyRecord>();
      for (const existingRecord of existingRecords) {
        existingRecordsMap.set(existingRecord.recordDate, existingRecord);
      }

      // Prepare records for batch save with proper ID preservation
      const recordsToSave: TerraDailyRecord[] = [];
      for (const record of uniqueRecords) {
        const existingRecord = existingRecordsMap.get(record.recordDate);

        if (existingRecord) {
          // Update existing record - preserve all IDs
          record.recordId = existingRecord.recordId;
          record.lastUpdated = new Date();

          // Preserve IDs of existing related entities so TypeORM updates instead of inserting
          if (existingRecord.dailyMetrics && record.dailyMetrics) {
            record.dailyMetrics.id = existingRecord.dailyMetrics.id;
            record.dailyMetrics.dailyRecordId = existingRecord.recordId;
          } else if (existingRecord.dailyMetrics && !record.dailyMetrics) {
            // Keep existing if new record doesn't have it
            record.dailyMetrics = existingRecord.dailyMetrics;
          }

          if (existingRecord.dailyActivity && record.dailyActivity) {
            record.dailyActivity.id = existingRecord.dailyActivity.id;
            record.dailyActivity.dailyRecordId = existingRecord.recordId;
          } else if (existingRecord.dailyActivity && !record.dailyActivity) {
            record.dailyActivity = existingRecord.dailyActivity;
          }

          if (existingRecord.stressData && record.stressData) {
            record.stressData.id = existingRecord.stressData.id;
            record.stressData.dailyRecordId = existingRecord.recordId;
          } else if (existingRecord.stressData && !record.stressData) {
            record.stressData = existingRecord.stressData;
          }

          // Merge sleeps: match existing by startTime to preserve IDs, add new ones
          if (record.sleeps && record.sleeps.length > 0) {
            const existingSleepsMap = new Map<string, TerraSleep>();
            if (existingRecord.sleeps && existingRecord.sleeps.length > 0) {
              for (const existingSleep of existingRecord.sleeps) {
                if (existingSleep.startTime) {
                  const key = existingSleep.startTime.toISOString();
                  existingSleepsMap.set(key, existingSleep);
                }
              }
            }

            // Match new sleeps with existing ones by startTime and preserve IDs
            for (const sleep of record.sleeps) {
              sleep.terraDailyRecord = record;
              if (sleep.startTime) {
                const key = sleep.startTime.toISOString();
                const existingSleep = existingSleepsMap.get(key);
                if (existingSleep?.id) {
                  // Preserve sleep ID and all nested entity IDs
                  sleep.id = existingSleep.id;

                  // Preserve nested metrics IDs
                  if (existingSleep.sleepPerfMetrics && sleep.sleepPerfMetrics) {
                    sleep.sleepPerfMetrics.id = existingSleep.sleepPerfMetrics.id;
                    sleep.sleepPerfMetrics.sleepId = existingSleep.id;
                  }
                  if (existingSleep.sleepRespirationData && sleep.sleepRespirationData) {
                    sleep.sleepRespirationData.id = existingSleep.sleepRespirationData.id;
                    sleep.sleepRespirationData.sleepId = existingSleep.id;
                  }
                  if (existingSleep.sleepHrMetrics && sleep.sleepHrMetrics) {
                    sleep.sleepHrMetrics.id = existingSleep.sleepHrMetrics.id;
                    sleep.sleepHrMetrics.sleepId = existingSleep.id;
                  }
                  if (existingSleep.sleepStageMetrics && sleep.sleepStageMetrics) {
                    sleep.sleepStageMetrics.id = existingSleep.sleepStageMetrics.id;
                    sleep.sleepStageMetrics.sleepId = existingSleep.id;
                  }
                }
              }
            }
          } else if (existingRecord.sleeps && existingRecord.sleeps.length > 0) {
            // Keep existing sleeps if no new ones provided
            record.sleeps = existingRecord.sleeps;
            // Update the relationship reference to point to the new record object
            for (const sleep of record.sleeps) {
              sleep.terraDailyRecord = record;
            }
          }

          // Merge activities: match existing by startTime to preserve IDs, add new ones
          if (record.activities && record.activities.length > 0) {
            const existingActivitiesMap = new Map<string, TerraActivity>();
            if (existingRecord.activities && existingRecord.activities.length > 0) {
              for (const existingActivity of existingRecord.activities) {
                if (existingActivity.startTime) {
                  const key = existingActivity.startTime.toISOString();
                  existingActivitiesMap.set(key, existingActivity);
                }
              }
            }

            // Match new activities with existing ones by startTime and preserve IDs
            for (const activity of record.activities) {
              activity.terraDailyRecord = record;
              if (activity.startTime) {
                const key = activity.startTime.toISOString();
                const existingActivity = existingActivitiesMap.get(key);
                if (existingActivity?.id) {
                  // Preserve activity ID and nested metrics ID
                  activity.id = existingActivity.id;

                  // Preserve nested metrics ID and nested movement data ID
                  if (existingActivity.activityMetrics && activity.activityMetrics) {
                    activity.activityMetrics.id = existingActivity.activityMetrics.id;
                    activity.activityMetrics.activityId = existingActivity.id;

                    // Preserve nested activityMovement ID
                    if (
                      existingActivity.activityMetrics.activityMovement &&
                      activity.activityMetrics.activityMovement
                    ) {
                      activity.activityMetrics.activityMovement.id =
                        existingActivity.activityMetrics.activityMovement.id;
                      activity.activityMetrics.activityMovement.activityMetricsId = existingActivity.activityMetrics.id;
                    }
                  }
                }
              }
            }
          } else if (existingRecord.activities && existingRecord.activities.length > 0) {
            // Keep existing activities if no new ones provided
            record.activities = existingRecord.activities;
            // Update the relationship reference to point to the new record object
            for (const activity of record.activities) {
              activity.terraDailyRecord = record;
            }
          }

          recordsToSave.push(record);
        } else {
          // Insert new record - generate recordId if not present
          if (!record.recordId) {
            record.recordId = generateUuidv7();
          }

          // Ensure all sleeps and activities have their terraDailyRecord reference set correctly
          if (record.sleeps) {
            for (const sleep of record.sleeps) {
              sleep.terraDailyRecord = record;
            }
          }
          if (record.activities) {
            for (const activity of record.activities) {
              activity.terraDailyRecord = record;
            }
          }

          recordsToSave.push(record);
        }
      }

      // Batch save all records at once
      if (recordsToSave.length > 0) {
        await manager.save(TerraDailyRecord, recordsToSave);
      }
    });
  }
}
