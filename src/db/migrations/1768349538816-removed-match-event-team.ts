import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedMatchEventTeam1768349538816 implements MigrationInterface {
  name = 'RemovedMatchEventTeam1768349538816';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" DROP CONSTRAINT "FK_8a8f47c06aae3a29ace8f375dbc"`);
    await queryRunner.query(`ALTER TABLE "match_event" DROP COLUMN "team_id"`);
    await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "id" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "match_event" ADD "team_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "match_event" ADD CONSTRAINT "FK_8a8f47c06aae3a29ace8f375dbc" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
