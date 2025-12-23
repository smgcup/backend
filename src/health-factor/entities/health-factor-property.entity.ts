import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { HealthFactorInputType } from '../enums/health-factor-input-type.enum';
import { HealthFactorPropertyMeasurementUnit } from './health-factor-property-measurement-unit.entity';
import { Account } from '../../account/entities/account.entity';

@ObjectType()
@Entity('health_factor_property')
export class HealthFactorProperty {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'key', type: 'text', nullable: false })
  key!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'label', type: 'text', nullable: false })
  label!: string;

  @Field(() => Account, { nullable: false })
  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'creator_id' })
  creator!: Account;

  @Field(() => HealthFactorInputType, { nullable: false })
  @Column({ name: 'input_type', type: 'enum', enum: HealthFactorInputType, nullable: false })
  inputType!: HealthFactorInputType;

  @Field(() => HealthFactorPropertyMeasurementUnit, { nullable: false })
  @ManyToOne(() => HealthFactorPropertyMeasurementUnit, { nullable: false })
  @JoinColumn({ name: 'measurement_unit_id', referencedColumnName: 'id' })
  measurementUnit!: HealthFactorPropertyMeasurementUnit;

  @Field(() => [String], { nullable: false })
  @Column({
    name: 'options',
    type: 'jsonb',
    nullable: true,
  })
  options!: string[] | null;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'updated_at', type: 'timestamptz', nullable: false })
  updatedAt!: Date;
}
