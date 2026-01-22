import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [],
  providers: [UserService, UserResolver],
  exports: [],
})
export class UserModule {}
