import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedCaptainPropertyToTeamEntity1768897623543 implements MigrationInterface {
  name = 'AddedCaptainPropertyToTeamEntity1768897623543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team" ADD "captain_id" uuid`);
    await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "UQ_6c0bde1d2b476889b52cd1a60ae" UNIQUE ("captain_id")`);
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_6c0bde1d2b476889b52cd1a60ae" FOREIGN KEY ("captain_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_6c0bde1d2b476889b52cd1a60ae"`);
    await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "UQ_6c0bde1d2b476889b52cd1a60ae"`);
    await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "captain_id"`);
  }
}
