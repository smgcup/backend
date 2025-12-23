import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeNotificationResolvedNotNull1765375654389 implements MigrationInterface {
    name = 'MadeNotificationResolvedNotNull1765375654389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "resolved" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "resolved" DROP NOT NULL`);
    }

}
