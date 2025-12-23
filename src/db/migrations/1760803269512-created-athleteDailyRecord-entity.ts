import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedAthleteDailyRecordEntity1760803269512 implements MigrationInterface {
  name = 'CreatedAthleteDailyRecordEntity1760803269512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "athlete_daily_records" ("id" uuid NOT NULL, "athlete_id" uuid NOT NULL, "record_date" date NOT NULL, "recovery" numeric(5,2), "strain" numeric(5,2), "rhr" integer, "hrv" integer, "sleep_performance" integer, "sleep_consistency" integer, "sleep_efficiency" integer, "sleep_duration" integer, "restorative_sleep_duration" integer, "restorative_sleep" integer, "sleep_start" TIMESTAMP WITH TIME ZONE, "sleep_end" TIMESTAMP WITH TIME ZONE, "timezone_offset" text, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0712d82eb50b157fe7bfb7d73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete_daily_records" ADD CONSTRAINT "FK_2e8b3ebbe1f960e9d2e250b1a1c" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "athlete_daily_records" DROP CONSTRAINT "FK_2e8b3ebbe1f960e9d2e250b1a1c"`);
    await queryRunner.query(`DROP TABLE "athlete_daily_records"`);
  }
}
