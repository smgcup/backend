import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { AdminLoginResult } from './entities/admin-login-result.entity';

@Resolver()
export class AdminAuthResolver {
  @Mutation(() => AdminLoginResult)
  adminLogin(@Args('passkey') passkey: string): AdminLoginResult {
    const expectedPasskey = process.env.ADMIN_PASSKEY;
    const token = process.env.ADMIN_TOKEN;

    if (!expectedPasskey || !token) throw new Error('Server misconfigured');

    if (passkey !== expectedPasskey) {
      throw new UnauthorizedException('Invalid passkey');
    }

    return { ok: true, token: token ?? '' };
  }

  // @Mutation(() => AdminLoginResult)
  // adminLogout(@Context() ctx: { res: Response }): AdminLoginResult {
  //   ctx.res.clearCookie('admin_auth', { path: '/' });
  //   return { ok: true };
  // }
}
