import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTeamRegistrationLinkEntity1762896021455 implements MigrationInterface {
    name = 'CreatedTeamRegistrationLinkEntity1762896021455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team_registration_link" ("id" uuid NOT NULL, "team_id" uuid NOT NULL, "token" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expiry_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_d4128050528281d7bffd5ba964f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "team_registration_link" ADD CONSTRAINT "FK_05e2eba6de749899e8ee37404f7" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_registration_link" DROP CONSTRAINT "FK_05e2eba6de749899e8ee37404f7"`);
        await queryRunner.query(`DROP TABLE "team_registration_link"`);
    }

}
