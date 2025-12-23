import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedAthleteActionLogEntity1763135309088 implements MigrationInterface {
    name = 'CreatedAthleteActionLogEntity1763135309088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "athlete_action_log" ("id" uuid NOT NULL, "athlete_id" uuid NOT NULL, "action" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "action_data" jsonb, CONSTRAINT "PK_6f99e1786d2b9bbc6ae57bec81b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "athlete_action_log"`);
    }

}
