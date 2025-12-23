import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Team } from '../../team/entities/team.entity';
import { Account } from '../../account/entities/account.entity';
@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => Account, { nullable: false })
  @OneToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Field(() => String, { nullable: false })
  @Column({ name: 'email', type: 'text', nullable: false, unique: true })
  email!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'first_name', type: 'text', nullable: false })
  firstName!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'last_name', type: 'text', nullable: false })
  lastName!: string;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'updated_at', type: 'timestamptz', nullable: false })
  updatedAt!: Date;

  @Field(() => String, { nullable: false })
  @Column({ name: 'role', type: 'text', nullable: false })
  role!: string;

  @Field(() => Team, { nullable: false })
  @ManyToOne(() => Team, { nullable: false })
  @JoinColumn({ name: 'team_id' })
  team!: Team;
}
