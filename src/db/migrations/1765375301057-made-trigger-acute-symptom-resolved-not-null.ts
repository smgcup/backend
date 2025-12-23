import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeTriggerAcuteSymptomResolvedNotNull1765375301057 implements MigrationInterface {
    name = 'MadeTriggerAcuteSymptomResolvedNotNull1765375301057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ALTER COLUMN "resolved" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ALTER COLUMN "resolved" DROP NOT NULL`);
    }

}
