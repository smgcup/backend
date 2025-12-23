import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedPlayerEntity1766525329292 implements MigrationInterface {
    name = 'CreatedPlayerEntity1766525329292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player" ("id" uuid NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "year_of_birth" integer NOT NULL, "height" integer NOT NULL, "image_url" text, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "player"`);
    }

}
