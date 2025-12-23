import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraSleep } from './terra-sleep.entity';

@Entity('terra_sleep_stage_metrics')
export class TerraSleepStageMetrics {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'light_sleep_seconds', type: 'int', nullable: true })
  lightSleepSeconds?: number;

  @Column({ name: 'deep_sleep_seconds', type: 'int', nullable: true })
  deepSleepSeconds?: number;

  @Column({ name: 'rem_sleep_seconds', type: 'int', nullable: true })
  remSleepSeconds?: number;

  @Column({ name: 'num_wakeup_events', type: 'int', nullable: true })
  numWakeupEvents?: number;

  @Column({ name: 'awake_seconds', type: 'int', nullable: true })
  awakeSeconds?: number;

  @Column({ name: 'time_asleep_seconds', type: 'int', nullable: true })
  timeAsleepSeconds?: number;

  @Column({ name: 'time_in_bed_seconds', type: 'int', nullable: true })
  timeInBedSeconds?: number;

  @Column({ name: 'sleep_id', type: 'uuid', nullable: true })
  sleepId?: string;

  @OneToOne(() => TerraSleep, (sleep) => sleep.sleepStageMetrics, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'sleep_id' })
  sleep?: TerraSleep;
}
