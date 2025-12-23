import { Field, ObjectType } from '@nestjs/graphql';
import { Metrics } from '../../shared/entities/metrics.entity';
import { DateSimpleScalar } from '../../graphql/scalars/date-simple.scalar';
import { Timezone } from '../../shared/entities/timezone.entity';
import { SleepInstance } from '../../shared/entities/sleep-instance.entity';

@ObjectType()
export class WindowInstance {
  @Field(() => DateSimpleScalar, { nullable: false })
  startDate!: Date;

  @Field(() => DateSimpleScalar, { nullable: false })
  endDate!: Date;

  @Field(() => Metrics)
  metrics!: Metrics;

  @Field(() => SleepInstance, { nullable: true })
  sleepInstance!: SleepInstance;

  @Field(() => Timezone, { nullable: true })
  timezone!: Timezone;
}
