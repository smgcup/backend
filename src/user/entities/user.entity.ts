import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Field(() => String)
  @Column({ name: 'first_name', type: 'text', nullable: false })
  firstName: string;

  @Field(() => String)
  @Column({ name: 'last_name', type: 'text', nullable: false })
  lastName: string;

  @Field(() => String)
  @Column({ name: 'email', type: 'text', nullable: false })
  email: string;

  @Field(() => String)
  @Column({ name: 'password', type: 'text', nullable: false })
  password: string;

  @Field(() => Date)
  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;
}
