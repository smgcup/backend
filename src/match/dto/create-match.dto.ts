import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { MatchLocation } from '../enums/match-location.enum';
import { MatchStatus } from '../enums/match-status.enum';
import { MATCH_TRANSLATION_CODES } from '../../exception/translation-codes/match.translation-codes';
import { MATCH_ROUND_VALUES } from '../match.constants';

@InputType()
export class CreateMatchDto {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @IsUUID('all')
  firstOpponentId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @IsUUID('all')
  secondOpponentId: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  date: Date | null;

  @Field(() => MatchStatus)
  @IsNotEmpty()
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(MATCH_ROUND_VALUES.MIN, { message: MATCH_TRANSLATION_CODES.matchRoundTooLow })
  @Max(MATCH_ROUND_VALUES.MAX, { message: MATCH_TRANSLATION_CODES.matchRoundTooHigh })
  round: number;

  @Field(() => MatchLocation, { nullable: true })
  @IsOptional()
  @IsEnum(MatchLocation)
  location?: MatchLocation | null;

}
