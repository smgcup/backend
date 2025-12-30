import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { AdminLoginResult } from './entities/admin-login-result.entity';

@Resolver()
export class AdminAuthResolver {
  @Mutation(() => AdminLoginResult)
  adminLogin(@Args('passkey') passkey: string, @Context() ctx: { res: Response }): AdminLoginResult {
    const expectedPasskey = process.env.ADMIN_PASSKEY;
    const token = process.env.ADMIN_TOKEN;

    if (!expectedPasskey || !token) throw new Error('Server misconfigured');

    if (passkey !== expectedPasskey) {
      throw new UnauthorizedException('Invalid passkey');
    }

    ctx.res.cookie('admin_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin',
    });

    return { ok: true };
  }

  @Mutation(() => AdminLoginResult)
  adminLogout(@Context() ctx: { res: Response }): AdminLoginResult {
    ctx.res.clearCookie('admin_auth', { path: '/admin' });
    return { ok: true };
  }
}
