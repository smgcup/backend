import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Stats {
  @Field(() => Number)
  goals: number;

  @Field(() => Number)
  penaltiesScored: number;

  @Field(() => Number)
  penaltiesMissed: number;

  @Field(() => Number)
  assists: number;

  @Field(() => Number)
  yellowCards: number;

  @Field(() => Number)
  redCards: number;

  @Field(() => Number)
  goalkeeperSaves: number;

  @Field(() => Number)
  ownGoals: number;

  @Field(() => Number)
  cleanSheets: number | null;
}
