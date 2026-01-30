import { MigrationInterface, QueryRunner } from "typeorm";

export class MatchEventChanges1768343726320 implements MigrationInterface {
    name = 'MatchEventChanges1768343726320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "id" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_event" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

}
