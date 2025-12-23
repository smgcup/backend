import { Injectable, ExecutionContext } from '@nestjs/common';
import { UnauthorizedError } from '../../exception/exceptions';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Account } from '../entities/account.entity';
import { RequestWithAccount } from '../../types/request-with-user.type';
import { ACCOUNT_TRANSLATION_CODES } from '../../exception/translation-codes';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return ctx.getContext().req as RequestWithAccount;
  }

  handleRequest<TAccount = Account>(err: any, account: TAccount, info: any, context: ExecutionContext): TAccount {
    if (err) {
      throw err;
    }

    if (!account) {
      // Check if token was provided
      const request = this.getRequest(context);
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError(ACCOUNT_TRANSLATION_CODES.accountTokenMissing, 'No token provided');
      }

      // Provide more detailed error message based on info
      let translationCode:
        | typeof ACCOUNT_TRANSLATION_CODES.accountTokenInvalid
        | typeof ACCOUNT_TRANSLATION_CODES.accountTokenExpired = ACCOUNT_TRANSLATION_CODES.accountTokenInvalid;
      let errorMessage = 'Invalid or expired token';

      if (info && typeof info === 'object' && 'message' in info) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const infoMessage = String(info.message);
        errorMessage = infoMessage;

        // Check if it's an expiration error
        if (infoMessage.toLowerCase().includes('expired') || infoMessage.toLowerCase().includes('expiration')) {
          translationCode = ACCOUNT_TRANSLATION_CODES.accountTokenExpired;
        }
      }

      throw new UnauthorizedError(translationCode, errorMessage);
    }

    // Set the account on the request object so it can be accessed by RolesGuard
    const request = this.getRequest(context);
    request.account = account as unknown as Account;

    return account;
  }
}
