import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeHasWearablePropertyOfAthleteEntityNotNullable1762949053376 implements MigrationInterface {
    name = 'MadeHasWearablePropertyOfAthleteEntityNotNullable1762949053376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD "first_name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD "last_name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD "email" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD "phone_number" text NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."athlete_registration_in_process_gender_enum" AS ENUM('M', 'F')`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD "gender" "public"."athlete_registration_in_process_gender_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD "date_of_birth" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "athlete" ALTER COLUMN "has_wearable" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete" ALTER COLUMN "has_wearable" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP COLUMN "date_of_birth"`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP COLUMN "gender"`);
        await queryRunner.query(`DROP TYPE "public"."athlete_registration_in_process_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "athlete_registration_in_process" DROP COLUMN "first_name"`);
    }

}
