import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import {
  Length,
  IsOptional,
  IsDate,
  IsArray,
  IsUUID,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsBoolean,
} from 'class-validator';
import { ScheduleEventFieldValueInput } from './schedule-event-field-value.input';
import { SCHEDULE_EVENTS_TRANSLATION_CODES } from '../../exception/translation-codes';

@ValidatorConstraint({ name: 'StartAtBeforeEndAt', async: false })
class StartAtBeforeEndAt implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const { startAt, endAt } = args.object as {
      startAt?: Date;
      endAt?: Date;
    };
    if (!(startAt instanceof Date) || !(endAt instanceof Date)) {
      return false;
    }
    return startAt.getTime() < endAt.getTime();
  }
  defaultMessage() {
    return SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventStartAtMustBeBeforeEndAt;
  }
}

@InputType()
export class CreateScheduleEventInput {
  @Field()
  @Length(2, 64)
  eventTypeKey!: string;

  @Field()
  @Length(1, 200)
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  startAt!: Date;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  endAt!: Date;

  @Field({ nullable: true })
  @IsOptional()
  locationText?: string;

  @Field(() => [ScheduleEventFieldValueInput], { nullable: true })
  @IsOptional()
  fields?: ScheduleEventFieldValueInput[];

  @Field(() => [ID], {
    nullable: true,
    description: 'Array of athlete IDs. If not provided, event applies to the whole team.',
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true }) // Allow any UUID format
  participantAthleteIds?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  teamEvent!: boolean;

  @Validate(StartAtBeforeEndAt)
  private readonly _orderCheck!: unknown;
}
