import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedMatchEventSecondsProperty1767128007468 implements MigrationInterface {
  name = 'RemovedMatchEventSecondsProperty1767128007468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" DROP COLUMN "second"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" ADD "second" integer NOT NULL DEFAULT '0'`);
  }
}
