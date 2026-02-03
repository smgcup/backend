import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedYearOfBirthPlayerEntity1768322264852 implements MigrationInterface {
  name = 'RemovedYearOfBirthPlayerEntity1768322264852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "year_of_birth"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" ADD "year_of_birth" integer NOT NULL`);
  }
}
