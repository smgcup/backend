import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPointsCalculatedToMatch1771418285192 implements MigrationInterface {
    name = 'AddedPointsCalculatedToMatch1771418285192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ADD "points_calculated" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "points_calculated"`);
    }

}
