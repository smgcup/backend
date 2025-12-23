import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  USER = 'user',
  ATHLETE = 'athlete',
  ADMIN = 'admin',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
});
