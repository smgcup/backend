import { Module, forwardRef } from '@nestjs/common';
import { Player } from './entities/player.entity';
import { PlayerStats } from './entities/player-stats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './player.service';
import { PlayerStatsService } from './player-stats.service';
import { TeamModule } from '../team/team.module';
import { PlayerResolver } from './player.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerStats]), forwardRef(() => TeamModule)],
  providers: [PlayerService, PlayerStatsService, PlayerResolver],
  exports: [PlayerService, PlayerStatsService, TypeOrmModule],
})
export class PlayerModule {}
