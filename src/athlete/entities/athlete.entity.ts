import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Gender } from '../enums/gender.enum';
import { Team } from '../../team/entities/team.entity';
import { WindowInstance } from '../../window-instance/entities/window-instance';
import { TerraDailyRecord } from '../../terra/entities/terra-daily-record.entity';
import { DateSimpleScalar } from '../../graphql/scalars/date-simple.scalar';
import { Account } from '../../account/entities/account.entity';
import { WearableProvider } from '../../wearable-provider/entities/wearable-provider.entity';

@Entity()
@ObjectType()
export class Athlete {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => Account, { nullable: false })
  @OneToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Field(() => ID, { nullable: true })
  @Column({ name: 'terra_id', type: 'uuid', nullable: true, unique: true })
  terraId!: string | null;

  @Field(() => String, { nullable: false })
  @Column({ name: 'first_name', type: 'text', nullable: false })
  firstName!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'last_name', type: 'text', nullable: false })
  lastName!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'email', type: 'text', nullable: false, unique: true })
  email!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'phone_number', type: 'text', nullable: false, unique: true })
  phoneNumber!: string;

  @Field(() => Gender, { nullable: false })
  @Column({ name: 'gender', type: 'enum', enum: Gender, nullable: false })
  gender!: Gender;

  @Field(() => DateSimpleScalar, { nullable: false })
  @Column({ name: 'date_of_birth', type: 'date', nullable: false })
  dateOfBirth!: Date;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Team, { nullable: false })
  @ManyToOne(() => Team, { nullable: false })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Field(() => [WindowInstance], { nullable: false })
  windowInstances?: WindowInstance[];

  @OneToMany(() => TerraDailyRecord, (terraDailyRecord) => terraDailyRecord.athlete)
  terraDailyRecords?: TerraDailyRecord[];

  @Field(() => WearableProvider, { nullable: true })
  @OneToOne(() => WearableProvider, { nullable: true })
  @JoinColumn({ name: 'wearable_provider_id' })
  wearableProvider!: WearableProvider;
}
