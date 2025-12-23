import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountService } from './account.service';
import { AccountResolver } from './account.resolver';
import { Account } from './entities/account.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '7d');
        return {
          secret: configService.get<string>('JWT_SECRET') || '',
          signOptions: {
            // JWT library accepts string format like '7d', '1h', '30m' or number in seconds
            // @ts-expect-error - jsonwebtoken accepts string but types are strict
            expiresIn,
          },
        };
      },
    }),
  ],
  providers: [AccountService, AccountResolver, JwtStrategy, RolesGuard],
  exports: [AccountService, JwtStrategy, RolesGuard],
})
export class AccountModule {}
