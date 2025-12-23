import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraDailyRecordTerraSleepTerraActivitesRelations1761931608496 implements MigrationInterface {
    name = 'CreatedTerraDailyRecordTerraSleepTerraActivitesRelations1761931608496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_sleep" ADD CONSTRAINT "FK_615b1154ec17b928b767edb388f" FOREIGN KEY ("record_id") REFERENCES "terra_daily_record"("record_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_activity" ADD CONSTRAINT "FK_f24d9cd6eb03d7e82ec1ed5595f" FOREIGN KEY ("record_id") REFERENCES "terra_daily_record"("record_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_activity" DROP CONSTRAINT "FK_f24d9cd6eb03d7e82ec1ed5595f"`);
        await queryRunner.query(`ALTER TABLE "terra_sleep" DROP CONSTRAINT "FK_615b1154ec17b928b767edb388f"`);
    }

}
