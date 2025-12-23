import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AthleteService } from './athlete.service';
import { AthleteResolver } from './athlete.resolver';
import { Athlete } from './entities/athlete.entity';
import { Team } from '../team/entities/team.entity';
import { AthleteDailyRecord } from './entities/athlete-daily-record.entity';
import { WindowScalar } from '../shared/inputs/window';
import { WindowInstance } from '../window-instance/entities/window-instance';
import { WindowInstanceModule } from '../window-instance/window-instance.module';
import { AthleteActionLog } from './entities/athlete-action-log.entity';
import { AthleteActionLogService } from './athlete-action-log.service';
import { TeamRegistrationLinkService } from '../team-registration-link/team-registration-link.service';
import { TeamRegistrationLink } from '../team-registration-link/entities/team-registration-link.entity';
import { TerraModule } from '../terra/terra.module';
import { AccountModule } from '../account/account.module';
import { WearableProviderModule } from '../wearable-provider/werable-provider.module';
import { WearableProvider } from '../wearable-provider/entities/wearable-provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Athlete,
      Team,
      AthleteDailyRecord,
      AthleteActionLog,
      WindowInstance,
      TeamRegistrationLink,
      WearableProvider,
    ]),
    AccountModule,
    WindowInstanceModule,
    WearableProviderModule,
    forwardRef(() => TerraModule),
  ],
  providers: [AthleteService, AthleteResolver, WindowScalar, TeamRegistrationLinkService, AthleteActionLogService],
  exports: [AthleteService, AthleteActionLogService],
})
export class AthleteModule {}
