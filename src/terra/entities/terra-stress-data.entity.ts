import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraDailyRecord } from './terra-daily-record.entity';

@Entity('terra_stress_data')
export class TerraStressData {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'low_stress_duration_seconds', type: 'int', nullable: true })
  lowStressDurationSeconds?: number | null;

  @Column({ name: 'medium_stress_duration_seconds', type: 'int', nullable: true })
  mediumStressDurationSeconds?: number | null;

  @Column({ name: 'high_stress_duration_seconds', type: 'int', nullable: true })
  highStressDurationSeconds?: number | null;

  @Column({ name: 'avg_stress_level', type: 'int', nullable: true })
  avgStressLevel?: number | null;

  @Column({ name: 'max_stress_level', type: 'int', nullable: true })
  maxStressLevel?: number | null;

  @Column({ name: 'daily_record_id', type: 'uuid', nullable: true })
  dailyRecordId?: string;

  @OneToOne(() => TerraDailyRecord, (dailyRecord) => dailyRecord.stressData, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'daily_record_id' })
  dailyRecord?: TerraDailyRecord;
}
