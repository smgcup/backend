import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Athlete } from '../../athlete/entities/athlete.entity';
import { WindowInstance } from '../../window-instance/entities/window-instance';
import { TeamRegistrationLink } from '../../team-registration-link/entities/team-registration-link.entity';

@Entity()
@ObjectType()
export class Team {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'name', type: 'text', nullable: false, unique: true })
  name!: string;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'updated_at', type: 'timestamptz', nullable: false })
  updatedAt!: Date;

  @Field(() => [User], { nullable: true })
  @OneToMany('User', 'team')
  users?: User[];

  @Field(() => [Athlete], { nullable: true })
  @OneToMany('Athlete', 'team')
  athletes?: Athlete[];

  @Field(() => [WindowInstance], { nullable: false })
  windowInstances!: WindowInstance[];

  @Field(() => [TeamRegistrationLink], { nullable: true })
  @OneToMany('TeamRegistrationLink', 'team')
  registrationLinks?: TeamRegistrationLink[];
}
