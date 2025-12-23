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
    // Only validate if both dates are provided
    if (!(startAt instanceof Date) || !(endAt instanceof Date)) {
      return true; // Skip validation if either is missing
    }
    return startAt.getTime() < endAt.getTime();
  }
  defaultMessage() {
    return SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventStartAtMustBeBeforeEndAt;
  }
}

@InputType()
export class UpdateScheduleEventInput {
  @Field(() => ID)
  @IsUUID()
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(2, 64)
  eventTypeKey?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(1, 200)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  startAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  endAt?: Date;

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
  @IsUUID(7, { each: true })
  participantAthleteIds?: string[];

  @Validate(StartAtBeforeEndAt)
  private readonly _orderCheck!: unknown;
}
