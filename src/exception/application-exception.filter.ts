import {
  ExceptionFilter,
  Catch,
  Logger,
  ArgumentsHost,
  InternalServerErrorException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';
import { GqlContextType } from '@nestjs/graphql';
import { GQLError } from './gql-error';
import { GENERAL_TRANSLATION_CODES } from './translation-codes.constants';
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from './exceptions';
import { PostgreSQLExceptions } from './postgresql-errors';

export const exceptionMap: {
  [key: string]: HttpStatus;
} = {
  EntityNotFoundError: HttpStatus.NOT_FOUND,
};

type ExceptionType = QueryFailedError &
  DatabaseError &
  EntityNotFoundError &
  ConflictError &
  BadRequestError &
  ForbiddenError &
  NotFoundError &
  InternalServerError;

@Catch(
  QueryFailedError,
  DatabaseError,
  EntityNotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
)
export class ApplicationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApplicationExceptionFilter.name);

  catch(exception: ExceptionType, host: ArgumentsHost) {
    if (host.getType() === 'http') {
      this.handleHttpException(exception);
    } else if (host.getType<GqlContextType>() === 'graphql') {
      this.handleGraphqlException(exception);
    }

    this.logger.error(`Error: ${exception.message}`, exception.stack);
    throw new InternalServerErrorException('Error', {
      description: exception?.message,
    });
  }

  private handleGraphqlException(exception: ExceptionType) {
    const exceptionName = exception.constructor.name;
    const statusCode = exception.getStatus?.() || exceptionMap[exceptionName] || 0;
    const translationCode =
      GENERAL_TRANSLATION_CODES[exceptionName as keyof typeof GENERAL_TRANSLATION_CODES] ||
      GENERAL_TRANSLATION_CODES.unknown;
    const response = exception.getResponse?.();

    if (statusCode) {
      throw new GQLError(statusCode, response?.message || translationCode, response?.error);
    }

    if (exception?.code) {
      const typeormException = PostgreSQLExceptions[exception?.code]?.(exception?.message);
      this.logger.log(`TypeORM exception: ${exception.code}`);
      if (typeormException) {
        throw new GQLError(typeormException.statusCode, typeormException.translationCode, typeormException.description);
      }
    }
  }

  private handleHttpException(exception: ExceptionType) {
    if (exception.constructor === EntityNotFoundError) {
      this.logger.log(`Entity not found: ${exception}`); // eslint-disable-line @typescript-eslint/restrict-template-expressions
      throw new NotFoundException(GENERAL_TRANSLATION_CODES.notFound, (exception as EntityNotFoundError)?.message);
    }

    if (exception?.code) {
      const typeormException = PostgreSQLExceptions[exception?.code]?.(exception?.message);
      this.logger.log(`TypeORM exception: ${exception.code}`);
      if (typeormException) {
        throw new typeormException.exception(typeormException.description || exception?.message || '');
      }
    }

    throw exception;
  }
}
