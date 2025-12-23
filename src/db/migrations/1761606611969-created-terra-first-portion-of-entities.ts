import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraFirstPortionOfEntities1761606611969 implements MigrationInterface {
    name = 'CreatedTerraFirstPortionOfEntities1761606611969'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "terra_stress_data" ("id" uuid NOT NULL, "low_stress_duration_seconds" integer, "medium_stress_duration_data" integer, "high_stress_duration_data" integer, "avg_stress_level" integer, "min_stress_level" integer, "max_stress_level" integer, CONSTRAINT "PK_bd58f5065fc81653565ad51f8d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_sleep" ("id" uuid NOT NULL, "record_id" uuid NOT NULL, "nap" boolean, "start_time" TIMESTAMP WITH TIME ZONE, "end_time" TIMESTAMP WITH TIME ZONE, "timezone_offset" text, "oxygen_saturation_percentage" integer, "skin_temp_delta_degrees" integer, "sleep_perf_metrics_id" uuid, "sleep_stage_metrics_id" uuid, "sleep_hr_metrics_id" uuid, "respiration_data_id" uuid, CONSTRAINT "PK_57b5a3d09c2a3fbf831778ea74b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_daily_record" ("record_id" uuid NOT NULL, "record_date" date NOT NULL, "athlete_id" uuid NOT NULL, "last_updated" TIMESTAMP WITH TIME ZONE, "timezone_offset" text, "daily_metrics_id" uuid, "daily_activity_summary_id" uuid, "stress_data_id" uuid, CONSTRAINT "PK_5b8d71c955c64c6d26ea387ed72" PRIMARY KEY ("record_id"))`);
        await queryRunner.query(`CREATE TABLE "terra_daily_metrics" ("id" uuid NOT NULL, "recovery" double precision, "strain" double precision, "avg_hr_bpm" integer, "max_hr_bpm" integer, "min_hr_bpm" integer, "trimp" double precision, CONSTRAINT "PK_5afcfe67fe42ff98b4e8c45a0ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_daily_activity" ("id" uuid NOT NULL, "activity_seconds" integer, "inactivity_seconds" integer, "low_intensity_seconds" integer, "moderate_intensity_seconds" integer, "high_intensity_seconds" integer, "total_burned_calories" integer, CONSTRAINT "PK_24d9338a68ae8812783cfe7957c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "terra_daily_activity"`);
        await queryRunner.query(`DROP TABLE "terra_daily_metrics"`);
        await queryRunner.query(`DROP TABLE "terra_daily_record"`);
        await queryRunner.query(`DROP TABLE "terra_sleep"`);
        await queryRunner.query(`DROP TABLE "terra_stress_data"`);
    }

}
