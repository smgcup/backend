import { AthleteActionType } from '../enums/athlete-action-type.enum';

/**
 * Action data for ATHLETE_REGISTRATION action
 */
export interface AthleteRegistrationActionData {
  registrationToken: string;
}

/**
 * Action data for WEARABLE_CONNECTION action (no data needed)
 */
export type WearableConnectionActionData = null;

/**
 * Union type of all action data types
 */
export type AthleteActionData = AthleteRegistrationActionData | WearableConnectionActionData;

/**
 * Type-safe mapping of action types to their corresponding action data types
 */
export type AthleteActionDataMap = {
  [AthleteActionType.ATHLETE_REGISTRATION]: AthleteRegistrationActionData;
  [AthleteActionType.WEARABLE_CONNECTION]: WearableConnectionActionData;
};

/**
 * Helper type to get action data type from action type
 */
export type GetActionData<T extends AthleteActionType> = AthleteActionDataMap[T];
