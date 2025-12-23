import { Injectable } from '@nestjs/common';
import { TerraDailyRecord } from '../entities/terra-daily-record.entity';
import { TerraDailyMetrics } from '../entities/terra-daily-metrics.entity';
import { TerraDailyActivity } from '../entities/terra-daily-activity.entity';
import { TerraStressData } from '../entities/terra-stress-data.entity';
import type { TerraAthleteDailyDataResponse } from '../responses/terra-responses';
import { generateUuidv7 } from '../../shared/utils/generateUuidV7';
import { Athlete } from '../../athlete/entities/athlete.entity';
import { TerraDailyDataItem } from '../types/terra-athlete-daily-data.response';
import extractTimezoneOffsetFromTimestamp from '../../shared/utils/extractTimezoneOffsetFromTimestamp';
export type TerraDailyTransformationResult = {
  terraDailyRecords: TerraDailyRecord[];
};

type Ids = {
  terraDailyRecordId: string;
  terraDailyMetricsId: string;
  terraDailyActivityId: string;
  terraStressDataId: string;
};

@Injectable()
export class TerraDailyDataTransformer {
  public transform(dailyDataResponse: TerraAthleteDailyDataResponse, athlete: Athlete): TerraDailyRecord[] {
    const terraDailyRecords = this.transformDailyRecord(dailyDataResponse, athlete);

    return terraDailyRecords;
  }

  private transformDailyRecord(dailyDataResponse: TerraAthleteDailyDataResponse, athlete: Athlete): TerraDailyRecord[] {
    const dailyData = dailyDataResponse.data;

    const terraDailyRecords: TerraDailyRecord[] = [];

    for (let i = 0; i < dailyData.length; i++) {
      const ids = this.generateIds();

      const terraDailyMetric = this.createTerraDailyMetrics(dailyData[i], ids.terraDailyMetricsId);
      const terraDailyActivity = this.createTerraDailyActivity(dailyData[i], ids.terraDailyActivityId);
      const terraStressDataItem = this.createTerraStressData(dailyData[i], ids.terraStressDataId);

      const terraDailyRecord = this.createTerraDailyRecord(
        dailyData[i],
        athlete,
        ids.terraDailyRecordId,
        terraDailyMetric,
        terraDailyActivity,
        terraStressDataItem,
      );
      terraDailyRecords.push(terraDailyRecord);
    }
    return terraDailyRecords;
  }

  /**
   * Creates a set of IDs for a TerraDailyRecord, TerraDailyMetrics, TerraDailyActivity, and TerraStressData
   * @returns The created IDs
   */
  private generateIds(): Ids {
    return {
      terraDailyRecordId: generateUuidv7(),
      terraDailyMetricsId: generateUuidv7(),
      terraDailyActivityId: generateUuidv7(),
      terraStressDataId: generateUuidv7(),
    };
  }

  /**
   * Creates a TerraDailyRecord entity from a TerraDailyDataItem
   * @param dailyDataItem - The daily data item to create the TerraDailyRecord for
   * @param athlteId - The ID of the athlete
   * @param ids - The IDs to use for the TerraDailyRecord
   * @returns The created TerraDailyRecord
   */
  private createTerraDailyRecord(
    dailyDataItem: TerraDailyDataItem,
    athlete: Athlete,
    terraDailyRecordId: string,
    terraDailyMetric: TerraDailyMetrics,
    terraDailyActivity: TerraDailyActivity,
    terraStressDataItem: TerraStressData,
  ): TerraDailyRecord {
    const terraDailyRecord = new TerraDailyRecord();

    terraDailyRecord.recordId = terraDailyRecordId;
    terraDailyRecord.athlete = athlete;

    const startStr = dailyDataItem.metadata.start_time;
    const [datePart] = startStr.split('T');

    const date = new Date(datePart + 'T00:00:00');
    date.setDate(date.getDate());

    // Get YYYY-MM-DD in local time (no UTC conversion)
    const recordDate =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');
    terraDailyRecord.recordDate = recordDate;
    terraDailyRecord.lastUpdated = new Date();
    terraDailyRecord.timezoneOffset = extractTimezoneOffsetFromTimestamp(dailyDataItem.metadata.start_time);

    // Set the FK on children (children now own the FK)
    terraDailyMetric.dailyRecordId = terraDailyRecordId;
    terraDailyActivity.dailyRecordId = terraDailyRecordId;
    terraStressDataItem.dailyRecordId = terraDailyRecordId;

    // Set the relations for proper cascade from parent
    terraDailyRecord.dailyMetrics = terraDailyMetric;
    terraDailyMetric.dailyRecord = terraDailyRecord;

    terraDailyRecord.dailyActivity = terraDailyActivity;
    terraDailyActivity.dailyRecord = terraDailyRecord;

    terraDailyRecord.stressData = terraStressDataItem;
    terraStressDataItem.dailyRecord = terraDailyRecord;

    return terraDailyRecord;
  }

  /**
   * Creates a TerraDailyMetrics entity from a TerraDailyDataItem
   * @param dailyDataItem - The daily data item to create the TerraDailyMetrics for
   * @param terraDailyMetricsId - The ID to use for the TerraDailyMetrics
   * @returns The created TerraDailyMetrics
   */
  private createTerraDailyMetrics(dailyDataItem: TerraDailyDataItem, terraDailyMetricsId: string): TerraDailyMetrics {
    const terraDailyMetrics = new TerraDailyMetrics();

    terraDailyMetrics.id = terraDailyMetricsId;
    terraDailyMetrics.recovery = dailyDataItem.scores.recovery;
    terraDailyMetrics.strain = dailyDataItem.strain_data.strain_level
      ? parseFloat(dailyDataItem.strain_data.strain_level.toFixed(1))
      : null;
    terraDailyMetrics.avgHrBpm = Math.round(dailyDataItem.heart_rate_data.summary.avg_hr_bpm);
    terraDailyMetrics.maxHrBpm = Math.round(dailyDataItem.heart_rate_data.summary.max_hr_bpm);
    terraDailyMetrics.minHrBpm = Math.round(dailyDataItem.heart_rate_data.summary.min_hr_bpm);
    terraDailyMetrics.trimp = 2; //? TODO: Implement TRIMP calculation

    return terraDailyMetrics;
  }

  /**
   * Creates a TerraDailyActivity entity from a TerraDailyDataItem
   * @param dailyDataItem - The daily data item to create the TerraDailyActivity for
   * @param terraDailyActivityId - The ID to use for the TerraDailyActivity
   * @returns The created TerraDailyActivity
   */
  private createTerraDailyActivity(
    dailyDataItem: TerraDailyDataItem,
    terraDailyActivityId: string,
  ): TerraDailyActivity {
    const terraDailyActivity = new TerraDailyActivity();

    terraDailyActivity.id = terraDailyActivityId;
    terraDailyActivity.activitySeconds = Math.round(dailyDataItem.active_durations_data.activity_seconds);
    terraDailyActivity.inactivitySeconds = Math.round(dailyDataItem.active_durations_data.inactivity_seconds);
    terraDailyActivity.lowIntensitySeconds = Math.round(dailyDataItem.active_durations_data.low_intensity_seconds);
    terraDailyActivity.moderateIntensitySeconds = Math.round(
      dailyDataItem.active_durations_data.moderate_intensity_seconds,
    );
    terraDailyActivity.highIntensitySeconds = Math.round(
      dailyDataItem.active_durations_data.vigorous_intensity_seconds,
    );
    terraDailyActivity.totalBurnedCalories = Math.round(dailyDataItem.calories_data.total_burned_calories);
    return terraDailyActivity;
  }

  /**
   * Creates a TerraStressData entity from a TerraDailyDataItem
   * @param dailyDataItem - The daily data item to create the TerraStressData for
   * @param terraStressDataId - The ID to use for the TerraStressData
   * @returns The created TerraStressData
   */
  private createTerraStressData(dailyDataItem: TerraDailyDataItem, terraStressDataId: string): TerraStressData {
    const terraStressData = new TerraStressData();

    terraStressData.id = terraStressDataId;
    terraStressData.lowStressDurationSeconds = dailyDataItem.stress_data.low_stress_duration_seconds;
    terraStressData.mediumStressDurationSeconds = dailyDataItem.stress_data.medium_stress_duration_seconds;
    terraStressData.highStressDurationSeconds = dailyDataItem.stress_data.high_stress_duration_seconds;
    terraStressData.avgStressLevel = dailyDataItem.stress_data.avg_stress_level;
    terraStressData.maxStressLevel = dailyDataItem.stress_data.max_stress_level;

    return terraStressData;
  }
}
