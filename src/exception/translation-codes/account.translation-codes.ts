export const ACCOUNT_TRANSLATION_CODES = {
  // Validation
  accountEmailInvalid: 'accountEmailInvalid',
  accountPasswordTooShort: 'accountPasswordTooShort',
  accountPasswordTooLong: 'accountPasswordTooLong',
  accountPasswordTooComplex: 'accountPasswordTooComplex',
  accountPasswordTooCommon: 'accountPasswordTooCommon',
  accountPasswordTooSimilar: 'accountPasswordTooSimilar',
  // Not Found
  accountNotFound: 'accountNotFound',
  // Conflict
  accountEmailAlreadyInUse: 'accountEmailAlreadyInUse',
  accountPasswordInvalid: 'accountPasswordInvalid',
  accountRoleInvalid: 'accountRoleInvalid',
  // Authentication
  accountTokenMissing: 'accountTokenMissing',
  accountTokenInvalid: 'accountTokenInvalid',
  accountTokenExpired: 'accountTokenExpired',
  // Authorization
  accountNotAuthenticated: 'accountNotAuthenticated',
  accountInsufficientRole: 'accountInsufficientRole',
} as const;
