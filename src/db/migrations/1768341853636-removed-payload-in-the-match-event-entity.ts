import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedPayloadInTheMatchEventEntity1768341853636 implements MigrationInterface {
  name = 'RemovedPayloadInTheMatchEventEntity1768341853636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" DROP COLUMN "payload"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" ADD "payload" jsonb`);
  }
}
