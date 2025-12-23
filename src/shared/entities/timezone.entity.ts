import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Timezone {
  @Field(() => String, { nullable: false })
  offset!: string;
}
