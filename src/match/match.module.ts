import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { Team } from '../team/entities/team.entity';
import { MatchService } from './match.service';
import { MatchResolver } from './match.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Team])],
  providers: [MatchService, MatchResolver],
  exports: [MatchService],
})
export class MatchModule {}
