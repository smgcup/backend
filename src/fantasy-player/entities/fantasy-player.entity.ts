import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Field, ID, ObjectType, Float } from '@nestjs/graphql';
import { Player } from '../../player/entities/player.entity';

@ObjectType()
@Entity()
export class FantasyPlayer {
  @Field(() => ID)
  @PrimaryColumn({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Field(() => String)
  @Column({ name: 'display_name', type: 'text', nullable: false })
  displayName: string;

  @Field(() => Float)
  @Column({ name: 'price', type: 'numeric', nullable: false })
  price: number;

  @Field(() => Player, { nullable: false })
  @OneToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;
}
