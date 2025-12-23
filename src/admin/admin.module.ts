import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { TerraModule } from '../terra/terra.module';
import { TeamRegistrationLinkModule } from '../team-registration-link/team-registration-link.module';
import { AccountModule } from '../account/account.module';
import { UserModule } from '../user/user.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [TerraModule, TeamRegistrationLinkModule, AccountModule, UserModule, TeamModule],
  providers: [AdminService, AdminResolver],
  exports: [AdminService],
})
export class AdminModule {}
