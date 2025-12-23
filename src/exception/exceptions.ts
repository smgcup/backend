import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { GENERAL_TRANSLATION_CODES } from './translation-codes.constants';
import { ExtendException } from './extend-http-exception.mixin';

export class UnauthorizedError extends ExtendException(UnauthorizedException) {
  constructor(translationCode: string = GENERAL_TRANSLATION_CODES.unauthorized, description?: string) {
    super(translationCode, description);
  }
}
export class ConflictError extends ExtendException(ConflictException) {
  constructor(translationCode: string = GENERAL_TRANSLATION_CODES.conflict, description?: string) {
    super(translationCode, description);
  }
}
export class BadRequestError extends ExtendException(BadRequestException) {
  constructor(translationCode: string = GENERAL_TRANSLATION_CODES.badRequest, description?: string) {
    super(translationCode, description);
  }
}
export class ForbiddenError extends ExtendException(ForbiddenException) {
  constructor(translationCode: string = GENERAL_TRANSLATION_CODES.forbidden, description?: string) {
    super(translationCode, description);
  }
}
export class NotFoundError extends ExtendException(NotFoundException) {
  constructor(translationCode: string = GENERAL_TRANSLATION_CODES.notFound, description?: string) {
    super(translationCode, description);
  }
}
export class InternalServerError extends ExtendException(InternalServerErrorException) {
  constructor(translationCode: string = GENERAL_TRANSLATION_CODES.internalServerError, description?: string) {
    super(translationCode, description);
  }
}
export class ServiceUnavailableError extends ExtendException(ServiceUnavailableException) {
  constructor(translationCode: string = GENERAL_TRANSLATION_CODES.serviceUnavailable, description?: string) {
    super(translationCode, description);
  }
}
