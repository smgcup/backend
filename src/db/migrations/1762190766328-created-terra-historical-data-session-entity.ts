import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraHistoricalDataSessionEntity1762190766328 implements MigrationInterface {
    name = 'CreatedTerraHistoricalDataSessionEntity1762190766328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "terra_historical_data_session" ("id" uuid NOT NULL, "athlete_id" uuid NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "start_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "expected_payloads_daily" integer, "expected_payloads_sleep" integer, "expected_payloads_activity" integer, "received_payloads_daily" integer NOT NULL, "received_payloads_sleep" integer NOT NULL, "received_payloads_activity" integer NOT NULL, "completed" boolean NOT NULL, CONSTRAINT "PK_aa22ffaf240d51e9806117c0298" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "terra_historical_data_session"`);
    }

}
