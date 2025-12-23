import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeTriggeredAcuteSymptomStatusNotNullable1766439313910 implements MigrationInterface {
    name = 'MadeTriggeredAcuteSymptomStatusNotNullable1766439313910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ALTER COLUMN "status" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ALTER COLUMN "status" DROP NOT NULL`);
    }

}
