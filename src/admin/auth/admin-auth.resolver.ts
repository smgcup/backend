import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AdminLoginResult } from './entities/admin-login-result.entity';
import { UnauthorizedError } from '../../exception/exceptions';
import { ADMIN_TRANSLATION_CODES } from '../../exception/translation-codes';

@Resolver()
export class AdminAuthResolver {
  @Mutation(() => AdminLoginResult)
  adminLogin(@Args('passkey') passkey: string): AdminLoginResult {
    const expectedPasskey = process.env.ADMIN_PASSKEY;
    const token = process.env.ADMIN_TOKEN;

    if (!expectedPasskey || !token) throw new Error('Server misconfigured');

    if (passkey !== expectedPasskey) {
      throw new UnauthorizedError(ADMIN_TRANSLATION_CODES.adminTokenInvalid, 'Invalid passkey');
    }

    return { ok: true, token: token ?? '' };
  }

  // @Mutation(() => AdminLoginResult)
  // adminLogout(@Context() ctx: { res: Response }): AdminLoginResult {
  //   ctx.res.clearCookie('admin_auth', { path: '/' });
  //   return { ok: true };
  // }
}
