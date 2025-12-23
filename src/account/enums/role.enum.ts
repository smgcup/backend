import { registerEnumType } from '@nestjs/graphql';

export enum AccountRole {
  USER = 'user',
  ATHLETE = 'athlete',
  ADMIN = 'admin',
}

registerEnumType(AccountRole, {
  name: 'AccountRole',
  description: 'Account roles in the system',
});
