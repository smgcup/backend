import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('terra_activity_hr_zone_data')
export class TerraActivityHrZoneData {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'zone_number', type: 'int', nullable: true })
  zoneNumber?: number;

  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds?: number;

  @Column({ name: 'start_percentage', type: 'int', nullable: true })
  startPercentage?: number;

  @Column({ name: 'end_percentage', type: 'int', nullable: true })
  endPercentage?: number;
}
