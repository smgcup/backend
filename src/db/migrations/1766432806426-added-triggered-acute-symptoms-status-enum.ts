import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTriggeredAcuteSymptomsStatusEnum1766432806426 implements MigrationInterface {
    name = 'AddedTriggeredAcuteSymptomsStatusEnum1766432806426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."triggered_acute_symptom_status_enum" AS ENUM('UNACTIONED', 'DISMISSED', 'RESOLVED')`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "status" "public"."triggered_acute_symptom_status_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."triggered_acute_symptom_status_enum"`);
        await queryRunner.query(`ALTER TABLE "triggered_acute_symptom" ADD "status" text`);
    }

}
