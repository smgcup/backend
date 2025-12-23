import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTeamIdRelationToTheAthleteEntity1763679275957 implements MigrationInterface {
    name = 'AddedTeamIdRelationToTheAthleteEntity1763679275957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "team_id" uuid`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_01a6ffbc1dc8d16e64bce4ff8ab" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_01a6ffbc1dc8d16e64bce4ff8ab"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "team_id"`);
    }

}
