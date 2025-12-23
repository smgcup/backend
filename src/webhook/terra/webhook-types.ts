import type { TerraUser } from '../../terra/types/terraUser.type';
import type { TerraDailyDataItem } from '../../terra/types/terra-athlete-daily-data.response';
import type { SleepDataItem } from '../../terra/types/terra-athlete-sleep-data.response';
import type { ActivityDataItem } from '../../terra/types/terra-athlete-ativity-data.response';
import type { TerraUserAuthenticationResponse } from 'src/terra/responses/terra-responses';

export const TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM = {
  DAILY: 'daily',
  SLEEP: 'sleep',
  ACTIVITY: 'activity',
} as const;

export type TERRA_WEBHOOK_PAYLOAD_TYPE =
  (typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM)[keyof typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM];
/**
 * **Trigger:**
 * 
 * A large request has been submitted to Terra, and is being processed. A large_request_sending event will follow
 * 
 * **Recommended action:**

 * Await for data chunks to be sent. Use the terra_reference to keep track of any events tied back to the initial request.
 * 
 * The terra_reference will match the one in the response to the initial HTTP request.
 * 
 * You may keep track of the sync progress using the expected_payloads field, which indicates how many data events will follow.
 */
export type LargeRequestProcessingTerraWebhookPayload = {
  type: 'large_request_processing';
  status: 'processing';
  message: 'Large request is processing';
  user: TerraUser;
  reference: string;
  version?: string;
};

/**
 * **Trigger:**
 *
 * A large request has been submitted to Terra, and data pertaining to it is about to be sent. Data chunks will be sent to your destination following this event, all with the same terra_reference header

 *
 * **Recommended action:**
 *
 * Await for data chunks to be sent. Use the terra_reference header or reference field to tie those back to the initial request. The reference will match the terra-reference header in the response to the initial HTTP request.

 * You may keep track of the sync progress using the expected_payloads field, which indicates how many data events will follow
 */
export type LargeRequestSendingTerraWebhookPayload = {
  user: TerraUser;
  reference: string;
  message: 'Large request is being sent';
  expected_payloads: number;
  type: 'large_request_sending';
  version?: string;
};

export type TerraDailyDataWebhookPayload = {
  type: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY;
  user: TerraUser;
  data: TerraDailyDataItem[];
};

export type TerraSleepDataWebhookPayload = {
  type: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP;
  user: TerraUser;
  data: SleepDataItem[];
};

export type TerraActivityDataWebhookPayload = {
  type: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY;
  user: TerraUser;
  data: ActivityDataItem[];
};

/**
 * Discriminated union of all Terra webhook payload types.
 * The 'type' field is the discriminator that distinguishes between different webhook types.
 */
export type TerraWebhookPayload =
  | TerraUserAuthenticationResponse
  | LargeRequestProcessingTerraWebhookPayload
  | LargeRequestSendingTerraWebhookPayload
  | TerraDailyDataWebhookPayload
  | TerraSleepDataWebhookPayload
  | TerraActivityDataWebhookPayload;

/**
 * Type guard to check if a payload is a LargeRequestProcessingTerraWebhookPayload.
 * This uses the industry-standard approach of checking the discriminator field.
 */
export function isLargeRequestProcessingPayload(
  payload: unknown,
): payload is LargeRequestProcessingTerraWebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === TERRA_EVENT_TYPE.LARGE_REQUEST_PROCESSING
  );
}

/**
 * Type guard to check if a payload is a LargeRequestSendingTerraWebhookPayload.
 * This uses the industry-standard approach of checking the discriminator field.
 */
export function isLargeRequestSendingPayload(payload: unknown): payload is LargeRequestSendingTerraWebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === TERRA_EVENT_TYPE.LARGE_REQUEST_SENDING
  );
}

/**
 * Type guard to check if a payload is a TerraDailyDataWebhookPayload.
 * This uses the industry-standard approach of checking the discriminator field.
 * @param payload - The payload to check
 * @returns True if the payload is a TerraDailyDataWebhookPayload, false otherwise
 */
export function isDailyDataPayload(payload: unknown): payload is TerraDailyDataWebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY
  );
}

/**
 * Type guard to check if a payload is a TerraSleepDataWebhookPayload.
 * This uses the industry-standard approach of checking the discriminator field.
 * @param payload - The payload to check
 * @returns True if the payload is a TerraSleepDataWebhookPayload, false otherwise
 */
export function isSleepDataPayload(payload: unknown): payload is TerraSleepDataWebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP
  );
}

/**
 * Type guard to check if a payload is a TerraActivityDataWebhookPayload.
 * This uses the industry-standard approach of checking the discriminator field.
 * @param payload - The payload to check
 * @returns True if the payload is a TerraActivityDataWebhookPayload, false otherwise
 */
export function isActivityDataPayload(payload: unknown): payload is TerraActivityDataWebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY
  );
}

export const TERRA_EVENT_TYPE = {
  //? Occurs when a user attempts to authenticate
  AUTH: 'auth',

  //? Occurs when a user deauthenticates through the Terra
  DEAUTH: 'deauth',

  //? Occurs when a user successfully authenticates for a second time, with the same account. You will receive a successful auth and a user_reauth payload
  USER_REAUTH: 'user_reauth',

  //? Occurs when a user revokes Terra's access from the provider's end
  ACCESS_REVOKED: 'access_revoked',

  //? Occurs when a request to a provider returns an HTTP response of 401, 403 or 412
  CONNECTION_ERROR: 'connection_error',

  //? Occurs when a Google Fit user doesn't have a data source linked to their account. All data requests for the user will be empty unless they link a data source
  GOOGLE_NO_DATASOURCE: 'google_no_datasource',

  //? Occurs when data is being fetched asynchronously from the provider. The data will be sent through automatically via your Destination, and you can also safely request for it after the time in the retry_after_seconds field.
  PROCESSING: 'processing',

  //? Occurs when more than one month of data has been requested and all data has been successfully submitted
  LARGE_REQUEST_SENDING: 'large_request_sending',

  //? Occurs when a large request has been submitted to Terra, and is being processed. A large_request_sending event will follow
  LARGE_REQUEST_PROCESSING: 'large_request_processing',

  //? Occurs when an asynchronous request has failed due to rate limiting and is going to be retried.
  RATE_LIMIT_HIT: 'rate_limit_hit',
} as const;
