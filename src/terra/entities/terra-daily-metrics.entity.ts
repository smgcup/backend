import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraDailyRecord } from './terra-daily-record.entity';

@Entity('terra_daily_metrics')
export class TerraDailyMetrics {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'recovery', type: 'int', nullable: true })
  recovery?: number | null;

  @Column({ name: 'strain', type: 'decimal', precision: 3, scale: 1, nullable: true })
  strain?: number | null;

  @Column({ name: 'avg_hr_bpm', type: 'int', nullable: true })
  avgHrBpm?: number | null;

  @Column({ name: 'max_hr_bpm', type: 'int', nullable: true })
  maxHrBpm?: number | null;

  @Column({ name: 'min_hr_bpm', type: 'int', nullable: true })
  minHrBpm?: number | null;

  @Column({ name: 'trimp', type: 'float', nullable: true })
  trimp?: number | null;

  @Column({ name: 'daily_record_id', type: 'uuid', nullable: true })
  dailyRecordId?: string;

  @OneToOne(() => TerraDailyRecord, (dailyRecord) => dailyRecord.dailyMetrics, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'daily_record_id' })
  dailyRecord?: TerraDailyRecord;
}
