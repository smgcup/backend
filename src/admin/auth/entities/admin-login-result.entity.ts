import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminLoginResult {
  @Field()
  ok: boolean;
}
