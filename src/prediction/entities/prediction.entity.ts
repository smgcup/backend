import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Match } from '../../match/entities/match.entity';

@ObjectType()
@Entity({ name: 'prediction' })
@Unique(['userId', 'matchId'])
export class Prediction {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'match_id', type: 'uuid', nullable: false })
  matchId: string;

  @Field(() => Match)
  @ManyToOne(() => Match, { nullable: false })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Field(() => Int)
  @Column({ name: 'predicted_score1', type: 'integer', nullable: false })
  predictedScore1: number;

  @Field(() => Int)
  @Column({ name: 'predicted_score2', type: 'integer', nullable: false })
  predictedScore2: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'points_earned', type: 'integer', nullable: true })
  pointsEarned: number | null;

  @Field(() => Boolean)
  @Column({ name: 'is_boosted', type: 'boolean', nullable: false, default: false })
  isBoosted: boolean;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;
}
