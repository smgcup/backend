import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEvent } from './entities/match-event.entity';
import { MatchEventService } from './match-event.service';
import { MatchEventResolver } from './match-event.resolver';
import { PlayerModule } from '../player/player.module';
import { TeamModule } from '../team/team.module';
import { MatchModule } from '../match/match.module';
import { Match } from '../match/entities/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchEvent, Match]),
    forwardRef(() => PlayerModule),
    forwardRef(() => TeamModule),
    forwardRef(() => MatchModule),
  ],
  providers: [MatchEventService, MatchEventResolver],
  exports: [MatchEventService],
})
export class MatchEventModule {}
