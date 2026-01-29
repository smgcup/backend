export const PREDICTION_TRANSLATION_CODES = {
  // Not Found
  predictionNotFound: 'predictionNotFound',
  userPredictionStatsNotFound: 'userPredictionStatsNotFound',

  // Validation
  predictionAlreadyExists: 'predictionAlreadyExists',
  matchNotScheduled: 'matchNotScheduled',
  matchAlreadyStarted: 'matchAlreadyStarted',
  invalidPredictionScores: 'invalidPredictionScores',

  // Persistence
  predictionCreationFailed: 'predictionCreationFailed',
  predictionUpdateFailed: 'predictionUpdateFailed',
} as const;
