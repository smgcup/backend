import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedAcuteSymptomRulesetEntity1764625806469 implements MigrationInterface {
    name = 'CreatedAcuteSymptomRulesetEntity1764625806469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "acute_symptom_ruleset" ("id" uuid NOT NULL, CONSTRAINT "PK_807bad9535dd30d6861bba747a1" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "acute_symptom_ruleset"`);
    }

}
