import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendedMatchEntityWithLocation1769474414075 implements MigrationInterface {
  name = 'ExtendedMatchEntityWithLocation1769474414075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."match_location_enum" AS ENUM('CK Green Sport', 'SMG Arena')`);
    await queryRunner.query(`ALTER TABLE "match" ADD "location" "public"."match_location_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "location"`);
    await queryRunner.query(`DROP TYPE "public"."match_location_enum"`);
  }
}
