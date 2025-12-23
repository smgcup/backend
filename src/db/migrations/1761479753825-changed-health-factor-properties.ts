import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedHealthFactorProperties1761479753825 implements MigrationInterface {
    name = 'ChangedHealthFactorProperties1761479753825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "health_factors" ("id" uuid NOT NULL, "name" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "creator_id" uuid NOT NULL, CONSTRAINT "PK_363de641964baa73036c5a53b6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "health_factor_property" ("id" uuid NOT NULL, "key" text NOT NULL, "label" text NOT NULL, "type" "public"."health_factor_property_type_enum" NOT NULL, "options" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_b4d95127bc94e4969ce0b80998c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "health_factor_properties" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "health_factor_id" uuid NOT NULL, "health_factor_property_id" uuid NOT NULL, CONSTRAINT "PK_476e5d4c7f8cf0764359ffc5133" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "health_factors" ADD CONSTRAINT "FK_3d0522bbbe750820696b91a9009" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "health_factor_properties" ADD CONSTRAINT "FK_b3d465fcd0ac6e97edbe84fd8f4" FOREIGN KEY ("health_factor_id") REFERENCES "health_factors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "health_factor_properties" ADD CONSTRAINT "FK_e60ffc8bce018818702f33c5f37" FOREIGN KEY ("health_factor_property_id") REFERENCES "health_factor_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factor_properties" DROP CONSTRAINT "FK_e60ffc8bce018818702f33c5f37"`);
        await queryRunner.query(`ALTER TABLE "health_factor_properties" DROP CONSTRAINT "FK_b3d465fcd0ac6e97edbe84fd8f4"`);
        await queryRunner.query(`ALTER TABLE "health_factors" DROP CONSTRAINT "FK_3d0522bbbe750820696b91a9009"`);
        await queryRunner.query(`DROP TABLE "health_factor_properties"`);
        await queryRunner.query(`DROP TABLE "health_factor_property"`);
        await queryRunner.query(`DROP TABLE "health_factors"`);
    }

}
