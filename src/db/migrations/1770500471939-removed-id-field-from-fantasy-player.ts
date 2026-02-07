import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedIdFieldFromFantasyPlayer1770500471939 implements MigrationInterface {
    name = 'RemovedIdFieldFromFantasyPlayer1770500471939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fantasy_player" DROP CONSTRAINT "PK_55837c3461dff6a80d6ed3c49c3"`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" DROP CONSTRAINT "FK_c6dfbfa1d16882951fc8d58cada"`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ALTER COLUMN "player_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ADD CONSTRAINT "PK_c6dfbfa1d16882951fc8d58cada" PRIMARY KEY ("player_id")`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" DROP CONSTRAINT "REL_c6dfbfa1d16882951fc8d58cad"`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ADD CONSTRAINT "FK_c6dfbfa1d16882951fc8d58cada" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fantasy_player" DROP CONSTRAINT "FK_c6dfbfa1d16882951fc8d58cada"`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ADD CONSTRAINT "REL_c6dfbfa1d16882951fc8d58cad" UNIQUE ("player_id")`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" DROP CONSTRAINT "PK_c6dfbfa1d16882951fc8d58cada"`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ALTER COLUMN "player_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ADD CONSTRAINT "FK_c6dfbfa1d16882951fc8d58cada" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fantasy_player" ADD CONSTRAINT "PK_55837c3461dff6a80d6ed3c49c3" PRIMARY KEY ("id")`);
    }

}
