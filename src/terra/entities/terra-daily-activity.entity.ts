import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraDailyRecord } from './terra-daily-record.entity';

@Entity('terra_daily_activity')
export class TerraDailyActivity {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'activity_seconds', type: 'int', nullable: true })
  activitySeconds?: number | null;

  @Column({ name: 'inactivity_seconds', type: 'int', nullable: true })
  inactivitySeconds?: number | null;

  @Column({ name: 'low_intensity_seconds', type: 'int', nullable: true })
  lowIntensitySeconds?: number | null;

  @Column({ name: 'moderate_intensity_seconds', type: 'int', nullable: true })
  moderateIntensitySeconds?: number | null;

  @Column({ name: 'high_intensity_seconds', type: 'int', nullable: true })
  highIntensitySeconds?: number | null;

  @Column({ name: 'total_burned_calories', type: 'int', nullable: true })
  totalBurnedCalories?: number | null;

  @Column({ name: 'daily_record_id', type: 'uuid', nullable: true })
  dailyRecordId?: string;

  @OneToOne(() => TerraDailyRecord, (dailyRecord) => dailyRecord.dailyActivity, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'daily_record_id' })
  dailyRecord?: TerraDailyRecord;
}
