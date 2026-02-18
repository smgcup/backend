import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDisplayNameNullable1770595205366 implements MigrationInterface {
  name = 'MakeDisplayNameNullable1770595205366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fantasy_player" ALTER COLUMN "display_name" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fantasy_player" ALTER COLUMN "display_name" SET NOT NULL`);
  }
}
