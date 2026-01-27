import { registerEnumType } from '@nestjs/graphql';

export enum MatchLocation {
  CK_GREEN_SPORT = 'CK Green Sport',
  SMG_ARENA = 'SMG Arena',
}

registerEnumType(MatchLocation, {
  name: 'MatchLocation',
});
