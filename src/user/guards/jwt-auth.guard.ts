import { Injectable, ExecutionContext } from '@nestjs/common';
import { UnauthorizedError } from '../../exception/exceptions';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../types/request-with-user.type';
import { USER_TRANSLATION_CODES } from '../../exception/translation-codes';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return ctx.getContext().req as RequestWithUser;
  }

  handleRequest<TUser = User>(err: any, user: TUser, info: any, context: ExecutionContext): TUser {
    if (err) {
      throw err;
    }

    if (!user) {
      // Check if token was provided
      const request = this.getRequest(context);
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError(USER_TRANSLATION_CODES.userTokenMissing, 'No token provided');
      }

      // Provide more detailed error message based on info
      let translationCode:
        | typeof USER_TRANSLATION_CODES.userTokenInvalid
        | typeof USER_TRANSLATION_CODES.userTokenExpired = USER_TRANSLATION_CODES.userTokenInvalid;
      let errorMessage = 'Invalid or expired token';

      if (info && typeof info === 'object' && 'message' in info) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const infoMessage = String(info.message);
        errorMessage = infoMessage;

        // Check if it's an expiration error
        if (infoMessage.toLowerCase().includes('expired') || infoMessage.toLowerCase().includes('expiration')) {
          translationCode = USER_TRANSLATION_CODES.userTokenExpired;
        }
      }

      throw new UnauthorizedError(translationCode, errorMessage);
    }

    // Set the user on the request object so it can be accessed by RolesGuard
    const request = this.getRequest(context);
    request.user = user as unknown as User;

    return user;
  }
}
