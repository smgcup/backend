export const MATCH_TRANSLATION_CODES = {
  // Not Found
  matchNotFound: 'matchNotFound',

  // Validation
  matchRoundTooLow: 'matchRoundTooLow',
  matchRoundTooHigh: 'matchRoundTooHigh',
  invalidMatchDate: 'invalidMatchDate',
  opponentTeamNotFound: 'opponentTeamNotFound',
  opponentTeamsMustBeDifferent: 'opponentTeamsMustBeDifferent',
  scoreNotAllowedForStatus: 'scoreNotAllowedForStatus',

  // Persistence
  matchCreationFailed: 'matchCreationFailed',
  matchUpdateFailed: 'matchUpdateFailed',
} as const;
