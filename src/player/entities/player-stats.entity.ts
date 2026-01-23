import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Player } from './player.entity';

@ObjectType()
@Entity({ name: 'player_stats' })
export class PlayerStats {
  @Field(() => ID)
  @PrimaryColumn({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @OneToOne(() => Player, (player) => player.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Field(() => Number)
  @Column({ default: 0 })
  goals: number;

  @Field(() => Number)
  @Column({ name: 'penalties_scored', default: 0 })
  penaltiesScored: number;

  @Field(() => Number)
  @Column({ name: 'penalties_missed', default: 0 })
  penaltiesMissed: number;

  @Field(() => Number)
  @Column({ default: 0 })
  assists: number;

  @Field(() => Number)
  @Column({ name: 'yellow_cards', default: 0 })
  yellowCards: number;

  @Field(() => Number)
  @Column({ name: 'red_cards', default: 0 })
  redCards: number;

  @Field(() => Number)
  @Column({ name: 'goalkeeper_saves', default: 0 })
  goalkeeperSaves: number;
}
