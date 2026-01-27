import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

@ObjectType()
@Entity({ name: 'user_prediction_stats' })
@Unique(['userId'])
export class UserPredictionStats {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false, unique: true })
  userId: string;

  @Field(() => User)
  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Int)
  @Column({ name: 'total_points', type: 'integer', nullable: false, default: 0 })
  totalPoints: number;

  @Field(() => Int)
  @Column({ name: 'exact_matches_count', type: 'integer', nullable: false, default: 0 })
  exactMatchesCount: number;

  @Field(() => Int)
  @Column({ name: 'correct_outcomes_count', type: 'integer', nullable: false, default: 0 })
  correctOutcomesCount: number;

  @Field(() => Int)
  @Column({ name: 'total_predictions_count', type: 'integer', nullable: false, default: 0 })
  totalPredictionsCount: number;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'last_updated', type: 'timestamp', nullable: false })
  lastUpdated: Date;
}
