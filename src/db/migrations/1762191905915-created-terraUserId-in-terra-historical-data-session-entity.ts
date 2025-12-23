import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraUserIdInTerraHistoricalDataSessionEntity1762191905915 implements MigrationInterface {
    name = 'CreatedTerraUserIdInTerraHistoricalDataSessionEntity1762191905915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_historical_data_session" ADD "terra_user_id" uuid NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_historical_data_session" DROP COLUMN "terra_user_id"`);
    }

}
