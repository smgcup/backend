import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateFantasyPlayerDto {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  playerId: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  @IsString()
  displayName?: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  price: number;
}
