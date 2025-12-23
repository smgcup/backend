import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Athlete } from '../../athlete/entities/athlete.entity';
import { TerraDailyMetrics } from './terra-daily-metrics.entity';
import { TerraDailyActivity } from './terra-daily-activity.entity';
import { TerraStressData } from './terra-stress-data.entity';
import { TerraSleep } from './terra-sleep.entity';
import { TerraActivity } from './terra-activity.entity';

@Entity('terra_daily_record')
export class TerraDailyRecord {
  @PrimaryColumn({ name: 'record_id', type: 'uuid', nullable: false })
  recordId!: string;

  @Column({ name: 'record_date', type: 'date', nullable: false })
  recordDate!: string;

  @ManyToOne(() => Athlete, { nullable: false })
  @JoinColumn({ name: 'athlete_id' })
  athlete!: Athlete;

  @Column({ name: 'last_updated', type: 'timestamptz', nullable: true })
  lastUpdated?: Date;

  @Column({ name: 'timezone_offset', type: 'text', nullable: true })
  timezoneOffset?: string;

  @OneToOne(() => TerraDailyMetrics, (dailyMetrics) => dailyMetrics.dailyRecord, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  dailyMetrics?: TerraDailyMetrics;

  @OneToOne(() => TerraDailyActivity, (dailyActivity) => dailyActivity.dailyRecord, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  dailyActivity?: TerraDailyActivity;

  @OneToOne(() => TerraStressData, (stressData) => stressData.dailyRecord, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  stressData?: TerraStressData;

  @OneToMany(() => TerraSleep, (sleep) => sleep.terraDailyRecord, {
    cascade: ['insert', 'update'],
  })
  sleeps?: TerraSleep[];

  @OneToMany(() => TerraActivity, (activity) => activity.terraDailyRecord, {
    cascade: ['insert', 'update'],
  })
  activities?: TerraActivity[];
}
