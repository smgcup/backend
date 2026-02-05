import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedIsBoostedToPredictions1770322195562 implements MigrationInterface {
  name = 'AddedIsBoostedToPredictions1770322195562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prediction" ADD "is_boosted" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prediction" DROP COLUMN "is_boosted"`);
  }
}
