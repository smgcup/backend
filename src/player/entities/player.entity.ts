import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Team } from '../../team/entities/team.entity';
import { PreferredFoot } from '../enums/preferred-foot.enum';
import { PlayerPosition } from '../enums/player-position.enum';
import { PlayerStats } from './player-stats.entity';

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
  @Column({ name: 'height', type: 'integer', nullable: false })
  height: number;

  @Field(() => Number)
  @Column({ name: 'weight', type: 'int', nullable: false })
  weight: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'class', type: 'text', nullable: true })
  class?: string;

  @Field(() => PreferredFoot)
  @Column({ name: 'preferred_foot', type: 'enum', enum: PreferredFoot, nullable: false })
  preferredFoot: PreferredFoot;

  @Field(() => PlayerPosition)
  @Column({ name: 'position', type: 'enum', enum: PlayerPosition, nullable: false })
  position: PlayerPosition;

  @Field(() => String, { nullable: true })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Field(() => Team, { nullable: false })
  @ManyToOne(() => Team, (team) => team.id, { nullable: false })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'date_of_birth', type: 'date', nullable: false })
  dateOfBirth: Date;

  @Field(() => PlayerStats, { nullable: true })
  stats?: PlayerStats;

  @Field(() => Number, { nullable: false })
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) {
      age--;
    }

    return age;
  }
}
