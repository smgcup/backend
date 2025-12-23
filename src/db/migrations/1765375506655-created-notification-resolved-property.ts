import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedNotificationResolvedProperty1765375506655 implements MigrationInterface {
    name = 'CreatedNotificationResolvedProperty1765375506655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "resolved" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "resolved"`);
    }

}
