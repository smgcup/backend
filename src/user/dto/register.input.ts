import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { USER_TRANSLATION_CODES } from '../../exception/translation-codes';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'Email address' })
  @IsNotEmpty()
  @IsEmail(undefined, { message: USER_TRANSLATION_CODES.userEmailInvalid })
  email!: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: USER_TRANSLATION_CODES.userPasswordTooShort })
  password!: string;

  @Field(() => String, { description: 'First name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: USER_TRANSLATION_CODES.userFirstNameTooShort })
  firstName!: string;

  @Field(() => String, { description: 'Last name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: USER_TRANSLATION_CODES.userLastNameTooShort })
  lastName!: string;
}
