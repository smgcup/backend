import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUsernameProppertyToUserEntity1769108384364 implements MigrationInterface {
    name = 'AddedUsernameProppertyToUserEntity1769108384364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

}
