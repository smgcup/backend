import { Field, ObjectType } from '@nestjs/graphql';
import { Stats } from '../../statistics/entities/stats.entity';

@ObjectType()
export class TeamStats extends Stats {
  @Field(() => Number)
  goalsConceded: number;
}
