import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTriggeredAcuteSymptomsSeverityScores1766436551835 implements MigrationInterface {
    name = 'AddedTriggeredAcuteSymptomsSeverityScores1766436551835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "acute_symptom" ADD "severity_score" integer`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "severity_score" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "severity_score"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom" DROP COLUMN "severity_score"`);
    }

}
