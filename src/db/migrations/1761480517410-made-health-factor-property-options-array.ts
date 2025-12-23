import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeHealthFactorPropertyOptionsArray1761480517410 implements MigrationInterface {
    name = 'MadeHealthFactorPropertyOptionsArray1761480517410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factor_property" DROP COLUMN "options"`);
        await queryRunner.query(`ALTER TABLE "health_factor_property" ADD "options" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factor_property" DROP COLUMN "options"`);
        await queryRunner.query(`ALTER TABLE "health_factor_property" ADD "options" text`);
    }

}
