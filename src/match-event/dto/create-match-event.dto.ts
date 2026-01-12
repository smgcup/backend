import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { MatchEventType } from '../enums/match-event-type.enum';

@InputType()
export class CreateMatchEventDto {
  @Field(() => String)
  @IsUUID()
  matchId: string;

  @Field(() => String)
  @IsUUID()
  teamId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  playerId?: string | null;

  @Field(() => MatchEventType)
  @IsEnum(MatchEventType)
  type: MatchEventType;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(200)
  minute: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  payload?: Record<string, any> | null;
}
