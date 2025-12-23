import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AcuteSymptomParameter } from './acute-symptom-parameter.entity';
import { ComparisonOperator } from '../enums/comparison-operator.enum';

@ObjectType()
@Entity()
export class AcuteSymptomRule {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => ID, { nullable: false })
  @Column({ name: 'parameter_id', type: 'uuid', nullable: false })
  parameterId!: string;

  @Field(() => AcuteSymptomParameter, { nullable: false })
  @ManyToOne(() => AcuteSymptomParameter, { nullable: false })
  @JoinColumn({ name: 'parameter_id' })
  parameter!: AcuteSymptomParameter;

  @Field(() => ComparisonOperator, { nullable: false })
  @Column({ name: 'operator', type: 'enum', enum: ComparisonOperator, nullable: false })
  operator!: ComparisonOperator;

  @Field(() => String, { nullable: false })
  @Column({ name: 'value', type: 'text', nullable: false })
  value!: string;
}
