import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FantasyTeam } from './entities/fantasy-team.entity';
import { FantasyTeamSlot } from './entities/fantasy-team-slot.entity';
import { FantasyPlayer } from '../fantasy-player/entities/fantasy-player.entity';
import { FantasyTeamService } from './fantasy-team.service';
import { FantasyTeamResolver } from './fantasy-team.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([FantasyTeam, FantasyTeamSlot, FantasyPlayer])],
  providers: [FantasyTeamService, FantasyTeamResolver],
  exports: [FantasyTeamService],
})
export class FantasyTeamModule {}
