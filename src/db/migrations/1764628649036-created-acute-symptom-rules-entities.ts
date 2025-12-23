import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedAcuteSymptomRulesEntities1764628649036 implements MigrationInterface {
    name = 'CreatedAcuteSymptomRulesEntities1764628649036'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "acute_symptom_parameter" ("id" uuid NOT NULL, "key" text NOT NULL, "label" text NOT NULL, CONSTRAINT "PK_a59f040f05088eeb098af99d65b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "acute_symptom_rule" ("id" uuid NOT NULL, "parameter_id" uuid NOT NULL, "operator" text NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_b37ad9e58958bfcb1dc83fbe8a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" ADD "symptom_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" ADD "rule_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" ADD CONSTRAINT "UQ_91321cea7ed4d01972d33fca86a" UNIQUE ("rule_id")`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_rule" ADD CONSTRAINT "FK_d3f6061ea84b3e4be20ace1bc23" FOREIGN KEY ("parameter_id") REFERENCES "acute_symptom_parameter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" ADD CONSTRAINT "FK_972bfcd8a35a706e00f744b34c0" FOREIGN KEY ("symptom_id") REFERENCES "acute_symptom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" ADD CONSTRAINT "FK_91321cea7ed4d01972d33fca86a" FOREIGN KEY ("rule_id") REFERENCES "acute_symptom_rule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" DROP CONSTRAINT "FK_91321cea7ed4d01972d33fca86a"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" DROP CONSTRAINT "FK_972bfcd8a35a706e00f744b34c0"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_rule" DROP CONSTRAINT "FK_d3f6061ea84b3e4be20ace1bc23"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" DROP CONSTRAINT "UQ_91321cea7ed4d01972d33fca86a"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" DROP COLUMN "rule_id"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" DROP COLUMN "symptom_id"`);
        await queryRunner.query(`DROP TABLE "acute_symptom_rule"`);
        await queryRunner.query(`DROP TABLE "acute_symptom_parameter"`);
    }

}
