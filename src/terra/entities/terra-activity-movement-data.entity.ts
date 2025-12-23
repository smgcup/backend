import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { TerraActivityMetrics } from './terra-activity-metrics.entity';

@Entity('terra_activity_movement_data')
export class TerraActivityMovementData {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'distance_meters', type: 'int', nullable: true })
  distanceMeters?: number | null;

  @Column({ name: 'activity_metrics_id', type: 'uuid', nullable: true })
  activityMetricsId?: string;

  @OneToOne(() => TerraActivityMetrics, (metrics) => metrics.activityMovement, {
    nullable: true,
    cascade: false,
  })
  @JoinColumn({ name: 'activity_metrics_id' })
  metrics?: TerraActivityMetrics;
}
