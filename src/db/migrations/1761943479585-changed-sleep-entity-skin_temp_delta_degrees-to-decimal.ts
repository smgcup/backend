import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedSleepEntitySkinTempDeltaDegreesToDecimal1761943479585 implements MigrationInterface {
    name = 'ChangedSleepEntitySkinTempDeltaDegreesToDecimal1761943479585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP COLUMN "skin_temp_delta_degrees"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD "skin_temp_delta_degrees" numeric(3,1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP COLUMN "skin_temp_delta_degrees"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD "skin_temp_delta_degrees" integer`);
    }

}
