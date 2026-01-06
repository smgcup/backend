import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertAllPlayerFieldsToEnums1767519759572 implements MigrationInterface {
  name = 'ConvertAllPlayerFieldsToEnums1767519759572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."player_preffered_foot_enum" RENAME TO "player_preffered_foot_enum_old"`,
    );
    await queryRunner.query(`CREATE TYPE "public"."player_preffered_foot_enum" AS ENUM('LEFT', 'RIGHT', 'BOTH')`);
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "preffered_foot" TYPE "public"."player_preffered_foot_enum" USING "preffered_foot"::"text"::"public"."player_preffered_foot_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."player_preffered_foot_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."player_preffered_foot_enum_old" AS ENUM('LEFT', 'RIGHT')`);
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "preffered_foot" TYPE "public"."player_preffered_foot_enum_old" USING "preffered_foot"::"text"::"public"."player_preffered_foot_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."player_preffered_foot_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."player_preffered_foot_enum_old" RENAME TO "player_preffered_foot_enum"`,
    );
  }
}
