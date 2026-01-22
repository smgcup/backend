export const USER_TRANSLATION_CODES = {
  // Validation
  userEmailInvalid: 'userEmailInvalid',
  userPasswordTooShort: 'userPasswordTooShort',
  userPasswordTooLong: 'userPasswordTooLong',
  userPasswordTooComplex: 'userPasswordTooComplex',
  userPasswordTooCommon: 'userPasswordTooCommon',
  userPasswordTooSimilar: 'userPasswordTooSimilar',
  userFirstNameTooShort: 'userFirstNameTooShort',
  userLastNameTooShort: 'userLastNameTooShort',
  userUsernameTooShort: 'userUsernameTooShort',
  // Not Found
  userNotFound: 'userNotFound',
  // Conflict
  userEmailAlreadyInUse: 'userEmailAlreadyInUse',
  userUsernameAlreadyInUse: 'userUsernameAlreadyInUse',
  userPasswordInvalid: 'userPasswordInvalid',
  userRoleInvalid: 'userRoleInvalid',
  // Authentication
  userTokenMissing: 'userTokenMissing',
  userTokenInvalid: 'userTokenInvalid',
  userTokenExpired: 'userTokenExpired',
  // Authorization
  userNotAuthenticated: 'userNotAuthenticated',
  userInsufficientRole: 'userInsufficientRole',
} as const;
