import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AcuteSymptom } from '../../acute-symptom/entities/acute-symptom.entity';
import { AcuteSymptomRule } from './acute-symptom-rule.entity';

@ObjectType()
@Entity()
export class AcuteSymptomRuleset {
  @Field(() => ID)
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Field(() => ID)
  @Column({ name: 'symptom_id', type: 'uuid', nullable: false })
  symptomId!: string;

  @ManyToOne(() => AcuteSymptom, { nullable: false })
  @JoinColumn({ name: 'symptom_id' })
  @Field(() => AcuteSymptom, { nullable: false })
  symptom!: AcuteSymptom;

  @Field(() => AcuteSymptomRule, { nullable: false })
  @ManyToOne(() => AcuteSymptomRule, { nullable: false })
  @JoinColumn({ name: 'rule_id' })
  rule!: AcuteSymptomRule;
}
