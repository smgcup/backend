import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { TerraActivity } from './terra-activity.entity';

@Entity('terra_activity_type')
export class TerraActivityType {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'name', type: 'text', nullable: false })
  name!: string;

  @OneToMany(() => TerraActivity, (activity) => activity.activityType)
  activities?: TerraActivity[];
}
