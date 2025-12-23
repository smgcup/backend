import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamedStandartDeviationToSigma1765140800270 implements MigrationInterface {
    name = 'RenamedStandartDeviationToSigma1765140800270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parameter_deviations" RENAME COLUMN "standard_deviation" TO "sigma1"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parameter_deviations" RENAME COLUMN "sigma1" TO "standard_deviation"`);
    }

}
