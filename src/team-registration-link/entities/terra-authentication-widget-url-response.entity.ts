import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TerraAuthenticationWidgetUrlResponse {
  @Field(() => String, { nullable: false })
  url!: string;
}
