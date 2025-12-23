import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletedAthleteInRegistrationProccessEntityAndAddedAccountToTheAthleteEntity1763248983574 implements MigrationInterface {
    name = 'DeletedAthleteInRegistrationProccessEntityAndAddedAccountToTheAthleteEntity1763248983574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete" RENAME COLUMN "has_wearable" TO "account_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "account_id" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_6acfec7285fdf9f463462de3e9f" UNIQUE ("account_id")`);
        await queryRunner.query(`ALTER TABLE "athlete" DROP COLUMN "account_id"`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD "account_id" uuid`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD CONSTRAINT "UQ_972763d8f9293021ddd738c69ca" UNIQUE ("account_id")`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD CONSTRAINT "FK_972763d8f9293021ddd738c69ca" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_6acfec7285fdf9f463462de3e9f" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_6acfec7285fdf9f463462de3e9f"`);
        await queryRunner.query(`ALTER TABLE "athlete" DROP CONSTRAINT "FK_972763d8f9293021ddd738c69ca"`);
        await queryRunner.query(`ALTER TABLE "athlete" DROP CONSTRAINT "UQ_972763d8f9293021ddd738c69ca"`);
        await queryRunner.query(`ALTER TABLE "athlete" DROP COLUMN "account_id"`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD "account_id" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_6acfec7285fdf9f463462de3e9f"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "account_id"`);
        await queryRunner.query(`ALTER TABLE "athlete" RENAME COLUMN "account_id" TO "has_wearable"`);
    }

}
