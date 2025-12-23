import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedSleepEntityOxygenSaturationPercentageToDecimal1761943795414 implements MigrationInterface {
    name = 'ChangedSleepEntityOxygenSaturationPercentageToDecimal1761943795414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP COLUMN "oxygen_saturation_percentage"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD "oxygen_saturation_percentage" numeric(3,1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP COLUMN "oxygen_saturation_percentage"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD "oxygen_saturation_percentage" integer`);
    }

}
