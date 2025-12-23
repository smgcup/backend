import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraSleepEntities1761764374635 implements MigrationInterface {
    name = 'CreatedTerraSleepEntities1761764374635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "terra_sleep_perf_metrics" ("id" uuid NOT NULL, "sleep_performance_percentage" integer, "sleep_efficiency_percentage" integer, "sleep_consistency_percentage" integer, "avg_breaths_per_min" integer, CONSTRAINT "PK_4bb7deba4228604af6b12b0c437" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_sleep_respiration_data" ("id" uuid NOT NULL, "avg_breaths_per_min" integer, "max_breaths_per_min" integer, "min_breaths_per_min" integer, CONSTRAINT "PK_82f5b0b540202b3f69661a21b78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_sleep_hr_metrics" ("id" uuid NOT NULL, "max_hr_bpm" integer, "min_hr_bpm" integer, "avg_hr_bpm" integer, "resting_hr_bpm" integer, "avg_hrv" integer, "hrv_calculation" text, CONSTRAINT "PK_9fe57f326ac095af84ef13326c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terra_sleep_stage_metrics" ("id" uuid NOT NULL, "light_sleep_seconds" integer, "deep_sleep_seconds" integer, "rem_sleep_seconds" integer, "num_wakeup_events" integer, "awake_seconds" integer, "time_asleep_seconds" integer, "time_in_bed_seconds" integer, CONSTRAINT "PK_22c0bc2340e9d95190135e4e740" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" DROP COLUMN "medium_stress_duration_data"`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" DROP COLUMN "high_stress_duration_data"`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" DROP COLUMN "min_stress_level"`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP COLUMN "daily_activity_summary_id"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP COLUMN "respiration_data_id"`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" ADD "medium_stress_duration_seconds" integer`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" ADD "high_stress_duration_seconds" integer`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD "daily_activity_id" uuid`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD CONSTRAINT "UQ_aba8af3f0d1a9f4dea8cfae4702" UNIQUE ("daily_activity_id")`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD "sleep_respiration_data_id" uuid`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "UQ_87fe145f014bb16d177d1bfc041" UNIQUE ("sleep_respiration_data_id")`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD CONSTRAINT "UQ_885b13fc32227a5520d1ad2af74" UNIQUE ("daily_metrics_id")`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD CONSTRAINT "UQ_3ff14b07b201dfa5370231957d4" UNIQUE ("stress_data_id")`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "UQ_abc49b0455c4399afcef616bf2b" UNIQUE ("sleep_perf_metrics_id")`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "UQ_955addfb582cfca2c09898e91f1" UNIQUE ("sleep_hr_metrics_id")`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "UQ_51da020b2989574ee0a0c6dd873" UNIQUE ("sleep_stage_metrics_id")`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD CONSTRAINT "FK_885b13fc32227a5520d1ad2af74" FOREIGN KEY ("daily_metrics_id") REFERENCES "terra_daily_metrics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD CONSTRAINT "FK_aba8af3f0d1a9f4dea8cfae4702" FOREIGN KEY ("daily_activity_id") REFERENCES "terra_daily_activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD CONSTRAINT "FK_3ff14b07b201dfa5370231957d4" FOREIGN KEY ("stress_data_id") REFERENCES "terra_stress_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "FK_abc49b0455c4399afcef616bf2b" FOREIGN KEY ("sleep_perf_metrics_id") REFERENCES "terra_sleep_perf_metrics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "FK_87fe145f014bb16d177d1bfc041" FOREIGN KEY ("sleep_respiration_data_id") REFERENCES "terra_sleep_respiration_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "FK_955addfb582cfca2c09898e91f1" FOREIGN KEY ("sleep_hr_metrics_id") REFERENCES "terra_sleep_hr_metrics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "FK_51da020b2989574ee0a0c6dd873" FOREIGN KEY ("sleep_stage_metrics_id") REFERENCES "terra_sleep_stage_metrics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "FK_51da020b2989574ee0a0c6dd873"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "FK_955addfb582cfca2c09898e91f1"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "FK_87fe145f014bb16d177d1bfc041"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "FK_abc49b0455c4399afcef616bf2b"`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP CONSTRAINT "FK_3ff14b07b201dfa5370231957d4"`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP CONSTRAINT "FK_aba8af3f0d1a9f4dea8cfae4702"`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP CONSTRAINT "FK_885b13fc32227a5520d1ad2af74"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "UQ_51da020b2989574ee0a0c6dd873"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "UQ_955addfb582cfca2c09898e91f1"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "UQ_abc49b0455c4399afcef616bf2b"`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP CONSTRAINT "UQ_3ff14b07b201dfa5370231957d4"`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP CONSTRAINT "UQ_885b13fc32227a5520d1ad2af74"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "UQ_87fe145f014bb16d177d1bfc041"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP COLUMN "sleep_respiration_data_id"`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP CONSTRAINT "UQ_aba8af3f0d1a9f4dea8cfae4702"`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP COLUMN "daily_activity_id"`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" DROP COLUMN "high_stress_duration_seconds"`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" DROP COLUMN "medium_stress_duration_seconds"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD "respiration_data_id" uuid`);
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD "daily_activity_summary_id" uuid`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" ADD "min_stress_level" integer`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" ADD "high_stress_duration_data" integer`);
        await queryRunner.query(`ALTER TABLE "terra_stress_data" ADD "medium_stress_duration_data" integer`);
        await queryRunner.query(`DROP TABLE "terra_sleep_stage_metrics"`);
        await queryRunner.query(`DROP TABLE "terra_sleep_hr_metrics"`);
        await queryRunner.query(`DROP TABLE "terra_sleep_respiration_data"`);
        await queryRunner.query(`DROP TABLE "terra_sleep_perf_metrics"`);
    }

}
