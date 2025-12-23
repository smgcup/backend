import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedWearableProviderEntity1765045400111 implements MigrationInterface {
    name = 'CreatedWearableProviderEntity1765045400111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wearable_provider" ("id" uuid NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_9985d6584a569c8dce8422f67ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD "wearable_provider_id" uuid`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD CONSTRAINT "UQ_0965a28965a904761e4a15fedde" UNIQUE ("wearable_provider_id")`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD CONSTRAINT "FK_0965a28965a904761e4a15fedde" FOREIGN KEY ("wearable_provider_id") REFERENCES "wearable_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete" DROP CONSTRAINT "FK_0965a28965a904761e4a15fedde"`);
        await queryRunner.query(`ALTER TABLE "athlete" DROP CONSTRAINT "UQ_0965a28965a904761e4a15fedde"`);
        await queryRunner.query(`ALTER TABLE "athlete" DROP COLUMN "wearable_provider_id"`);
        await queryRunner.query(`DROP TABLE "wearable_provider"`);
    }

}
