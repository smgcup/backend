import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedSleepRespirationColumnsToFloats1761939344906 implements MigrationInterface {
    name = 'ChangedSleepRespirationColumnsToFloats1761939344906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" DROP COLUMN "avg_breaths_per_min"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" ADD "avg_breaths_per_min" numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" DROP COLUMN "max_breaths_per_min"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" ADD "max_breaths_per_min" numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" DROP COLUMN "min_breaths_per_min"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" ADD "min_breaths_per_min" numeric(3,1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" DROP COLUMN "min_breaths_per_min"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" ADD "min_breaths_per_min" integer`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" DROP COLUMN "max_breaths_per_min"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" ADD "max_breaths_per_min" integer`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" DROP COLUMN "avg_breaths_per_min"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep_respiration_data" ADD "avg_breaths_per_min" integer`);
    }

}
