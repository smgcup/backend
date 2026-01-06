import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { MatchStatus } from '../enums/match-status.enum';

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

  @Field(() => Date)
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @Field(() => MatchStatus)
  @IsNotEmpty()
  @IsEnum(MatchStatus)
  status: MatchStatus;
}
