export const GENERAL_TRANSLATION_CODES = {
  // Authentication
  unauthorized: 'unauthorized',
  // General
  notFound: 'notFound',
  conflict: 'conflict',
  badRequest: 'badRequest',
  internalServerError: 'internalServerError',
  forbidden: 'forbidden',
  unknown: 'unknown',
  // Postgres
  foreignKeyViolation: 'foreignKeyViolation',
  databaseConflict: 'databaseConflict',
  invalidUUID: 'invalidUUID',
  invalidDate: 'invalidDate',
  nullConstraintViolation: 'nullConstraintViolation',
  stringTooLong: 'stringTooLong',
  outOfRangeInteger: 'outOfRangeInteger',
  serviceUnavailable: 'serviceUnavailable',
} as const;
