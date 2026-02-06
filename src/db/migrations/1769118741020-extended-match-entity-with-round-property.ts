import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendedMatchEntityWithRoundProperty1769118741020 implements MigrationInterface {
  name = 'ExtendedMatchEntityWithRoundProperty1769118741020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" ADD "round" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "round"`);
  }
}
