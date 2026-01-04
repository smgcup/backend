import { registerEnumType } from '@nestjs/graphql';

export enum PreferredFoot {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

registerEnumType(PreferredFoot, {
  name: 'PreferredFoot',
});
