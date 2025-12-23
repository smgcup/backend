import { Module, forwardRef } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamResolver } from './team.resolver';
import { Team } from './entities/team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team]), forwardRef(() => PlayerModule)],
  providers: [TeamService, TeamResolver],
  exports: [TeamService],
})
export class TeamModule {}
