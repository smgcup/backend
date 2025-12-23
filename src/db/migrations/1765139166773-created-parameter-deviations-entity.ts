import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedParameterDeviationsEntity1765139166773 implements MigrationInterface {
    name = 'CreatedParameterDeviationsEntity1765139166773'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "parameter_deviations" ("id" uuid NOT NULL, "standard_deviation" double precision NOT NULL, "athlete_id" uuid NOT NULL, "mean" double precision NOT NULL, "parameter_id" uuid NOT NULL, CONSTRAINT "PK_6a814ab21c20b2c1349e3992732" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "parameter_deviations" ADD CONSTRAINT "FK_49179250a1f20c5299d2e1134b2" FOREIGN KEY ("parameter_id") REFERENCES "acute_symptom_parameter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parameter_deviations" ADD CONSTRAINT "FK_88f0853e0b4f69c03d9ef0ef9f9" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parameter_deviations" DROP CONSTRAINT "FK_88f0853e0b4f69c03d9ef0ef9f9"`);
        await queryRunner.query(`ALTER TABLE "parameter_deviations" DROP CONSTRAINT "FK_49179250a1f20c5299d2e1134b2"`);
        await queryRunner.query(`DROP TABLE "parameter_deviations"`);
    }

}
