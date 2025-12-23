import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Athlete } from '../../athlete/entities/athlete.entity';
import { AcuteSymptom } from '../../acute-symptom/entities/acute-symptom.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TriggeredAcuteSymptomStatus } from '../enums/triggered-acute-symptom-status.enum';

@ObjectType()
@Entity()
export class TriggeredAcuteSymptom {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => ID)
  @Column({ name: 'symptom_id', type: 'uuid', nullable: false })
  symptomId!: string;

  @ManyToOne(() => AcuteSymptom, { nullable: false })
  @JoinColumn({ name: 'symptom_id' })
  @Field(() => AcuteSymptom, { nullable: false })
  symptom!: AcuteSymptom;

  @Field(() => ID)
  @Column({ name: 'athlete_id', type: 'uuid', nullable: false })
  athleteId!: string;

  @ManyToOne(() => Athlete, { nullable: false })
  @JoinColumn({ name: 'athlete_id' })
  @Field(() => Athlete, { nullable: false })
  athlete!: Athlete;

  @Field(() => ID, { nullable: true })
  @Column({ name: 'notification_id', type: 'uuid', nullable: true })
  notificationId?: string | null;

  @ManyToOne(() => Notification, 'acuteSymptoms', { nullable: true })
  @JoinColumn({ name: 'notification_id' })
  @Field(() => Notification, { nullable: true })
  notification?: Notification | null;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Boolean, { nullable: false })
  @Column({ name: 'resolved', type: 'boolean', nullable: false })
  resolved: boolean;

  @Field(() => TriggeredAcuteSymptomStatus, { nullable: false })
  @Column({ name: 'status', type: 'enum', enum: TriggeredAcuteSymptomStatus, nullable: false })
  status!: TriggeredAcuteSymptomStatus;

  @Field(() => Date, { nullable: true })
  @Column({ name: 'status_changed_at', type: 'timestamptz', nullable: true })
  statusChangedAt!: Date | null;

  @Field(() => Number, { nullable: true })
  @Column({ name: 'severity_score', type: 'float', nullable: true })
  severityScore!: number | null;
}
