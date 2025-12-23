import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { TerraActivityMetrics } from './terra-activity-metrics.entity';
import { TerraActivityType } from './terra-activity-type.entity';
import { TerraDailyRecord } from './terra-daily-record.entity';

@Entity('terra_activity')
export class TerraActivity {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @ManyToOne(() => TerraDailyRecord, { nullable: false })
  @JoinColumn({ name: 'record_id' })
  terraDailyRecord!: TerraDailyRecord;

  @ManyToOne(() => TerraActivityType, { nullable: true })
  @JoinColumn({ name: 'activity_type_id' })
  activityType?: TerraActivityType;

  @OneToOne(() => TerraActivityMetrics, (metrics) => metrics.activity, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  activityMetrics?: TerraActivityMetrics;

  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime?: Date;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime?: Date;

  @Column({ name: 'timezone_offset', type: 'text', nullable: true })
  timezoneOffset?: string;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds?: number | null;

  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string;
}
