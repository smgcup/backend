import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsInt, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class PlayerAppearanceInput {
  @Field(() => String)
  @IsUUID()
  playerId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(2)
  level: number;
}

@InputType()
export class CreateAllPlayerAppearancesDto {
  @Field(() => String)
  @IsUUID()
  matchId: string;

  @Field(() => [PlayerAppearanceInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerAppearanceInput)
  appearances: PlayerAppearanceInput[];
}
