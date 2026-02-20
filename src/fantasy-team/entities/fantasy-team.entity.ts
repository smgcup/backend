import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { FantasyPlayer } from '../../fantasy-player/entities/fantasy-player.entity';
import { FantasyTeamSlot } from './fantasy-team-slot.entity';

@ObjectType()
@Entity({ name: 'fantasy_team' })
export class FantasyTeam {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false, unique: true })
  userId: string;

  @Field(() => User)
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String)
  @Column({ name: 'team_name', type: 'text', nullable: false })
  teamName: string;

  @Field(() => Float)
  @Column({ name: 'budget', type: 'numeric', nullable: false, default: 100 })
  budget: number;

  @Field(() => Int)
  @Column({ name: 'free_transfers', type: 'integer', nullable: false, default: 1 })
  freeTransfers: number;

  @Column({ name: 'captain_player_id', type: 'uuid', nullable: false })
  captainPlayerId: string;

  @Field(() => FantasyPlayer)
  @ManyToOne(() => FantasyPlayer, { nullable: false })
  @JoinColumn({ name: 'captain_player_id' })
  captainPlayer: FantasyPlayer;

  @Field(() => [FantasyTeamSlot])
  @OneToMany(() => FantasyTeamSlot, (slot) => slot.fantasyTeam, { cascade: true })
  slots: FantasyTeamSlot[];

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;
}
