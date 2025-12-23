import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SleepTime {
  @Field(() => String, { nullable: false })
  timestamp!: string;

  @Field(() => String, { nullable: false })
  timezoneCode!: string;
}

@ObjectType()
export class SleepInstance {
  @Field(() => SleepTime, { nullable: false })
  start!: SleepTime;

  @Field(() => SleepTime, { nullable: false })
  end!: SleepTime;
}
