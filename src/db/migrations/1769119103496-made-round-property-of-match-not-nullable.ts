import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeRoundPropertyOfMatchNotNullable1769119103496 implements MigrationInterface {
    name = 'MadeRoundPropertyOfMatchNotNullable1769119103496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "round" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "round" DROP NOT NULL`);
    }

}
