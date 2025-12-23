import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NotificationType } from './notification-type.entity';
import { TriggeredAcuteSymptom } from '../../triggered-acute-symptom/entities/triggered-acute-symptom.entity';

@Entity()
@ObjectType()
export class Notification {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => NotificationType)
  @ManyToOne(() => NotificationType, { nullable: false })
  @JoinColumn({ name: 'type' })
  type!: NotificationType;

  @Field(() => String)
  @Column({ name: 'title', type: 'text', nullable: false })
  title!: string;

  @Field(() => String)
  @Column({ name: 'sub_title', type: 'text', nullable: false })
  subTitle!: string;

  @Field(() => String)
  @Column({ name: 'body', type: 'text', nullable: false })
  body!: string;

  // Optional: Only populated for notifications related to acute symptoms
  // Other notification types can have their own relationships added similarly
  @Field(() => [TriggeredAcuteSymptom], { nullable: true })
  @OneToMany(() => TriggeredAcuteSymptom, (acuteSymptom) => acuteSymptom.notification, { nullable: true })
  acuteSymptoms?: TriggeredAcuteSymptom[] | null;

  @Field(() => Date)
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @PrimaryGeneratedColumn()
  @Field(() => String)
  @Column({ name: 'count', type: 'integer', nullable: true })
  count!: number;

  @Field(() => Boolean, { nullable: false })
  @Column({ name: 'resolved', type: 'boolean', nullable: false })
  resolved: boolean;
}
