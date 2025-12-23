import { Module } from '@nestjs/common';
import { Player } from './entities/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [],
  exports: [TypeOrmModule],
})
export class PlayerModule {}
