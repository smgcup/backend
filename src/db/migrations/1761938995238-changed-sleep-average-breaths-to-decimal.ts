import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedSleepAverageBreathsToDecimal1761938995238 implements MigrationInterface {
    name = 'ChangedSleepAverageBreathsToDecimal1761938995238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep_perf_metrics" DROP COLUMN "avg_breaths_per_min"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_perf_metrics" ADD "avg_breaths_per_min" numeric(3,1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep_perf_metrics" DROP COLUMN "avg_breaths_per_min"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_perf_metrics" ADD "avg_breaths_per_min" integer`);
    }

}
