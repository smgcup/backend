import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { IsUUID, Length } from 'class-validator';
import { ScheduleEventType } from './schedule-event-type.entity';
import { ScheduleEventField } from './schedule-event-field.entity';

/**
 * Join table: which fields belong to which type
 * Per-type configuration for each reusable field: label override, required, order.
 */

@Entity({ name: 'schedule_event_type_field' })
@ObjectType()
@Unique('uq_type_field', ['typeId', 'fieldId'])
export class ScheduleEventTypeField {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @IsUUID()
  id!: string;

  @ManyToOne(() => ScheduleEventType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'type_id' })
  @Field(() => ScheduleEventType)
  type!: ScheduleEventType;

  @Field(() => ID)
  @Column({ name: 'type_id', type: 'uuid' })
  @IsUUID()
  typeId!: string;

  @ManyToOne(() => ScheduleEventField, { eager: true })
  @JoinColumn({ name: 'field_id' })
  @Field(() => ScheduleEventField)
  field!: ScheduleEventField;

  @Field(() => ID)
  @Column({ name: 'field_id', type: 'uuid' })
  @IsUUID()
  fieldId!: string;

  /**
   * Label as visible for this type.
   * Often same as field.defaultLabel, but can be overridden:
   * - "Start time" vs "Kick-off time"
   */
  @Field()
  @Column({ name: 'label', type: 'text' })
  @Length(1, 128)
  label!: string;

  @Field()
  @Column({ name: 'required', type: 'boolean', default: false })
  required!: boolean;

  @Field(() => Int)
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
