import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AccountRole } from '../enums/role.enum';
import { Team } from '../../team/entities/team.entity';

@ObjectType()
@Entity('accounts')
export class Account {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => AccountRole, { nullable: false })
  @Column({ name: 'role', type: 'enum', enum: AccountRole, nullable: false })
  role!: AccountRole;

  @Field(() => String, { nullable: false })
  @Column({ name: 'email', type: 'text', nullable: false, unique: true })
  email!: string;

  @Column({ name: 'password', type: 'text', nullable: false })
  password!: string;

  @Field(() => Team, { nullable: true })
  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team?: Team | null;
}
