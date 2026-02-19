import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFantasyTeamAndSlots1771439208466 implements MigrationInterface {
    name = 'AddFantasyTeamAndSlots1771439208466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fantasy_team_slot" ("id" uuid NOT NULL, "fantasy_team_id" uuid NOT NULL, "player_id" uuid NOT NULL, "is_benched" boolean NOT NULL DEFAULT false, "slot_order" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_d06e23f6793f59798db78969e41" UNIQUE ("fantasy_team_id", "player_id"), CONSTRAINT "PK_0382052a27b08384dcff9793bc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fantasy_team" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "team_name" text NOT NULL, "budget" numeric NOT NULL DEFAULT '100', "free_transfers" integer NOT NULL DEFAULT '1', "captain_player_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4a2064ce388697eb4ec60809fe1" UNIQUE ("user_id"), CONSTRAINT "REL_4a2064ce388697eb4ec60809fe" UNIQUE ("user_id"), CONSTRAINT "PK_74ee806f6d237ae8a83f3cce8b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fantasy_team_slot" ADD CONSTRAINT "FK_581e0ef5115623e9e66adb55b07" FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fantasy_team_slot" ADD CONSTRAINT "FK_29afff57ae25eb66b06affaa21e" FOREIGN KEY ("player_id") REFERENCES "fantasy_player"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fantasy_team" ADD CONSTRAINT "FK_4a2064ce388697eb4ec60809fe1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fantasy_team" ADD CONSTRAINT "FK_93953656476136178b998033f00" FOREIGN KEY ("captain_player_id") REFERENCES "fantasy_player"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fantasy_team" DROP CONSTRAINT "FK_93953656476136178b998033f00"`);
        await queryRunner.query(`ALTER TABLE "fantasy_team" DROP CONSTRAINT "FK_4a2064ce388697eb4ec60809fe1"`);
        await queryRunner.query(`ALTER TABLE "fantasy_team_slot" DROP CONSTRAINT "FK_29afff57ae25eb66b06affaa21e"`);
        await queryRunner.query(`ALTER TABLE "fantasy_team_slot" DROP CONSTRAINT "FK_581e0ef5115623e9e66adb55b07"`);
        await queryRunner.query(`DROP TABLE "fantasy_team"`);
        await queryRunner.query(`DROP TABLE "fantasy_team_slot"`);
    }

}
