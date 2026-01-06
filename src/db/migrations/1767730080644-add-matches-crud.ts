import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchesCrud1767730080644 implements MigrationInterface {
  name = 'AddMatchesCrud1767730080644';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "score1" integer`);
    await queryRunner.query(`ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "score2" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN IF EXISTS "score2"`);
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN IF EXISTS "score1"`);
  }
}
