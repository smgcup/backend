import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { USER_TRANSLATION_CODES } from '../../exception/translation-codes';
import { Transform } from 'class-transformer';

@InputType()
export class RegisterUserInput {
  @Field(() => String, { description: 'Email address' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail(undefined, {
    message: USER_TRANSLATION_CODES.userEmailInvalid,
  })
  @MaxLength(255, {
    message: USER_TRANSLATION_CODES.userEmailTooLong,
  })
  email!: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: USER_TRANSLATION_CODES.userPasswordTooShort,
  })
  @MaxLength(128, {
    message: USER_TRANSLATION_CODES.userPasswordTooLong,
  })
  password!: string;

  @Field(() => String, { description: 'First name' })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: USER_TRANSLATION_CODES.userFirstNameTooShort,
  })
  @MaxLength(50, {
    message: USER_TRANSLATION_CODES.userFirstNameTooLong,
  })
  @Matches(/^[A-Za-zÀ-ÿ'-]+$/, {
    message: USER_TRANSLATION_CODES.userFirstNameInvalid,
  })
  firstName!: string;

  @Field(() => String, { description: 'Last name' })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: USER_TRANSLATION_CODES.userLastNameTooShort,
  })
  @MaxLength(50, {
    message: USER_TRANSLATION_CODES.userLastNameTooLong,
  })
  @Matches(/^[A-Za-zÀ-ÿ'-]+$/, {
    message: USER_TRANSLATION_CODES.userLastNameInvalid,
  })
  lastName!: string;

  @Field(() => String, { description: 'Username' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: USER_TRANSLATION_CODES.userUsernameTooShort,
  })
  @MaxLength(30, {
    message: USER_TRANSLATION_CODES.userUsernameTooLong,
  })
  @Matches(/^[a-z0-9._]+$/, {
    message: USER_TRANSLATION_CODES.userUsernameInvalid,
  })
  username!: string;
}
