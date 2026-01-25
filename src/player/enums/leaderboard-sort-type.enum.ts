import { registerEnumType } from '@nestjs/graphql';

export enum LeaderboardSortType {
  GOALS = 'GOALS',
  ASSISTS = 'ASSISTS',
  CLEAN_SHEETS = 'CLEAN_SHEETS',
  RED_CARDS = 'RED_CARDS',
  YELLOW_CARDS = 'YELLOW_CARDS',
}

registerEnumType(LeaderboardSortType, {
  name: 'LeaderboardSortType',
});
