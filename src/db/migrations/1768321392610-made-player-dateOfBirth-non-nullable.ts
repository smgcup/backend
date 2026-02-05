import { MigrationInterface, QueryRunner } from 'typeorm';

export class MadePlayerDateOfBirthNonNullable1768321392610 implements MigrationInterface {
  name = 'MadePlayerDateOfBirthNonNullable1768321392610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" ALTER COLUMN "date_of_birth" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "created_at" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "created_at" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "player" ALTER COLUMN "date_of_birth" DROP NOT NULL`);
  }
}
