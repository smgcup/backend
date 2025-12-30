import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedMatchEventEntity1767127960771 implements MigrationInterface {
    name = 'CreatedMatchEventEntity1767127960771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."match_event_type_enum" AS ENUM('SHOT', 'GOAL', 'FOUL', 'CARD', 'SUBSTITUTION', 'HALF_TIME', 'PENALTY_SHOOTOUT', 'CORNER_KICK', 'FREE_KICK', 'PENALTY_KICK', 'FULL_TIME')`);
        await queryRunner.query(`CREATE TABLE "match_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "match_id" uuid NOT NULL, "team_id" uuid NOT NULL, "player_id" uuid, "type" "public"."match_event_type_enum" NOT NULL, "minute" integer NOT NULL, "second" integer NOT NULL DEFAULT '0', "payload" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c1329cb9d3397d63a39a11f6af5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "match_event" ADD CONSTRAINT "FK_9f789e95a157139a4e508a9f35d" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_event" ADD CONSTRAINT "FK_8a8f47c06aae3a29ace8f375dbc" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_event" ADD CONSTRAINT "FK_edba289307c9b420a525540d723" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_event" DROP CONSTRAINT "FK_edba289307c9b420a525540d723"`);
        await queryRunner.query(`ALTER TABLE "match_event" DROP CONSTRAINT "FK_8a8f47c06aae3a29ace8f375dbc"`);
        await queryRunner.query(`ALTER TABLE "match_event" DROP CONSTRAINT "FK_9f789e95a157139a4e508a9f35d"`);
        await queryRunner.query(`DROP TABLE "match_event"`);
        await queryRunner.query(`DROP TYPE "public"."match_event_type_enum"`);
    }

}
