import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class AcuteSymptom {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => String)
  @Column({ name: 'key', type: 'text', nullable: false })
  key!: string;

  @Field(() => String)
  @Column({ name: 'label', type: 'text', nullable: false })
  label!: string;

  @Field(() => Date)
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Number, { nullable: true })
  @Column({ name: 'severity_score', type: 'integer', nullable: true })
  severityScore!: number | null;
}
