import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendedNotificationAndAcuteSymptomEntities1764605000577 implements MigrationInterface {
    name = 'ExtendedNotificationAndAcuteSymptomEntities1764605000577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_type" ADD "class" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "acute_symptom" ADD "notification_id" uuid`);
        await queryRunner.query(`ALTER TABLE "acute_symptom" ADD CONSTRAINT "FK_7d035f2d9e2486fc4cca0a91447" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "acute_symptom" DROP CONSTRAINT "FK_7d035f2d9e2486fc4cca0a91447"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom" DROP COLUMN "notification_id"`);
        await queryRunner.query(`ALTER TABLE "notification_type" DROP COLUMN "class"`);
    }

}
