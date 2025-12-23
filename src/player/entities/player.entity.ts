import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Team } from '../../team/entities/team.entity';

@ObjectType()
@Entity()
export class Player {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id: string;

  @Field(() => String)
  @Column({ name: 'first_name', type: 'text', nullable: false })
  firstName: string;

  @Field(() => String)
  @Column({ name: 'last_name', type: 'text', nullable: false })
  lastName: string;

  @Field(() => Number)
  @Column({ name: 'year_of_birth', type: 'integer', nullable: false })
  yearOfBirth: number;

  @Field(() => Number)
  @Column({ name: 'height', type: 'integer', nullable: false })
  height: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Field(() => Team, { nullable: false })
  @ManyToOne(() => Team, (team) => team.id, { nullable: false })
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
