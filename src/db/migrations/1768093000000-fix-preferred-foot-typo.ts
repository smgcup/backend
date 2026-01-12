import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPreferredFootTypo1768093000000 implements MigrationInterface {
  name = 'FixPreferredFootTypo1768093000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename the enum type first
    await queryRunner.query(`ALTER TYPE "public"."player_preffered_foot_enum" RENAME TO "player_preferred_foot_enum"`);
    // Rename the column
    await queryRunner.query(`ALTER TABLE "player" RENAME COLUMN "preffered_foot" TO "preferred_foot"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename the column back
    await queryRunner.query(`ALTER TABLE "player" RENAME COLUMN "preferred_foot" TO "preffered_foot"`);
    // Rename the enum type back
    await queryRunner.query(`ALTER TYPE "public"."player_preferred_foot_enum" RENAME TO "player_preffered_foot_enum"`);
  }
}
