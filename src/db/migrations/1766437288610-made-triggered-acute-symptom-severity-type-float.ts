import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeTriggeredAcuteSymptomSeverityTypeFloat1766437288610 implements MigrationInterface {
    name = 'MadeTriggeredAcuteSymptomSeverityTypeFloat1766437288610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "severity_score"`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "severity_score" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "severity_score"`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "severity_score" integer`);
    }

}
