import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsUUID, Length } from 'class-validator';
import { Team } from '../../team/entities/team.entity';

/**
 * Represents “Match”, “Training”, “Travel”, etc.
 * Also supports team-specific types in the future (teamId nullable).
 */

@Entity({ name: 'schedule_event_type' })
@ObjectType()
export class ScheduleEventType {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @IsUUID()
  id!: string;

  /**
   * Machine-friendly key, e.g.:
   * "MATCH", "TRAINING", "TRAVEL", "HOTEL"
   */
  @Field()
  @Column({ name: 'key', type: 'text', unique: true })
  @Length(2, 64)
  key!: string;

  /**
   * Human-readable name, e.g. "Match", "Training"
   */
  @Field()
  @Column({ name: 'name', type: 'text' })
  @Length(2, 128)
  name!: string;

  @Field({ nullable: true })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  /**
   * null => system-wide type
   * non-null => custom type for this team only (for future)
   */
  @Field(() => ID, { nullable: true })
  @Column({ name: 'team_id', type: 'uuid', nullable: true })
  teamId?: string | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team?: Team | null;

  /**
   * true => shipped by the system (seeded)
   * false => user-defined later
   */
  @Field()
  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean;

  /**
   * Color code for the event type (e.g., "#FF5733", "blue", "rgb(255, 87, 51)")
   * Used for UI display purposes
   */
  @Field({ nullable: false })
  @Column({ name: 'color', type: 'text', nullable: false })
  @Length(2, 64)
  color?: string;
}
