import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTerraActivityNameColumn1762018392292 implements MigrationInterface {
    name = 'CreatedTerraActivityNameColumn1762018392292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_activity" ADD "name" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terra_activity" DROP COLUMN "name"`);
    }

}
