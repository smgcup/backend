import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

@InputType()
export class SaveFantasyTeamSlotDto {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  playerId: string;

  @Field(() => Boolean)
  @IsBoolean()
  isBenched: boolean;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  slotOrder: number;
}

@InputType()
export class SaveFantasyTeamDto {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  teamName: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  budget: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  freeTransfers: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  captainPlayerId: string;

  @Field(() => [SaveFantasyTeamSlotDto])
  @IsArray()
  @ArrayMinSize(9)
  @ArrayMaxSize(9)
  @ValidateNested({ each: true })
  @Type(() => SaveFantasyTeamSlotDto)
  slots: SaveFantasyTeamSlotDto[];
}
