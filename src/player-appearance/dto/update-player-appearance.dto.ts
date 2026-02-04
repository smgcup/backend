import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class UpdatePlayerAppearanceDto {
  @Field(() => String)
  @IsUUID()
  matchId: string;

  @Field(() => String)
  @IsUUID()
  playerId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(2)
  level: number;
}
