import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { PlayerPosition } from '../../player/enums/player-position.enum';

@ObjectType()
export class TopPlayerOutput {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => ID)
  teamId: string;

  @Field(() => String)
  teamName: string;

  @Field(() => PlayerPosition)
  position: PlayerPosition;

  @Field(() => Int)
  goals: number;

  @Field(() => Int)
  assists: number;

  @Field(() => Int)
  redCards: number;

  @Field(() => Int)
  yellowCards: number;

  @Field(() => Int)
  ownGoals: number;
}
