import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateFantasyPlayerDto {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  playerId: string;

  @Field()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  @IsString()
  displayName: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  price: number;
}
