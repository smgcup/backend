import { Injectable } from '@nestjs/common';
import type { TerraAthleteActivityDataResponse } from '../responses/terra-responses';
import type { ActivityDataItem } from '../types';
import { TerraActivity } from '../entities/terra-activity.entity';
import { generateUuidv7 } from '../../shared/utils/generateUuidV7';
import { TerraActivityMetrics } from '../entities/terra-activity-metrics.entity';
import { TerraActivityHrZoneData } from '../entities/terra-activity-hr-zone-data.entity';
import { TerraActivityMovementData } from '../entities/terra-activity-movement-data.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TerraActivityType } from '../entities/terra-activity-type.entity';
import extractTimezoneOffsetFromTimestamp from '../../shared/utils/extractTimezoneOffsetFromTimestamp';
import { BadRequestError } from '../../exception/exceptions';
import { TERRA_TRANSLATION_CODES } from '../../exception/translation-codes';

type Ids = {
  activityId: string;
  activityMetricsId: string;
  activityHrZoneDataId: string;
  activityMovementDataId: string;
};
@Injectable()
export class TerraActivityDataTransformer {
  constructor(
    @InjectRepository(TerraActivityType)
    private terraActivityTypeRepository: Repository<TerraActivityType>,
  ) {}
  public async transform(activityDataResponse: TerraAthleteActivityDataResponse): Promise<TerraActivity[]> {
    const terraActivities = await this.transformActivity(activityDataResponse);
    return terraActivities;
  }

  private async transformActivity(activityDataResponse: TerraAthleteActivityDataResponse): Promise<TerraActivity[]> {
    const activityData = activityDataResponse.data;

    const terraActivityType = await this.terraActivityTypeRepository.findOne({
      where: {
        id: '019a3614-1562-799a-88e6-9d6db9d197c3',
      },
    });
    if (!terraActivityType) {
      throw new BadRequestError(
        TERRA_TRANSLATION_CODES.terraActivityTypeUnknown,
        'Could not find unknown activity type',
      );
    }
    const terraActivities: TerraActivity[] = [];
    for (let i = 0; i < activityData.length; i++) {
      const ids = this.generateIds();

      const terraActivityMovementData = this.createTerraActivityMovementData(
        activityData[i],
        ids.activityMovementDataId,
      );

      const terraActivityMetrics = this.createTerraActivityMetrics(
        activityData[i],
        ids.activityMetricsId,
        terraActivityMovementData,
      );
      // const terraActivityHrZoneData = this.createTerraActivityHrZoneData(activityData[i], ids.activityHrZoneDataId);

      // TODO: Implement proper activity entities relations
      const terraActivity = this.createTerraActivity(
        activityData[i],
        ids.activityId,
        terraActivityType,
        terraActivityMetrics,
      );
      terraActivities.push(terraActivity);
    }

    return terraActivities;
  }

  /**
   * Creates a set of IDs for a TerraDailyRecord, TerraDailyMetrics, TerraDailyActivity, and TerraStressData
   * @returns The created IDs
   */
  private generateIds(): Ids {
    return {
      activityId: generateUuidv7(),
      activityMetricsId: generateUuidv7(),
      activityHrZoneDataId: generateUuidv7(),
      activityMovementDataId: generateUuidv7(),
    };
  }

  private createTerraActivity(
    activityData: ActivityDataItem,
    activityId: string,
    activityType: TerraActivityType,
    activityMetrics: TerraActivityMetrics,
  ): TerraActivity {
    const terraActivity = new TerraActivity();
    terraActivity.id = activityId;
    // terraActivity.recordId = 'record_id';
    terraActivity.startTime = new Date(activityData.metadata.start_time);
    terraActivity.endTime = new Date(activityData.metadata.end_time);

    terraActivity.timezoneOffset = extractTimezoneOffsetFromTimestamp(activityData.metadata.start_time);

    terraActivity.durationSeconds = Math.round(activityData.active_durations_data.activity_seconds);
    terraActivity.name = activityData.metadata.name;
    // Set the FK on children (children now own the FK)
    activityMetrics.activityId = activityId;

    //? Relations (both sides for proper cascade)
    terraActivity.activityMetrics = activityMetrics;
    activityMetrics.activity = terraActivity;

    terraActivity.activityType = activityType;

    return terraActivity;
  }

  private createTerraActivityMetrics(
    activityData: ActivityDataItem,
    activityMetricsId: string,
    terraActivityMovementData: TerraActivityMovementData,
  ): TerraActivityMetrics {
    const terraActivityMetrics = new TerraActivityMetrics();
    terraActivityMetrics.id = activityMetricsId;
    terraActivityMetrics.caloriesBurnedTotal = Math.round(activityData.calories_data.total_burned_calories);
    terraActivityMetrics.workKilojoules = Math.round(activityData.work_data.work_kilojoules);
    terraActivityMetrics.hrAvgBpm = Math.round(activityData.heart_rate_data.summary.avg_hr_bpm);
    terraActivityMetrics.hrMaxBpm = Math.round(activityData.heart_rate_data.summary.max_hr_bpm);
    terraActivityMetrics.hrMinBpm = Math.round(activityData.heart_rate_data.summary.min_hr_bpm);

    // Set the FK on children (children now own the FK)
    terraActivityMovementData.activityMetricsId = activityMetricsId;

    //? Relations (both sides for proper cascade)
    terraActivityMetrics.activityMovement = terraActivityMovementData;
    terraActivityMovementData.metrics = terraActivityMetrics;

    return terraActivityMetrics;
  }

  // TODO: Fix the implemention - right we are getting only the first element of an array
  private createTerraActivityHrZoneData(
    activityData: ActivityDataItem,
    activityHrZoneDataId: string,
  ): TerraActivityHrZoneData {
    const terraActivityHrZoneData = new TerraActivityHrZoneData();
    terraActivityHrZoneData.id = activityHrZoneDataId;
    terraActivityHrZoneData.zoneNumber = activityData.heart_rate_data.summary.hr_zone_data[0].zone;
    terraActivityHrZoneData.name = activityData.heart_rate_data.summary.hr_zone_data[0].name;
    terraActivityHrZoneData.durationSeconds = Math.round(
      activityData.heart_rate_data.summary.hr_zone_data[0].duration_seconds,
    );
    terraActivityHrZoneData.startPercentage = activityData.heart_rate_data.summary.hr_zone_data[0].start_percentage;
    terraActivityHrZoneData.endPercentage = activityData.heart_rate_data.summary.hr_zone_data[0].end_percentage;
    return terraActivityHrZoneData;
  }

  private createTerraActivityMovementData(
    activityData: ActivityDataItem,
    activityMovementDataId: string,
  ): TerraActivityMovementData {
    const terraActivityMovementData = new TerraActivityMovementData();
    terraActivityMovementData.id = activityMovementDataId;
    terraActivityMovementData.distanceMeters = Math.round(activityData.distance_data.summary.distance_meters);

    return terraActivityMovementData;
  }
}
