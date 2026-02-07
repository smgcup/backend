import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FantasyPlayer } from './entities/fantasy-player.entity';
import { FantasyPlayerService } from './fantasy-player.service';
import { FantasyPlayerResolver } from './fantasy-player.resolver';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [TypeOrmModule.forFeature([FantasyPlayer]), PlayerModule],
  providers: [FantasyPlayerService, FantasyPlayerResolver],
  exports: [FantasyPlayerService],
})
export class FantasyPlayerModule {}
