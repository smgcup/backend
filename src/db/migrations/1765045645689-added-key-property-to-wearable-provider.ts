import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedKeyPropertyToWearableProvider1765045645689 implements MigrationInterface {
    name = 'AddedKeyPropertyToWearableProvider1765045645689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wearable_provider" ADD "key" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wearable_provider" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "wearable_provider" ADD "name" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wearable_provider" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "wearable_provider" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wearable_provider" DROP COLUMN "key"`);
    }

}
