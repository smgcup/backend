import { MigrationInterface, QueryRunner } from 'typeorm';

export class MadeMatchEventCreatedAtNonNullable1768323719225 implements MigrationInterface {
  name = 'MadeMatchEventCreatedAtNonNullable1768323719225';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "created_at" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "created_at" DROP NOT NULL`);
  }
}
