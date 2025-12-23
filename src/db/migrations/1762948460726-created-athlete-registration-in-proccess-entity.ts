import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedAthleteRegistrationInProccessEntity1762948460726 implements MigrationInterface {
    name = 'CreatedAthleteRegistrationInProccessEntity1762948460726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "athlete_registration_in_process" ("id" uuid NOT NULL, CONSTRAINT "PK_1c6a2fd7072a0e682b384c908a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD "has_wearable" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete" DROP COLUMN "has_wearable"`);
        await queryRunner.query(`DROP TABLE "athlete_registration_in_process"`);
    }

}
