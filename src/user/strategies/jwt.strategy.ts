import { Injectable } from '@nestjs/common';
import { InternalServerError } from '../../exception/exceptions';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user.service';
import { User } from '../entities/user.entity';

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
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

  async validate(payload: JwtPayload): Promise<User | null> {
    try {
      const user = await this.userService.getUserById(payload.sub);
      return user;
    } catch {
      // If user not found, return null (Passport will treat this as authentication failure)
      return null;
    }
  }
}
