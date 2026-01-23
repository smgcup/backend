import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadResponse {
  @Field(() => String)
  path: string;

  @Field(() => String)
  signedUrl: string;
}
