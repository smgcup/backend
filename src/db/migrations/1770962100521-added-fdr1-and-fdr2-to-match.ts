import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFdr1AndFdr2ToMatch1770962100521 implements MigrationInterface {
    name = 'AddedFdr1AndFdr2ToMatch1770962100521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ADD "fdr1" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "fdr2" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "fdr2"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "fdr1"`);
    }

}
