import { Athlete } from '../../athlete/entities/athlete.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('terra_historical_data_session')
export class TerraHistoricalDataSession {
  @PrimaryColumn({ name: 'id', type: 'uuid', nullable: false })
  id!: string;

  @Column({ name: 'athlete_id', type: 'uuid', nullable: false })
  athleteId!: string;

  @Column({ name: 'terra_user_id', type: 'uuid', nullable: false })
  terraUserId!: Athlete['terraId'];

  @Column({ name: 'start_date', type: 'date', nullable: false })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date', nullable: false })
  endDate!: Date;

  @Column({ name: 'start_timestamp', type: 'timestamptz', nullable: false })
  startTimestamp!: Date;

  @Column({ name: 'expected_payloads_daily', type: 'integer', nullable: true })
  expectedPayloadsDaily!: number | null;

  @Column({ name: 'terra_daily_reference', type: 'text', nullable: true })
  terraDailyReference: string;

  @Column({ name: 'terra_sleep_reference', type: 'text', nullable: true })
  terraSleepReference: string;

  @Column({ name: 'terra_activity_reference', type: 'text', nullable: true })
  terraActivityReference: string;

  @Column({ name: 'expected_payloads_sleep', type: 'integer', nullable: true })
  expectedPayloadsSleep!: number | null;

  @Column({ name: 'expected_payloads_activity', type: 'integer', nullable: true })
  expectedPayloadsActivity!: number | null;

  @Column({ name: 'received_payloads_daily', type: 'integer', nullable: false })
  receivedPayloadsDaily!: number;

  @Column({ name: 'received_payloads_sleep', type: 'integer', nullable: false })
  receivedPayloadsSleep!: number;

  @Column({ name: 'received_payloads_activity', type: 'integer', nullable: false })
  receivedPayloadsActivity!: number;

  @Column({ name: 'completed', type: 'boolean', nullable: false })
  completed!: boolean;
}
