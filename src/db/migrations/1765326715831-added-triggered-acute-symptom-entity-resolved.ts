import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTriggeredAcuteSymptomEntityResolved1765326715831 implements MigrationInterface {
    name = 'AddedTriggeredAcuteSymptomEntityResolved1765326715831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" RENAME COLUMN "status" TO "resolved"`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "resolved"`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "resolved" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "resolved"`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "resolved" text`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" RENAME COLUMN "resolved" TO "status"`);
    }

}
