import { registerEnumType } from '@nestjs/graphql';

export enum PreferredFoot {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BOTH = 'BOTH',
}

registerEnumType(PreferredFoot, {
  name: 'PreferredFoot',
});
