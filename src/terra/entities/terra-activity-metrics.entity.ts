import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraActivity } from './terra-activity.entity';
import { TerraActivityMovementData } from './terra-activity-movement-data.entity';

@Entity('terra_activity_metrics')
export class TerraActivityMetrics {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'calories_burned_total', type: 'int', nullable: true })
  caloriesBurnedTotal?: number | null;

  @Column({ name: 'work_kilojoules', type: 'int', nullable: true })
  workKilojoules?: number | null;

  @Column({ name: 'hr_avg_bpm', type: 'int', nullable: true })
  hrAvgBpm?: number | null;

  @Column({ name: 'hr_max_bpm', type: 'int', nullable: true })
  hrMaxBpm?: number | null;

  @Column({ name: 'hr_min_bpm', type: 'int', nullable: true })
  hrMinBpm?: number | null;

  // @Column({ name: 'activity_hr_zone_data_id', type: 'uuid', nullable: true })
  // activityHrZoneDataId?: string;

  @Column({ name: 'activity_id', type: 'uuid', nullable: true })
  activityId?: string;

  @OneToOne(() => TerraActivityMovementData, (movementData) => movementData.metrics, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  activityMovement?: TerraActivityMovementData;

  @OneToOne(() => TerraActivity, (activity) => activity.activityMetrics, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'activity_id' })
  activity?: TerraActivity;
}
