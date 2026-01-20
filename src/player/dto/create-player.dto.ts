import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  MaxLength,
  MinLength,
  IsDate,
} from 'class-validator';
import { PreferredFoot } from '../enums/preferred-foot.enum';
import { PlayerPosition } from '../enums/player-position.enum';

@InputType()
export class CreatePlayerDto {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  firstName: string;

  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  lastName: string;

  @Field()
  @IsNotEmpty()
  @IsDate()
  dateOfBirth: Date;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  height: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @Field(() => PreferredFoot)
  @IsNotEmpty()
  @IsEnum(PreferredFoot)
  preferredFoot: PreferredFoot;

  @Field(() => PlayerPosition)
  @IsNotEmpty()
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  teamId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  class?: string;
}
