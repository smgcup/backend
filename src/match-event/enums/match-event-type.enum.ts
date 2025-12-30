import { registerEnumType } from '@nestjs/graphql';

export enum MatchEventType {
  SHOT = 'SHOT', // Shot on goal
  GOAL = 'GOAL', // Goal
  FOUL = 'FOUL', // Foul
  CARD = 'CARD', // Card
  SUBSTITUTION = 'SUBSTITUTION', // Substitution
  HALF_TIME = 'HALF_TIME', // Half time
  PENALTY_SHOOTOUT = 'PENALTY_SHOOTOUT', // Penalty shootout
  CORNER_KICK = 'CORNER_KICK', // Corner kick
  FREE_KICK = 'FREE_KICK', // Free kick
  PENALTY_KICK = 'PENALTY_KICK', // Penalty kick
  FULL_TIME = 'FULL_TIME', // Full time
}

registerEnumType(MatchEventType, {
  name: 'MatchEventType',
});
