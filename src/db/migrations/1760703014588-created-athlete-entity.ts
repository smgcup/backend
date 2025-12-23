import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedAthleteEntity1760703014588 implements MigrationInterface {
  name = 'CreatedAthleteEntity1760703014588';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."athlete_gender_enum" AS ENUM('M', 'F')`);
    await queryRunner.query(
      `CREATE TABLE "athlete" ("id" uuid NOT NULL, "terra_id" uuid NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "email" text NOT NULL, "phone_number" text NOT NULL, "gender" "public"."athlete_gender_enum" NOT NULL, "date_of_birth" date NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_8bf51e0689529ca963f10949596" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "athlete"`);
    await queryRunner.query(`DROP TYPE "public"."athlete_gender_enum"`);
  }
}
