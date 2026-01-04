import { registerEnumType } from '@nestjs/graphql';

export enum PlayerPosition {
  GOALKEEPER = 'GOALKEEPER',
  DEFENDER = 'DEFENDER',
  MIDFIELDER = 'MIDFIELDER',
  FORWARD = 'FORWARD',
}

registerEnumType(PlayerPosition, {
  name: 'PlayerPosition',
});
