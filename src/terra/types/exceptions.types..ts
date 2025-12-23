/**
 * Error code types for Terra API.
 * Response wrapper types have been moved to ../responses/terra-responses.ts
 */
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
