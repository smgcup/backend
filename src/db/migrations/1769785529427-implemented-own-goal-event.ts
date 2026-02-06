import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImplementedOwnGoalEvent1769785529427 implements MigrationInterface {
  name = 'ImplementedOwnGoalEvent1769785529427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player_stats" ADD "own_goals" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TYPE "public"."match_event_type_enum" RENAME TO "match_event_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."match_event_type_enum" AS ENUM('GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'GOALKEEPER_SAVE', 'PENALTY_SCORED', 'PENALTY_MISSED', 'HALF_TIME', 'FULL_TIME')`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_event" ALTER COLUMN "type" TYPE "public"."match_event_type_enum" USING "type"::"text"::"public"."match_event_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."match_event_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."match_event_type_enum_old" AS ENUM('GOAL', 'YELLOW_CARD', 'RED_CARD', 'GOALKEEPER_SAVE', 'PENALTY_SCORED', 'PENALTY_MISSED', 'HALF_TIME', 'FULL_TIME')`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_event" ALTER COLUMN "type" TYPE "public"."match_event_type_enum_old" USING "type"::"text"::"public"."match_event_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."match_event_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."match_event_type_enum_old" RENAME TO "match_event_type_enum"`);
    await queryRunner.query(`ALTER TABLE "player_stats" DROP COLUMN "own_goals"`);
  }
}
