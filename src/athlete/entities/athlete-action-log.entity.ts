// src/athlete/entities/athlete-action-log.entity.ts

import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { GraphQLJSONObject } from 'graphql-type-json';
import { AthleteActionType } from '../enums/athlete-action-type.enum';
import { AthleteActionData } from '../types/athlete-action.types';

@Entity('athlete_action_log')
@ObjectType()
export class AthleteActionLog {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => ID, { nullable: false })
  @Column({ name: 'athlete_id', type: 'uuid', nullable: false })
  athleteId!: string;

  @Field(() => AthleteActionType, { nullable: false })
  @Column({
    name: 'action',
    type: 'text',
    nullable: false,
    enum: AthleteActionType,
  })
  action!: AthleteActionType;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'timestamp', type: 'timestamptz', nullable: false })
  timestamp!: Date;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ name: 'action_data', type: 'jsonb', nullable: true })
  actionData!: AthleteActionData | null;
}
