import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraActivityEntitiesRelations1761842377961 implements MigrationInterface {
    name = 'CreatedTerraActivityEntitiesRelations1761842377961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_activity_metrics" DROP COLUMN "activity_hr_zone_data_id"`);
        await queryRunner.query(`ALTER TABLE "terra_activity" DROP COLUMN "activity_duration_seconds"`);
        await queryRunner.query(`ALTER TABLE "terra_activity" ADD "duration_seconds" integer`);
        await queryRunner.query(`ALTER TABLE "terra_activity_metrics" ADD CONSTRAINT "UQ_8af420cd0eeeb6d5b528a1a0aeb" UNIQUE ("activity_movement_id")`);
        await queryRunner.query(`ALTER TABLE "terra_activity" ADD CONSTRAINT "UQ_20b8fc0c5107149db3656a4a8e7" UNIQUE ("activity_metrics_id")`);
        await queryRunner.query(`ALTER TABLE "terra_activity_hr_zone_data" DROP COLUMN "zone_number"`);
        await queryRunner.query(`ALTER TABLE "terra_activity_hr_zone_data" ADD "zone_number" integer`);
        await queryRunner.query(`ALTER TABLE "terra_activity_metrics" ADD CONSTRAINT "FK_8af420cd0eeeb6d5b528a1a0aeb" FOREIGN KEY ("activity_movement_id") REFERENCES "terra_activity_movement_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_activity" ADD CONSTRAINT "FK_614e768ec59f5cd73d900799600" FOREIGN KEY ("activity_type_id") REFERENCES "terra_activity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terra_activity" ADD CONSTRAINT "FK_20b8fc0c5107149db3656a4a8e7" FOREIGN KEY ("activity_metrics_id") REFERENCES "terra_activity_metrics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_activity" DROP CONSTRAINT "FK_20b8fc0c5107149db3656a4a8e7"`);
        await queryRunner.query(`ALTER TABLE "terra_activity" DROP CONSTRAINT "FK_614e768ec59f5cd73d900799600"`);
        await queryRunner.query(`ALTER TABLE "terra_activity_metrics" DROP CONSTRAINT "FK_8af420cd0eeeb6d5b528a1a0aeb"`);
        await queryRunner.query(`ALTER TABLE "terra_activity_hr_zone_data" DROP COLUMN "zone_number"`);
        await queryRunner.query(`ALTER TABLE "terra_activity_hr_zone_data" ADD "zone_number" text`);
        await queryRunner.query(`ALTER TABLE "terra_activity" DROP CONSTRAINT "UQ_20b8fc0c5107149db3656a4a8e7"`);
        await queryRunner.query(`ALTER TABLE "terra_activity_metrics" DROP CONSTRAINT "UQ_8af420cd0eeeb6d5b528a1a0aeb"`);
        await queryRunner.query(`ALTER TABLE "terra_activity" DROP COLUMN "duration_seconds"`);
        await queryRunner.query(`ALTER TABLE "terra_activity" ADD "activity_duration_seconds" integer`);
        await queryRunner.query(`ALTER TABLE "terra_activity_metrics" ADD "activity_hr_zone_data_id" uuid`);
    }

}
