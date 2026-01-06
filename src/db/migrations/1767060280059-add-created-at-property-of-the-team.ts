import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtPropertyOfTheTeam1767060280059 implements MigrationInterface {
  name = 'AddCreatedAtPropertyOfTheTeam1767060280059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team" ADD "created_at" TIMESTAMP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "created_at"`);
  }
}
