import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedWeightPrefferedFootAndPositonToThePlayerEntity1767475030912 implements MigrationInterface {
  name = 'AddedWeightPrefferedFootAndPositonToThePlayerEntity1767475030912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" ADD "weight" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "player" ADD "preffered_foot" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "player" ADD "position" text NOT NULL`);
    await queryRunner.query(`ALTER TYPE "public"."match_event_type_enum" RENAME TO "match_event_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."match_event_type_enum" AS ENUM('GOAL', 'YELLOW_CARD', 'RED_CARD', 'GOALKEEPER_SAVE', 'PENALTY_SCORED', 'PENALTY_MISSED', 'HALF_TIME', 'FULL_TIME')`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_event" ALTER COLUMN "type" TYPE "public"."match_event_type_enum" USING "type"::"text"::"public"."match_event_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."match_event_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."match_event_type_enum_old" AS ENUM('SHOT', 'GOAL', 'FOUL', 'CARD', 'SUBSTITUTION', 'HALF_TIME', 'PENALTY_SHOOTOUT', 'CORNER_KICK', 'FREE_KICK', 'PENALTY_KICK', 'FULL_TIME')`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_event" ALTER COLUMN "type" TYPE "public"."match_event_type_enum_old" USING "type"::"text"::"public"."match_event_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."match_event_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."match_event_type_enum_old" RENAME TO "match_event_type_enum"`);
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "position"`);
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "preffered_foot"`);
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "weight"`);
  }
}
