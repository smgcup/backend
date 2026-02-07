import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class UpdateFantasyPlayerDto {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  @IsString()
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;
}
