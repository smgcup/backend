import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class WearableProvider {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Field()
  @Column({ name: 'key', type: 'text', nullable: false })
  key: string;

  @Field()
  @Column({ name: 'name', type: 'text', nullable: false })
  name: string;
}
