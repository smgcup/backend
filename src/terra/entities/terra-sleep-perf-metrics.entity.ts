import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraSleep } from './terra-sleep.entity';

@Entity('terra_sleep_perf_metrics')
export class TerraSleepPerfMetrics {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'sleep_performance_percentage', type: 'int', nullable: true })
  sleepPerformancePercentage?: number;

  @Column({ name: 'sleep_efficiency_percentage', type: 'int', nullable: true })
  sleepEfficiencyPercentage?: number;

  @Column({ name: 'sleep_consistency_percentage', type: 'int', nullable: true })
  sleepConsistencyPercentage?: number;

  @Column({ name: 'avg_breaths_per_min', type: 'decimal', precision: 3, scale: 1, nullable: true })
  avgBreathsPerMin?: number;

  @Column({ name: 'sleep_id', type: 'uuid', nullable: true })
  sleepId?: string;

  @OneToOne(() => TerraSleep, (sleep) => sleep.sleepPerfMetrics, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'sleep_id' })
  sleep?: TerraSleep;
}
