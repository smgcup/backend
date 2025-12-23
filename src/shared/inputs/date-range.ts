import { InputType, Field } from '@nestjs/graphql';
import {
  IsDate,
  IsNotEmpty,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateSimpleScalar } from '../../graphql/scalars/date-simple.scalar';
@ValidatorConstraint({ name: 'StartBeforeEnd', async: false })
class StartBeforeEnd implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const { startDate, endDate } = args.object as {
      startDate?: Date;
      endDate?: Date;
    };
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      return false;
    }
    return startDate.getTime() <= endDate.getTime();
  }
  defaultMessage() {
    return 'startDate must be less than or equal to endDate';
  }
}
@InputType()
export class DateRange {
  @Field(() => DateSimpleScalar)
  @IsNotEmpty()
  @IsDate()
  startDate!: Date;

  @Field(() => DateSimpleScalar)
  @IsNotEmpty()
  @IsDate()
  endDate!: Date;

  @Validate(StartBeforeEnd)
  private readonly _orderCheck!: unknown;
}
