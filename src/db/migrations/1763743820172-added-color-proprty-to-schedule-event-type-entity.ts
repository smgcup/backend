import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColorProprtyToScheduleEventTypeEntity1763743820172 implements MigrationInterface {
    name = 'AddedColorProprtyToScheduleEventTypeEntity1763743820172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event_type" ADD "color" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event_type" DROP COLUMN "color"`);
    }

}
