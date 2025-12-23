import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { HealthFactorPropertyMeasurementUnitClass } from '../enums/health-factor-property-measurement-unit-class.enum';
import { HealthFactorPropertyMeasurementUnitType } from '../enums/health-factor-property-measurement-unit-type.enum';
@ObjectType()
@Entity('health_factor_property_measurement_unit')
export class HealthFactorPropertyMeasurementUnit {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => HealthFactorPropertyMeasurementUnitClass, { nullable: false })
  @Column({ name: 'class', type: 'enum', enum: HealthFactorPropertyMeasurementUnitClass, nullable: false })
  class!: HealthFactorPropertyMeasurementUnitClass;

  @Field(() => String, { nullable: false })
  @Column({ name: 'symbol', type: 'text', nullable: false })
  symbol!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'type', type: 'enum', enum: HealthFactorPropertyMeasurementUnitType, nullable: false })
  type!: HealthFactorPropertyMeasurementUnitType;
}
