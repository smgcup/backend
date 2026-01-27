import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreatePredictionDto {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @IsUUID('all')
  matchId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  predictedScore1: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  predictedScore2: number;
}
