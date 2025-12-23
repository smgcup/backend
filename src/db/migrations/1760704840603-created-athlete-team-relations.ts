import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedAthleteTeamRelations1760704840603 implements MigrationInterface {
  name = 'CreatedAthleteTeamRelations1760704840603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "athlete" ADD "team_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "athlete" ADD CONSTRAINT "FK_0afaa41250047aefc37ea28183c" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "athlete" DROP CONSTRAINT "FK_0afaa41250047aefc37ea28183c"`);
    await queryRunner.query(`ALTER TABLE "athlete" DROP COLUMN "team_id"`);
  }
}
