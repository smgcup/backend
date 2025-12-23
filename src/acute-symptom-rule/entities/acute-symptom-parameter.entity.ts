import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class AcuteSymptomParameter {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'key', type: 'text', nullable: false })
  key!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'label', type: 'text', nullable: false })
  label!: string;
}
