import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { HealthFactorProperties } from './health-factor-properties.entity';

@ObjectType()
@Entity('health_factors')
export class HealthFactor {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => String, { nullable: false })
  @Column({ name: 'name', type: 'text', nullable: false })
  name!: string;

  @Field(() => Account, { nullable: false })
  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'creator_id' })
  creator!: Account;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  @Column({ name: 'updated_at', type: 'timestamptz', nullable: false })
  updatedAt!: Date;

  @OneToMany(() => HealthFactorProperties, (healthFactorProperties) => healthFactorProperties.healthFactor)
  healthFactorProperties!: HealthFactorProperties[];
}
