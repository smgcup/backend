import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { ImageUploadInput } from '../../shared/inputs/image-upload.input';
import { Type } from 'class-transformer';

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
  @ValidateNested()
  @Type(() => ImageUploadInput)
  @IsOptional()
  image?: ImageUploadInput;
}
