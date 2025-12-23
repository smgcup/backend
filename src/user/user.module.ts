import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { Team } from '../team/entities/team.entity';
import { Account } from '../account/entities/account.entity';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([User, Team, Account]), forwardRef(() => TeamModule)],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
