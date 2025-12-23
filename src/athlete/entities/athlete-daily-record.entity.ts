import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Athlete } from './athlete.entity';

@Entity('athlete_daily_records')
export class AthleteDailyRecord {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'athlete_id', type: 'uuid', nullable: false })
  athleteId!: string;

  @Column({ name: 'date', type: 'date', nullable: false })
  date!: Date;

  @Column({
    name: 'recovery',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  recovery!: number | null;

  @Column({
    name: 'strain',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  strain!: number | null;

  @Column({ name: 'rhr', type: 'integer', nullable: true })
  rhr!: number | null;

  @Column({ name: 'hrv', type: 'integer', nullable: true })
  hrv!: number | null;

  @Column({ name: 'sleep_performance', type: 'integer', nullable: true })
  sleepPerformance!: number | null;

  @Column({ name: 'sleep_consistency', type: 'integer', nullable: true })
  sleepConsistency!: number | null;

  @Column({ name: 'sleep_efficiency', type: 'integer', nullable: true })
  sleepEfficiency!: number | null;

  @Column({ name: 'sleep_duration', type: 'integer', nullable: true })
  sleepDuration!: number | null;

  @Column({
    name: 'restorative_sleep_duration',
    type: 'integer',
    nullable: true,
  })
  restorativeSleepDuration!: number | null;

  @Column({ name: 'restorative_sleep', type: 'integer', nullable: true })
  restorativeSleep!: number | null;

  @Column({ name: 'sleep_start', type: 'timestamptz', nullable: true })
  sleepStart!: Date | null;

  @Column({ name: 'sleep_end', type: 'timestamptz', nullable: true })
  sleepEnd!: Date | null;

  @Column({ name: 'timezone_offset', type: 'text', nullable: true })
  timezoneOffset!: string | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: false,
  })
  updatedAt!: Date;

  // Relationship
  @ManyToOne(() => Athlete, { nullable: false })
  @JoinColumn({ name: 'athlete_id' })
  athlete!: Athlete;
}
