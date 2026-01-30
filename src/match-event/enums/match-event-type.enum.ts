import { registerEnumType } from '@nestjs/graphql';

export enum MatchEventType {
  GOAL = 'GOAL', // Goal
  OWN_GOAL = 'OWN_GOAL', // Own goal
  YELLOW_CARD = 'YELLOW_CARD', // Yellow card
  RED_CARD = 'RED_CARD', // Red card
  GOALKEEPER_SAVE = 'GOALKEEPER_SAVE', // Goalkeeper save
  // SUBSTITUTION = 'SUBSTITUTION', // Substitution
  PENALTY_SCORED = 'PENALTY_SCORED', // Penalty scored
  PENALTY_MISSED = 'PENALTY_MISSED', // Penalty missed
  HALF_TIME = 'HALF_TIME', // Half time
  FULL_TIME = 'FULL_TIME', // Full time
}

registerEnumType(MatchEventType, {
  name: 'MatchEventType',
});
