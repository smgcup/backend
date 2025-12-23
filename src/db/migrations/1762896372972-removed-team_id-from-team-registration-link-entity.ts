import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedTeamIdFromTeamRegistrationLinkEntity1762896372972 implements MigrationInterface {
    name = 'RemovedTeamIdFromTeamRegistrationLinkEntity1762896372972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_registration_link" DROP CONSTRAINT "FK_05e2eba6de749899e8ee37404f7"`);
        await queryRunner.query(`ALTER TABLE "team_registration_link" ALTER COLUMN "team_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team_registration_link" ADD CONSTRAINT "FK_05e2eba6de749899e8ee37404f7" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_registration_link" DROP CONSTRAINT "FK_05e2eba6de749899e8ee37404f7"`);
        await queryRunner.query(`ALTER TABLE "team_registration_link" ALTER COLUMN "team_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team_registration_link" ADD CONSTRAINT "FK_05e2eba6de749899e8ee37404f7" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
