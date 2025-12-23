import { Athlete } from '../../athlete/entities/athlete.entity';
import { AcuteSymptomParameter } from '../../acute-symptom-rule/entities/acute-symptom-parameter.entity';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('parameter_deviations')
export class ParameterDeviations {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @ManyToOne(() => AcuteSymptomParameter, { nullable: false })
  @JoinColumn({ name: 'parameter_id' })
  parameter!: AcuteSymptomParameter;

  @Column({ name: 'sigma1', type: 'float', nullable: false })
  sigma1!: number;

  @Column({ name: 'athlete_id', type: 'uuid', nullable: false })
  athleteId!: string;

  @ManyToOne(() => Athlete, { nullable: false })
  @JoinColumn({ name: 'athlete_id' })
  athlete!: Athlete;

  @Column({ name: 'mean', type: 'float', nullable: false })
  mean!: number;
}
