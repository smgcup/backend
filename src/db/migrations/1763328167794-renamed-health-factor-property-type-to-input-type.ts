import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamedHealthFactorPropertyTypeToInputType1763328167794 implements MigrationInterface {
    name = 'RenamedHealthFactorPropertyTypeToInputType1763328167794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factor_property" RENAME COLUMN "type" TO "input_type"`);
        await queryRunner.query(`ALTER TYPE "public"."health_factor_property_type_enum" RENAME TO "health_factor_property_input_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."health_factor_property_input_type_enum" RENAME TO "health_factor_property_type_enum"`);
        await queryRunner.query(`ALTER TABLE "health_factor_property" RENAME COLUMN "input_type" TO "type"`);
    }

}
