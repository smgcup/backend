import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HealthFactor } from './health-factor.entity';
import { HealthFactorProperty } from './health-factor-property.entity';

@ObjectType()
@Entity('health_factor_properties')
export class HealthFactorProperties {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => HealthFactor, { nullable: false })
  @ManyToOne(() => HealthFactor, { nullable: false })
  @JoinColumn({ name: 'health_factor_id' })
  healthFactor!: HealthFactor;

  @Field(() => HealthFactorProperty, { nullable: false })
  @ManyToOne(() => HealthFactorProperty, { nullable: false })
  @JoinColumn({ name: 'health_factor_property_id', referencedColumnName: 'id' })
  healthFactorProperty!: HealthFactorProperty;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'updated_at', type: 'timestamptz', nullable: false })
  updatedAt!: Date;
}
