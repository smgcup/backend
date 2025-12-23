import { Injectable } from '@nestjs/common';
import { DateRange } from '../shared/inputs/date-range';
import { WindowType } from '../shared/inputs/window';
import { Window } from '../shared/enums/window.enum';
import { WindowInstance } from './entities/window-instance';
import { AthleteDailyRecord } from '../athlete/entities/athlete-daily-record.entity';
import { Metrics } from '../shared/entities/metrics.entity';
import { calculateNumericAverage, calculateAverageTime, formatDateToDateOnly } from '../shared/utils';
import { BadRequestError } from '../exception/exceptions';
import { VALIDATION_TRANSLATION_CODES } from '../exception/translation-codes/';

@Injectable()
export class WindowInstanceService {
  /**
   * Defines the periods for the window instances.
   * This method will return the periods for the window instances in the format { startDate: string; endDate: string }.
   * The startDate and endDate will be the start and end dates of the window instance.
   * The startDate and endDate will be the start and end dates of the window instance.
   * @param window - The window type - day | week | month
   * @param dateRange - The date range in the format { startDate: Date; endDate: Date }
   * @returns The periods for the window instances in the format { startDate: string; endDate: string }
   * @example
   * ```typescript
   * const periods = service.defineWindowInstancesPeriods(Window.DAY, { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-07') });
   * // Returns the periods for the window instances in the format { startDate: string; endDate: string }
   * // [
   * //   { startDate: '2024-01-01', endDate: '2024-01-01' },
   * //   { startDate: '2024-01-02', endDate: '2024-01-02' },
   * //   { startDate: '2024-01-03', endDate: '2024-01-03' },
   * //   ...
   * ```
   */
  public defineWindowInstancesPeriods(
    window: WindowType,
    dateRange: DateRange,
  ): { startDate: string; endDate: string }[] {
    const startDate: Date = dateRange.startDate;
    const endDate: Date = dateRange.endDate;

    const result: { startDate: Date; endDate: Date }[] = [];
    switch (window) {
      case Window.DAY: {
        const indexDate = new Date(startDate);
        while (indexDate.getTime() <= endDate.getTime()) {
          result.push({
            startDate: new Date(indexDate),
            endDate: new Date(indexDate),
          });
          indexDate.setDate(indexDate.getDate() + 1);
        }
        break;
      }
      case Window.WEEK:
        {
          const weekStartDate = new Date(startDate);
          while (weekStartDate.getTime() <= endDate.getTime()) {
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);

            // Ensure weekEndDate doesn't exceed the original endDate
            const actualEndDate = weekEndDate.getTime() > endDate.getTime() ? endDate : weekEndDate;

            result.push({
              startDate: new Date(weekStartDate),
              endDate: actualEndDate,
            });
            weekStartDate.setDate(weekStartDate.getDate() + 7);
          }
        }
        break;
      case Window.MONTH:
        {
          const monthStartDate = new Date(startDate);
          while (monthStartDate.getTime() <= endDate.getTime()) {
            // For the first month, use the actual start date
            const actualStartDate =
              monthStartDate.getMonth() === startDate.getMonth() &&
              monthStartDate.getFullYear() === startDate.getFullYear()
                ? new Date(startDate)
                : new Date(monthStartDate.getFullYear(), monthStartDate.getMonth(), 1);

            // For the last month, use the actual end date, otherwise use the last day of the month
            const isLastMonth =
              monthStartDate.getMonth() === endDate.getMonth() &&
              monthStartDate.getFullYear() === endDate.getFullYear();
            const monthEndDate = isLastMonth
              ? new Date(endDate)
              : new Date(monthStartDate.getFullYear(), monthStartDate.getMonth() + 1, 0);

            result.push({
              startDate: actualStartDate,
              endDate: monthEndDate,
            });
            monthStartDate.setMonth(monthStartDate.getMonth() + 1);
            monthStartDate.setDate(1);
          }
        }
        break;
      default:
        throw new BadRequestError(
          VALIDATION_TRANSLATION_CODES.invalidWindowValue,
          `Invalid window value: ${window as string}`,
        );
    }
    return result.map((instance) => ({
      startDate: formatDateToDateOnly(instance.startDate),
      endDate: formatDateToDateOnly(instance.endDate),
    }));
  }

  /**
   * Creates or clears metrics.
   * @param metrics - Optional metrics to clear
   * @returns Metrics object with cleared values
   * @example
   * ```typescript
   * const metrics = new Metrics();
   * metrics.heartRate = 70;
   * const clearedMetrics = service.createOrClearMetrics(metrics);
   * // Returns Metrics object with cleared values
   * // { heartRate: null, sleepStart: null, sleepEnd: null, ... }
   * ```
   */
  private createOrClearMetrics(metrics?: Metrics): Metrics {
    if (metrics) {
      Object.keys(metrics).forEach((key) => {
        metrics[key as keyof Metrics] = null;
      });
      return metrics;
    }
    const newMetrics = new Metrics();
    Object.keys(newMetrics).forEach((key) => {
      newMetrics[key] = null;
    });
    return newMetrics;
  }

  /**
   * Creates or cleans valid values.
   * @param validValues - Optional valid values to clean
   * @returns Valid values object with cleaned values
   * @example
   * ```typescript
   * const validValues = { heartRate: [70, 75, 68], sleepStart: ['22:30:00', '23:00:00', '22:45:00'], sleepEnd: ['06:30:00', '07:00:00', '06:45:00'], ... };
   * const cleanedValidValues = service.createOrCleanValidValues(validValues);
   * // Returns Valid values object with cleaned values
   * // { heartRate: [70, 75, 68], sleepStart: ['22:30:00', '23:00:00', '22:45:00'], sleepEnd: ['06:30:00', '07:00:00', '06:45:00'], ... }
   * ```
   */
  private createOrCleanValidValues(validValues?: { [K in keyof Metrics]: Metrics[K][] }): {
    [K in keyof Metrics]: Metrics[K][];
  } {
    if (validValues) {
      Object.keys(validValues).forEach((key) => {
        validValues[key as keyof typeof validValues] = [];
      });
      return validValues;
    }
    const metrics = new Metrics();
    const validValuesResult = {} as { [K in keyof Metrics]: Metrics[K][] };

    for (const key of Object.keys(metrics) as (keyof Metrics)[]) {
      validValuesResult[key] = [];
    }

    return validValuesResult;
  }

  private calculateMetricsAverages(validValues: { [K in keyof Metrics]: Metrics[K][] }): Metrics {
    const metrics = new Metrics();
    for (const key of Object.keys(metrics) as (keyof Metrics)[]) {
      metrics[key] = calculateNumericAverage(validValues[key]);
    }
    return metrics;
  }

  private addRecordToValidValues(
    validValues: { [K in keyof Metrics]: Metrics[K][] },
    record: AthleteDailyRecord,
  ): void {
    for (const key of Object.keys(validValues) as (keyof Metrics)[]) {
      validValues[key].push(record[key as keyof AthleteDailyRecord] as Metrics[keyof Metrics]);
    }
  }

  /**
   * Creates window instances by aggregating daily records into time-based windows.
   *
   * This algorithm efficiently processes daily records across multiple consecutive time windows
   * (days, weeks, or months) using a two-pointer approach for O(n + m) complexity where n is
   * the number of records and m is the number of windows.
   *
   * Algorithm Overview:
   * 1. Pre-process: Convert string dates to Date objects for efficient comparison
   * 2. Find starting point: Locate the first window that contains the earliest record
   * 3. Two-pointer iteration: Use separate indices for windows and records
   * 4. For each window:
   *    a. Skip records that fall before the window start (maintains linear complexity)
   *    b. Aggregate all records that fall within the window boundaries
   *    c. Calculate metrics averages and average sleep start/end times
   *    d. Create WindowInstance and advance to next window
   *
   * Key optimizations:
   * - Each record is examined exactly once (linear complexity)
   * - No nested loops - records and windows advance independently
   * - Early termination when no more records or windows remain
   *
   * @param windowInstancesPeriods - Array of time periods defining window boundaries
   * @param dailyRecords - Array of daily athlete records to aggregate
   * @returns Array of WindowInstance objects with aggregated metrics and metadata
   *
   * @example
   * ```typescript
   * const windows = [
   *   { startDate: '2024-01-01', endDate: '2024-01-07' },  // Week 1
   *   { startDate: '2024-01-08', endDate: '2024-01-14' }   // Week 2
   * ];
   * const records = [
   *   { date: '2024-01-02', heartRate: 70, sleepStart: '22:30:00', sleepEnd: '06:30:00', ... },
   *   { date: '2024-01-05', heartRate: 75, sleepStart: '23:00:00', sleepEnd: '07:00:00', ... },
   *   { date: '2024-01-10', heartRate: 68, sleepStart: '22:45:00', sleepEnd: '06:45:00', ... }
   * ];
   * const instances = service.createWindowInstances(windows, records);
   * // Returns 2 WindowInstance objects with:
   * // - Aggregated metrics (average heartRate, etc.) for each week
   * // - Average sleep start/end times for each week
   * ```
   */
  public createWindowInstances(
    windowInstancesPeriods: { startDate: string; endDate: string }[],
    dailyRecords: AthleteDailyRecord[],
  ): WindowInstance[] {
    //? Early return for empty inputs
    if (!dailyRecords.length || !windowInstancesPeriods.length) return [];

    //? Pre-process: Convert string dates to Date objects for efficient comparison
    //? This avoids repeated new Date() calls during the main algorithm loop
    const records = dailyRecords.map((r) => ({ ...r, d: new Date(r.date) }));
    const windows = windowInstancesPeriods.map((p) => ({
      ...p,
      start: new Date(p.startDate),
      end: new Date(p.endDate),
    }));

    //? Find the starting window: locate the first window that contains the earliest record
    //? This optimization ensures we don't process windows that have no relevant records
    const firstDate = records[0].d;
    let wIndex = windows.findIndex((p) => p.start <= firstDate && p.end >= firstDate);

    //? If no window contains the first record, all records are outside the date range
    if (wIndex === -1) return [];

    //? Initialize result array and record index for the two-pointer algorithm
    const result: WindowInstance[] = [];
    let recordIndex = 0;

    //? Main algorithm: Two-pointer approach for O(n + m) complexity
    //? wIndex tracks current window, recordIndex tracks current record
    while (wIndex < windows.length && recordIndex < records.length) {
      const period = windows[wIndex];

      //? Initialize per-window accumulators for metrics aggregation
      const validValues = this.createOrCleanValidValues();
      let currentAverageDailyRecord = this.createOrClearMetrics();

      //? Initialize sleep time accumulators for calculating averages
      const sleepStartTimes: Date[] = [];
      const sleepEndTimes: Date[] = [];
      let timezoneCode = 'UTC+0';

      //? Skip records that are strictly before this window
      //? This maintains linear complexity by ensuring each record is examined exactly once
      //? Even with consecutive windows, this is necessary for sparse data and edge cases
      while (recordIndex < records.length && records[recordIndex].d < period.start) recordIndex++;

      //? Aggregate all records that fall within the current window boundaries
      //? Records are processed in chronological order, maintaining data integrity
      while (recordIndex < records.length && records[recordIndex].d <= period.end) {
        const record = records[recordIndex];
        this.addRecordToValidValues(validValues, record);

        //? Collect sleep times for averaging (only if they exist)
        if (record.sleepStart) {
          sleepStartTimes.push(record.sleepStart);
        }
        if (record.sleepEnd) {
          sleepEndTimes.push(record.sleepEnd);
        }
        //? Use the timezone from the last record in the window
        if (record.timezoneOffset) {
          timezoneCode = record.timezoneOffset;
        }

        recordIndex++; //? Linear advancement: each record is processed exactly once
      }

      //? Finalize current window: calculate aggregated metrics from collected values
      currentAverageDailyRecord = this.calculateMetricsAverages(validValues);

      //? Calculate average sleep times for the window
      //? If no sleep data is available, use default times
      const averageSleepStart = calculateAverageTime(sleepStartTimes);
      const averageSleepEnd = calculateAverageTime(sleepEndTimes);

      const sleepStartTs = averageSleepStart?.toISOString() ?? '12:00:00';
      const sleepEndTs = averageSleepEnd?.toISOString() ?? '12:00:00';

      //? Create WindowInstance with aggregated data
      result.push({
        startDate: period.start,
        endDate: period.end,
        metrics: { ...currentAverageDailyRecord },
        sleepInstance: {
          start: { timestamp: sleepStartTs, timezoneCode: timezoneCode },
          end: { timestamp: sleepEndTs, timezoneCode: timezoneCode },
        },
        timezone: { offset: timezoneCode },
      });

      //? Advance to next window
      //? This handles cases where records may be sparse or windows may be empty
      wIndex++;
    }

    return result;
  }
}
