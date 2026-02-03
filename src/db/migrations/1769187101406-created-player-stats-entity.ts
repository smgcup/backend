import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedPlayerStatsEntity1769187101406 implements MigrationInterface {
    name = 'CreatedPlayerStatsEntity1769187101406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player_stats" ("player_id" uuid NOT NULL, "goals" integer NOT NULL DEFAULT '0', "penalties_scored" integer NOT NULL DEFAULT '0', "penalties_missed" integer NOT NULL DEFAULT '0', "assists" integer NOT NULL DEFAULT '0', "yellow_cards" integer NOT NULL DEFAULT '0', "red_cards" integer NOT NULL DEFAULT '0', "goalkeeper_saves" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_93f34075933141f2cadabb03eaf" PRIMARY KEY ("player_id"))`);
        await queryRunner.query(`ALTER TABLE "player_stats" ADD CONSTRAINT "FK_93f34075933141f2cadabb03eaf" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_stats" DROP CONSTRAINT "FK_93f34075933141f2cadabb03eaf"`);
        await queryRunner.query(`DROP TABLE "player_stats"`);
    }

}
