import { Entity, PrimaryColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Player } from '../../player/entities/player.entity';
import { TeamStats } from './team-stats.entity';

@ObjectType()
@Entity()
export class Team {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Field(() => String)
  @Column({ name: 'name', type: 'text', nullable: false })
  name: string;

  @Field(() => [Player])
  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @Field(() => Date)
  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Field(() => Player, { nullable: true })
  @OneToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'captain_id' })
  captain: Player | null;

  @Field(() => TeamStats)
  stats: TeamStats;
}
