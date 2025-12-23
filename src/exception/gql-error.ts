import { HttpStatus } from '@nestjs/common';
import { GraphQLError } from 'graphql';

export const STATUS_CODE_MAP = {
  [HttpStatus.BAD_REQUEST]: HttpStatus[HttpStatus.BAD_REQUEST],
  [HttpStatus.UNAUTHORIZED]: HttpStatus[HttpStatus.UNAUTHORIZED],
  [HttpStatus.FORBIDDEN]: HttpStatus[HttpStatus.FORBIDDEN],
  [HttpStatus.NOT_FOUND]: HttpStatus[HttpStatus.NOT_FOUND],
  [HttpStatus.CONFLICT]: HttpStatus[HttpStatus.CONFLICT],
  [HttpStatus.INTERNAL_SERVER_ERROR]: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
};

export class GQLError extends GraphQLError {
  constructor(statusCode: HttpStatus, translationCode: string, description?: string) {
    super(translationCode, {
      extensions: {
        code:
          STATUS_CODE_MAP[statusCode as keyof typeof STATUS_CODE_MAP] || HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
        translationCode,
        description,
        response: {
          statusCode: statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
          message: translationCode,
          error: description,
        },
      },
    });
  }
}
