import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Match } from '../../match/entities/match.entity';
import { Player } from '../../player/entities/player.entity';

@ObjectType()
@Entity({ name: 'player_appearance' })
export class PlayerAppearance {
  @Field(() => String)
  @PrimaryColumn({ name: 'match_id', type: 'uuid' })
  matchId: string;

  @Field(() => Match)
  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Field(() => String)
  @PrimaryColumn({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Field(() => Player)
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Field(() => Int)
  @Column({ type: 'int', nullable: false })
  level: number;

  @Field(() => Date)
  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;
}
