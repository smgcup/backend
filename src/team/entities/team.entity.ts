import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Player } from '../../player/entities/player.entity';

@ObjectType()
@Entity()
export class Team {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Field(() => String)
  @Column({ name: 'name', type: 'text', nullable: false })
  name: string;

  @Field(() => [Player], { nullable: true })
  @OneToMany(() => Player, (player) => player.team)
  players: Player[];
}
