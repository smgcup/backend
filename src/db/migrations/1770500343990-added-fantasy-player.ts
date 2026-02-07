import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFantasyPlayer1770500343990 implements MigrationInterface {
    name = 'AddedFantasyPlayer1770500343990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fantasy_player" ("id" uuid NOT NULL, "display_name" text NOT NULL, "price" numeric NOT NULL, "player_id" uuid, CONSTRAINT "REL_c6dfbfa1d16882951fc8d58cad" UNIQUE ("player_id"), CONSTRAINT "PK_55837c3461dff6a80d6ed3c49c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ADD CONSTRAINT "FK_c6dfbfa1d16882951fc8d58cada" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fantasy_player" DROP CONSTRAINT "FK_c6dfbfa1d16882951fc8d58cada"`);
        await queryRunner.query(`DROP TABLE "fantasy_player"`);
    }

}
