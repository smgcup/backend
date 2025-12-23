import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUniqueConstraintsOnAthleteRegistrationInProccessEntityEmailAndPhoneNumber1763049729727 implements MigrationInterface {
    name = 'AddedUniqueConstraintsOnAthleteRegistrationInProccessEntityEmailAndPhoneNumber1763049729727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD CONSTRAINT "UQ_2615968c0b5959974c4fb79aaa4" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD CONSTRAINT "UQ_e2158aecc8bd15ef212c6f31267" UNIQUE ("phone_number")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP CONSTRAINT "UQ_e2158aecc8bd15ef212c6f31267"`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP CONSTRAINT "UQ_2615968c0b5959974c4fb79aaa4"`);
    }

}
