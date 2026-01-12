import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Match } from '../../match/entities/match.entity';
import { Team } from '../../team/entities/team.entity';
import { Player } from '../../player/entities/player.entity';
import { MatchEventType } from '../enums/match-event-type.enum';

@ObjectType()
@Entity({ name: 'match_event' })
export class MatchEvent {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId: string;

  @Field(() => Match)
  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Field(() => Team)
  @ManyToOne(() => Team, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'player_id', type: 'uuid', nullable: true })
  playerId: string | null;

  @Field(() => Player, { nullable: true })
  @ManyToOne(() => Player, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'player_id' })
  player: Player | null;

  @Field(() => MatchEventType)
  @Column({ type: 'enum', enum: MatchEventType })
  type: MatchEventType;

  @Field(() => Number)
  @Column({ type: 'int' })
  minute: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @Field(() => Date)
  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;
}
