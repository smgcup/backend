import { ObjectType, Field } from '@nestjs/graphql';
import { Account } from '../entities/account.entity';

@ObjectType()
export class AuthResponse {
  @Field(() => String, { description: 'JWT access token' })
  accessToken!: string;

  @Field(() => Account, { description: 'Authenticated account' })
  account!: Account;
}
