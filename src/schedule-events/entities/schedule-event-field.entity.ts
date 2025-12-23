import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryColumn, Column } from 'typeorm';
import { IsUUID, Length } from 'class-validator';
import { ScheduleEventFieldDataType } from '../enums/schedule-event-field-data-type.enum';

/**
 * One row per reusable field: "start_time", "opponent_name", "hotel_name", etc.
 */

@Entity({ name: 'schedule_event_field' })
@ObjectType()
export class ScheduleEventField {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @IsUUID()
  id!: string;

  /**
   * Machine key (used in API payload):
   * "start_time", "opponent_name", "bus_company"
   */
  @Field()
  @Column({ name: 'key', type: 'text', unique: true })
  @Length(2, 64)
  key!: string;

  /**
   * Default human label:
   * "Start time", "Opponent", "Bus company"
   */
  @Field()
  @Column({ name: 'default_label', type: 'text' })
  @Length(1, 128)
  defaultLabel!: string;

  @Field(() => ScheduleEventFieldDataType)
  @Column({ name: 'data_type', type: 'text' })
  dataType!: ScheduleEventFieldDataType;
}
