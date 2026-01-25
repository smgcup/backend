import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Player } from '../entities/player.entity';

@ObjectType()
export class PaginatedPlayersResponse {
  @Field(() => [Player])
  players: Player[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
