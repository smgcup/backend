import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { FantasyTeam } from './fantasy-team.entity';
import { FantasyPlayer } from '../../fantasy-player/entities/fantasy-player.entity';

@ObjectType()
@Entity({ name: 'fantasy_team_slot' })
@Unique(['fantasyTeamId', 'playerId'])
export class FantasyTeamSlot {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Column({ name: 'fantasy_team_id', type: 'uuid', nullable: false })
  fantasyTeamId: string;

  @ManyToOne(() => FantasyTeam, (team) => team.slots, { nullable: false })
  @JoinColumn({ name: 'fantasy_team_id' })
  fantasyTeam: FantasyTeam;

  @Column({ name: 'player_id', type: 'uuid', nullable: false })
  playerId: string;

  @Field(() => FantasyPlayer)
  @ManyToOne(() => FantasyPlayer, { nullable: false })
  @JoinColumn({ name: 'player_id' })
  fantasyPlayer: FantasyPlayer;

  @Field(() => Boolean)
  @Column({ name: 'is_benched', type: 'boolean', nullable: false, default: false })
  isBenched: boolean;

  @Field(() => Int)
  @Column({ name: 'slot_order', type: 'integer', nullable: false, default: 0 })
  slotOrder: number;
}
