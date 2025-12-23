import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraDailyRecordAthlteEntityRelation1761665331085 implements MigrationInterface {
    name = 'CreatedTerraDailyRecordAthlteEntityRelation1761665331085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_daily_record" ADD CONSTRAINT "FK_b162f0fd6202e6a5236f7d4c1b5" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_daily_record" DROP CONSTRAINT "FK_b162f0fd6202e6a5236f7d4c1b5"`);
    }

}
