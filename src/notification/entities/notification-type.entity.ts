import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class NotificationType {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => String)
  @Column({ name: 'key', type: 'text', nullable: false })
  key!: string;

  @Field(() => String)
  @Column({ name: 'label', type: 'text', nullable: false })
  label!: string;

  @Field(() => String)
  @Column({ name: 'class', type: 'text', nullable: false })
  class!: string;
}
