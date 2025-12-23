import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsUUID } from 'class-validator';
import { ScheduleEvent } from './schedule-event.entity';
import { Athlete } from '../../athlete/entities/athlete.entity';

/**
 * Junction table linking schedule events to specific athlete participants.
 * If an event has no participants, it applies to the whole team.
 * If an event has participants, it applies only to those athletes.
 */
@Entity({ name: 'schedule_event_participant' })
@ObjectType()
export class ScheduleEventParticipant {
  @Field(() => ID)
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  @IsUUID()
  eventId!: string;

  @Field(() => ID)
  @PrimaryColumn({ name: 'athlete_id', type: 'uuid' })
  @IsUUID()
  athleteId!: string;

  @ManyToOne(() => ScheduleEvent, (event) => event.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  @Field(() => ScheduleEvent)
  event!: ScheduleEvent;

  @ManyToOne(() => Athlete)
  @JoinColumn({ name: 'athlete_id' })
  @Field(() => Athlete)
  athlete!: Athlete;

  // Future extensibility: could add fields like:
  // @Column({ name: 'attendance_status', type: 'text', nullable: true })
  // attendanceStatus?: string;
  // @Column({ name: 'rsvp_status', type: 'text', nullable: true })
  // rsvpStatus?: string;
}
