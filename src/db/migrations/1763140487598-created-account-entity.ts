import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedAccountEntity1763140487598 implements MigrationInterface {
    name = 'CreatedAccountEntity1763140487598'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."accounts_role_enum" AS ENUM('user', 'athlete', 'admin')`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL, "role" "public"."accounts_role_enum" NOT NULL, "email" text NOT NULL, "password" text NOT NULL, CONSTRAINT "UQ_ee66de6cdc53993296d1ceb8aa0" UNIQUE ("email"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_role_enum"`);
    }

}
