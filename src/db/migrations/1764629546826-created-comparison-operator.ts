import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedComparisonOperator1764629546826 implements MigrationInterface {
    name = 'CreatedComparisonOperator1764629546826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "acute_symptom_rule" DROP COLUMN "operator"`);
        await queryRunner.query(`CREATE TYPE "public"."acute_symptom_rule_operator_enum" AS ENUM('>', '<', '=')`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_rule" ADD "operator" "public"."acute_symptom_rule_operator_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "acute_symptom_rule" DROP COLUMN "operator"`);
        await queryRunner.query(`DROP TYPE "public"."acute_symptom_rule_operator_enum"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_rule" ADD "operator" text NOT NULL`);
    }

}
