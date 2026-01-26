import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { ImageUploadInput } from '../../shared/inputs/image-upload.input';
import { Type } from 'class-transformer';
@InputType()
export class CreateNewsDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  category: string;

  @Field()
  @ValidateNested()
  @Type(() => ImageUploadInput)
  image: ImageUploadInput;
}
