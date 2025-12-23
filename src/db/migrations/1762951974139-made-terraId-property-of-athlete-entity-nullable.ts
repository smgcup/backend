import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeTerraIdPropertyOfAthleteEntityNullable1762951974139 implements MigrationInterface {
    name = 'MadeTerraIdPropertyOfAthleteEntityNullable1762951974139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete" ALTER COLUMN "terra_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete" ALTER COLUMN "terra_id" SET NOT NULL`);
    }

}
