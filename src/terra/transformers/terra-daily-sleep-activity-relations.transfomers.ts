import { TerraSleep } from '../entities/terra-sleep.entity';
import { TerraActivity } from '../entities/terra-activity.entity';
import { TerraDailyRecord } from '../entities/terra-daily-record.entity';
/**
 * Assigns sleep and activity relations to their corresponding TerraDailyRecord entities.
 * Matches by date using the helper functions to determine the appropriate record date.
 *
 * @param terraDailyRecords - Array of TerraDailyRecord entities
 * @param terraSleeps - Array of TerraSleep entities to assign
 * @param terraActivities - Array of TerraActivity entities to assign
 * @returns The TerraDailyRecord array with all relations assigned
 */
export class TerraDailySleepActivityRelationsTransformer {
  public transform(
    terraDailyRecords: TerraDailyRecord[],
    terraSleeps: TerraSleep[],
    terraActivities: TerraActivity[],
  ): TerraDailyRecord[] {
    // Create a map of daily records by date for efficient lookup
    const dailyRecordMap = new Map<string, TerraDailyRecord>();
    for (const record of terraDailyRecords) {
      dailyRecordMap.set(record.recordDate, record);
      // Initialize arrays if they don't exist
      record.sleeps = record.sleeps || [];
      record.activities = record.activities || [];
    }

    // Sort sleeps by start time for efficient lookup of next sleep
    const sortedSleeps = [...terraSleeps].sort((a, b) => {
      const aStart = a.startTime?.getTime() ?? 0;
      const bStart = b.startTime?.getTime() ?? 0;
      return aStart - bStart;
    });

    // Assign sleeps to their corresponding daily records
    for (const sleep of terraSleeps) {
      const recordDate = this.setTerraSleepRecordDate(sleep.endTime);
      if (recordDate) {
        const dailyRecord = dailyRecordMap.get(recordDate);
        if (dailyRecord) {
          sleep.terraDailyRecord = dailyRecord;
          dailyRecord.sleeps!.push(sleep);
        }
      }
    }

    // Assign activities to their corresponding daily records
    for (const activity of terraActivities) {
      const recordDate = this.setTerraActivityRecordDate(activity.endTime, sortedSleeps);
      if (recordDate) {
        const dailyRecord = dailyRecordMap.get(recordDate);
        if (dailyRecord) {
          activity.terraDailyRecord = dailyRecord;
          dailyRecord.activities!.push(activity);
        }
      }
    }

    return terraDailyRecords;
  }

  /**
   * Determines the record date for a TerraSleep entity based on its start and end times.
   * Uses the sleep end time to set the record date, then reduces it by 1 day.
   * The sleep happened at the end of the day, so the record date is the day before.
   *
   * @param endTime - The end time of the sleep record
   * @returns The record date string (YYYY-MM-DD format) that this sleep should be associated with, or null if it cannot be determined
   */
  private setTerraSleepRecordDate(endTime: Date | undefined): string | null {
    if (!endTime) {
      return null;
    }

    try {
      // Create a new Date object to avoid mutating the original
      const endDate = new Date(endTime);

      endDate.setDate(endDate.getDate());

      // Format as YYYY-MM-DD
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn(`Invalid date format in sleep end_time: ${endTime.toISOString()}`, error);
      return null;
    }
  }

  /**
   * Determines the record date for a TerraActivity entity based on its end time and the next sleep.
   * If the activity ends between 12 AM and 6 AM, checks if the next sleep starts within 8 hours.
   * If the next sleep starts within 8 hours after the activity ends, assigns the activity to the previous day.
   * Otherwise, assigns the activity to the current day based on end time.
   *
   * @param endTime - The end time of the activity record
   * @param sortedSleeps - Array of TerraSleep entities sorted by start time
   * @returns The record date string (YYYY-MM-DD format) that this activity should be associated with, or null if it cannot be determined
   */

  // 1. sleep[n-1] and sleep[n] > recordDate of activity is sleep[n] recordDate:

  // Sleep assigned to night of 13th Sep
  // Sleep assigned to night of 14th Sep
  // Activity done at 5pm on the 14th Sep -> recordDate of activity is 14th Sep
  // Activity done at 2am on the 15th Sep(assuming sleepStart is after 2am) -> recordDate of activity is 14th Sep

  // 2. missing sleep[n-1] but sleep[n]
  // No sleep assigned to night of 13th Sep
  // Sleep assigned to night of 14th Sep

  // Activity done any time on the 13th Sep -> recordDate of activity is 13th Sep (uses calendar date)
  // Activity done any time on the 14th Sep -> recordDate of activity is 14th Sep (uses calendar date)
  // Activity done at 2am on the 15th Sep (assuming sleepStart is after 2am) -> recordDate of activity is 14th Sep (same as case 1)

  // 3. sleep before but missing sleep after

  // Sleep assigned to night of 13th Sep
  // No sleep assigned to night of 14th Sep
  // Activity done at 5pm on the 14th Sep -> recordDate of activity is 14th Sep
  // Activity done at 2am on the 15th Sep -> recordDate of activity is 14th Sep (since no sleep is detected )

  // 4. missing sleep before and after
  private setTerraActivityRecordDate(endTime: Date | undefined, sortedSleeps: TerraSleep[]): string | null {
    if (!endTime) {
      return null;
    }

    try {
      const endDate = new Date(endTime);
      const hours = endDate.getHours(); // 0-23

      // Check if activity ends between 12 AM (midnight) and 6 AM
      const isLateNightActivity = hours >= 0 && hours < 6;

      let activityDate: Date;

      if (isLateNightActivity) {
        // Only check for next sleep if activity ends between 12 AM and 6 AM
        const nextSleep = sortedSleeps.find((sleep) => sleep.startTime && sleep.startTime > endTime);

        if (nextSleep?.startTime) {
          // Calculate the time difference in milliseconds
          const timeDiffMs = nextSleep.startTime.getTime() - endTime.getTime();
          const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

          // If the next sleep starts within 8 hours, assign to previous day
          if (timeDiffHours < 8) {
            activityDate = new Date(endTime);
            activityDate.setDate(activityDate.getDate() - 1);
          } else {
            // More than 8 hours apart, assign to current day
            activityDate = new Date(endTime);
          }
        } else {
          // No next sleep found, assign to current day based on end time
          activityDate = new Date(endTime);
        }
      } else {
        // Activity doesn't end between 12 AM and 6 AM, assign to current day
        activityDate = new Date(endTime);
      }

      // Format as YYYY-MM-DD
      const year = activityDate.getFullYear();
      const month = String(activityDate.getMonth() + 1).padStart(2, '0');
      const day = String(activityDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn(`Invalid date format in activity end_time: ${endTime.toISOString()}`, error);
      return null;
    }
  }
}
