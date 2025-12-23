import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraReferencesForDailyAndSleepAndActivity1762216131575 implements MigrationInterface {
    name = 'CreatedTerraReferencesForDailyAndSleepAndActivity1762216131575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_historical_data_session" ADD "terra_daily_reference" text`);
        await queryRunner.query(`ALTER TABLE "terra_historical_data_session" ADD "terra_sleep_reference" text`);
        await queryRunner.query(`ALTER TABLE "terra_historical_data_session" ADD "terra_activity_reference" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_historical_data_session" DROP COLUMN "terra_activity_reference"`);
        await queryRunner.query(`ALTER TABLE "terra_historical_data_session" DROP COLUMN "terra_sleep_reference"`);
        await queryRunner.query(`ALTER TABLE "terra_historical_data_session" DROP COLUMN "terra_daily_reference"`);
    }

}
