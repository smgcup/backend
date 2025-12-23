import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraActivityEntities1761835649656 implements MigrationInterface {
    name = 'CreatedTerraActivityEntities1761835649656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "terra_activity" ("id" uuid NOT NULL, "record_id" uuid NOT NULL, "activity_type_id" uuid, "activity_metrics_id" uuid, "start_time" TIMESTAMP WITH TIME ZONE, "end_time" TIMESTAMP WITH TIME ZONE, "timezone_offset" text, "activity_duration_seconds" integer, CONSTRAINT "PK_ef8a9d027f651f4053cd20d3612" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_activity_type" ("id" uuid NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_447bbe6552c34b652561f7cff9b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_activity_movement_data" ("id" uuid NOT NULL, "distance_meters" integer, CONSTRAINT "PK_0b447680bb6b4de9f8a28d72fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_activity_metrics" ("id" uuid NOT NULL, "calories_burned_total" integer, "work_kilojoules" integer, "hr_avg_bpm" integer, "hr_max_bpm" integer, "hr_min_bpm" integer, "activity_hr_zone_data_id" uuid, "activity_movement_id" uuid, CONSTRAINT "PK_d798a0e689a93257f3d050db33b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_activity_hr_zone_data" ("id" uuid NOT NULL, "zone_number" text, "name" text, "duration_seconds" integer, "start_percentage" integer, "end_percentage" integer, CONSTRAINT "PK_12e71f6504f8843c5106acc55e4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "terra_activity_hr_zone_data"`);
        await queryRunner.query(`DROP TABLE "terra_activity_metrics"`);
        await queryRunner.query(`DROP TABLE "terra_activity_movement_data"`);
        await queryRunner.query(`DROP TABLE "terra_activity_type"`);
        await queryRunner.query(`DROP TABLE "terra_activity"`);
    }

}
