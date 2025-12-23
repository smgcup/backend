import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraSleep } from './terra-sleep.entity';

@Entity('terra_sleep_respiration_data')
export class TerraSleepRespirationData {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'avg_breaths_per_min', type: 'decimal', precision: 3, scale: 1, nullable: true })
  avgBreathsPerMin?: number | null;

  @Column({ name: 'max_breaths_per_min', type: 'decimal', precision: 3, scale: 1, nullable: true })
  maxBreathsPerMin?: number | null;

  @Column({ name: 'min_breaths_per_min', type: 'decimal', precision: 3, scale: 1, nullable: true })
  minBreathsPerMin?: number | null;

  @Column({ name: 'sleep_id', type: 'uuid', nullable: true })
  sleepId?: string;

  @OneToOne(() => TerraSleep, (sleep) => sleep.sleepRespirationData, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'sleep_id' })
  sleep?: TerraSleep;
}
