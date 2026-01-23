import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UploadFileDto {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  fileBase64: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @Field(() => String, { nullable: true })
  @IsString()
  bucket?: string;
}
