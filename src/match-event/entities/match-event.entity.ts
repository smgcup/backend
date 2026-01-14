import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Match } from '../../match/entities/match.entity';
import { Team } from '../../team/entities/team.entity';
import { Player } from '../../player/entities/player.entity';
import { MatchEventType } from '../enums/match-event-type.enum';

@ObjectType()
@Entity({ name: 'match_event' })
export class MatchEvent {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId: string;

  @Field(() => Match)
  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'player_id', type: 'uuid', nullable: true })
  playerId: string | null;

  @Field(() => Player, { nullable: true })
  @ManyToOne(() => Player, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'player_id' })
  player: Player | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'assist_player_id', type: 'uuid', nullable: true })
  assistPlayerId?: string | null;

  @Field(() => Player, { nullable: true })
  @ManyToOne(() => Player, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assist_player_id' })
  assistPlayer: Player | null;

  @Field(() => MatchEventType)
  @Column({ type: 'enum', enum: MatchEventType })
  type: MatchEventType;

  @Field(() => Number)
  @Column({ type: 'int' })
  minute: number;

  @Field(() => Date)
  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;
}
