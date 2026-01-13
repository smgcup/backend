import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDateOfBirthToPlayerEntity1768318312466 implements MigrationInterface {
    name = 'AddedDateOfBirthToPlayerEntity1768318312466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_event" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "match_event" ADD "created_at" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_event" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "match_event" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

}
