import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedParameterDeviationsSigmaColumns1765218786607 implements MigrationInterface {
    name = 'AddedParameterDeviationsSigmaColumns1765218786607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parameter_deviations" ADD "sigma1_5" double precision`);
        await queryRunner.query(`ALTER TABLE "parameter_deviations" ADD "sigma2" double precision`);
        await queryRunner.query(`ALTER TABLE "parameter_deviations" ADD "sigma2_5" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parameter_deviations" DROP COLUMN "sigma2_5"`);
        await queryRunner.query(`ALTER TABLE "parameter_deviations" DROP COLUMN "sigma2"`);
        await queryRunner.query(`ALTER TABLE "parameter_deviations" DROP COLUMN "sigma1_5"`);
    }

}
