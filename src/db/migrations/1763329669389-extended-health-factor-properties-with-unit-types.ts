import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendedHealthFactorPropertiesWithUnitTypes1763329669389 implements MigrationInterface {
    name = 'ExtendedHealthFactorPropertiesWithUnitTypes1763329669389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."health_factor_property_measurement_unit_class_enum" AS ENUM('length', 'mass', 'time', 'duration')`);
        await queryRunner.query(`CREATE TYPE "public"."health_factor_property_measurement_unit_type_enum" AS ENUM('integer', 'float', 'string', 'boolean', 'date', 'time', 'datetime')`);
        await queryRunner.query(`CREATE TABLE "health_factor_property_measurement_unit" ("id" uuid NOT NULL, "class" "public"."health_factor_property_measurement_unit_class_enum" NOT NULL, "symbol" text NOT NULL, "type" "public"."health_factor_property_measurement_unit_type_enum" NOT NULL, CONSTRAINT "PK_99fede950805118c5afdb016ec2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "health_factor_property" ADD "measurement_unit_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_factor_property" ADD CONSTRAINT "FK_99fede950805118c5afdb016ec2" FOREIGN KEY ("measurement_unit_id") REFERENCES "health_factor_property_measurement_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factor_property" DROP CONSTRAINT "FK_99fede950805118c5afdb016ec2"`);
        await queryRunner.query(`ALTER TABLE "health_factor_property" DROP COLUMN "measurement_unit_id"`);
        await queryRunner.query(`DROP TABLE "health_factor_property_measurement_unit"`);
        await queryRunner.query(`DROP TYPE "public"."health_factor_property_measurement_unit_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."health_factor_property_measurement_unit_class_enum"`);
    }

}
