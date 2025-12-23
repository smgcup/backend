import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Metrics {
  @Field(() => Number, { nullable: true })
  recovery!: number | null;

  @Field(() => Number, { nullable: true })
  strain!: number | null;

  @Field(() => Number, { nullable: true })
  rhr!: number | null;

  @Field(() => Number, { nullable: true })
  hrv!: number | null;

  @Field(() => Number, { nullable: true })
  sleepPerformance!: number | null;

  @Field(() => Number, { nullable: true })
  sleepConsistency!: number | null;

  @Field(() => Number, { nullable: true })
  sleepEfficiency!: number | null;

  @Field(() => Number, { nullable: true })
  sleepDuration!: number | null;

  @Field(() => Number, { nullable: true })
  restorativeSleepDuration!: number | null;

  @Field(() => Number, { nullable: true })
  restorativeSleep!: number | null;
}
