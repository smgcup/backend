import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedNotificationCountProperty1765305569189 implements MigrationInterface {
    name = 'CreatedNotificationCountProperty1765305569189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "count" SERIAL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "count"`);
    }

}
