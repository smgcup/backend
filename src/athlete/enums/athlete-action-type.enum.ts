import { registerEnumType } from '@nestjs/graphql';

/**
 * Enum defining all possible athlete actions
 */
export enum AthleteActionType {
  ATHLETE_REGISTRATION = 'ATHLETE_REGISTRATION',
  WEARABLE_CONNECTION = 'WEARABLE_CONNECTION',
}

registerEnumType(AthleteActionType, {
  name: 'AthleteActionType',
  description: 'Types of actions that can be performed on athletes',
});
