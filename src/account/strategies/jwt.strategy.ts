import { Injectable } from '@nestjs/common';
import { InternalServerError } from '../../exception/exceptions';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccountService } from '../account.service';
import { Account } from '../entities/account.entity';

export interface JwtPayload {
  sub: string; // account id
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private accountService: AccountService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || '';
    if (!secret) {
      throw new InternalServerError('JWT_SECRET is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<Account | null> {
    try {
      const account = await this.accountService.getAccountById(payload.sub);
      return account;
    } catch (error) {
      // If account not found, return null (Passport will treat this as authentication failure)
      return null;
    }
  }
}
