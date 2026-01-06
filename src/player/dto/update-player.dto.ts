import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { PreferredFoot } from '../enums/preferred-foot.enum';
import { PlayerPosition } from '../enums/player-position.enum';

@InputType()
export class UpdatePlayerDto {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  yearOfBirth?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  height?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => PreferredFoot, { nullable: true })
  @IsOptional()
  @IsEnum(PreferredFoot)
  prefferedFoot?: PreferredFoot;

  @Field(() => PlayerPosition, { nullable: true })
  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}
