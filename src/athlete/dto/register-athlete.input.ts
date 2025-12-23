import { InputType, Field } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { DateSimpleScalar } from '../../graphql/scalars/date-simple.scalar';

@InputType()
export class RegisterAthleteInput {
  @Field(() => String, { description: 'Token of the registration link' })
  @IsNotEmpty()
  @IsString()
  token!: string;

  @Field(() => String, { description: 'First name of the athlete' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 55)
  firstName!: string;

  @Field(() => String, { description: 'Last name of the athlete' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 55)
  lastName!: string;

  @Field(() => String, { description: 'Email of the athlete' })
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Email must be a valid email address' })
  @MinLength(5)
  email!: string;

  @Field(() => String, { description: 'Phone number of the athlete' })
  @IsNotEmpty()
  @IsString()
  @Length(10, 15)
  @IsPhoneNumber(undefined, { message: 'Phone number must be a valid phone number' })
  phoneNumber!: string;

  @Field(() => Gender, { description: 'Gender of the athlete' })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender!: Gender;

  @Field(() => DateSimpleScalar, { description: 'Date of birth of the athlete' })
  @IsNotEmpty()
  @IsDate()
  dateOfBirth!: Date;

  @Field(() => String, { description: 'Password of the athlete' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}
