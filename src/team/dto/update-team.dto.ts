import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class UpdateTeamDto {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  captainId?: string | null;
}
