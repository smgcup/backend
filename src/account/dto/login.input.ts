import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ACCOUNT_TRANSLATION_CODES } from '../../exception/translation-codes';

@InputType()
export class LoginInput {
  @Field(() => String, { description: 'Email address' })
  @IsNotEmpty()
  @IsEmail(undefined, { message: ACCOUNT_TRANSLATION_CODES.accountEmailInvalid })
  email!: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}
