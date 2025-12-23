import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateTeamDto {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  name: string;
}
