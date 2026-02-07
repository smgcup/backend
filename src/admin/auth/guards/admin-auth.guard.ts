import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { UnauthorizedError } from '../../../exception/exceptions';
import { ADMIN_TRANSLATION_CODES } from '../../../exception/translation-codes';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const request = ctx.getContext().req as Request;

    const adminToken = request.headers['adminauthorization'] as string | undefined;

    if (!adminToken) {
      throw new UnauthorizedError(ADMIN_TRANSLATION_CODES.adminTokenMissing, 'Admin authorization token is missing');
    }

    const expectedToken = process.env.ADMIN_TOKEN;

    if (!expectedToken || adminToken !== expectedToken) {
      throw new UnauthorizedError(ADMIN_TRANSLATION_CODES.adminTokenInvalid, 'Invalid admin authorization token');
    }

    return true;
  }
}
