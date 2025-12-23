import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { TerraSleepPerfMetrics } from './terra-sleep-perf-metrics.entity';
import { TerraSleepRespirationData } from './terra-sleep-respiration-data.entity';
import { TerraSleepHrMetrics } from './terra-sleep-hr-metrics.entity';
import { TerraSleepStageMetrics } from './terra-sleep-stage-metrics.entity';
import { TerraDailyRecord } from './terra-daily-record.entity';

@Entity('terra_sleep')
export class TerraSleep {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @ManyToOne(() => TerraDailyRecord, { nullable: false })
  @JoinColumn({ name: 'record_id' })
  terraDailyRecord!: TerraDailyRecord;

  @Column({ name: 'nap', type: 'boolean', nullable: true })
  nap?: boolean;

  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime?: Date;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime?: Date;

  @Column({ name: 'timezone_offset', type: 'text', nullable: true })
  timezoneOffset?: string;

  @Column({ name: 'oxygen_saturation_percentage', type: 'decimal', precision: 3, scale: 1, nullable: true })
  oxygenSaturationPercentage?: number | null;

  @Column({ name: 'skin_temp_delta_degrees', type: 'decimal', precision: 3, scale: 1, nullable: true })
  skinTempDeltaDegrees?: number | null;

  @OneToOne(() => TerraSleepPerfMetrics, (metrics) => metrics.sleep, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  sleepPerfMetrics?: TerraSleepPerfMetrics;

  @OneToOne(() => TerraSleepRespirationData, (data) => data.sleep, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  sleepRespirationData?: TerraSleepRespirationData;

  @OneToOne(() => TerraSleepHrMetrics, (metrics) => metrics.sleep, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  sleepHrMetrics?: TerraSleepHrMetrics;

  @OneToOne(() => TerraSleepStageMetrics, (metrics) => metrics.sleep, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  sleepStageMetrics?: TerraSleepStageMetrics;
}
