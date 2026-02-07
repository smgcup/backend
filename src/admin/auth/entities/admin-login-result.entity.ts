import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminLoginResult {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String)
  token: string;
}
