import { MigrationInterface, QueryRunner } from 'typeorm';

export class MadePredictionScoresNonNullable1769555345701 implements MigrationInterface {
  name = 'MadePredictionScoresNonNullable1769555345701';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update any existing NULL values to 0 before making the columns NOT NULL
    await queryRunner.query(`UPDATE "prediction" SET "predicted_score1" = 0 WHERE "predicted_score1" IS NULL`);
    await queryRunner.query(`UPDATE "prediction" SET "predicted_score2" = 0 WHERE "predicted_score2" IS NULL`);

    // Now make the columns NOT NULL
    await queryRunner.query(`ALTER TABLE "prediction" ALTER COLUMN "predicted_score1" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prediction" ALTER COLUMN "predicted_score2" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the columns back to nullable
    await queryRunner.query(`ALTER TABLE "prediction" ALTER COLUMN "predicted_score2" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prediction" ALTER COLUMN "predicted_score1" DROP NOT NULL`);
  }
}
