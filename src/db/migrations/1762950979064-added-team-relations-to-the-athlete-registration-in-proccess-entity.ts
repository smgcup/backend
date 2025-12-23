import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTeamRelationsToTheAthleteRegistrationInProccessEntity1762950979064 implements MigrationInterface {
    name = 'AddedTeamRelationsToTheAthleteRegistrationInProccessEntity1762950979064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD "team_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD CONSTRAINT "FK_43437c133a524d4d6054cb8cf6a" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP CONSTRAINT "FK_43437c133a524d4d6054cb8cf6a"`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP COLUMN "team_id"`);
    }

}
