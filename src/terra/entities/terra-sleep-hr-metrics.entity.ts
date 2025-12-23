import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraSleep } from './terra-sleep.entity';

@Entity('terra_sleep_hr_metrics')
export class TerraSleepHrMetrics {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'max_hr_bpm', type: 'int', nullable: true })
  maxHrBpm?: number | null;

  @Column({ name: 'min_hr_bpm', type: 'int', nullable: true })
  minHrBpm?: number | null;

  @Column({ name: 'avg_hr_bpm', type: 'int', nullable: true })
  avgHrBpm?: number | null;

  @Column({ name: 'resting_hr_bpm', type: 'int', nullable: true })
  restingHrBpm?: number | null;

  @Column({ name: 'avg_hrv', type: 'int', nullable: true })
  avgHrv?: number | null;

  @Column({ name: 'hrv_calculation', type: 'text', nullable: true })
  hrvCalculation?: string;

  @Column({ name: 'sleep_id', type: 'uuid', nullable: true })
  sleepId?: string;

  @OneToOne(() => TerraSleep, (sleep) => sleep.sleepHrMetrics, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'sleep_id' })
  sleep?: TerraSleep;
}
