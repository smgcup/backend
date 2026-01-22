import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RequestWithUser } from '../types/request-with-user.type';
import { User } from '../entities/user.entity';

export const UserSession = createParamDecorator((data: unknown, context: ExecutionContext): User => {
  const ctx = GqlExecutionContext.create(context);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const request = ctx.getContext().req as RequestWithUser;

  if (!request.user) {
    throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
  }

  return request.user;
});
