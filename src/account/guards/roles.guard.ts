import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AccountRole } from '../enums/role.enum';
import { Account } from '../entities/account.entity';
import { RequestWithAccount } from '../../types/request-with-user.type';
import { ForbiddenError } from '../../exception/exceptions';
import { ACCOUNT_TRANSLATION_CODES } from '../../exception/translation-codes';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AccountRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const request = ctx.getContext().req as RequestWithAccount;

    // Get the account from the request (set by JwtAuthGuard)
    const account: Account = request.account as Account;

    if (!account) {
      throw new ForbiddenError(
        ACCOUNT_TRANSLATION_CODES.accountNotAuthenticated,
        'Account information is missing. Please ensure you are authenticated.',
      );
    }

    if (!requiredRoles.includes(account.role)) {
      const requiredRolesStr = requiredRoles.join(', ');
      throw new ForbiddenError(
        ACCOUNT_TRANSLATION_CODES.accountInsufficientRole,
        `Access denied. Required role(s): ${requiredRolesStr}. Your current role: ${account.role}.`,
      );
    }

    return true;
  }
}
