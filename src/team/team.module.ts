import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { Team } from './entities/team.entity';
import { User } from '../user/entities/user.entity';
import { TeamService } from './team.service';
import { TeamResolver } from './team.resolver';
import { Athlete } from '../athlete/entities/athlete.entity';
import { AthleteModule } from '../athlete/athlete.module';
import { WindowInstanceModule } from '../window-instance/window-instance.module';
import { TerraDailyRecord } from '../terra/entities/terra-daily-record.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    DbModule,
    TypeOrmModule.forFeature([Team, User, Athlete, TerraDailyRecord]),
    forwardRef(() => AthleteModule),
    WindowInstanceModule,
    forwardRef(() => UserModule),
  ],
  providers: [TeamService, TeamResolver],
  exports: [TeamService],
})
export class TeamModule {}
