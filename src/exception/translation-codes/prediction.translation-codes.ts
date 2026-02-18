export const PREDICTION_TRANSLATION_CODES = {
  // Not Found
  predictionNotFound: 'predictionNotFound',
  userPredictionStatsNotFound: 'userPredictionStatsNotFound',

  // Validation
  predictionAlreadyExists: 'predictionAlreadyExists',
  matchNotScheduled: 'matchNotScheduled',
  matchAlreadyStarted: 'matchAlreadyStarted',
  invalidPredictionScores: 'invalidPredictionScores',

  // Booster
  boosterAlreadyUsed: 'boosterAlreadyUsed',

  // Points Calculation
  matchNotFinished: 'matchNotFinished',
  pointsAlreadyCalculated: 'pointsAlreadyCalculated',
  pointsCalculationFailed: 'pointsCalculationFailed',

  // Persistence
  predictionCreationFailed: 'predictionCreationFailed',
  predictionUpdateFailed: 'predictionUpdateFailed',
} as const;
