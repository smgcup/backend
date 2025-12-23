import { Injectable } from '@nestjs/common';
import type { TerraAthleteSleepDataResponse } from '../responses/terra-responses';
import type { SleepDataItem } from '../types/terra-athlete-sleep-data.response';
import { TerraSleep } from '../entities/terra-sleep.entity';
import { generateUuidv7 } from '../../shared/utils/generateUuidV7';
import { TerraSleepPerfMetrics } from '../entities/terra-sleep-perf-metrics.entity';
import { TerraSleepRespirationData } from '../entities/terra-sleep-respiration-data.entity';
import { TerraSleepHrMetrics } from '../entities/terra-sleep-hr-metrics.entity';
import { TerraSleepStageMetrics } from '../entities/terra-sleep-stage-metrics.entity';
import extractTimezoneOffsetFromTimestamp from '../../shared/utils/extractTimezoneOffsetFromTimestamp';
type Ids = {
  terraSleepId: string;
  terraSleepPerfMetricsId: string;
  terraSleepStageMetricsId: string;
  terraSleepHrMetricsId: string;
  terraSleepRespirationDataId: string;
};
@Injectable()
export class TerraSleepDataTransformer {
  public transform(sleepDataResponse: TerraAthleteSleepDataResponse): TerraSleep[] {
    const terraSleeps = this.transformSleepData(sleepDataResponse);

    return terraSleeps;
  }
  private transformSleepData(sleepDataResponse: TerraAthleteSleepDataResponse): TerraSleep[] {
    const sleepData = sleepDataResponse.data;

    const terraSleeps: TerraSleep[] = [];

    for (let i = 0; i < sleepData.length; i++) {
      const ids = this.createIds();

      const terraSleepPerfMetric = this.createTerraSleepPerfMetrics(sleepData[i], ids.terraSleepPerfMetricsId);
      const terraSleepHrMetrics = this.createTerraSleepHrMetrics(sleepData[i], ids.terraSleepHrMetricsId);
      const terraSleepStageMetrics = this.createTerraSleepStageMetrics(sleepData[i], ids.terraSleepStageMetricsId);
      const terraSleepRespirationData = this.createTerraSleepRespirationData(
        sleepData[i],
        ids.terraSleepRespirationDataId,
      );

      const terraSleep = this.createTerraSleep(
        sleepData[i],
        ids,
        terraSleepPerfMetric,
        terraSleepHrMetrics,
        terraSleepRespirationData,
        terraSleepStageMetrics,
      );
      terraSleeps.push(terraSleep);
    }
    return terraSleeps;
  }

  /**
   * Creates a set of IDs for a TerraSleep, TerraSleepPerfMetrics, TerraSleepStageMetrics, TerraSleepHrMetrics, and TerraSleepRespirationData
   * @returns The created IDs
   * @example
   * ```typescript
   * const ids = this.createIds();
   * // Returns the created IDs
   * // {
   * //   terraSleepId: '123e4567-e89b-12d3-a456-426614174000',
   * //   terraSleepPerfMetricsId: '123e4567-e89b-12d3-a456-426614174001',
   * //   terraSleepStageMetricsId: '123e4567-e89b-12d3-a456-426614174002',
   * //   terraSleepHrMetricsId: '123e4567-e89b-12d3-a456-426614174003',
   * //   terraSleepRespirationDataId: '123e4567-e89b-12d3-a456-426614174004',
   * // }
   * ```
   */
  private createIds(): Ids {
    return {
      terraSleepId: generateUuidv7(),
      terraSleepPerfMetricsId: generateUuidv7(),
      terraSleepStageMetricsId: generateUuidv7(),
      terraSleepHrMetricsId: generateUuidv7(),
      terraSleepRespirationDataId: generateUuidv7(),
    };
  }
  /**
   * Creates a TerraSleep entity from a SleepDataItem
   * @param sleepDataItem - The sleep data item to create the TerraSleep for
   * @param ids - The IDs to use for the TerraSleep
   * @param terraSleepPerfMetrics - The TerraSleepPerfMetrics to use for the TerraSleep
   * @param terraSleepHrMetrics - The TerraSleepHrMetrics to use for the TerraSleep
   * @param terraSleepRespirationData - The TerraSleepRespirationData to use for the TerraSleep
   * @returns The created TerraSleep
   */

  private createTerraSleep(
    sleepDataItem: SleepDataItem,
    ids: Ids,
    terraSleepPerfMetrics: TerraSleepPerfMetrics,
    terraSleepHrMetrics: TerraSleepHrMetrics,
    terraSleepRespirationData: TerraSleepRespirationData,
    terraSleepStageMetrics: TerraSleepStageMetrics,
  ): TerraSleep {
    const terraSleep = new TerraSleep();

    terraSleep.id = ids.terraSleepId;
    // terraSleep.recordId = 'record_id';

    terraSleep.nap = sleepDataItem.metadata.is_nap;
    terraSleep.startTime = new Date(sleepDataItem.metadata.start_time);
    terraSleep.endTime = new Date(sleepDataItem.metadata.end_time);
    terraSleep.timezoneOffset = extractTimezoneOffsetFromTimestamp(sleepDataItem.metadata.start_time); //? Figure out why the timezone offset is always

    terraSleep.oxygenSaturationPercentage = sleepDataItem.respiration_data.oxygen_saturation_data
      .avg_saturation_percentage
      ? parseFloat(sleepDataItem.respiration_data.oxygen_saturation_data.avg_saturation_percentage.toFixed(1))
      : null;
    terraSleep.skinTempDeltaDegrees = sleepDataItem.temperature_data.delta
      ? parseFloat(sleepDataItem.temperature_data.delta.toFixed(1))
      : null;

    // Set the FK on children (children now own the FK)
    terraSleepPerfMetrics.sleepId = ids.terraSleepId;
    terraSleepStageMetrics.sleepId = ids.terraSleepId;
    terraSleepHrMetrics.sleepId = ids.terraSleepId;
    terraSleepRespirationData.sleepId = ids.terraSleepId;

    // Link the relations (both sides for proper cascade)
    terraSleep.sleepPerfMetrics = terraSleepPerfMetrics;
    terraSleepPerfMetrics.sleep = terraSleep;

    terraSleep.sleepStageMetrics = terraSleepStageMetrics;
    terraSleepStageMetrics.sleep = terraSleep;

    terraSleep.sleepHrMetrics = terraSleepHrMetrics;
    terraSleepHrMetrics.sleep = terraSleep;

    terraSleep.sleepRespirationData = terraSleepRespirationData;
    terraSleepRespirationData.sleep = terraSleep;

    return terraSleep;
  }

  /**
   * Creates a TerraSleepPerfMetrics entity from a SleepDataItem
   * @param sleepDataItem - The sleep data item to create the TerraSleepPerfMetrics for
   * @param terraSleepPerfMetricsId - The ID to use for the TerraSleepPerfMetrics
   * @returns The created TerraSleepPerfMetrics
   */
  private createTerraSleepPerfMetrics(
    sleepDataItem: SleepDataItem,
    terraSleepPerfMetricsId: string,
  ): TerraSleepPerfMetrics {
    const terraSleepPerfMetrics = new TerraSleepPerfMetrics();

    terraSleepPerfMetrics.id = terraSleepPerfMetricsId;
    terraSleepPerfMetrics.sleepPerformancePercentage = undefined; // Calculated by TerraSleepMetricsCalculatorService after persistence
    terraSleepPerfMetrics.sleepEfficiencyPercentage = Math.round(
      sleepDataItem.sleep_durations_data.sleep_efficiency * 100,
    );
    terraSleepPerfMetrics.sleepConsistencyPercentage = undefined; // Calculated by TerraSleepMetricsCalculatorService after persistence
    terraSleepPerfMetrics.avgBreathsPerMin = parseFloat(
      sleepDataItem.respiration_data.breaths_data.avg_breaths_per_min.toFixed(1),
    );

    return terraSleepPerfMetrics;
  }

  /**
   * Creates a TerraSleepRespirationData entity from a SleepDataItem
   * @param sleepDataItem - The sleep data item to create the TerraSleepRespirationData for
   * @param terraSleepRespirationDataId - The ID to use for the TerraSleepRespirationData
   * @returns The created TerraSleepRespirationData
   */
  private createTerraSleepRespirationData(
    sleepDataItem: SleepDataItem,
    terraSleepRespirationDataId: string,
  ): TerraSleepRespirationData {
    const terraSleepRespirationData = new TerraSleepRespirationData();

    terraSleepRespirationData.id = terraSleepRespirationDataId;

    terraSleepRespirationData.avgBreathsPerMin = sleepDataItem.respiration_data.breaths_data.avg_breaths_per_min
      ? parseFloat(sleepDataItem.respiration_data.breaths_data.avg_breaths_per_min.toFixed(1))
      : null;

    terraSleepRespirationData.maxBreathsPerMin = sleepDataItem.respiration_data.breaths_data.max_breaths_per_min
      ? parseFloat(sleepDataItem.respiration_data.breaths_data.max_breaths_per_min.toFixed(1))
      : null;

    terraSleepRespirationData.minBreathsPerMin = sleepDataItem.respiration_data.breaths_data.min_breaths_per_min
      ? parseFloat(sleepDataItem.respiration_data.breaths_data.min_breaths_per_min.toFixed(1))
      : null;

    return terraSleepRespirationData;
  }

  private createTerraSleepHrMetrics(sleepDataItem: SleepDataItem, terraSleepHrMetricsId: string): TerraSleepHrMetrics {
    const terraSleepHrMetrics = new TerraSleepHrMetrics();

    terraSleepHrMetrics.id = terraSleepHrMetricsId;
    terraSleepHrMetrics.minHrBpm = Math.round(sleepDataItem.heart_rate_data.summary.min_hr_bpm);
    terraSleepHrMetrics.maxHrBpm = Math.round(sleepDataItem.heart_rate_data.summary.max_hr_bpm);
    terraSleepHrMetrics.avgHrBpm = Math.round(sleepDataItem.heart_rate_data.summary.avg_hr_bpm);
    terraSleepHrMetrics.restingHrBpm = Math.round(sleepDataItem.heart_rate_data.summary.resting_hr_bpm);
    terraSleepHrMetrics.avgHrv = Math.round(sleepDataItem.heart_rate_data.summary.avg_hrv_rmssd);
    terraSleepHrMetrics.hrvCalculation = 'RMSSD'; //? TODO: Implement dynamic HRV algorithm settning for different providers

    return terraSleepHrMetrics;
  }

  private createTerraSleepStageMetrics(
    sleepDataItem: SleepDataItem,
    terraSleepStageMetricsId: string,
  ): TerraSleepStageMetrics {
    const terraSleepStageMetrics = new TerraSleepStageMetrics();

    const lightSleepSeconds = Math.round(sleepDataItem.sleep_durations_data.asleep.duration_light_sleep_state_seconds);
    const deepSleepSeconds = Math.round(sleepDataItem.sleep_durations_data.asleep.duration_deep_sleep_state_seconds);
    const remSleepSeconds = Math.round(sleepDataItem.sleep_durations_data.asleep.duration_REM_sleep_state_seconds);

    terraSleepStageMetrics.id = terraSleepStageMetricsId;
    terraSleepStageMetrics.lightSleepSeconds = lightSleepSeconds;
    terraSleepStageMetrics.deepSleepSeconds = deepSleepSeconds;
    terraSleepStageMetrics.remSleepSeconds = remSleepSeconds;

    terraSleepStageMetrics.numWakeupEvents = sleepDataItem.sleep_durations_data.awake.num_wakeup_events;
    terraSleepStageMetrics.awakeSeconds = Math.round(
      sleepDataItem.sleep_durations_data.awake.duration_awake_state_seconds,
    );
    terraSleepStageMetrics.timeAsleepSeconds = Math.round(
      sleepDataItem.sleep_durations_data.asleep.duration_asleep_state_seconds,
    );
    terraSleepStageMetrics.timeInBedSeconds = Math.round(lightSleepSeconds + deepSleepSeconds + remSleepSeconds);

    return terraSleepStageMetrics;
  }
}
