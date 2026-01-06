import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertPlayerFieldsToEnums1767519453618 implements MigrationInterface {
  name = 'ConvertPlayerFieldsToEnums1767519453618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "preffered_foot"`);
    await queryRunner.query(`CREATE TYPE "public"."player_preffered_foot_enum" AS ENUM('LEFT', 'RIGHT')`);
    await queryRunner.query(`ALTER TABLE "player" ADD "preffered_foot" "public"."player_preffered_foot_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "position"`);
    await queryRunner.query(
      `CREATE TYPE "public"."player_position_enum" AS ENUM('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD')`,
    );
    await queryRunner.query(`ALTER TABLE "player" ADD "position" "public"."player_position_enum" NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "position"`);
    await queryRunner.query(`DROP TYPE "public"."player_position_enum"`);
    await queryRunner.query(`ALTER TABLE "player" ADD "position" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "preffered_foot"`);
    await queryRunner.query(`DROP TYPE "public"."player_preffered_foot_enum"`);
    await queryRunner.query(`ALTER TABLE "player" ADD "preffered_foot" text NOT NULL`);
  }
}
