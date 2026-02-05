import { Field, ObjectType } from '@nestjs/graphql';
import { Stats } from '../../statistics/entities/stats.entity';

@ObjectType()
export class TeamStats extends Stats {
  @Field(() => Number)
  goalsConceded: number;

  @Field(() => Number)
  points: number;
  @Field(() => Number)
  draws: number;

  @Field(() => Number)
  losses: number;

  @Field(() => Number)
  wins: number;

  @Field(() => Number)
  matchesPlayed: number;
}
