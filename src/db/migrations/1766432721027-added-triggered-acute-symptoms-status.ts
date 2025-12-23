import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTriggeredAcuteSymptomsStatus1766432721027 implements MigrationInterface {
    name = 'AddedTriggeredAcuteSymptomsStatus1766432721027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "status" text`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "status_changed_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "status_changed_at"`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "status"`);
    }

}
