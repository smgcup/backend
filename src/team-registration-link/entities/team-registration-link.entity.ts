import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Team } from '../../team/entities/team.entity';

@Entity()
@ObjectType()
export class TeamRegistrationLink {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => Team, { nullable: false })
  @ManyToOne('Team', 'registrationLinks')
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Field(() => String)
  @Column({ name: 'token', type: 'text', nullable: false })
  token!: string;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'expiry_timestamp', type: 'timestamptz', nullable: false })
  expiryTimestamp!: Date;
}
