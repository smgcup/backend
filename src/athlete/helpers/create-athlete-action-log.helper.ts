import { AthleteActionType } from '../enums/athlete-action-type.enum';
import { AthleteActionDataMap, GetActionData } from '../types/athlete-action.types';
import { AthleteActionLog } from '../entities/athlete-action-log.entity';

/**
 * Creates a type-safe athlete action log entry
 * @param athleteId - The ID of the athlete
 * @param action - The action type
 * @param actionData - The action data matching the action type (null for WEARABLE_CONNECTION)
 * @returns A new AthleteActionLog instance (without id and timestamp)
 */
export function constructAthleteActionLog<T extends AthleteActionType>(
  athleteId: string,
  action: T,
  actionData: GetActionData<T>,
): Omit<AthleteActionLog, 'id' | 'timestamp'> {
  return {
    athleteId,
    action,
    actionData: actionData as AthleteActionDataMap[T],
  };
}
