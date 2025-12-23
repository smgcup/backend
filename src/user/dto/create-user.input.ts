import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength, Length } from 'class-validator';
import { ACCOUNT_TRANSLATION_CODES } from '../../exception/translation-codes';
import { Team } from '../../team/entities/team.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'Email address' })
  @IsNotEmpty()
  @IsEmail(undefined, { message: ACCOUNT_TRANSLATION_CODES.accountEmailInvalid })
  email!: string;

  @Field(() => String, { description: 'First name' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 55)
  firstName!: string;

  @Field(() => String, { description: 'Last name' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 55)
  lastName!: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @Field(() => ID, { description: 'Team ID' })
  @IsNotEmpty()
  @IsString()
  teamId!: Team['id'];

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  role!: string;
}
