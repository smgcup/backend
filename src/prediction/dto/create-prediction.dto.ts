import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import { PREDICTION_TRANSLATION_CODES } from '../../exception/translation-codes/prediction.translation-codes';

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
  @Min(0, { message: PREDICTION_TRANSLATION_CODES.invalidPredictionScores })
  predictedScore1: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: PREDICTION_TRANSLATION_CODES.invalidPredictionScores })
  predictedScore2: number;
}
