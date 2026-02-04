import { Module, forwardRef } from '@nestjs/common';
import { Player } from './entities/player.entity';
import { PlayerStats } from './entities/player-stats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './player.service';
import { PlayerStatsService } from './player-stats.service';
import { TeamModule } from '../team/team.module';
import { PlayerResolver } from './player.resolver';
import { ImageModule } from '../image/image.module';
import { ImageService } from '../image/image.service';
import { MatchEvent } from '../match-event/entities/match-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, PlayerStats, MatchEvent]),
    forwardRef(() => TeamModule),
    forwardRef(() => ImageModule),
  ],
  providers: [PlayerService, PlayerStatsService, PlayerResolver, ImageService],
  exports: [PlayerService, PlayerStatsService, TypeOrmModule],
})
export class PlayerModule {}
