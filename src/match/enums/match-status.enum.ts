import { registerEnumType } from '@nestjs/graphql';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(MatchStatus, {
  name: 'MatchStatus',
});
