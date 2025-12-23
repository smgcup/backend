import { Injectable } from '@nestjs/common';
import { AcuteSymptomParameterService } from '../acute-symptom-rule/acute-symptom-parameter.service';
import { AcuteSymptomParameter } from '../acute-symptom-rule/entities/acute-symptom-parameter.entity';
import { Athlete } from '../athlete/entities/athlete.entity';
import { AthleteDailyRecordService } from '../athlete/athlete-daily-record.service';
import { AthleteDailyRecord } from '../athlete/entities/athlete-daily-record.entity';
import { ParameterDeviations } from './entities/parameter-deviations.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';

type ParameterValues = {
  mean: number;
  sigma1: number;
};

type MetricKey = keyof Pick<
  AthleteDailyRecord,
  | 'recovery'
  | 'strain'
  | 'rhr'
  | 'hrv'
  | 'sleepPerformance'
  | 'sleepConsistency'
  | 'sleepEfficiency'
  | 'sleepDuration'
  | 'restorativeSleepDuration'
  | 'restorativeSleep'
>;

const METRIC_KEYS: MetricKey[] = [
  'recovery',
  'strain',
  'rhr',
  'hrv',
  'sleepPerformance',
  'sleepConsistency',
  'sleepEfficiency',
  'sleepDuration',
  'restorativeSleepDuration',
  'restorativeSleep',
];

@Injectable()
export class MetricDeviationService {
  constructor(
    private readonly acuteSymptomParameterService: AcuteSymptomParameterService,
    private readonly athleteDailyRecordService: AthleteDailyRecordService,
    @InjectRepository(ParameterDeviations)
    private readonly parameterDeviationRepository: Repository<ParameterDeviations>,
  ) {}

  async calculateAndSaveMetricDeviation({ athleteId }: { athleteId: Athlete['id'] }) {
    const acuteSymptomParameters = await this.acuteSymptomParameterService.getAcuteSymptomParameters();
    const athleteDailyRecords = await this.athleteDailyRecordService.getAthleteDailyRecords(athleteId);

    const metricData = METRIC_KEYS.map((metricKey) => {
      const parameter = acuteSymptomParameters.find((p) => p.key === metricKey)!;
      const stats = this.calculateMetricStatistics(athleteDailyRecords, metricKey);
      return {
        parameter,
        stats,
        deviation: stats.sigma1,
      };
    });

    await this.saveOrUpdateParameterDeviations(metricData, athleteId);

    return this.mapParametersToDeviations(metricData);
  }

  private mapParametersToDeviations(
    metricData: Array<{ parameter: { id: string }; deviation: number }>,
  ): Record<string, number> {
    return metricData.reduce(
      (acc, { parameter, deviation }) => {
        acc[parameter.id] = deviation;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Maps MetricKey values to parameter IDs
   * @param metricValues Object with MetricKey as keys and values as numbers or strings (null values are filtered out)
   * @returns Object with parameter IDs as keys and values as numbers
   */
  public async mapMetricKeyObjectToParameterIds(
    metricValues: Partial<Record<MetricKey, number | string | null>>,
  ): Promise<Record<string, number>> {
    const acuteSymptomParameters = await this.acuteSymptomParameterService.getAcuteSymptomParameters();
    const result: Record<string, number> = {};

    for (const [metricKey, value] of Object.entries(metricValues) as [
      MetricKey,
      number | string | null | undefined,
    ][]) {
      if (value !== null && value !== undefined) {
        const parameter = acuteSymptomParameters.find((p) => p.key === metricKey);
        if (parameter) {
          // Convert string values to numbers (TypeORM may return decimal fields as strings)
          const numericValue = typeof value === 'string' ? Number(value) : value;
          if (!isNaN(numericValue)) {
            result[parameter.id] = numericValue;
          }
        }
      }
    }

    return result;
  }

  private calculateMetricStatistics(records: AthleteDailyRecord[], metricKey: MetricKey): ParameterValues {
    // Extract non-null values for the metric
    const values = records
      .map((record) => record[metricKey])
      .filter((value): value is number => value !== null && value !== undefined)
      .map((value) => Number(value));

    if (values.length === 0) {
      // Return default statistics if no data available
      return {
        mean: 0,
        sigma1: 0,
      };
    }

    // Calculate mean (average)
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

    // Calculate standard deviation
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate sigma values (multiples of standard deviation)
    const sigma1 = standardDeviation;

    return {
      mean: Math.round(mean * 100) / 100,
      sigma1: Math.round(sigma1 * 100) / 100,
    };
  }

  private async saveOrUpdateParameterDeviations(
    metricData: Array<{ parameter: AcuteSymptomParameter; stats: ParameterValues }>,
    athleteId: string,
  ) {
    const parameterIds = metricData.map(({ parameter }) => parameter.id);

    // Find existing records for this athlete and these parameters
    const existingDeviations = await this.parameterDeviationRepository
      .createQueryBuilder('pd')
      .leftJoinAndSelect('pd.parameter', 'parameter')
      .where('pd.athleteId = :athleteId', { athleteId })
      .andWhere('parameter.id IN (:...parameterIds)', { parameterIds })
      .getMany();

    // Create a map for quick lookup
    const existingMap = new Map(existingDeviations.map((dev) => [dev.parameter.id, dev]));

    const deviationsToSave: ParameterDeviations[] = [];

    for (const { parameter, stats } of metricData) {
      const existing = existingMap.get(parameter.id);

      if (existing) {
        // Update existing record
        existing.sigma1 = stats.sigma1;
        existing.mean = stats.mean;
        deviationsToSave.push(existing);
      } else {
        // Create new record
        const parameterDeviation = new ParameterDeviations();
        parameterDeviation.id = generateUuidv7();
        parameterDeviation.parameter = parameter;
        parameterDeviation.sigma1 = stats.sigma1;
        parameterDeviation.mean = stats.mean;
        parameterDeviation.athleteId = athleteId;
        deviationsToSave.push(parameterDeviation);
      }
    }

    return await this.parameterDeviationRepository.save(deviationsToSave);
  }
}
