import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ImageUploadInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  fileBase64: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  mimeType: string;
}
