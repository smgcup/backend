import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamedRecordDateToDate1760803729738 implements MigrationInterface {
  name = 'RenamedRecordDateToDate1760803729738';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "athlete_daily_records" RENAME COLUMN "record_date" TO "date"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "athlete_daily_records" RENAME COLUMN "date" TO "record_date"`);
  }
}
