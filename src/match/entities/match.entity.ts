import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Team } from '../../team/entities/team.entity';
import { MatchStatus } from '../enums/match-status.enum';

@ObjectType()
@Entity()
export class Match {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Field(() => Team)
  @ManyToOne(() => Team, (team) => team.id, { nullable: false })
  @JoinColumn({ name: 'first_opponent_id' })
  firstOpponent: Team;

  @Field(() => Team)
  @ManyToOne(() => Team, (team) => team.id, { nullable: false })
  @JoinColumn({ name: 'second_opponent_id' })
  secondOpponent: Team;

  @Field(() => Date, { nullable: true })
  @Column({ name: 'date', type: 'timestamp', nullable: true })
  date: Date | null;

  @Field(() => MatchStatus)
  @Column({ name: 'status', type: 'enum', enum: MatchStatus, nullable: false })
  status: MatchStatus;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'score1', type: 'integer', nullable: true })
  score1?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'score2', type: 'integer', nullable: true })
  score2?: number | null;

  @Field(() => Int)
  @Column({ name: 'round', type: 'integer', nullable: false })
  round: number;
}
