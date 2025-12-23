import type { TerraUser } from '../types/terraUser.type';
import type { TerraDailyDataItem, SleepDataItem, ActivityDataItem } from '../types';
import { TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM } from '../../webhook/terra/webhook-types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Message that indicates a large request is being processed.
 * Used to identify TerraAthleteHistoricalDataResponse.
 */
export const TERRA_HISTORICAL_DATA_MESSAGE =
  'Large request submitted. The data is being processed and will be sent to your destination in chunks';

// ============================================================================
// Error Types
// ============================================================================

export type TerraErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'UNKNOWN';

/**
 * Error response from Terra API.
 * Discriminated by: status === 'error'
 */
export type TerraErrorResponse = {
  status: 'error';
  message: string;
  code: TerraErrorCode;
  statusCode?: number; // 400/401/404/429/5xx if available
};

// ============================================================================
// Success Response Types
// ============================================================================

/**
 * Daily data response from Terra API.
 * Discriminated by: status === 'success' && type === 'daily' && 'data' in response
 */
export type TerraAthleteDailyDataResponse = {
  status: 'success';
  user: TerraUser;
  data: TerraDailyDataItem[];
  type: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY | null;
};

/**
 * Sleep data response from Terra API.
 * Discriminated by: status === 'success' && type === 'sleep' && 'data' in response
 */
export type TerraAthleteSleepDataResponse = {
  status: 'success';
  user: TerraUser;
  data: SleepDataItem[];
  type: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP | null;
};

/**
 * Activity data response from Terra API.
 * Discriminated by: status === 'success' && type === 'activity' && 'data' in response
 */
export type TerraAthleteActivityDataResponse = {
  status: 'success';
  user: TerraUser;
  data: ActivityDataItem[];
  type: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY | null;
};

/**
 * Historical data response from Terra API.
 * Indicates that a large request has been submitted and data will be sent via webhooks.
 * Discriminated by: message === TERRA_HISTORICAL_DATA_MESSAGE
 */
export type TerraAthleteHistoricalDataResponse = {
  status: 'success';
  user: TerraUser;
  reference: string;
  type: string | null;
  message: typeof TERRA_HISTORICAL_DATA_MESSAGE;
};

// ============================================================================
// Union Types
// ============================================================================

/**
 * Union of all possible daily data responses from Terra API.
 */
export type TerraAthleteDailyResponse =
  | TerraAthleteDailyDataResponse
  | TerraAthleteHistoricalDataResponse
  | TerraErrorResponse;

/**
 * Union of all possible sleep data responses from Terra API.
 */
export type TerraAthleteSleepResponse =
  | TerraAthleteSleepDataResponse
  | TerraAthleteHistoricalDataResponse
  | TerraErrorResponse;

/**
 * Union of all possible activity data responses from Terra API.
 */
export type TerraAthleteActivityResponse =
  | TerraAthleteActivityDataResponse
  | TerraAthleteHistoricalDataResponse
  | TerraErrorResponse;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a response is a TerraErrorResponse.
 * @param response - The response to check
 * @returns True if the response is a TerraErrorResponse, false otherwise
 */
export function isErrorResponse(response: unknown): response is TerraErrorResponse {
  return typeof response === 'object' && response !== null && 'status' in response && response.status === 'error';
}

/**
 * Type guard to check if a response is a TerraAthleteHistoricalDataResponse.
 * @param response - The response to check
 * @returns True if the response is a TerraAthleteHistoricalDataResponse, false otherwise
 */
export function isHistoricalDataResponse(response: unknown): response is TerraAthleteHistoricalDataResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    response.status === 'success' &&
    'message' in response &&
    response.message === TERRA_HISTORICAL_DATA_MESSAGE &&
    'reference' in response
  );
}

/**
 * Type guard to check if a response is a TerraAthleteDailyDataResponse.
 * @param response - The response to check
 * @returns True if the response is a TerraAthleteDailyDataResponse, false otherwise
 */
export function isDailyDataResponse(response: TerraAthleteDailyResponse): response is TerraAthleteDailyDataResponse {
  return (
    'status' in response &&
    response.status === 'success' &&
    'data' in response &&
    'type' in response &&
    (response.type === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY || response.type === null) &&
    !isHistoricalDataResponse(response)
  );
}

/**
 * Type guard to check if a response is a TerraAthleteSleepDataResponse.
 * @param response - The response to check
 * @returns True if the response is a TerraAthleteSleepDataResponse, false otherwise
 */
export function isSleepDataResponse(response: TerraAthleteSleepResponse): response is TerraAthleteSleepDataResponse {
  return (
    'status' in response &&
    response.status === 'success' &&
    'data' in response &&
    'type' in response &&
    (response.type === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP || response.type === null) &&
    !isHistoricalDataResponse(response)
  );
}

/**
 * Type guard to check if a response is a TerraAthleteActivityDataResponse.
 * @param response - The response to check
 * @returns True if the response is a TerraAthleteActivityDataResponse, false otherwise
 */
export function isActivityDataResponse(
  response: TerraAthleteActivityResponse,
): response is TerraAthleteActivityDataResponse {
  return (
    'status' in response &&
    response.status === 'success' &&
    'data' in response &&
    'type' in response &&
    (response.type === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY || response.type === null) &&
    !isHistoricalDataResponse(response)
  );
}

// ============================================================================
// Authentication Widget Response Types
// ============================================================================

export type TerraAuthenticationWidgetSuccessResponse = {
  session_id: string;
  url: string;
  status: 'success';
  expires_in: number;
};
export type TerraAuthenticationWidgetResponse = TerraAuthenticationWidgetSuccessResponse | TerraErrorResponse;

// Authentication Response
export type TerraUserSuccessAuthenticationResponse = {
  type: 'auth';
  status: 'success';
  message: string;
  user: TerraUser;
  reference_id: string;
  widget_session_id: string;
};
export type TerraUserErrorAuthenticationResponse = {
  type: 'auth';
  status: 'error';
  message: string;
  reason: string;
  reference_id: string;
  widget_session_id: string;
};
export type TerraUserAuthenticationResponse =
  | TerraUserSuccessAuthenticationResponse
  | TerraUserErrorAuthenticationResponse;

/**
 * Type guard to check if a response is a TerraUserAuthenticationResponse.
 * @param response - The response to check
 * @returns True if the response is a TerraUserAuthenticationResponse, false otherwise
 */
export function isAuthenticationResponse(response: unknown): response is TerraUserAuthenticationResponse {
  return typeof response === 'object' && response !== null && 'type' in response && response.type === 'auth';
}
/**
 * Type guard to check if a response is a TerraUserSuccessAuthenticationResponse.
 * @param response - The response to check
 * @returns True if the response is a TerraUserSuccessAuthenticationResponse, false otherwise
 */
export function isSuccessAuthenticationResponse(
  response: TerraUserAuthenticationResponse,
): response is TerraUserSuccessAuthenticationResponse {
  return (
    'status' in response &&
    response.status === 'success' &&
    'type' in response &&
    response.type === 'auth' &&
    'user' in response &&
    'reference_id' in response &&
    'widget_session_id' in response
  );
}

/**
 * Type guard to check if a response is a TerraUserErrorAuthenticationResponse.
 * @param response - The response to check
 * @returns True if the response is a TerraUserErrorAuthenticationResponse, false otherwise
 */
export function isErrorAuthenticationResponse(
  response: TerraUserAuthenticationResponse,
): response is TerraUserErrorAuthenticationResponse {
  return (
    'status' in response &&
    response.status === 'error' &&
    'type' in response &&
    response.type === 'auth' &&
    'reason' in response &&
    'reference_id' in response &&
    'widget_session_id' in response
  );
}
