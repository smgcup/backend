import { Field, InputType } from '@nestjs/graphql';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PreferredFoot } from '../enums/preferred-foot.enum';
import { PlayerPosition } from '../enums/player-position.enum';
import { Type } from 'class-transformer';
import { ImageUploadInput } from '../../shared/inputs/image-upload.input';

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
  @IsDate()
  dateOfBirth?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  height?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  weight?: number;

  // @Field({ nullable: true })
  // @IsOptional()
  // @IsString()
  // imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImageUploadInput)
  image?: ImageUploadInput;

  @Field({ nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImageUploadInput)
  celebrationImage?: ImageUploadInput;

  @Field(() => PreferredFoot, { nullable: true })
  @IsOptional()
  @IsEnum(PreferredFoot)
  preferredFoot?: PreferredFoot;

  @Field(() => PlayerPosition, { nullable: true })
  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  class?: string;
}
