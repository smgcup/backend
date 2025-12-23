import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class GeminiStreamChunk {
  @Field(() => String, { nullable: false })
  text!: string;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  done!: boolean;
}
