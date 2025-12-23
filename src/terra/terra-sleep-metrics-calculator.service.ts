import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Between, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { TerraDailyRecord } from './entities/terra-daily-record.entity';
import { TerraSleep } from './entities/terra-sleep.entity';

type SleepQualityInput = {
  sleep_duration: number; // minutes
  sleep_efficiency_pct: number; // 0–100
  sleep_consistency_pct: number; // 0–100
  restorative_sleep_pct: number; // 0–100
};

type SleepQualityBreakdown = {
  Duration: number; // 0–35
  Efficiency: number; // 0–25
  Consistency: number; // 0–20
  Restorative: number; // 0–20
};

type SleepQualityResult = {
  score: number; // 0–100 or NaN
  breakdown: SleepQualityBreakdown | null;
};

@Injectable()
export class TerraSleepMetricsCalculatorService {
  constructor(
    @InjectRepository(TerraDailyRecord)
    private readonly terraDailyRecordRepository: Repository<TerraDailyRecord>,
  ) {}

  private readonly MAX_DAYS_BEFORE_START_DATE = 7;
  private readonly DAYS_BEFORE_START_DATE = 4;
  // Exponent for non-linear consistency scoring penalty
  // Higher values create greater penalty for poor consistency scores
  // Using very high exponent to heavily penalize low scores
  private readonly CONSISTENCY_PENALTY_EXPONENT = 10.0;

  /**
   * Calculates the sleep metrics for a given athlete and date range.
   * @param athleteId - The ID of the athlete to calculate the sleep metrics for
   * @param startDate - The start date of the period to calculate the sleep metrics for
   * @param endDate - The end date of the period to calculate the sleep metrics for
   * @returns The sleep metrics for the given athlete and date range
   */
  async calculateSleepMetrics(athleteId: string, startDate: Date, endDate: Date): Promise<void> {
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    // Get the terra daily records for the given date range
    const terraDailyRecords = await this.terraDailyRecordRepository.find({
      where: {
        athlete: { id: athleteId },
        recordDate: Between(normalizedStartDate.toISOString(), normalizedEndDate.toISOString()),
      },
      relations: [
        'athlete',
        'sleeps',
        'sleeps.sleepPerfMetrics',
        'sleeps.sleepRespirationData',
        'sleeps.sleepHrMetrics',
        'sleeps.sleepStageMetrics',
      ],
    });

    // Get the terra daily records for the last 7 days
    const prevPeriodStartDate = new Date(normalizedStartDate);
    prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - this.MAX_DAYS_BEFORE_START_DATE);

    const prevPeriodTerraDailyRecords = await this.terraDailyRecordRepository.find({
      where: {
        athlete: { id: athleteId },
        recordDate: And(
          LessThan(normalizedStartDate.toISOString()),
          MoreThanOrEqual(prevPeriodStartDate.toISOString()),
        ),
      },
      order: {
        recordDate: 'DESC',
      },
      relations: [
        'athlete',
        'sleeps',
        'sleeps.sleepPerfMetrics',
        'sleeps.sleepRespirationData',
        'sleeps.sleepHrMetrics',
        'sleeps.sleepStageMetrics',
      ],
    });

    const mergedTerraDailyRecords = [...prevPeriodTerraDailyRecords, ...terraDailyRecords];

    for (const record of terraDailyRecords) {
      const sri = this.calculateSRIForRecord(mergedTerraDailyRecords, record.recordDate);
      if (record.sleeps) {
        // Calculate athlete's age from date of birth
        const athleteAge = record.athlete?.dateOfBirth
          ? this.calculateAge(record.athlete.dateOfBirth, new Date(record.recordDate))
          : null;

        for (const sleep of record.sleeps) {
          if (!sleep.nap && sleep.sleepPerfMetrics) {
            sleep.sleepPerfMetrics.sleepConsistencyPercentage = Math.round(sri);

            // Calculate and store sleep quality score
            const sleepQualityResult = this.calculateSleepQualityScore(sleep, athleteAge);
            if (sleepQualityResult.score !== null && !isNaN(sleepQualityResult.score)) {
              sleep.sleepPerfMetrics.sleepPerformancePercentage = Math.round(sleepQualityResult.score);
            }
          }
        }
      }
    }
    await this.terraDailyRecordRepository.save(terraDailyRecords);
  }

  /**
   * Calculates the Sleep Regularity Index (SRI) for a given window of sleep records.
   * SRI measures how likely it is that, at any given clock time, the athlete is in the same
   * state (asleep vs awake) on one day as they are at the same clock time on the next day.
   *
   * @param periodRecords - Array of TerraDailyRecord entities for the calculation window (N days)
   * @returns SRI value between 0 and 100
   */
  private calculateSRI(periodRecords: TerraDailyRecord[]): number {
    // Validate input
    if (periodRecords.length < this.DAYS_BEFORE_START_DATE) {
      console.warn(
        `Insufficient data for SRI calculation: Only ${periodRecords.length} record(s) found in the period. Expected at least ${this.DAYS_BEFORE_START_DATE}.`,
      );
      return 0;
    }

    // Convert each day's sleep data to epoch states
    // Using 1-minute epochs (1440 epochs per day)
    const EPOCHS_PER_DAY = 1440; // 24 hours * 60 minutes

    const days: Array<Array<0 | 1 | null>> = [];

    for (const record of periodRecords) {
      const dayEpochs: Array<0 | 1 | null> = [];
      for (let i = 0; i < EPOCHS_PER_DAY; i++) {
        dayEpochs.push(null);
      }

      // Get primary sleep (non-nap, or first sleep if all are naps)
      const primarySleep = record.sleeps?.find((sleep) => !sleep.nap) || record.sleeps?.[0];

      if (primarySleep?.startTime && primarySleep?.endTime) {
        // Calculate the start of the day (midnight) for this record's date
        const recordDate = new Date(record.recordDate);
        const dayStart = new Date(recordDate);
        dayStart.setHours(0, 0, 0, 0);

        const sleepStart = new Date(primarySleep.startTime);
        const sleepEnd = new Date(primarySleep.endTime);

        // Mark epochs as asleep (0) or awake (1)
        // Direct timestamp comparison works correctly even when sleep spans midnight
        for (let epochIndex = 0; epochIndex < EPOCHS_PER_DAY; epochIndex++) {
          const epochTime = new Date(dayStart);
          epochTime.setMinutes(epochTime.getMinutes() + epochIndex);

          // Check if epoch time falls within sleep period [sleepStart, sleepEnd)
          const isAsleep = epochTime >= sleepStart && epochTime < sleepEnd;

          dayEpochs[epochIndex] = isAsleep ? 0 : 1;
        }
      }
      // If no sleep data, epochs remain null (missing)

      days.push(dayEpochs);
    }

    // Validate all days have the same number of epochs
    const firstDayLength = days[0].length;
    if (!days.every((day) => day.length === firstDayLength)) {
      return 0;
    }

    // Calculate SRI: compare consecutive day pairs
    let matchCount = 0; // number of epoch pairs where state is the same on consecutive days
    let totalPairs = 0; // number of epoch pairs that are valid (non-missing on both days)

    const N = days.length;
    const M = firstDayLength;

    // Loop over all consecutive day pairs
    for (let dayIndex = 0; dayIndex < N - 1; dayIndex++) {
      const currentDay = days[dayIndex];
      const nextDay = days[dayIndex + 1];

      // For each epoch in the day
      for (let epochIndex = 0; epochIndex < M; epochIndex++) {
        const stateToday = currentDay[epochIndex];
        const stateTomorrow = nextDay[epochIndex];

        // Skip if either state is missing
        if (stateToday === null || stateTomorrow === null) {
          continue;
        }

        // Both states are valid (0 or 1)
        totalPairs++;

        // Check if states match
        if (stateToday === stateTomorrow) {
          matchCount++;
        }
      }
    }

    // Calculate SRI: SRI = -100 + (200 * matchCount) / totalPairs
    // This formula ensures:
    // - If all pairs match: SRI = -100 + 200 = 100 (perfect regularity)
    // - If no pairs match: SRI = -100 + 0 = -100 (but we'll clamp to 0)
    // - If random (50% match): SRI = -100 + 100 = 0
    if (totalPairs === 0) {
      return 0;
    }

    const sri = -100 + (200 * matchCount) / totalPairs;

    // Clamp to [0, 100] range
    return Math.max(0, Math.min(100, sri));
  }

  /**
   * Calculates a consistency score based on the coefficient of variation.
   * Lower variance = higher consistency score.
   *
   * @param values - Array of numeric values
   * @returns Consistency score between 0 and 1
   */

  private calculateSRIForRecord(
    mergedTerraDailyRecords: TerraDailyRecord[],
    recordDate: TerraDailyRecord['recordDate'],
  ) {
    const currentDate = new Date(recordDate);
    const windowStartDate = new Date(currentDate);
    windowStartDate.setDate(windowStartDate.getDate() - this.DAYS_BEFORE_START_DATE);

    const windowStartDateStr = windowStartDate.toISOString().split('T')[0];
    const currentDateStr = currentDate.toISOString().split('T')[0];

    const periodRecords = mergedTerraDailyRecords.filter(
      (record) => record.recordDate >= windowStartDateStr && record.recordDate <= currentDateStr,
    );

    const sri = this.calculateSRI(periodRecords);
    return sri;
  }

  /**
   * Calculates the Sleep Quality Score (0–100) for a single night based on four weighted sleep metrics:
   * sleep duration, sleep efficiency, sleep consistency, and restorative sleep proportion.
   *
   * @param sleep - The TerraSleep entity containing sleep data
   * @param athleteAge - The athlete's age in years (optional, for age-adaptive restorative sleep scoring)
   * @returns SleepQualityResult with score (0–100 or NaN) and breakdown
   */
  private calculateSleepQualityScore(sleep: TerraSleep, athleteAge: number | null = null): SleepQualityResult {
    // Extract input data from sleep entity
    const input = this.extractSleepQualityInput(sleep);

    // Validate inputs - all 4 keys must exist
    if (
      input.sleep_duration === undefined ||
      input.sleep_efficiency_pct === undefined ||
      input.sleep_consistency_pct === undefined ||
      input.restorative_sleep_pct === undefined
    ) {
      return { score: NaN, breakdown: null };
    }

    // Initialize breakdown
    const breakdown: SleepQualityBreakdown = {
      Duration: 0,
      Efficiency: 0,
      Consistency: 0,
      Restorative: 0,
    };

    // 1. Sleep Duration Scoring (0–35 pts)
    const duration = input.sleep_duration;
    let durationScore = 0;
    if (duration >= 480) {
      // ≥ 8 hours
      durationScore = 35;
    } else if (duration > 240) {
      // 240–480 min: Linear scale
      durationScore = ((duration - 240) / 240) * 35;
    }
    // ≤ 240 min: 0 (already initialized)
    breakdown.Duration = Math.round(Math.max(0, Math.min(35, durationScore)));

    // 2. Sleep Efficiency Scoring (0–25 pts)
    const eff = input.sleep_efficiency_pct;
    let efficiencyScore = 0;
    if (eff >= 90) {
      efficiencyScore = 25;
    } else if (eff > 75) {
      // 75–90%: Linear scale
      efficiencyScore = ((eff - 75) / 15) * 25;
    }
    // ≤ 75%: 0 (already initialized)
    breakdown.Efficiency = Math.round(Math.max(0, Math.min(25, efficiencyScore)));

    // 3. Sleep Consistency Scoring (0–20 pts)
    // Uses very high power function to heavily penalize poor consistency scores
    // Low scores receive minimal credit, creating greater variability
    // This reflects sleep science research on the disproportionate impact of poor sleep consistency
    // Example with exponent 7.0:
    //   0% → 0 pts, 50% → ~0.16 pts, 70% → ~1.6 pts, 80% → ~4.2 pts, 90% → ~9.6 pts, 100% → 20 pts
    const cons = input.sleep_consistency_pct;
    const normalizedConsistency = cons / 100; // Normalize to 0-1
    // Apply very high power function: poor scores get heavily penalized
    const consistencyScore = Math.pow(normalizedConsistency, this.CONSISTENCY_PENALTY_EXPONENT) * 20;
    breakdown.Consistency = Math.round(Math.max(0, Math.min(20, consistencyScore)));

    // 4. Restorative Sleep Scoring (0–20 pts) - Age-Adapted
    const rest = input.restorative_sleep_pct;
    const restorativeScore = this.calculateAgeAdaptiveRestorativeScore(rest, athleteAge);
    breakdown.Restorative = Math.round(Math.max(0, Math.min(20, restorativeScore)));

    // Calculate final score
    const totalScore = breakdown.Duration + breakdown.Efficiency + breakdown.Consistency + breakdown.Restorative;
    const finalScore = Math.round(totalScore);

    return {
      score: Math.max(0, Math.min(100, finalScore)),
      breakdown,
    };
  }

  /**
   * Calculates age-adaptive restorative sleep score (0–20 points).
   * The thresholds adjust based on age to account for natural decline in deep sleep with age.
   *
   * @param restorativePct - The restorative sleep percentage (Deep + REM / Total sleep * 100)
   * @param athleteAge - The athlete's age in years (null if unknown, falls back to fixed thresholds)
   * @returns Score between 0 and 20
   */
  private calculateAgeAdaptiveRestorativeScore(restorativePct: number, athleteAge: number | null): number {
    // If age is not available, use fixed thresholds (backward compatibility)
    if (athleteAge === null) {
      if (restorativePct >= 40) {
        return 20;
      } else if (restorativePct > 20) {
        // 20–40%: Linear scale
        return ((restorativePct - 20) / 20) * 20;
      }
      return 0;
    }

    // Age-adaptive thresholds
    // Optimal target: 45% for age ≤ 25, decreases by 0.2% per year over 25, minimum 30%
    const MAX_OPTIMAL_TARGET = 45; // For age ≤ 25
    const MIN_OPTIMAL_TARGET = 30; // Minimum optimal target
    const DECLINE_RATE = 0.2; // Percentage points per year over 25

    // Calculate optimal target based on age
    let optimalTarget: number;
    if (athleteAge <= 25) {
      optimalTarget = MAX_OPTIMAL_TARGET;
    } else {
      const yearsOver25 = athleteAge - 25;
      optimalTarget = MAX_OPTIMAL_TARGET - yearsOver25 * DECLINE_RATE;
      optimalTarget = Math.max(optimalTarget, MIN_OPTIMAL_TARGET);
    }

    // Zero-point threshold: scales proportionally with optimal target
    // Maintains the same ratio as the original fixed thresholds (20/40 = 0.5)
    // But with a minimum of 15% as specified
    const ZERO_POINT_RATIO = 0.5; // Zero point is 50% of optimal target
    const MIN_ZERO_POINT = 15; // Minimum zero-point threshold

    let zeroPointThreshold = optimalTarget * ZERO_POINT_RATIO;
    zeroPointThreshold = Math.max(zeroPointThreshold, MIN_ZERO_POINT);

    // Scoring logic
    if (restorativePct >= optimalTarget) {
      // Achieved or exceeded optimal target: full 20 points
      return 20;
    } else if (restorativePct <= zeroPointThreshold) {
      // Below zero-point threshold: 0 points
      return 0;
    } else {
      // Linear interpolation between zero-point and optimal target
      // Score = (Restorative - ZeroPoint) / (OptimalTarget - ZeroPoint) × 20
      const score = ((restorativePct - zeroPointThreshold) / (optimalTarget - zeroPointThreshold)) * 20;
      return score;
    }
  }

  /**
   * Calculates age from date of birth to a reference date.
   *
   * @param dateOfBirth - The date of birth
   * @param referenceDate - The reference date to calculate age at (defaults to today)
   * @returns Age in years
   */
  private calculateAge(dateOfBirth: Date, referenceDate: Date = new Date()): number {
    const birthDate = new Date(dateOfBirth);
    const refDate = new Date(referenceDate);

    let age = refDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = refDate.getMonth() - birthDate.getMonth();

    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Extracts sleep quality input data from a TerraSleep entity.
   *
   * @param sleep - The TerraSleep entity
   * @returns SleepQualityInput with extracted values (may contain  undefined if data is missing)
   */
  private extractSleepQualityInput(sleep: TerraSleep): Partial<SleepQualityInput> {
    const input: Partial<SleepQualityInput> = {};

    // Sleep duration: from timeAsleepSeconds (convert to minutes)
    if (sleep.sleepStageMetrics?.timeAsleepSeconds !== undefined) {
      input.sleep_duration = Math.round(sleep.sleepStageMetrics.timeAsleepSeconds / 60);
    }

    // Sleep efficiency: from sleepPerfMetrics
    if (sleep.sleepPerfMetrics?.sleepEfficiencyPercentage !== undefined) {
      input.sleep_efficiency_pct = sleep.sleepPerfMetrics.sleepEfficiencyPercentage;
    }

    // Sleep consistency: from sleepPerfMetrics (already calculated)
    if (sleep.sleepPerfMetrics?.sleepConsistencyPercentage !== undefined) {
      input.sleep_consistency_pct = sleep.sleepPerfMetrics.sleepConsistencyPercentage;
    }

    // Restorative sleep: (REM + Deep) / Total sleep * 100
    if (sleep.sleepStageMetrics?.timeAsleepSeconds !== undefined && sleep.sleepStageMetrics.timeAsleepSeconds > 0) {
      const deepSleepSeconds = sleep.sleepStageMetrics.deepSleepSeconds ?? 0;
      const remSleepSeconds = sleep.sleepStageMetrics.remSleepSeconds ?? 0;
      const totalSleepSeconds = sleep.sleepStageMetrics.timeAsleepSeconds;
      const restorativeSleepSeconds = deepSleepSeconds + remSleepSeconds;
      input.restorative_sleep_pct = (restorativeSleepSeconds / totalSleepSeconds) * 100;
    }

    return input;
  }
}
