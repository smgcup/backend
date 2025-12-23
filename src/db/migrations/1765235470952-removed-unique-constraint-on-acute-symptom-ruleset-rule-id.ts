import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedUniqueConstraintOnAcuteSymptomRulesetRuleId1765235470952 implements MigrationInterface {
  name = 'RemovedUniqueConstraintOnAcuteSymptomRulesetRuleId1765235470952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "acute_symptom_ruleset" DROP CONSTRAINT "UQ_91321cea7ed4d01972d33fca86a"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "acute_symptom_ruleset" ADD CONSTRAINT "UQ_91321cea7ed4d01972d33fca86a" UNIQUE ("rule_id")`,
    );
  }
}
