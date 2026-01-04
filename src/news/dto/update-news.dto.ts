import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class UpdateNewsDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
