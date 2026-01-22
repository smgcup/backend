import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { USER_TRANSLATION_CODES } from '../../exception/translation-codes';

@InputType()
export class LoginInput {
  @Field(() => String, { description: 'Email address' })
  @IsNotEmpty()
  @IsEmail(undefined, { message: USER_TRANSLATION_CODES.userEmailInvalid })
  email!: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: USER_TRANSLATION_CODES.userPasswordTooShort })
  password!: string;
}
