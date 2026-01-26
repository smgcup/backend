import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeMatchDatePropertyNullable1769442277658 implements MigrationInterface {
    name = 'MadeMatchDatePropertyNullable1769442277658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "date" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "date" SET NOT NULL`);
    }

}
