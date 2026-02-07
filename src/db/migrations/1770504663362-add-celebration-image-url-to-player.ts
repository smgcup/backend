import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCelebrationImageUrlToPlayer1770504663362 implements MigrationInterface {
    name = 'AddCelebrationImageUrlToPlayer1770504663362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" ADD "celebration_image_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "celebration_image_url"`);
    }

}
