import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTeamEntity1766525681395 implements MigrationInterface {
    name = 'CreatedTeamEntity1766525681395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" uuid NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "player" ADD "team_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_9deb77a11ad43ce17975f13dc85" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_9deb77a11ad43ce17975f13dc85"`);
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "team_id"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}
