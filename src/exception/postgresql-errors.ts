import { BadRequestException, HttpStatus } from '@nestjs/common';
import { GENERAL_TRANSLATION_CODES } from './translation-codes.constants';

type PostgreSQLException = {
  statusCode: HttpStatus;
  exception: typeof BadRequestException;
  translationCode: string;
  description?: string;
};

type PostgreSQLExceptions = {
  [key: string]: (message?: string) => PostgreSQLException;
};

export const PostgreSQLExceptions: PostgreSQLExceptions = {
  '23503': (message?: string) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    exception: BadRequestException,
    translationCode: GENERAL_TRANSLATION_CODES.foreignKeyViolation,
    description: message,
  }),
  '23505': (message?: string) => ({
    statusCode: HttpStatus.CONFLICT,
    exception: BadRequestException,
    translationCode: GENERAL_TRANSLATION_CODES.databaseConflict,
    description: message,
  }),
  '22P02': (message?: string) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    exception: BadRequestException,
    translationCode: GENERAL_TRANSLATION_CODES.invalidUUID,
    description: message,
  }),
  '22007': (message?: string) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    exception: BadRequestException,
    translationCode: GENERAL_TRANSLATION_CODES.invalidDate,
    description: message,
  }),
  '23502': (message?: string) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    exception: BadRequestException,
    translationCode: GENERAL_TRANSLATION_CODES.nullConstraintViolation,
    description: message,
  }),
  '22001': (message?: string) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    exception: BadRequestException,
    translationCode: GENERAL_TRANSLATION_CODES.stringTooLong,
    description: message,
  }),
  '22003': (message?: string) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    exception: BadRequestException,
    translationCode: GENERAL_TRANSLATION_CODES.outOfRangeInteger,
    description: message,
  }),
};
