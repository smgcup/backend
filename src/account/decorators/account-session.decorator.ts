import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Account } from '../entities/account.entity';
import { RequestWithAccount } from '../../types/request-with-user.type';

export const AccountSession = createParamDecorator((data: unknown, context: ExecutionContext): Account => {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext().req as RequestWithAccount;

  if (!request.account) {
    throw new Error('Account not found in request. Ensure JwtAuthGuard is applied.');
  }

  return request.account;
});
