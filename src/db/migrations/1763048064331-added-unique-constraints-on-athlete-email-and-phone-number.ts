import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUniqueConstraintsOnAthleteEmailAndPhoneNumber1763048064331 implements MigrationInterface {
    name = 'AddedUniqueConstraintsOnAthleteEmailAndPhoneNumber1763048064331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "UQ_cf461f5b40cf1a2b8876011e1e1" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD CONSTRAINT "UQ_c653e0267e557e5a4c28fb71fbf" UNIQUE ("terra_id")`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD CONSTRAINT "UQ_6b605cd9ed2fc11b50677fc8f2d" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "athlete" ADD CONSTRAINT "UQ_b405ca1dcfa237f93449286638d" UNIQUE ("phone_number")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "athlete" DROP CONSTRAINT "UQ_b405ca1dcfa237f93449286638d"`);
        await queryRunner.query(`ALTER TABLE "athlete" DROP CONSTRAINT "UQ_6b605cd9ed2fc11b50677fc8f2d"`);
        await queryRunner.query(`ALTER TABLE "athlete" DROP CONSTRAINT "UQ_c653e0267e557e5a4c28fb71fbf"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "UQ_cf461f5b40cf1a2b8876011e1e1"`);
    }

}
