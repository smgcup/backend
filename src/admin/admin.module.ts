import { Module } from '@nestjs/common';
import { AdminAuthResolver } from './auth/admin-auth.resolver';
@Module({
  imports: [],
  controllers: [],
  providers: [AdminAuthResolver],
})
export class AdminModule {}
