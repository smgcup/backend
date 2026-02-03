import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplementedPlayerAppearanceTable1770136584908 implements MigrationInterface {
    name = 'ImplementedPlayerAppearanceTable1770136584908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player_appearance" ("match_id" uuid NOT NULL, "player_id" uuid NOT NULL, "level" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_2f91e811c794a916d4425858e21" PRIMARY KEY ("match_id", "player_id"))`);
        await queryRunner.query(`ALTER TABLE "player_appearance" ADD CONSTRAINT "FK_6d00abddb93584bdbe42d1b9f07" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_appearance" ADD CONSTRAINT "FK_c6f69adda77a002c2305032577c" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_appearance" DROP CONSTRAINT "FK_c6f69adda77a002c2305032577c"`);
        await queryRunner.query(`ALTER TABLE "player_appearance" DROP CONSTRAINT "FK_6d00abddb93584bdbe42d1b9f07"`);
        await queryRunner.query(`DROP TABLE "player_appearance"`);
    }

}
