import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StatisticsOutput {
  @Field(() => Int)
  teamsCount: number;

  @Field(() => Int)
  matchesPlayedCount: number;

  @Field(() => Int)
  totalGoals: number;
}
