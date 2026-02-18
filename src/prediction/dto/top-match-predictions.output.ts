import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PopularPrediction {
  @Field(() => Int)
  predictedScore1: number;

  @Field(() => Int)
  predictedScore2: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class MatchTopPredictions {
  @Field(() => ID)
  matchId: string;

  @Field(() => [PopularPrediction])
  topPredictions: PopularPrediction[];
}
