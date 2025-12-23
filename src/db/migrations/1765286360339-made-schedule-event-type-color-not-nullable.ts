import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeScheduleEventTypeColorNotNullable1765286360339 implements MigrationInterface {
    name = 'MadeScheduleEventTypeColorNotNullable1765286360339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event_type" ALTER COLUMN "color" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event_type" ALTER COLUMN "color" DROP NOT NULL`);
    }

}
