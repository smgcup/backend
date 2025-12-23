export const TERRA_TRANSLATION_CODES = {
  // Not Found
  terraUserNotFound: 'terraUserNotFound',
  terraHistoricalDataSessionNotFound: 'terraHistoricalDataSessionNotFound',
  terraUserIdNotProvided: 'terraUserIdNotProvided',

  // Bad Request
  terraHistoricalDataSessionFailed: 'terraHistoricalDataSessionFailed',
  terraDailyDataFailed: 'terraDailyDataFailed',
  terraSleepDataFailed: 'terraSleepDataFailed',
  terraActivityDataFailed: 'terraActivityDataFailed',
  terraInvalidResponse: 'terraInvalidResponse',
  terraActivityTypeUnknown: 'terraActivityTypeUnknown',
  terraConfigMissing: 'terraConfigMissing',
  requestHistoricalDataFailed: 'requestHistoricalDataFailed',
  createHistoricalDataSessionFailed: 'createHistoricalDataSessionFailed',
  getActiveHistoricalDataSessionFailed: 'getActiveHistoricalDataSessionFailed',
  updateHistoricalDataSessionFailed: 'updateHistoricalDataSessionFailed',
} as const;
