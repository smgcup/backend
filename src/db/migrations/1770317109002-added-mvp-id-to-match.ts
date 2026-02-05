import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedMvpIdToMatch1770317109002 implements MigrationInterface {
  name = 'AddedMvpIdToMatch1770317109002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" ADD "mvp_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "FK_70df565d57d608074a854eb77e0" FOREIGN KEY ("mvp_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_70df565d57d608074a854eb77e0"`);
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "mvp_id"`);
  }
}
