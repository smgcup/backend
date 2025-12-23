import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

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
  @IsNumber()
  yearOfBirth: number;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  height: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  teamId: string;
}
