import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsUUID } from 'class-validator';
import { ScheduleEvent } from './schedule-event.entity';
import { ScheduleEventField } from './schedule-event-field.entity';

/**
 * Stores actual values per event per field.
 * Which column is used depends on ScheduleEventField.dataType.
 */

@Entity({ name: 'schedule_event_field_value' })
@ObjectType()
export class ScheduleEventFieldValue {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @IsUUID()
  id!: string;

  @ManyToOne(() => ScheduleEvent, (event) => event.fieldValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  @Field(() => ScheduleEvent)
  event!: ScheduleEvent;

  @Field(() => ID)
  @Column({ name: 'event_id', type: 'uuid' })
  @IsUUID()
  eventId!: string;

  @ManyToOne(() => ScheduleEventField)
  @JoinColumn({ name: 'field_id' })
  @Field(() => ScheduleEventField)
  field!: ScheduleEventField;

  @Field(() => ID)
  @Column({ name: 'field_id', type: 'uuid' })
  @IsUUID()
  fieldId!: string;

  // One of these will be used depending on field.dataType
  // These are not exposed in GraphQL schema - use the 'value' field resolver instead

  @Column({ name: 'value_string', type: 'text', nullable: true })
  valueString?: string | null;

  @Column({ name: 'value_number', type: 'numeric', nullable: true })
  valueNumber?: number | null;

  @Column({ name: 'value_boolean', type: 'boolean', nullable: true })
  valueBoolean?: boolean | null;

  @Column({ name: 'value_datetime', type: 'timestamptz', nullable: true })
  valueDateTime?: Date | null;
}
