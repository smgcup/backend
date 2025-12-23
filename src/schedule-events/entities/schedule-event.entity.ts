import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { IsUUID, Length } from 'class-validator';
import { Team } from '../../team/entities/team.entity';
import { ScheduleEventType } from './schedule-event-type.entity';
import { ScheduleEventFieldValue } from './schedule-event-field-value.entity';
import { ScheduleEventParticipant } from './schedule-event-participant.entity';

/**
 * Core, always-present fields (team, type, start/end, title, location).
 * Dynamic properties go through ScheduleEventFieldValue.
 */
@Entity({ name: 'schedule_event' })
@ObjectType()
export class ScheduleEvent {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @IsUUID()
  id!: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  @Field(() => Team)
  team!: Team;

  @Field(() => ID)
  @Column({ name: 'team_id', type: 'uuid' })
  @IsUUID()
  teamId!: string;

  @ManyToOne(() => ScheduleEventType)
  @JoinColumn({ name: 'type_id' })
  @Field(() => ScheduleEventType)
  type!: ScheduleEventType;

  @Field(() => ID)
  @Column({ name: 'type_id', type: 'uuid' })
  @IsUUID()
  typeId!: string;

  @Field()
  @Column({ name: 'title', type: 'text' })
  @Length(1, 200)
  title!: string;

  @Field({ nullable: true })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Field(() => GraphQLISODateTime)
  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt!: Date;

  @Field({ nullable: true })
  @Column({ name: 'location_text', type: 'text', nullable: true })
  locationText?: string;

  @OneToMany(() => ScheduleEventFieldValue, (value) => value.event)
  @Field(() => [ScheduleEventFieldValue], { nullable: true })
  fieldValues?: ScheduleEventFieldValue[];

  @OneToMany(() => ScheduleEventParticipant, (participant) => participant.event)
  @Field(() => [ScheduleEventParticipant], { nullable: true })
  participants?: ScheduleEventParticipant[];

  @Field({ nullable: false })
  @Column({ name: 'team_event', type: 'boolean', nullable: false })
  teamEvent: boolean;
}
