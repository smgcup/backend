import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPenaltySavedEvent1770508951387 implements MigrationInterface {
    name = 'AddedPenaltySavedEvent1770508951387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."match_event_type_enum" RENAME TO "match_event_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."match_event_type_enum" AS ENUM('GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'GOALKEEPER_SAVE', 'PENALTY_SCORED', 'PENALTY_MISSED', 'PENALTY_SAVE', 'HALF_TIME', 'FULL_TIME')`);
        await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "type" TYPE "public"."match_event_type_enum" USING "type"::"text"::"public"."match_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."match_event_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."match_event_type_enum_old" AS ENUM('GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'GOALKEEPER_SAVE', 'PENALTY_SCORED', 'PENALTY_MISSED', 'HALF_TIME', 'FULL_TIME')`);
        await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "type" TYPE "public"."match_event_type_enum_old" USING "type"::"text"::"public"."match_event_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."match_event_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."match_event_type_enum_old" RENAME TO "match_event_type_enum"`);
    }

}
