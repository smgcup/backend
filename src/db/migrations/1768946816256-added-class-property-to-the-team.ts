import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedClassPropertyToTheTeam1768946816256 implements MigrationInterface {
    name = 'AddedClassPropertyToTheTeam1768946816256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" ADD "class" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "class"`);
    }

}
